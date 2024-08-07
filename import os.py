import os
import logging
import psycopg2
from flask import Flask, request, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
from marshmallow import Schema, fields, validate, ValidationError

# 設置日誌記錄
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 Flask 應用
app = Flask(__name__)

# 配置數據庫連接
try:
    connection = psycopg2.connect(
        user=os.getenv("DB_USER"),  # 從環境變量讀取數據庫用戶
        password=os.getenv("DB_PASSWORD"),  # 從環境變量讀取數據庫密碼
        host=os.getenv("DB_HOST"),  # 從環境變量讀取數據庫主機
        port=os.getenv("DB_PORT", "5432"),  # 從環境變量讀取端口號，默認值為 5432
        database=os.getenv("DB_NAME")  # 從環境變量讀取數據庫名稱
    )
except psycopg2.OperationalError as e:
    logger.error("OperationalError: %s", str(e))
    abort(500, "Database connection error")
except Exception as e:
    logger.error("Unexpected error: %s", str(e))
    abort(500, "Unexpected error")

# 定義輸入驗證模式
class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    username = fields.Str(required=True, validate=validate.Length(min=1))

def validate_json(schema, data):
    try:
        schema().load(data)
    except ValidationError as err:
        logger.warning("Validation error: %s", err.messages)
        abort(400, str(err.messages))

# 定義統一 API 響應格式
def make_response(status, message, data=None):
    return jsonify({'status': status, 'message': message, 'data': data}), 200 if status else 400

# 用戶註冊路由
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    validate_json(RegisterSchema, data)
    
    email = data['email']
    password = data['password']
    username = data['username']
    
    hashed_password = generate_password_hash(password)

    try:
        with connection.cursor() as cursor:  # 使用上下文管理器確保 cursor 被正確關閉
            check_user_exist_query = "SELECT * FROM users WHERE email = %s"
            cursor.execute(check_user_exist_query, (email,))
            check_result = cursor.fetchone()
            
            if check_result:
                return make_response(False, "User already exists")
            
            insert_user_query = "INSERT INTO users (email, password, username) VALUES (%s, %s, %s)"
            cursor.execute(insert_user_query, (email, hashed_password, username))
            connection.commit()
            
            logger.info("User registered with email: %s", email)
            return make_response(True, "User registered successfully")
    except Exception as e:
        logger.error("Database error: %s", str(e))
        return make_response(False, "Database error: " + str(e))

# 啟動 Flask 應用
if __name__ == '__main__':
    app.run(debug=False)  # 在生產環境中禁用 debug 模式

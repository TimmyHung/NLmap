from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from chromaDB import loadData
from chromaDB import query
import hashlib
import os
import jwt
import pymysql

app = Flask(__name__)
CORS(app)
load_dotenv()
chromaDB = loadData()

# MySQL connection setup
db = pymysql.connect(
    host=os.getenv('DATABASE_HOST'),
    user=os.getenv('DATABASE_USER'),
    password=os.getenv('DATABASE_PASSWORD'),
    database=os.getenv('DATABASE_SCHEMA')
)

# Utility functions
def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def generate_jwt(payload):
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')

# Default route
@app.route('/', methods=['GET'])
def default_route():
    return "Invalid API", 400

# Test route
@app.route('/api/query',methods=['POST'])
def getQuery():
    data = request.get_json()
    promptText = data.get('queryNL')
    response = query(chromaDB,promptText)
    
    osmquery = response.split("|||")[1].replace("data=", "")
    query_name = response.split("|||")[0].replace("query_name=", "")

    if not response:
        return jsonify({'status': False, 'message': 'Query Failed: Max retries exceeded', 'osmquery': None, 'query_name': None}), 200
    else:
        print({'status': True, 'message': 'Query Success', 'osmquery': osmquery, 'query_name': query_name})
        return jsonify({'status': True, 'message': 'Query Success', 'osmquery': osmquery, 'query_name': query_name}), 200

# Register route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')
    username = data.get('username')

    cursor = db.cursor()
    check_user_exist_query = "SELECT * FROM user_accounts WHERE account = %s"
    cursor.execute(check_user_exist_query, (account,))
    check_result = cursor.fetchone()

    if check_result:
        return jsonify({'status': False, 'message': 'Account already exists'}), 200

    salt = os.urandom(16).hex()
    hashed_password = hash_password(password, salt)

    insert_query = "INSERT INTO user_accounts (account, hashed_password, salt, username) VALUES (%s, %s, %s, %s)"
    cursor.execute(insert_query, (account, hashed_password, salt, username))
    db.commit()

    payload = {'username': username, 'account': account, 'role': 'User'}
    token = generate_jwt(payload)

    return jsonify({'status': True, 'message': 'Register successful', 'JWTtoken': token}), 200

# Login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    account = data.get('account')
    password = data.get('password')

    cursor = db.cursor()
    sql = "SELECT hashed_password, salt, role, username FROM user_accounts WHERE account = %s"
    cursor.execute(sql, (account,))
    result = cursor.fetchone()

    if not result:
        return jsonify({'status': False, 'message': 'Account is not exists'}), 200

    stored_hashed_password, salt, role, username = result

    hashed_login_password = hash_password(password, salt)

    if hashed_login_password == stored_hashed_password:
        payload = {'account': account, 'username': username, 'role': role}
        token = generate_jwt(payload)
        return jsonify({'status': True, 'message': 'Login Successful', 'JWTtoken': token}), 200
    else:
        return jsonify({'status': False, 'message': 'Login Failed: Invalid account or password.', 'JWTtoken': None}), 200

# JWT verify route
@app.route('/api/jwtverify', methods=['POST'])
def jwt_verify():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'no token'}), 401

    try:
        decoded = jwt.decode(token.split(' ')[1], os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        return jsonify({'status': True, 'message': 'Token Normal', 'data': decoded}), 200
    except jwt.ExpiredSignatureError as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Token Expired', 'detail': str(e)}), 200
    except jwt.InvalidTokenError as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Token Invalid', 'detail': str(e)}), 200
    except Exception as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Unknown Error', 'detail': str(e)}), 200

if __name__ == "__main__":
    app.run(port=3000)

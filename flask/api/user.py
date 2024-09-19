from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from utils.util import verify_JWTtoken, hash_password
from utils.MySQL import get_db_cursor
import mimetypes
from io import BytesIO
from PIL import Image
import uuid

user_blueprint = Blueprint('user', __name__)

# 允許上傳的頭像文件格式
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@user_blueprint.route('/api/user/updateName', methods=['PUT'])
def update_user_name():
    # 驗證JWT
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200
    
    user_id = JWTresponse["data"]["userID"]
    data = request.get_json()
    new_name = data.get('newName')

    if not new_name:
        return jsonify({'statusCode': 400, 'message': '名稱不可為空'}), 200

    # 更新名稱到資料庫
    try:
        cursor, connection = get_db_cursor()
        update_sql = "UPDATE users SET username = %s WHERE userID = %s"
        cursor.execute(update_sql, (new_name, user_id))
        connection.commit()
        return jsonify({'statusCode': 200, 'message': '名稱更新成功'}), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': f'更新名稱失敗: {e}'}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@user_blueprint.route('/api/user/updatePassword', methods=['PUT'])
def update_user_password():
    # 驗證JWT
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200
    
    user_id = JWTresponse["data"]["userID"]
    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({'statusCode': 400, 'message': '請填寫所有欄位'}), 200

    try:
        cursor, connection = get_db_cursor()
        # 驗證當前密碼
        cursor.execute("SELECT hashed_password, salt FROM users WHERE userID = %s", (user_id,))
        result = cursor.fetchone()

        if not result:
            return jsonify({'statusCode': 400, 'message': '使用者不存在'}), 200

        stored_hashed_password = result['hashed_password']
        stored_salt = result['salt']
        current_password_hashed = hash_password(current_password, stored_salt)

        if(current_password_hashed != stored_hashed_password):
            return jsonify({'statusCode': 400, 'message': '當前密碼不正確'}), 200

        # 生成新的鹽和加密的新密碼
        new_salt = os.urandom(16).hex()
        new_hashed_password = hash_password(new_password, new_salt)

        # 更新密碼和鹽到資料庫
        update_sql = "UPDATE users SET hashed_password = %s, salt = %s WHERE userID = %s"
        cursor.execute(update_sql, (new_hashed_password, new_salt, user_id))
        connection.commit()

        return jsonify({'statusCode': 200, 'message': '密碼更新成功'}), 200

    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': f'更新密碼失敗: {e}'}), 200

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@user_blueprint.route('/api/user/uploadAvatar', methods=['POST'])
def upload_avatar():
    # 驗證JWT
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

    user_id = JWTresponse["data"]["userID"]

    if 'avatar' not in request.files:
        return jsonify({'statusCode': 400, 'message': '未上傳任何文件'}), 200

    avatar = request.files['avatar']

    # 檢查文件類型是否允許
    if not allowed_file(avatar.filename):
        return jsonify({'statusCode': 400, 'message': '不支持的文件格式'}), 200

    # 檢查文件大小
    avatar.seek(0, os.SEEK_END)
    file_size = avatar.tell()
    avatar.seek(0)

    if file_size > 5 * 1024 * 1024:  # 超過5MB
        return jsonify({'statusCode': 400, 'message': '文件大小超過限制（5MB）'}), 200

    # 生成唯一的檔名
    filename = f"{uuid.uuid4()}{os.path.splitext(avatar.filename)[1]}"  # 保留原檔案格式

    # 確保目錄存在，沒有的話就創建
    upload_folder = 'uploads/avatars'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # 保存圖片文件到伺服器
    upload_path = os.path.join(upload_folder, filename)
    avatar.save(upload_path)  # 直接保存文件到目錄

    # 查找並刪除舊的頭像文件
    try:
        cursor, connection = get_db_cursor()
        cursor.execute("SELECT avatar_url FROM users WHERE userID = %s", (user_id,))
        old_avatar_url = cursor.fetchone().get('avatar_url')

        if old_avatar_url:
            old_avatar_path = os.path.join('uploads/avatars', old_avatar_url.rsplit('/', 1)[-1])
            if os.path.exists(old_avatar_path):
                os.remove(old_avatar_path)  # 刪除舊文件

        # 更新用戶的頭像URL到資料庫
        avatar_url = f'https://timmyhungback.pettw.online/uploads/avatars/{filename}'
        update_sql = "UPDATE users SET avatar_url = %s WHERE userID = %s"
        cursor.execute(update_sql, (avatar_url, user_id))
        
        # 加入提交的確認
        connection.commit()
        if cursor.rowcount == 0:
            # 如果資料庫沒有更新，記錄一個警告
            return jsonify({'statusCode': 500, 'message': '頭像更新失敗，資料庫未進行更新'}), 200

        return jsonify({'statusCode': 200, 'message': '頭像更新成功', 'avatar_url': avatar_url}), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': f'更新頭像失敗: {e}'}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@user_blueprint.route('/api/user/settings', methods=['GET'])
def get_user_settings():
    # 驗證JWT
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200
    
    user_id = JWTresponse["data"]["userID"]

    try:
        cursor, connection = get_db_cursor()

        # 查詢該使用者的設定
        select_sql = """
            SELECT filterCities, hideUnknownRecords, skipFetchLocationInfo, removeRecordAfterAddToFavorite
            FROM user_setting
            WHERE user_id = %s
        """
        cursor.execute(select_sql, (user_id,))
        result = cursor.fetchone()

        if not result:
            return jsonify({'statusCode': 404, 'message': '找不到使用者設定'}), 200

        # 返回設定結果
        user_settings = {
            'filterCities': bool(result['filterCities']),
            'hideUnknownRecords': bool(result['hideUnknownRecords']),
            'skipFetchLocationInfo': result['skipFetchLocationInfo'],
            'removeRecordAfterAddToFavorite': bool(result['removeRecordAfterAddToFavorite']),
        }
        return jsonify({'statusCode': 200, 'message': '成功取得使用者設定', 'settings': user_settings}), 200

    except Exception as e:
        return jsonify({'statusCode': 500, 'message': f'無法取得使用者設定: {e}'}), 200

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@user_blueprint.route('/api/user/settings/update', methods=['PUT'])
def update_user_settings():
    # 驗證JWT
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]

    if not JWTresponse["status"]:
        return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

    user_id = JWTresponse["data"]["userID"]
    data = request.get_json()

    filterCities = data.get('filterCities', True)
    hideUnknownRecords = data.get('hideUnknownRecords', True)
    skipFetchLocationInfo = data.get('skipFetchLocationInfo', 500)
    removeRecordAfterAddToFavorite = data.get('removeRecordAfterAddToFavorite', False)

    try:
        cursor, connection = get_db_cursor()

        update_sql = """
        UPDATE user_setting 
        SET filterCities = %s, hideUnknownRecords = %s, skipFetchLocationInfo = %s, removeRecordAfterAddToFavorite = %s 
        WHERE user_id = %s
        """
        cursor.execute(update_sql, (filterCities, hideUnknownRecords, skipFetchLocationInfo, removeRecordAfterAddToFavorite, user_id))
        connection.commit()

        return jsonify({'statusCode': 200, 'message': '設定更新成功'}), 200
    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': f'更新設定失敗: {e}'}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
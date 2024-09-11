import os
import requests
import jwt
from flask import Blueprint, request, jsonify, redirect
from utils.MySQL import get_db_cursor
from utils.util import hash_password, generate_jwt, verify_google_token, verify_apple_token, verify_JWTtoken, generate_otp_code

authorize_blueprint = Blueprint('authorize', __name__)
root = "/api/authorization"

@authorize_blueprint.route(root + '/jwtverify', methods=['POST'])
def jwt_verify():
    token = request.headers.get('Authorization').split(' ')[1]
    response, status_code = verify_JWTtoken(token)
    return jsonify(response), status_code


@authorize_blueprint.route(root + '/delete', methods=['DELETE'])
def deleteAccount():
    JWTtoken = request.args.get("JWTtoken")
    response, status_code = verify_JWTtoken(JWTtoken)
    if not response['status']:
        return jsonify(response), status_code

    account_type = response['data']['account_type']
    userID = response['data']['userID']

    if not account_type or not userID:
        return {"status": False, "message": "Missing account_type or userID"}, 200

    userID_column = ""
    match account_type:
        case "Native":
            userID_column = "userID"
        case "Google":
            userID_column = "google_userID"
        case "Apple":
            userID_column = "apple_userID"
        case "Discord":
            userID_column = "discord_userID"
        case _:
            return {"status": False, "message": "Invalid account type"}, 200

    cursor, connection = get_db_cursor()
    check_user_exist_query = f"SELECT email, account_type FROM users WHERE {userID_column} = %s"
    cursor.execute(check_user_exist_query, (userID,))
    check_result = cursor.fetchone()

    if not check_result:
        return {"status": False, "message": "User does not exist"}, 200

    delete_query = f"DELETE FROM users WHERE {userID_column} = %s AND account_type = %s"

    try:
        cursor.execute(delete_query, (userID, account_type))
        cursor.connection.commit()
        return {"status": True, "message": "Account deleted successfully"}, 200
    except Exception as e:
        cursor.connection.rollback()
        return {"status": False, "message": str(e)}, 500
    
    connection.close()

@authorize_blueprint.route(root + '/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    account_type = "Native"

    cursor, connection = get_db_cursor()
    check_user_exist_query = "SELECT email, account_type FROM users WHERE email = %s"
    cursor.execute(check_user_exist_query, (email,))
    check_result = cursor.fetchone()

    if check_result:
        email = check_result["email"]
        account_type = check_result["account_type"]
        return jsonify({'status': False, 'message': 'Account already exists', 'account_type': account_type}), 200

    salt = os.urandom(16).hex()
    hashed_password = hash_password(password, salt)

    insert_query = "INSERT INTO users (email, hashed_password, salt, username, account_type) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(insert_query, (email, hashed_password, salt, username, account_type))
    connection.commit()

    userID = cursor.lastrowid

    payload = {'username': username, 'account_type': account_type, 'role': 'User', 'userID': userID}
    token = generate_jwt(payload)

    connection.close()

    return jsonify({'status': True, 'message': 'Register successful', 'JWTtoken': token}), 200


@authorize_blueprint.route(root + '/login', methods=['POST'])
def login():
    data = request.get_json()
    loginType = data.get('type')
    cursor, connection = get_db_cursor()

    def create_new_user(email, username, role, google_userID=None, apple_userID=None, discord_userID=None):
        sql = """
            INSERT INTO users (email, username, role, google_userID, apple_userID, discord_userID, account_type) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (email, username, role, google_userID, apple_userID, discord_userID, loginType))
        cursor.connection.commit()

    def generate_response(loginType, username, role, userID, additional_payload={}):
        payload = {'account_type': loginType, 'username': username, 'role': role, 'userID': userID}
        payload.update(additional_payload)
        token = generate_jwt(payload)
        return jsonify({'status': True, 'message': message, 'JWTtoken': token}), 200

    def get_user_by_field(field, value):
        sql = f"SELECT role, userID, username, {field}, account_type FROM users WHERE {field} = %s"
        cursor.execute(sql, (value,))
        return cursor.fetchone()

    def check_email_exists(email):
        sql = "SELECT email, account_type FROM users WHERE email = %s"
        cursor.execute(sql, (email,))
        result = cursor.fetchone()
        cursor.connection.commit()
        return result

    match loginType:
        case "Native":
            email = data.get('email')
            password = data.get('password')

            result = check_email_exists(email)
            if result:
                db_email = result["email"]
                db_account_type = result["account_type"]
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200
            else:
                return jsonify({'status': False, 'message': 'Login Failed: Account does not exist'}), 200

            sql = "SELECT userID, hashed_password, salt, role, username FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            result = cursor.fetchone()
            userID = result["userID"]
            stored_hashed_password = result["hashed_password"]
            salt = result["salt"]
            role = result["role"]
            username = result["username"]
            hashed_login_password = hash_password(password, salt)

            if hashed_login_password == stored_hashed_password:
                message = 'Login Successful'
                return generate_response(loginType, username, role, userID)
            else:
                return jsonify({'status': False, 'message': 'Login Failed: Invalid account or password.', 'JWTtoken': None}), 200

        case "Google":
            access_token = data.get('access_token')
            user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers={'Authorization': f'Bearer {access_token}'}).json()

            email = user_info.get('email')
            name = user_info.get('name')
            picture = user_info.get('picture')
            google_userID = user_info.get('sub')

            result = check_email_exists(email)
            if result:
                db_email = result["email"]
                db_account_type = result["account_type"]
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200

            result = get_user_by_field('google_userID', google_userID)
            
            if not result: #使用者第一次登入
                role = 'User'
                username = name
                create_new_user(email, name, role, google_userID=google_userID)
                userID = cursor.lastrowid
                message = 'Register Successful'
            else:
                role = result["role"]
                username = result["username"]
                google_userID = result["google_userID"] 
                account_type = result["account_type"]
                userID = result["userID"]
                message = 'Login Successful'

            additional_payload = {'google_userID': google_userID,'picture': picture}
            return generate_response(loginType, username, role, userID, additional_payload)

        case "Apple":
            appleRes = data.get('appleRes')
            initLogin = appleRes.get("user") is not None
            apple_data = verify_apple_token(appleRes.get("authorization")["id_token"])
            email = apple_data.get('email')
            apple_userID = apple_data.get('sub')

            result = check_email_exists(email)
            if result:
                db_email = result["email"]
                db_account_type = result["account_type"]
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200

            result = get_user_by_field('apple_userID', apple_userID)
            
            if initLogin and not result: #使用者第一次登入
                role = 'User'
                username = appleRes.get("user")["name"]["lastName"] + appleRes.get("user")["name"]["firstName"]
                create_new_user(email, username, role, apple_userID=apple_userID)
                userID = cursor.lastrowid
                message = 'Register Successful'
            elif not initLogin and not result: #使用者已註冊過但資料庫沒有資料
                role = 'User'
                username = "使用者"
                create_new_user(email, username, role, apple_userID=apple_userID)
                userID = cursor.lastrowid
                message = 'Register Successful'
            else:
                role = result["role"]
                username = result["username"]
                apple_userID = result["apple_userID"] 
                account_type = result["account_type"]
                userID = result["userID"]
                message = 'Login Successful'

            additional_payload = {'apple_userID': apple_userID}
            return generate_response(loginType, username, role, userID, additional_payload)

        case _:
            return jsonify({'status': False, 'message': 'Bad Request'}), 400
    
    connection.close()


CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
REDIRECT_URI = "https://timmyhungback.pettw.online/api/authorization/discord/callback"
FRONTEND_URL = "https://timmyhung.pettw.online"

@authorize_blueprint.route(root + '/discord/callback', methods=['GET'])
def discord_callback():
    code = request.args.get('code')
    if not code:
        return redirect(f"{FRONTEND_URL}/login?error=Code is missing")

    token_url = 'https://discord.com/api/oauth2/token'
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    token_response = requests.post(token_url, data=data, headers=headers)
    if token_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=Failed to fetch token")

    access_token = token_response.json().get('access_token')
    if not access_token:
        return redirect(f"{FRONTEND_URL}/login?error=Failed to obtain access token")

    user_info_url = 'https://discord.com/api/users/@me'
    user_info_response = requests.get(user_info_url, headers={'Authorization': f'Bearer {access_token}'})
    if user_info_response.status_code != 200:
        return redirect(f"{FRONTEND_URL}/login?error=Failed to fetch user info")

    user_info = user_info_response.json()
    discord_user_id = user_info['id']
    username = user_info['global_name']
    email = user_info['email']
    picture = "https://cdn.discordapp.com/avatars/" + discord_user_id + "/" + user_info['avatar'] + ".png"

    cursor, connection = get_db_cursor()
    
    def create_new_user(email, username, role, discord_userID):
        sql = """
            INSERT INTO users (email, username, role, discord_userID, account_type) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (email, username, role, discord_userID, 'Discord'))
        cursor.connection.commit()

    def generate_response(username, role, userID, additional_payload={}):
        payload = {'account_type': 'Discord', 'username': username, 'role': role, 'userID': userID}
        payload.update(additional_payload)
        token = generate_jwt(payload)
        return token

    def get_user_by_field(field, value):
        sql = f"SELECT role, username, {field}, account_type, userID FROM users WHERE {field} = %s"
        cursor.execute(sql, (value,))
        return cursor.fetchone()

    def check_email_exists(email):
        sql = "SELECT email, account_type FROM users WHERE email = %s"
        cursor.execute(sql, (email,))
        result = cursor.fetchone()
        cursor.connection.commit()
        return result

    result = check_email_exists(email)
    if result:
        db_email = result["email"]
        db_account_type = result["account_type"]
        if db_email and db_account_type != 'Discord':
            return redirect(f"{FRONTEND_URL}/login?message=Login Failed: account exists&account_type={db_account_type}&status=false")

    result = get_user_by_field('discord_userID', discord_user_id)
    
    if not result: # 使用者第一次登入
        role = 'User'
        create_new_user(email, username, role, discord_user_id)
        message = 'Register Successful'
        userID = cursor.lastrowid
    else:
        role = result["role"]
        username = result["username"]
        discord_user_id = result["discord_userID"]
        account_type = result["account_type"]
        userID = result["userID"]
        message = 'Login Successful'

    additional_payload = {'discord_userID': discord_user_id, 'picture': picture}
    jwt_token = generate_response(username, role, userID, additional_payload)

    connection.close()
    return redirect(f"{FRONTEND_URL}/login?token={jwt_token}&message={message}&status=true")


#重設密碼
@authorize_blueprint.route(root + "/reset", methods=["POST"])
def resetPassword():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    if not email:
        return jsonify({'statusCode': 400, 'message': '請提供電子郵件'}), 200
    if not otp:
        return jsonify({'statusCode': 400, 'message': '請提供驗證碼'}), 200
    if not new_password:
        return jsonify({'statusCode': 400, 'message': '請提供新密碼'}), 200

    cursor, connection = get_db_cursor()

    # 檢查 OTP 是否正確
    check_otp_query = "SELECT otp, account_type, salt FROM users WHERE email = %s"
    cursor.execute(check_otp_query, (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'statusCode': 400, 'message': '無效的電子郵件或驗證碼'}), 200

    if user['otp'] != otp:
        return jsonify({'statusCode': 400, 'message': '驗證碼錯誤'}), 200

    if user['account_type'] != 'Native':
        return jsonify({'statusCode': 400, 'message': '只有原生帳戶可以重設密碼'}), 200

    # 為新密碼生成 hash 和 salt
    new_salt = os.urandom(16).hex()
    new_hashed_password = hash_password(new_password, new_salt)

    # 更新資料庫中的密碼和 salt
    update_password_query = "UPDATE users SET hashed_password = %s, salt = %s, otp = NULL WHERE email = %s"
    try:
        cursor.execute(update_password_query, (new_hashed_password, new_salt, email))
        connection.commit()
    except Exception as e:
        connection.rollback()
        return jsonify({'statusCode': 500, 'message': f'重設密碼失敗: {str(e)}'}), 200
    finally:
        connection.close()

    return jsonify({'statusCode': 200, 'message': '密碼重設成功'}), 200


#發送密碼重設OTP信件
@authorize_blueprint.route(root + "/otp", methods=["POST"])
def sendOTP():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'statusCode': 400, 'message': 'Email is required'}), 200

    cursor, connection = get_db_cursor()

    # 檢查帳號類型是否為 Native
    check_user_exist_query = "SELECT userID, account_type FROM users WHERE email = %s"
    cursor.execute(check_user_exist_query, (email,))
    user = cursor.fetchone()

    # 即使找不到用戶，還是返回同樣的訊息，避免洩露是否存在該信箱
    if user and user['account_type'] == 'Native':
        # 生成六位數的 OTP
        reset_code = generate_otp_code()

        # 更新資料庫中的 OTP 欄位
        update_otp_query = "UPDATE users SET otp = %s WHERE email = %s"
        try:
            cursor.execute(update_otp_query, (reset_code, email))
            connection.commit()
        except Exception as e:
            connection.rollback()
            return jsonify({'statusCode': 500, 'message': f'Failed to update OTP: {str(e)}'}), 200
        finally:
            connection.close()

        # 寄送 OTP 到使用者的 email
        send_mail(reset_code, email)

    # 無論帳號是否存在，皆回傳相同的訊息。
    return jsonify({'statusCode': 200, 'message': '如果這個信箱有註冊，系統會寄送重設密碼。', 'email': email}), 200

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from email.header import Header
# 寄送含有OTP的郵件
def send_mail(reset_code, recipient_email):
    smtp_server = os.getenv('SMTP_SERVER')
    smtp_port = os.getenv('SMTP_PORT')
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')

    sender_name = 'NLmap'
    sender_email = os.getenv('SMTP_USERNAME')

    # 建立郵件內容
    msg = MIMEMultipart('alternative')
    msg['From'] = formataddr((str(Header(sender_name, 'utf-8')), sender_email))
    msg['To'] = recipient_email
    msg['Subject'] = Header('密碼重設請求', 'utf-8')

    # HTML 郵件內容
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="text-align: center; padding: 5px;">
                    <tr>
                        <td style="text-align: center; vertical-align: middle;">
                            <img src="https://i.imgur.com/XUko08E.png" alt="Logo" style="height: 40px; display: inline-block; vertical-align: middle;"/>
                            <h2 style="color: #14466e; margin: 0; font-size: 24px; display: inline-block; vertical-align: middle;">NLmap 密碼重設請求</h2>
                        </td>
                    </tr>
                </table>
                
                <p style="text-align: center; font-size: 20px; color: #333;">這是您的密碼重置驗證碼：</p>
                <div style="text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #000;">
                    {reset_code}
                </div>
                <p style="text-align: center; color: #666; font-size: 14px;">
                    若您沒提出此要求，您可以安全的忽略這封電子郵件。
                </p>
                
                <hr style="border: 0; height: 1px; background-color: #eeeeee; margin: 20px 0;">
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="text-align: center; font-size: 12px; color: #999;">
                    <tr>
                        <td>
                            &copy; 2024 NLmap | 
                            <a href="https://timmyhung.pettw.online" style="color: #14466e; text-decoration: none;">NLmap 網站</a>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
    </html>
    """

    # 將 HTML 郵件內容加入 MIMEText
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    # try:
    # 發送郵件
    server = smtplib.SMTP_SSL(smtp_server, smtp_port)
    server.login(smtp_username, smtp_password)
    server.sendmail(sender_email, recipient_email, msg.as_string())
    server.quit()
    print("密碼重置郵件發送成功！")
    # except Exception as e:
    #     print(f"郵件發送失敗: {e}")
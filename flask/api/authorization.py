from flask import Blueprint, request, jsonify
from db import get_db_cursor, db
from utils import hash_password, generate_jwt, verify_google_token, verify_facebook_token, verify_apple_token
import requests
import os
import jwt


authorize_blueprint = Blueprint('authorize', __name__)
root = "/api/authorization"

def verify_jwt(token):
    if not token:
        return {'status': False, 'message': 'no token'}, 401
    try:
        decoded = jwt.decode(token, os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        return {'status': True, 'message': 'Token Normal', 'data': decoded}, 200
    except jwt.ExpiredSignatureError as e:
        return {'status': False, 'message': 'JWT Failed: Token Expired', 'detail': str(e)}, 200
    except jwt.InvalidTokenError as e:
        return {'status': False, 'message': 'JWT Failed: Token Invalid', 'detail': str(e)}, 200
    except Exception as e:
        return {'status': False, 'message': 'JWT Failed: ' + str(e)}, 200

@authorize_blueprint.route(root + '/jwtverify', methods=['POST'])
def jwt_verify():
    token = request.headers.get('Authorization').split(' ')[1]
    response, status_code = verify_jwt(token)
    return jsonify(response), status_code


@authorize_blueprint.route(root + '/delete', methods=['DELETE'])
def deleteAccount():
    JWTtoken = request.args.get("JWTtoken")
    response, status_code = verify_jwt(JWTtoken)
    if not response['status']:
        return jsonify(response), status_code

    account_type = response['data']['account_type']
    userID = response['data']['userID']

    if not account_type or not userID:
        return {"status": False, "message": "Missing account_type or userID"}, 200

    userID_column = ""
    match account_type:
        case "Native":
            userID_column = "user_ID"
        case "Google":
            userID_column = "google_userID"
        case "Apple":
            userID_column = "apple_userID"
        case "Discord":
            userID_column = "discord_userID"
        case _:
            return {"status": False, "message": "Invalid account type"}, 200

    cursor = get_db_cursor()
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

@authorize_blueprint.route(root + '/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    account_type = "Native"

    cursor = get_db_cursor()
    check_user_exist_query = "SELECT email, account_type FROM users WHERE email = %s"
    cursor.execute(check_user_exist_query, (email,))
    check_result = cursor.fetchone()

    if check_result:
        email, account_type = check_result
        return jsonify({'status': False, 'message': 'Account already exists', 'account_type': account_type}), 200

    salt = os.urandom(16).hex()
    hashed_password = hash_password(password, salt)

    insert_query = "INSERT INTO users (email, hashed_password, salt, username, account_type) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(insert_query, (email, hashed_password, salt, username, account_type))
    db.commit()

    userID = cursor.lastrowid

    payload = {'username': username, 'account_type': account_type, 'role': 'User', 'userID': userID}
    token = generate_jwt(payload)

    return jsonify({'status': True, 'message': 'Register successful', 'JWTtoken': token}), 200


@authorize_blueprint.route(root + '/login', methods=['POST'])
def login():
    data = request.get_json()
    loginType = data.get('type')
    cursor = get_db_cursor()

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
        sql = f"SELECT role, username, {field}, account_type FROM users WHERE {field} = %s"
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
                db_email, db_account_type = result
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200
            else:
                return jsonify({'status': False, 'message': 'Login Failed: Account does not exist'}), 200

            sql = "SELECT user_ID, hashed_password, salt, role, username FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            result = cursor.fetchone()
            userID, stored_hashed_password, salt, role, username = result
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
                db_email, db_account_type = result
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200

            result = get_user_by_field('google_userID', google_userID)
            
            if not result: #使用者第一次登入
                role = 'User'
                username = name
                create_new_user(email, name, role, google_userID=google_userID)
                message = 'Register Successful'
            else:
                role, username, db_google_userID, account_type = result
                message = 'Login Successful'

            additional_payload = {'picture': picture}
            return generate_response(loginType, username, role, db_google_userID, additional_payload)

        # case "Facebook":
        #     fb_res = data.get('fbRes')
        #     email = fb_res.get('email')
        #     name = fb_res.get('name')
        #     picture = fb_res.get('picture')['data']['url']
        #     facebook_userID = fb_res.get('id')

        #     result = check_email_exists(email)
        #     if result:
        #         db_email, db_account_type = result
        #         if db_email and db_account_type != loginType:
        #             return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200

        #     result = get_user_by_field('facebook_userID', facebook_userID)
            
        #     if not result:
        #         role = 'User'
        #         username = name
        #         create_new_user(email, username, role, facebook_userID=facebook_userID)
        #         message = "Register Successful"
        #     else:
        #         role, username, db_facebook_userID, account_type = result
        #         message = "Login Successful"

        #     additional_payload = {'name': name, 'picture': picture}
        #     return generate_response(loginType, username, role, additional_payload)

        case "Apple":
            appleRes = data.get('appleRes')
            initLogin = appleRes.get("user") is not None
            apple_data = verify_apple_token(appleRes.get("authorization")["id_token"])
            email = apple_data.get('email')
            apple_userID = apple_data.get('sub')

            result = check_email_exists(email)
            if result:
                db_email, db_account_type = result
                if db_email and db_account_type != loginType:
                    return jsonify({'status': False, 'message': 'Login Failed: account exists.', 'JWTtoken': None, 'account_type': db_account_type}), 200

            result = get_user_by_field('apple_userID', apple_userID)
            
            if initLogin and not result: #使用者第一次登入
                role = 'User'
                username = appleRes.get("user")["name"]["lastName"] + appleRes.get("user")["name"]["firstName"]
                create_new_user(email, username, role, apple_userID=apple_userID)
                message = 'Register Successful'
            else:
                role, username, apple_userID, account_type = result
                message = 'Login Successful'

            additional_payload = {'userID': apple_userID}
            return generate_response(loginType, username, role, apple_userID, additional_payload)

        case _:
            return jsonify({'status': False, 'message': 'Bad Request'}), 400


CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
REDIRECT_URI = "https://timmyhungback.pettw.online/api/authorization/discord/callback"
FRONTEND_URL = "https://timmyhung.pettw.online"

@authorize_blueprint.route('/api/authorization/discord/callback', methods=['GET'])
def callback():
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
    user_id = user_info['id']
    username = user_info['global_name']
    email = user_info['email']
    picture = "https://cdn.discordapp.com/avatars/" + user_id + "/" + user_info['avatar'] + ".png"

    cursor = get_db_cursor()
    def create_new_user(email, username, role, discord_userID):
        sql = """
            INSERT INTO users (email, username, role, discord_userID, account_type) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (email, username, role, discord_userID, 'Discord'))
        cursor.connection.commit()

    def generate_response(username, role, additional_payload={}):
        payload = {'account_type': 'Discord', 'username': username, 'role': role}
        payload.update(additional_payload)
        token = generate_jwt(payload)
        return token

    def get_user_by_field(field, value):
        sql = f"SELECT role, username, {field}, account_type FROM users WHERE {field} = %s"
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
        db_email, db_account_type = result
        if db_email and db_account_type != 'Discord':
            return redirect(f"{FRONTEND_URL}/login?message=Login Failed: account exists&account_type={db_account_type}&status=false")

    result = get_user_by_field('discord_userID', user_id)
    
    if not result: # 使用者第一次登入
        role = 'User'
        create_new_user(email, username, role, user_id)
        message = 'Register Successful'
    else:
        role, username, db_discord_userID, account_type = result
        message = 'Login Successful'

    additional_payload = {'username': username, 'picture': picture}
    jwt_token = generate_response(username, role, additional_payload)
    return redirect(f"{FRONTEND_URL}/login?token={jwt_token}&message={message}&status=true")

from flask import Blueprint, request, jsonify
from db import get_db_cursor
from utils import hash_password, generate_jwt, verify_google_token, verify_facebook_token, verify_apple_token
import requests

login_blueprint = Blueprint('login', __name__)

@login_blueprint.route('/api/login', methods=['POST'])
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

    def generate_response(loginType, username, role, additional_payload={}):
        payload = {'account_type': loginType, 'username': username, 'role': role}
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

            sql = "SELECT hashed_password, salt, role, username FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            result = cursor.fetchone()
            stored_hashed_password, salt, role, username = result
            hashed_login_password = hash_password(password, salt)

            if hashed_login_password == stored_hashed_password:
                message = 'Login Successful'
                return generate_response(loginType, username, role)
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

            additional_payload = {'name': name, 'picture': picture}
            return generate_response(loginType, username, role, additional_payload)

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
            return generate_response(loginType, username, role, additional_payload)

        case _:
            return jsonify({'status': False, 'message': 'Bad Request'}), 400

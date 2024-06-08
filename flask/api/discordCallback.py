from flask import Blueprint, request, redirect, jsonify
import requests
import os
from utils import generate_jwt
from db import get_db_cursor

discord_callback_blueprint = Blueprint('discordCallback', __name__)

CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
REDIRECT_URI = "https://timmyhungback.pettw.online/api/discord/callback"
FRONTEND_URL = "https://timmyhung.pettw.online"  # 替換為你的前端 URL

@discord_callback_blueprint.route('/api/discord/callback', methods=['GET'])
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
    print(user_info)
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
            print(result)
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

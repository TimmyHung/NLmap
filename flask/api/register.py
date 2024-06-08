from flask import Blueprint, request, jsonify
from db import get_db_cursor, db
from utils import hash_password, generate_jwt
import os

register_blueprint = Blueprint('register', __name__)

@register_blueprint.route('/api/register', methods=['POST'])
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

    payload = {'username': username, 'account_type': account_type, 'role': 'User'}
    token = generate_jwt(payload)

    return jsonify({'status': True, 'message': 'Register successful', 'JWTtoken': token}), 200

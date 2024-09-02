import hashlib
import jwt
import os
import requests
from utils.MySQL import get_db_cursor

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def generate_jwt(payload):
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')

def verify_google_token(access_token):
    response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}')
    return response.json() if response.status_code == 200 else None

def verify_apple_token(appleJWT):
    return jwt.decode(appleJWT, options={"verify_signature": False})

def save_queryLog(user_id, query_text, query, model_name, prompt_tokens, completion_tokens, total_tokens, valid):
    cursor, connection = get_db_cursor()
    try:
        sql = "INSERT INTO query_logs (user_id, query_text, query, model_name, prompt_tokens, completion_tokens, total_tokens, valid) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (user_id, query_text, query, model_name, prompt_tokens, completion_tokens, total_tokens, valid))
        connection.commit()
    except Exception as e:
        print(f"新增QueryLogs時發生錯誤： {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def verify_JWTtoken(token):
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



# from openai import OpenAI
# 自費OpenAI Token
# def self_chat_completion(prompt):
#     client = OpenAI(
#         api_key = os.getenv("OPENAI_API_KEY"),
#     )
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[{"role": "user", "content": prompt}]
#     )
#     return response.choices[0].message.content.strip()


    
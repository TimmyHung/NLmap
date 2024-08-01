import hashlib
import jwt
import os
import requests

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def generate_jwt(payload):
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')

def verify_google_token(access_token):
    response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}')
    return response.json() if response.status_code == 200 else None

# def verify_facebook_token(access_token):
#     response = requests.get(f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email')
#     return response.json() if response.status_code == 200 else None

def verify_apple_token(appleJWT):
    return jwt.decode(appleJWT, options={"verify_signature": False})


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


    
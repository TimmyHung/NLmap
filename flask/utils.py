import hashlib
import jwt
import os
import requests
from openai import OpenAI

def hash_password(password, salt):
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def generate_jwt(payload):
    return jwt.encode(payload, os.getenv('JWT_SECRET_KEY'), algorithm='HS256')

def verify_google_token(access_token):
    response = requests.get(f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}')
    return response.json() if response.status_code == 200 else None

def verify_facebook_token(access_token):
    response = requests.get(f'https://graph.facebook.com/me?access_token={access_token}&fields=id,name,email')
    return response.json() if response.status_code == 200 else None

def verify_apple_token(appleJWT):
    return jwt.decode(appleJWT, options={"verify_signature": False})

def chat_completion(prompt, role='You are a OverpassQL expert.', model_engine="gpt35",
                     temperature=0.7, top_p=0.95, max_tokens=1024,
                     frequency_penalty=0, presence_penalty=0, stop=None):
    args = {
        'prompt': prompt,
        'role': role,
        'model_engine': model_engine,
        'temperature': temperature,
        'top_p': top_p,
        'max_tokens': max_tokens,
        'frequency_penalty': frequency_penalty,
        'presence_penalty': presence_penalty,
        'stop': stop
    }
    try:
        response = requests.post("http://lingpu.im.tku.edu.tw:35130/api/v1/chat/completions", json=args)
        response_json = response.json()
        message = response_json['message']

        return message
    except:
        return None

def self_chat_completion(prompt):
    client = OpenAI(
        api_key = os.getenv("OPENAI_API_KEY"),
    )
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()
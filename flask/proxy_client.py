#
#  proxy_client.py
#   an api client to call gpt3.5 or gpt4.
#
# Reference:
#   https://learn.microsoft.com/zh-tw/azure/cognitive-services/openai/how-to/chatgpt?pivots=programming-language-chat-completions
#
import requests
import os
from openai import OpenAI

url = 'http://lingpu.im.tku.edu.tw:35130/api/chat'

# prompt: the instruction
# mode_engine: gpt35 or gpt4
# temperature: 0 ~ 1 (decide how creative the answer is generated)
# top_p: 0 ~ 1 (decide how many most probable words to select)
# max_tokens: 0 ~ 2048 tokens
def chat_completion(prompt, model_engine="gpt35", temperature=0.7, top_p=0.95, max_tokens=1024):
    args = {
        'prompt': prompt,
        'model_engine': model_engine,
        'temperature': temperature,
        'top_p': top_p,
        'max_tokens': max_tokens
    }

    response = requests.post(url, json=args)

    response_json = response.json()
    message = response_json['message']

    return message

url2 = 'http://lingpu.im.tku.edu.tw:35130/api/v1/chat/completions'

# prompt: the instruction
# role: the role of the AI model to follow the prompt instruction
# mode_engine: 'gpt35' or 'gpt4'
# temperature: 0 ~ 1 (decide how creative the answer is generated)
# top_p: 0 ~ 1 (decide how many most probable words to select)
# max_tokens: 0 ~ 2048 tokens
# frequency_penalty = 0 (decide how generated words are discrouaged, a value added to the log-probability of a token)
# presence_penalty = 0 (decide how ungenerated words are encouraged, a value subtracted from the log-probability of a token)
# stop = None, (words or a list of words to stop the generated text)
def chat_completion2(prompt, role='You are a OverpassQL expert.', model_engine="gpt35",
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
        response = requests.post(url2, json=args)
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
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY_CHATGPT'))

"""
使用gpt35或gpt4o生成文字
可以先定義角色(system role)
"""
def chat_completion(model,prompt):
    match model:
        case "gpt4o":
            response = client.chat.completions.create(messages=prompt,model="gpt-4o")
            return {"content": response.choices[0].message.content ,"response_metadata": {"model_name": response.model, "token_usage": response.usage.__dict__}} 
        case "gpt35":
            response = client.chat.completions.create(messages=prompt,model="gpt-3.5-turbo")
            return {"content": response.choices[0].message.content ,"response_metadata": {"model_name": response.model, "token_usage": response.usage.__dict__}} 


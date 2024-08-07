import os
import requests

# 從環境變量讀取 API 金鑰
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# 設置請求標頭
headers = {
    'Authorization': f'Bearer {OPENAI_API_KEY}',
}

# 發送請求
response = requests.get('https://api.openai.com/v1/engines/davinci/completions', headers=headers)

# 處理響應
print(response.json())


from langchain_openai import AzureOpenAI, AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain.schema import HumanMessage
import os

API_KEY = "525b241353b28b19a7e8b443840f58e4"


llm35 = AzureOpenAI(
    deployment_name='ETHCI',
    api_version='2023-05-15',
    api_key=API_KEY,
    azure_endpoint='https://lingpu.im.tku.edu.tw',
    model='gpt-35-turbo',
    temperature=0,
    max_tokens=80
)

gpt35 = AzureChatOpenAI(
    deployment_name='ETHCI',
    api_version='2023-05-15',
    api_key=API_KEY,
    azure_endpoint='https://lingpu.im.tku.edu.tw',
    model='gpt-35-turbo',
    temperature=0.2,
    # max_tokens=80
)

gpt4 = AzureChatOpenAI(
    deployment_name='ETHCIGPT4',
    api_version='2023-05-15',
    api_key=API_KEY,
    azure_endpoint='https://lingpu.im.tku.edu.tw',
    model='gpt-4',
    temperature=0.2,
    # max_tokens=80
)

embeddings = AzureOpenAIEmbeddings(
    deployment='ETHCI-ada2',
    openai_api_key=API_KEY,
    azure_endpoint='https://lingpu.im.tku.edu.tw',
    model='text-embedding-ada-002',
    chunk_size=1
)



"""
使用llm35生成文字
只能提問題讓它生成，不能紀錄上下對話或先定義角色(system role)
在本次專題中基本上不會用到
"""
def completion(prompt):
    return llm35.invoke(input=prompt)


"""
使用gpt35或gpt4生成文字
可以先定義角色(system role)
"""
def chat_completion(model,prompt):
    try:
        match model:
            case "gpt4":
                if(isinstance(prompt,list)):
                    response = gpt4.invoke(input=prompt)
                else:
                    response = gpt4.invoke(input=[HumanMessage(content=prompt)])
                return {"content": response.content,"response_metadata": response.response_metadata} 
            case "gpt35" | _:
                if(isinstance(prompt,list)):
                    response = gpt35.invoke(input=prompt)
                else:
                    response = gpt35.invoke(input=[HumanMessage(content=prompt)])
                return {"content": response.content,"response_metadata": response.response_metadata}
    except TypeError as e:
        if "'NoneType' object is not iterable" in (str(e)):
            return None
    

"""
文本嵌入為向量
"""
def text_embedding(text):
    return embeddings.embed_query(msg)


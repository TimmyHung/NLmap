from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from utils.azure_openai import chat_completion
from utils.util import save_queryLog, verify_JWTtoken
import os
import json
import pickle
import uuid
import shutil

datasetNL = "./assets/dataset.dev.nl"
datasetQuery = "./assets/dataset.dev.query"
persist_directory = './chroma_persist_db'
modification_time_file = './assets/modification_times.json'
datalist_file = 'assets/datalist.pkl'

# 檢查檔案的修改日期
def get_last_modified_time(filepath):
    return os.path.getmtime(filepath)

# 儲存最後的修改時間到 JSON
def save_last_modified_times():
    modified_times = {
        'datasetNL': get_last_modified_time(datasetNL),
        'datasetQuery': get_last_modified_time(datasetQuery)
    }
    with open(modification_time_file, 'w', encoding='utf-8') as f:
        json.dump(modified_times, f)

# 加載最後的修改時間
def load_last_modified_times():
    if os.path.exists(modification_time_file):
        with open(modification_time_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        return None

# 檢查是否需要重新加載數據
def needs_reload():
    last_times = load_last_modified_times()
    if last_times is None:
        return True
    return (get_last_modified_time(datasetNL) > last_times['datasetNL'] or
            get_last_modified_time(datasetQuery) > last_times['datasetQuery'])

# 加載或初始化資料庫
def loadData():
    global DataList

    # 如果需要重載或資料庫目錄不存在，或者 datalist.pkl 不存在
    if needs_reload() or not os.path.exists(persist_directory) or not os.path.exists(datalist_file):
        print("偵測到新資料，重新建構ChromaDB。")
        if os.path.exists(persist_directory):
            shutil.rmtree(persist_directory)  # 刪除舊的資料庫目錄
        
        with open(datasetNL, "r", encoding="utf-8") as f:
            Nl_List = [line.strip() for line in f.readlines()]

        with open(datasetQuery, "r", encoding="utf-8") as f:
            Query_List = [line.strip() for line in f.readlines()]

        DataList = {nl: query for nl, query in zip(Nl_List, Query_List)}

        # 保存 DataList 以便後續使用
        with open(datalist_file, 'wb') as f:
            pickle.dump(DataList, f)

        model_name = "sentence-transformers/all-MiniLM-L6-v2"
        model_kwargs = {'device': 'cpu'}
        embedding = HuggingFaceEmbeddings(model_name=model_name, model_kwargs=model_kwargs)
        
        # 建立並持久化 Chroma 資料庫
        client = Chroma.from_texts(Nl_List, embedding=embedding, persist_directory=persist_directory)
        
        # 儲存修改時間
        save_last_modified_times()
    else:
        print("沒有新資料，從ChromaDB持久化啟動。")
        client = Chroma(embedding_function=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"), persist_directory=persist_directory)
        
        # 從文件中重新加載 DataList
        with open(datalist_file, 'rb') as f:
            DataList = pickle.load(f)
        
    return client


def combineSystemRoleText(search_results, prompt):
    # promptText = f"Help me generate Overpass Query Language for querying OpenStreetMap, related to the term: {prompt}\n"
    promptText = "Respond with just the `query_name` and `data`. Do not include `{` or `}` in the response. After `data=`, include the entire query string without any explanation.\n"
    promptText += "Format your response like this: query_name={NAME PLACEHOLDER}|||data=[out:json][timeout:60];{INSERT_QUERY_HERE};out;>;out skel qt;\n"
    promptText += "Ensure that you replace the entire `{NAME PLACEHOLDER}` with the appropriate Traditional Chinese (zh_tw) words representing this query.\n"
    promptText += "If you determine that the prompt is not a valid query, respond with: query_name=null|||data=null\n"
    promptText += "I will provide a few example phrases for reference, but please note these are only for guidance. If you find the example phrases unhelpful, feel free to generate them yourself.\n"
    promptText += "Example phrases and expected responses are:\n"

    # 檢查並去重搜尋結果
    unique_results = []
    seen_queries = set()
    for result in search_results:
        if result.page_content not in seen_queries:
            unique_results.append(result)
            seen_queries.add(result.page_content)
    
    for i in range(min(len(unique_results), 5)):  # 防止結果不足5個
        promptText += str(unique_results[i].page_content) + "\n" + "query_name={NAME PLACEHOLDER}|||" + str(DataList[unique_results[i].page_content]) + "\n"
    
    promptText += "Now only generate one query response."

    print("\n==================\n" + promptText + "\n=================\n")
    return promptText

def query(chromaDB, model, prompt, JWTtoken, bounds):
    search_results = chromaDB.similarity_search(prompt, k=5)

    if(model == "gpt4o"):
        return {'statuscode': 403, 'message': '查詢失敗\nGPT-4o暫時不開放使用。'}

    promptText = [
        (
            "system",
            combineSystemRoleText(search_results, prompt)
        ),
        ("human", prompt),
    ]
    response = chat_completion(model, promptText)

    if response == None:
        return {'statuscode': 429, 'message': '查詢失敗: 速率限制'}
    else:
        
        print(response["content"])
        query_name = response["content"].split("|||")[0].replace("query_name=", "").replace("{","").replace("}","")
        osmquery = response["content"].split("|||")[1].replace("data=", "")

        JWTresponse = verify_JWTtoken(JWTtoken)[0]

        user_id = JWTresponse["data"]["userID"] if JWTresponse["status"] else None
        query = osmquery.replace("{{bbox}}", bounds)
        model_name = response["response_metadata"]["model_name"]
        prompt_tokens = response["response_metadata"]["token_usage"]["prompt_tokens"]
        completion_tokens = response["response_metadata"]["token_usage"]["completion_tokens"]
        total_tokens = response["response_metadata"]["token_usage"]["total_tokens"]
        valid = osmquery != "null"
        # 儲存查詢日誌
        save_queryLog(user_id, query, model_name, prompt_tokens, completion_tokens, total_tokens, valid)
        
        # 資料返回給前端
        if osmquery == "null":
            return {'statuscode': 400, 'message': '查詢失敗，無效的查詢字詞。'}
        else:
            return {'statuscode': 200, 'message': '查詢成功', 'osmquery': osmquery, 'query_name': query_name, 'response_metadata': response["response_metadata"]}

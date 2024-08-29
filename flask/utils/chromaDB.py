from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from utils.azure_openai import chat_completion
from utils.util import save_queryLog
import os
import json
import pickle
import uuid

datasetNL = "./assets/dataset.dev.nl"
datasetQuery = "./assets/dataset.dev.query"
persist_directory = './chroma_persist_db'
modification_time_file = './assets/modification_times.json'

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
    if needs_reload() or not os.path.exists(persist_directory):
        print("偵測到新資料，重新建構ChromaDB。")
        with open(datasetNL, "r", encoding="utf-8") as f:
            Nl_List = [line.strip() for line in f.readlines()]

        with open(datasetQuery, "r", encoding="utf-8") as f:
            Query_List = [line.strip() for line in f.readlines()]

        DataList = {nl: query for nl, query in zip(Nl_List, Query_List)}

        # 保存 DataList 以便後續使用
        with open('assets/datalist.pkl', 'wb') as f:
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
        with open('assets/datalist.pkl', 'rb') as f:
            DataList = pickle.load(f)
        
    return client


def combineSystemRoleText(search_results, prompt):
    # promptText = f"Help me generate Overpass Query Language for querying OpenStreetMap, related to the term: {prompt}\n"
    promptText = "Respond with just the \"query_name\" without { or } and\"data\"，after \"data=\" all should be of the querystring and no explanation.\n"
    promptText += "Format your response like this: query_name={NAME PLACEHOLDER}|||data=[out:json][timeout:45];{INSERT_QUERY_HERE};out;>;out skel qt;\n"
    promptText += "Be careful you should replace the entire {NAME PLACEHOLDER} with the corresponding words in Traditional Chinese (zh_tw) that represent this query.\n"
    promptText += "If you think the prompt is not a valid query you should response query_name=null|||data=null"
    promptText += "Example phrases and expected responses are:\n"
    for i in range(0,5):
        promptText += str(search_results[i].page_content) + "\n" + "query_name={NAME PLACEHOLDER}|||" + str(DataList[search_results[i].page_content]) + "\n"
    promptText += "Now only generate one query response."

    print("\n==================\n" + promptText + "\n=================\n")
    return promptText

def query(chromaDB, model, prompt):
    search_results = chromaDB.similarity_search(prompt, k=5)

    if(model == "gpt4o"):
        return {'statucode': 403, 'message': '查詢失敗\nGPT-4o暫時不開放使用。'}

    promptText = [
        (
            "system",
            combineSystemRoleText(search_results, prompt)
        ),
        ("human", prompt),
    ]
    response = chat_completion(model, promptText)

    if response == None:
        return {'statucode': 429, 'message': '查詢失敗: 速率限制'}
    else:
        print(response["content"])
        query_name = response["content"].split("|||")[0].replace("query_name=", "").replace("{","").replace("}","")
        osmquery = response["content"].split("|||")[1].replace("data=", "")

        # 提取 response_metadata 中的 token 使用情況
        request_id = str(uuid.uuid4())  # 生成唯一的 request_id
        model_name = response["response_metadata"]["model_name"]
        prompt_tokens = response["response_metadata"]["token_usage"]["prompt_tokens"]
        completion_tokens = response["response_metadata"]["token_usage"]["completion_tokens"]
        total_tokens = response["response_metadata"]["token_usage"]["total_tokens"]
        valid = osmquery != "null"
        # 儲存查詢日誌
        save_queryLog(request_id, model_name, prompt_tokens, completion_tokens, total_tokens, valid)
        
        # 資料返回給前端
        if osmquery == "null":
            return {'statucode': 400, 'message': '查詢失敗，無效的查詢字詞。'}
        else:
            return {'statucode': 200, 'message': '查詢成功', 'osmquery': osmquery, 'query_name': query_name, 'response_metadata': response["response_metadata"]}

from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from utils.azure_openai import chat_completion

datasetNL = "./assets/dataset.dev.nl"
with open(datasetNL, "r", encoding="utf-8") as f:
    temp = f.readlines()
Nl_List = [line.strip() for line in temp]

datasetQuery = "./assets/dataset.dev.query"
with(open(datasetQuery, "r", encoding="utf-8") as f):
    temp = f.readlines()
Query_List = [line.strip() for line in temp]

DataList = {nl: query for nl, query in zip(Nl_List, Query_List)}


def loadData():
    # persist_directory = 'db'
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    # model_kwargs = {'device': 'cuda'} #cuda核心跑比較快
    model_kwargs = {'device': 'cpu'}
    embedding = HuggingFaceEmbeddings(model_name=model_name,model_kwargs=model_kwargs)
    client = Chroma.from_texts(Nl_List, embedding=embedding)
    return client

def combineSystemRoleText(search_results, prompt):
    # promptText = f"Help me generate Overpass Query Language for querying OpenStreetMap, related to the term: {prompt}\n"
    promptText = "Respond with just the \"query_name\" without { or } and\"data\"，after \"data=\" all should be of the querystring and no explanation.\n"
    promptText += "Format your response like this: query_name=FEW TAIWAN STYLE zh_TW WORDS REPRESENT THIS QUERY|||data=[out:json][timeout:45];{INSERT_QUERY_HERE};out;>;out skel qt;\n"
    promptText += "Example phrases and expected responses are:\n"
    for i in range(0,5):
        promptText += str(search_results[i].page_content) + "\n" + "query_name={FEW TAIWAN STYLE zh_TW WORDS REPRESENT THIS QUERY}|||" + str(DataList[search_results[i].page_content]) + "\n"
    promptText += "Now only generate one query response."

    print("\n==================\n" + promptText + "\n=================\n")
    return promptText

def query(chromaDB, model, prompt):
    search_results = chromaDB.similarity_search(prompt, k=5)
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
        return {'statucode': 200, 'message': '查詢成功', 'osmquery': osmquery, 'query_name': query_name, 'response_metadata': response["response_metadata"]}

from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from proxy_client import chat_completion2

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

def query(client, prompt):
    search_results = client.similarity_search(prompt, k=5)
    promptText = combinePromptText(search_results, prompt)
    print(promptText)
    response = chat_completion2(promptText)
    if response:
        return response.strip().replace("台灣",'臺灣')
    else:
        return response

def combinePromptText(search_results, prompt):
    promptText = "你現在是一位Overpass Query Language的專家，請幫我參考以下例子並生成OverPass QL，輸出的格式僅限OverPass QL其餘多餘的文字請不要回答我：\n"
    for i in range(0,5):
        promptText += "提問詞：" + str(search_results[i].page_content) + "。正確輸出格式：" + str(DataList[search_results[i].page_content]) + "\n"
    promptText += "請幫我生成提問詞： " + prompt + " 的Query，請嚴格遵守回答格式。若QL輸出格式並非[out:json]請幫我改一下或請幫我補上。"

    return promptText

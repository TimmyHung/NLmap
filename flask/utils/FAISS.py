import datetime
import os
from openai import OpenAI
import faiss
import pickle
import numpy as np
import tiktoken
from dotenv import load_dotenv
from utils.MySQL import get_db_cursor

load_dotenv()

client = OpenAI(
    api_key=os.environ.get('OPENAI_API_KEY_TEXT_EMBEDDING'),
)

# 資料檔案和嵌入向量檔案的路徑
DATA_FILE_NL = './assets/dataset.nl'
DATA_FILE_QL = './assets/dataset.ql'
EMBEDDINGS_FILE = './assets/embeddings.pkl'
FAISS_INDEX_FILE = './assets/faiss.index'

def log(text):
    print(f"[FAISS] {text}")

# 計算文字的token數
def num_tokens_from_string(string: str, encoding_name: str = "cl100k_base") -> int:
    encoding = tiktoken.get_encoding(encoding_name)
    return len(encoding.encode(string))

def load_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines

def log_embedding_to_db(user_id, token_count):
    cursor, connection = get_db_cursor()
    try:
        cursor.execute(
            "INSERT INTO textembedding_log (user_id, token) VALUES (%s, %s)",
            (user_id if user_id is not None else 0, token_count)
        )
        connection.commit()
    except Exception as e:
        print(f"無法插入資料到資料庫: {e}")
    finally:
        cursor.close()
        connection.close()

def compute_embeddings(questions):
    embeddings = []
    batch_size_limit = 8000
    current_batch = []
    current_token_count = 0
    response_total_count = 0

    for i, question in enumerate(questions):
        question_token_count = num_tokens_from_string(question)

        if current_token_count + question_token_count > batch_size_limit:
            # 發送當前 batch 到 API
            response = client.embeddings.create(
                input=current_batch,
                model='text-embedding-3-large'
            )
            batch_embeddings = [res.embedding for res in response.data]
            embeddings.extend(batch_embeddings)

            response_total_count += response.usage.total_tokens

            # 清空 batch 並重置 token 計數器
            current_batch = []
            current_token_count = 0
            log(f'已處理 {i} / {len(questions)} 個問題')

        # 加入問題到當前 batch
        current_batch.append(question)
        current_token_count += question_token_count

    # 發送最後一個 batch 到 API
    if current_batch:
        response = client.embeddings.create(
            input=current_batch,
            model='text-embedding-3-large'
        )
        batch_embeddings = [res.embedding for res in response.data]
        embeddings.extend(batch_embeddings)
        response_total_count += response.usage.total_tokens
        log(f'已處理 {len(questions)} / {len(questions)} 個問題')
    
    log_embedding_to_db(0, response_total_count)

    return embeddings

def save_embeddings(embeddings, questions, file_path):
    with open(file_path, 'wb') as f:
        pickle.dump({'embeddings': embeddings, 'questions': questions}, f)

def load_embeddings(file_path):
    with open(file_path, 'rb') as f:
        data = pickle.load(f)
    return data['embeddings'], data['questions']

def build_faiss_index(embeddings):
    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings).astype('float32'))
    return index

def save_faiss_index(index, file_path):
    faiss.write_index(index, file_path)

def load_faiss_index(file_path):
    index = faiss.read_index(file_path)
    return index

def search_similar_questions(query, index, questions, top_k=5):
    response = client.embeddings.create(
        input=query,
        model='text-embedding-3-large'
    )
    query_embedding = np.array(response.data[0].embedding).astype('float32').reshape(1, -1)
    distances, indices = index.search(query_embedding, top_k)
    results = [(questions[i], distances[0][idx], i) for idx, i in enumerate(indices[0])]  # 同時返回索引
    tokenUsage = response.usage.total_tokens
    return results,tokenUsage

def remove_question_by_index(index_to_remove, questions, embeddings):
    question = questions.pop(index_to_remove)
    embeddings.pop(index_to_remove)
    log(f'已移除問題：「{question}」及其對應的嵌入向量。')

def rebuild_faiss_index(embeddings):
    if embeddings:
        dimension = len(embeddings[0])
        index = faiss.IndexFlatL2(dimension)
        index.add(np.array(embeddings).astype('float32'))
        log('已重建 FAISS 索引。')
        return index
    else:
        log('嵌入向量列表為空，無法重建 FAISS 索引。')
        return None

def detect_removed_questions(dataset_questions, current_questions):
    removed_questions = []
    for idx, question in enumerate(current_questions):
        if question not in dataset_questions:
            removed_questions.append((idx, question))
    return removed_questions

def FAISS_initialize():
    # 載入現有的嵌入向量和問題列表
    if os.path.exists(EMBEDDINGS_FILE):
        log('載入已有的嵌入向量')
        embeddings, existing_questions = load_embeddings(EMBEDDINGS_FILE)
    else:
        embeddings = []
        existing_questions = []

    # 載入數據集中所有問題
    all_questions_nl = load_data(DATA_FILE_NL)
    all_questions_ql = load_data(DATA_FILE_QL)  # 載入 dataset.dev.ql

    # 檢測現有的問題列表中是否有問題已被移除
    removed_questions = detect_removed_questions(all_questions_nl, existing_questions)

    if removed_questions:
        log(f'發現 {len(removed_questions)} 個問題已被移除:')
        # 反向刪除，以避免索引問題
        for idx, question in reversed(removed_questions):
            log(f'行數：{idx}, 問題：{question}')
            remove_question_by_index(idx, existing_questions, embeddings)

        # 重建 FAISS 索引並保存
        index = rebuild_faiss_index(embeddings)
        save_faiss_index(index, FAISS_INDEX_FILE)
        save_embeddings(embeddings, existing_questions, EMBEDDINGS_FILE)

    # 找出新增的問題
    new_questions = [q for q in all_questions_nl if q not in existing_questions]

    if new_questions:
        log(f'發現 {len(new_questions)} 個新增問題，正在計算嵌入向量')
        new_embeddings = compute_embeddings(new_questions)

        # 更新嵌入向量和問題列表
        embeddings.extend(new_embeddings)
        existing_questions.extend(new_questions)

        # 保存更新後的嵌入向量和問題列表
        log('保存更新後的嵌入向量')
        save_embeddings(embeddings, existing_questions, EMBEDDINGS_FILE)

    # 構建或載入FAISS索引
    if os.path.exists(FAISS_INDEX_FILE):
        log('載入已有的FAISS索引')
        index = load_faiss_index(FAISS_INDEX_FILE)
        # 如果有新增的嵌入向量，更新索引
        if new_questions:
            log('更新FAISS索引')
            new_embeddings_array = np.array(new_embeddings).astype('float32')
            index.add(new_embeddings_array)
            save_faiss_index(index, FAISS_INDEX_FILE)
    else:
        log('構建新的FAISS索引')
        embeddings_array = np.array(embeddings).astype('float32')
        index = faiss.IndexFlatL2(embeddings_array.shape[1])
        index.add(embeddings_array)
        save_faiss_index(index, FAISS_INDEX_FILE)


    return index, existing_questions, all_questions_ql
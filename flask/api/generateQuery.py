import requests
import threading
import json
from flask import Blueprint, request, jsonify
from utils.chromaDB import loadData, query as chroma_query
from utils.MySQL import get_db_cursor
from utils.util import verify_JWTtoken

query_blueprint = Blueprint('query', 'query')
chromaDB = loadData()

@query_blueprint.route('/api/query', methods=['GET'])
def getQuery():
    # 從查詢參數中獲取資料
    promptText = request.args.get('queryNL')
    model = request.args.get('model')
    bounds = request.args.get('bounds')
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]

    if not promptText or not model:
        return jsonify({"statuscode": 400, "message": "Missing queryNL or model parameters"}), 400

    # 執行生成Overpass QL的邏輯
    query_response = chroma_query(chromaDB, model, promptText, JWTtoken, bounds)

    # 立即返回查詢結果給前端
    # if query_response['statuscode'] != 200:
    #     return jsonify(query_response), query_response.get('statuscode', 500)

    # 非同步執行儲存歷史紀錄的操作
    # if JWTtoken:
    #     threading.Thread(target=save_query_result_async, args=(JWTtoken, promptText, query_response)).start()

    return jsonify(query_response), 200

# def save_query_result_async(JWTtoken, query_text, query_response, bounds):
#     response, status_code = verify_JWTtoken(JWTtoken)
#     if not response["status"]:
#         return
#     user_id = response["data"]["userID"]

#     # try:
#     # 從查詢結果中取得 Overpass QL 查詢字串
#     overpass_query = query_response['osmquery']
#     overpass_url = "http://overpass-api.de/api/interpreter"
#     overpass_data = overpass_query.replace("{{bbox}}", bounds)

#     response = requests.post(overpass_url, data={'data': overpass_data})

#     result_data = response.json()
#     elements = result_data.get('elements', [])
    
#     # 如果 elements 是空的列表，則不進行任何操作
#     if not elements:
#         return

#     elements_json = json.dumps(elements)  # 轉換為 JSON 字串以便比對

#     cursor, connection = get_db_cursor()
#     try:
#         # 檢查是否已有相同的歷史紀錄
#         check_sql = """
#             SELECT id 
#             FROM query_history 
#             WHERE user_id = %s AND query = %s
#         """
#         cursor.execute(check_sql, (user_id, overpass_query))
#         existing_record = cursor.fetchone()

#         if existing_record:
#             # 如果存在相同 query_text 的紀錄，則刪除該紀錄
#             delete_sql = "DELETE FROM query_history WHERE id = %s"
#             cursor.execute(delete_sql, (existing_record['id'],))
#             connection.commit()

#         # 插入新的歷史紀錄
#         insert_sql = """
#             INSERT INTO query_history (user_id, query_text, query, result) 
#             VALUES (%s, %s, %s, %s)
#         """
#         cursor.execute(insert_sql, (user_id, query_text, overpass_query, elements_json))
#         connection.commit()

#     except Exception as e:
#         connection.rollback()
#         print(f"更新歷史記錄失敗: {e}")
#     finally:
#         cursor.close()
#         connection.close()
#     # except Exception as e:
#     #     print(f"查詢和儲存歷史記錄的過程失敗: {e}")

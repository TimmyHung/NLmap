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
    return jsonify(query_response), 200

from datetime import datetime
from flask import Blueprint, request, jsonify, redirect
from utils.MySQL import get_db_cursor

record_visit_blueprint = Blueprint('record_visit', __name__)
root = "/api"

@record_visit_blueprint.route(root + '/record-visit', methods=['POST'])
def record_visit():
    today = datetime.now().strftime('%Y-%m-%d')
    visitor_ip = request.json.get('ip')

    # 獲取資料庫連接和游標
    cursor, connection = get_db_cursor()

    # 檢查當天的這個 IP 是否已經紀錄過
    query = "SELECT * FROM record_visitor WHERE visit_date = %s AND visitor_ip = %s"
    cursor.execute(query, (today, visitor_ip))
    result = cursor.fetchone()

    if not result:
        # 如果當天這個 IP 還沒有紀錄過，則插入新紀錄
        insert_query = "INSERT INTO record_visitor (visit_date, visitor_ip) VALUES (%s, %s)"
        cursor.execute(insert_query, (today, visitor_ip))
        connection.commit()

    cursor.close()
    connection.close()

    return jsonify({"status": "success"}), 200

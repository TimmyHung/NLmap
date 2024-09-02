from flask import Blueprint, request, jsonify
import json
from utils.MySQL import get_db_cursor
from utils.util import verify_JWTtoken, save_queryLog

history_blueprint = Blueprint('history', __name__)
root = "/api/user/historyRecords"

@history_blueprint.route(root + '/get', methods=['GET'])
def get_history_records():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization')

        if JWTtoken is None:
            return jsonify({'statusCode': 401, 'message': 'Invalid token'}), 200

        response, status_code = verify_JWTtoken(JWTtoken.split(' ')[1])
        if not response["status"]:
            return jsonify({'statusCode': 401, 'message': 'Invalid token'}), 200

        user_id = response["data"]["userID"]

        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 5))
        offset = (page - 1) * per_page

        cursor, connection = get_db_cursor()

        count_sql = "SELECT COUNT(*) FROM query_history WHERE user_id = %s"
        cursor.execute(count_sql, (user_id,))
        total_records = cursor.fetchone()['COUNT(*)']

        sql = """
            SELECT id, query_text, result, timestamp 
            FROM query_history 
            WHERE user_id = %s 
            ORDER BY timestamp DESC 
            LIMIT %s OFFSET %s
        """
        cursor.execute(sql, (user_id, per_page, offset))
        results = cursor.fetchall()

        formatted_results = []
        for record in results:
            formatted_results.append({
                'id': record['id'],  # 返回記錄的ID
                'title': record['query_text'],
                'timestamp': record['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
                'records': json.loads(record['result'])
            })

        total_pages = (total_records + per_page - 1) // per_page

        return jsonify({
            'statusCode': 200,
            'message': 'Success',
            'data': formatted_results,
            'total_pages': total_pages,
            'current_page': page
        }), 200
    except Exception as e:
        print(f"查詢歷史記錄失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': 'Failed to retrieve history records', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()



@history_blueprint.route(root + '/delete', methods=['DELETE'])
def delete_history_record():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization')
        if JWTtoken is None:
            return jsonify({'statusCode': 401, 'message': 'Invalid token'}), 200

        response, status_code = verify_JWTtoken(JWTtoken.split(' ')[1])
        if not response["status"]:
            return jsonify({'statusCode': 401, 'message': 'Invalid token'}), 200

        user_id = response["data"]["userID"]
        record_id = request.json.get('record_id')

        if not record_id:
            return jsonify({'statusCode': 400, 'message': 'Missing record_id'}), 200

        cursor, connection = get_db_cursor()

        delete_sql = "DELETE FROM query_history WHERE user_id = %s AND id = %s"
        cursor.execute(delete_sql, (user_id, record_id))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'statusCode': 200, 'message': 'Record deleted successfully'}), 200
        else:
            return jsonify({'statusCode': 404, 'message': 'Record not found'}), 200
    except Exception as e:
        print(f"刪除歷史紀錄失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': 'Failed to delete history record', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@history_blueprint.route(root + '/save', methods=['POST'])
def save_manual_query():
    cursor, connection = None, None
    # try:
    JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
    JWTresponse = verify_JWTtoken(JWTtoken)[0]
    
    user_id = JWTresponse["data"]["userID"] if JWTresponse["status"] else None
    data = request.json
    query_text = data.get('query_text')
    query = data.get('query')
    valid = data.get('valid')
    manualQuery = data.get('manualQuery')
    geoRawJson = data.get('geoRawJson')
    model_name = "manual" if manualQuery else None

    try:

        # 保存歷史記錄和查詢日誌
        if manualQuery:
            save_queryLog(user_id, query, "manual", 0, 0, 0, valid)
        else:
            response_metadata = data.get("response_metadata")
            model_name = response_metadata["model_name"]
            prompt_tokens = response_metadata["token_usage"]["prompt_tokens"]
            completion_tokens = response_metadata["token_usage"]["completion_tokens"]
            total_tokens = response_metadata["token_usage"]["total_tokens"]
            save_queryLog(user_id, query, model_name, prompt_tokens, completion_tokens, total_tokens, valid)
        
        if user_id != None and len(data.get('geoRawJson').get("elements",[])) > 0:
            cursor, connection = get_db_cursor()
            insert_sql = """
                INSERT INTO query_history (user_id, model_name, query_text, query, result) 
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(insert_sql, (user_id, model_name, query_text, query, json.dumps(geoRawJson)))
            connection.commit()

        return jsonify({'statusCode': 200, 'message': 'Query saved successfully'}), 200
    
    except Exception as e:
        print(f"手動查詢保存失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': 'Failed to save manual query', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

from flask import Blueprint, jsonify, request
from utils.MySQL import get_db_cursor
from datetime import datetime

token_usage_blueprint = Blueprint('tokenUsage', __name__)
root = "/api/tokenUsage"

@token_usage_blueprint.route(root + '/today', methods=['GET'])
def get_today_token_usage():
    cursor, connection = get_db_cursor()
    try:
        today_date = datetime.now().date()
        
        sql = """
        SELECT 
            SUM(prompt_tokens) AS total_prompt_tokens, 
            SUM(completion_tokens) AS total_completion_tokens, 
            SUM(total_tokens) AS total_tokens 
        FROM 
            query_logs 
        WHERE 
            DATE(timestamp) = %s
        """
        cursor.execute(sql, (today_date,))
        result = cursor.fetchone()
        
        if result:
            return jsonify({
                'status': True,
                'message': 'Success',
                'date': today_date.strftime('%Y-%m-%d'),
                'total_prompt_tokens': result['total_prompt_tokens'] or 0,
                'total_completion_tokens': result['total_completion_tokens'] or 0,
                'total_tokens': result['total_tokens'] or 0
            }), 200
        else:
            return jsonify({'status': False, 'message': 'No data available for today'}), 404

    except Exception as e:
        return jsonify({'status': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@token_usage_blueprint.route(root + '/month', methods=['GET'])
def get_month_token_usage():
    cursor, connection = get_db_cursor()
    try:
        current_month = datetime.now().strftime('%Y-%m')
        
        sql = """
        SELECT 
            SUM(prompt_tokens) AS total_prompt_tokens, 
            SUM(completion_tokens) AS total_completion_tokens, 
            SUM(total_tokens) AS total_tokens 
        FROM 
            query_logs 
        WHERE 
            DATE_FORMAT(timestamp, '%%Y-%%m') = %s
        """
        cursor.execute(sql, (current_month,))
        result = cursor.fetchone()
        
        if result:
            return jsonify({
                'status': True,
                'message': 'Success',
                'month': current_month,
                'total_prompt_tokens': result['total_prompt_tokens'] or 0,
                'total_completion_tokens': result['total_completion_tokens'] or 0,
                'total_tokens': result['total_tokens'] or 0
            }), 200
        else:
            return jsonify({'status': False, 'message': 'No data available for this month'}), 404

    except Exception as e:
        return jsonify({'status': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@token_usage_blueprint.route(root + '/range', methods=['GET'])
def get_range_token_usage():
    cursor, connection = get_db_cursor()
    try:
        # 從查詢參數中取得開始和結束日期
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if(start_date == None or end_date == None):
            return jsonify({'status': False, 'message': 'Invalid start_date or end_date'}), 400
        
        # 驗證日期格式
        try:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'status': False, 'message': 'Invalid date format. Use YYYY-MM-DD.'}), 400
        
        sql = """
        SELECT 
            SUM(prompt_tokens) AS total_prompt_tokens, 
            SUM(completion_tokens) AS total_completion_tokens, 
            SUM(total_tokens) AS total_tokens 
        FROM 
            query_logs 
        WHERE 
            DATE(timestamp) BETWEEN %s AND %s
        """
        cursor.execute(sql, (start_date, end_date))
        result = cursor.fetchone()
        
        if result:
            return jsonify({
                'status': True,
                'message': 'Success',
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'total_prompt_tokens': result['total_prompt_tokens'] or 0,
                'total_completion_tokens': result['total_completion_tokens'] or 0,
                'total_tokens': result['total_tokens'] or 0
            }), 200
        else:
            return jsonify({'status': False, 'message': 'No data available for the specified range'}), 404

    except Exception as e:
        return jsonify({'status': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

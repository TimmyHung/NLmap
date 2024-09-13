from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from utils.MySQL import get_db_cursor
from decimal import Decimal

dashboard_blueprint = Blueprint('dashBoard', __name__)
root = "/api/dashboard"

@dashboard_blueprint.route(root + '/systemInfo', methods=['GET'])
def get_systemInfo():
    range_type = request.args.get('range', 'daily')  # 預設為每日
    data = get_db_data_for_range(range_type)

    return jsonify(data), 200


@dashboard_blueprint.route(root + '/stats', methods=['GET'])
def get_stats():
    range_type = request.args.get('range', 'daily')
    data = get_db_data_for_range(range_type)

    # 查詢用戶統計數據
    total_users, new_users, last_week_logins, today_logins = get_user_stats()
    
    # 查詢今日和昨天的查詢數據
    today_queries, yesterday_queries = get_query_stats()

    # 查詢今日和昨天的不重複訪客數
    today_visitors, yesterday_visitors = get_today_and_yesterday_visitors()

    response = {
        'system_stats': data,
        'stats_data': {
            'total_users': total_users,
            'new_users_last_week': new_users,
            'last_week_logins': last_week_logins,
            'today_logins': today_logins,
            'today_queries': today_queries,
            'yesterday_queries': yesterday_queries,
            'today_visitors': today_visitors,
            'yesterday_visitors': yesterday_visitors
        },
        'pie_data':{
            'whisper': get_whisper_platform_stats(),
            'query': get_query_success_rate(),
        },
        'top_favorites': get_top_favorites(),
        'users': get_all_users(),
        'usage_data': get_monthly_usage(),
    }

    return jsonify(response), 200

@dashboard_blueprint.route(root + '/getTopFavorites', methods=['GET'])
def getTopFavorites():
    results = get_top_favorites()
    response = {"statusCode": 200, "data": results}

    return jsonify(response), 200

def get_top_favorites():
    cursor, connection = get_db_cursor()

    # 查詢最近七天收藏次數最多的地點
    sql = """
        SELECT osm_type, osm_id, favorite_count, name
        FROM favorite_leaderboard
        WHERE last_updated >= NOW() - INTERVAL 7 DAY
        ORDER BY favorite_count DESC
        LIMIT 15
    """
    cursor.execute(sql)
    results = cursor.fetchall()

    return results

def get_query_success_rate():
    cursor, connection = get_db_cursor()

    # 設置過去三十天的起始日期
    start_date = datetime.now() - timedelta(days=30)

    # 查詢過去三十天有效和無效的查詢
    sql = """
        SELECT valid, COUNT(*) as count
        FROM query_logs
        WHERE timestamp >= %s
        GROUP BY valid
    """
    cursor.execute(sql, (start_date,))
    result = cursor.fetchall()

    valid_count = 0
    invalid_count = 0

    # 根據查詢結果，統計 valid 和 invalid 的次數
    for row in result:
        if row['valid'] == 1:
            valid_count = row['count']
        elif row['valid'] == 0:
            invalid_count = row['count']

    # 返回 JSON 格式數據給前端
    response = {
        'valid_count': valid_count,
        'invalid_count': invalid_count
    }

    connection.close()
    return response

def get_whisper_platform_stats():
    cursor, connection = get_db_cursor()

    # 查詢 platform 欄位中的 PC 和 mobile 的統計數量
    sql = """
        SELECT platform, COUNT(*) as count
        FROM whisper_log
        WHERE platform IN ('PC', 'mobile')
        GROUP BY platform
    """
    cursor.execute(sql)
    platform_data = cursor.fetchall()

    # 將資料以 JSON 格式返回
    platform_stats = {entry['platform']: entry['count'] for entry in platform_data}

    connection.close()

    return platform_stats


def get_today_and_yesterday_visitors():
    cursor, connection = get_db_cursor()

    # 取得今天和昨天的日期
    today = datetime.now().strftime('%Y-%m-%d')
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    # 查詢今日不重複的訪客數
    sql_today_visitors = """
        SELECT COUNT(DISTINCT visitor_ip) as today_visitors
        FROM record_visitor
        WHERE visit_date = %s
    """
    cursor.execute(sql_today_visitors, (today,))
    today_visitors = cursor.fetchone()['today_visitors']

    # 查詢昨日不重複的訪客數
    sql_yesterday_visitors = """
        SELECT COUNT(DISTINCT visitor_ip) as yesterday_visitors
        FROM record_visitor
        WHERE visit_date = %s
    """
    cursor.execute(sql_yesterday_visitors, (yesterday,))
    yesterday_visitors = cursor.fetchone()['yesterday_visitors']

    connection.close()

    return today_visitors, yesterday_visitors



def get_query_stats():
    cursor, connection = get_db_cursor()

    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)
    
    # 查詢今日查詢次數
    sql_today_queries = """
        SELECT COUNT(*) as today_queries 
        FROM query_logs 
        WHERE timestamp >= %s
    """
    cursor.execute(sql_today_queries, (today_start,))
    today_queries = cursor.fetchone()['today_queries']

    # 查詢昨天的查詢次數
    sql_yesterday_queries = """
        SELECT COUNT(*) as yesterday_queries 
        FROM query_logs 
        WHERE timestamp >= %s AND timestamp < %s
    """
    cursor.execute(sql_yesterday_queries, (yesterday_start, today_start))
    yesterday_queries = cursor.fetchone()['yesterday_queries']

    connection.close()

    return today_queries, yesterday_queries


def get_monthly_usage():
    cursor, connection = get_db_cursor()

    # GPT-3.5 and GPT-4 pricing
    gpt_35_input_price = 0.003
    gpt_35_output_price = 0.006
    gpt_4_input_price = 0.005
    gpt_4_output_price = 0.015
    whisper_price_per_minute = 0.006

    # 生成過去30天的日期列表
    today = datetime.now().date()
    last_30_days = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]

    # 查詢GPT和Whisper的使用日誌
    query_logs_sql = """
        SELECT DATE_FORMAT(timestamp, '%Y-%m-%d') as date, model_name, 
               SUM(prompt_tokens) as total_prompt_tokens, 
               SUM(completion_tokens) as total_completion_tokens
        FROM query_logs
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY date, model_name
    """
    cursor.execute(query_logs_sql)
    query_logs = cursor.fetchall()

    whisper_logs_sql = """
        SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, 
               SUM(audio_duration) as total_audio_duration
        FROM whisper_log
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY date
    """
    cursor.execute(whisper_logs_sql)
    whisper_logs = cursor.fetchall()

    usage_data = {date: {'gpt_35_price': 0, 'gpt_4_price': 0, 'whisper_price': 0} for date in last_30_days}

    # Process GPT logs
    for log in query_logs:
        date = log['date']
        model_name = log['model_name']

        if "gpt-3.5-turbo" in model_name:
            price = (float(log['total_prompt_tokens']) / 1000) * gpt_35_input_price + (float(log['total_completion_tokens']) / 1000) * gpt_35_output_price
            usage_data[date]['gpt_35_price'] += round(price, 4)
        elif "gpt-4o" in model_name:
            price = (float(log['total_prompt_tokens']) / 1000) * gpt_4_input_price + (float(log['total_completion_tokens']) / 1000) * gpt_4_output_price
            usage_data[date]['gpt_4_price'] += round(price, 4)

    # Process Whisper logs
    for log in whisper_logs:
        date = log['date']
        whisper_price = (float(log['total_audio_duration']) / 60) * whisper_price_per_minute
        usage_data[date]['whisper_price'] += round(whisper_price, 4)

    # 將數據轉換為列表格式
    usage_data_list = sorted([
        {
            'date': date,
            'gpt_35_price': data['gpt_35_price'],
            'gpt_4_price': data['gpt_4_price'],
            'whisper_price': data['whisper_price'],
        }
        for date, data in usage_data.items()
    ], key=lambda x: x['date'], reverse=False)  # 按日期升序排列

    connection.close()

    return usage_data_list


def get_all_users():
    cursor, connection = get_db_cursor()

    sql = "SELECT userID, username, email, role, account_type FROM users"
    cursor.execute(sql)
    users = cursor.fetchall()

    connection.close()
    
    return users


def get_db_data_for_range(range_type):
    cursor, connection = get_db_cursor()
    now = datetime.now()

    # 設置起始時間和日期格式
    if range_type == 'hourly':
        start_time = now - timedelta(hours=1)
        group_by_format = '%m-%d %H:%i'  # 每小時
    elif range_type == 'daily':
        start_time = now - timedelta(days=1)
        group_by_format = '%m-%d %H:00:00'  # 每天
    elif range_type == 'weekly':
        start_time = now - timedelta(weeks=1)
        group_by_format = '%m-%d'  # 每周
    elif range_type == 'monthly':
        start_time = now - timedelta(days=30)
        group_by_format = '%m-%d'  # 每月
    elif range_type == 'yearly':
        start_time = now - timedelta(days=365)
        group_by_format = '%Y-%m'  # 每年
    else:
        return []

    # 使用 MySQL 的日期格式化功能，並避免在 Python 中處理 `%` 符號
    sql = """
        SELECT DATE_FORMAT(timestamp, %s) as period, 
               AVG(cpu_usage) as cpu_usage, 
               AVG(ram_usage) as ram_usage, 
               AVG(disk_usage) as disk_usage
        FROM system_stats
        WHERE timestamp >= %s
        GROUP BY period
        ORDER BY period
    """
    cursor.execute(sql, (group_by_format, start_time))
    data = cursor.fetchall()

    return data


def get_user_stats():
    cursor, connection = get_db_cursor()
    now = datetime.now()
    last_week = now - timedelta(weeks=1)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # 查詢所有用戶數量
    sql_total_users = "SELECT COUNT(*) as total_users FROM users"
    cursor.execute(sql_total_users)
    total_users = cursor.fetchone()['total_users']

    # 查詢過去七天內新增的用戶數量
    sql_new_users_last_week = """
        SELECT COUNT(*) as new_users 
        FROM users 
        WHERE created_at >= %s
    """
    cursor.execute(sql_new_users_last_week, (last_week,))
    new_users = cursor.fetchone()['new_users']

    # 查詢過去七天內登入的使用者數量
    sql_last_week_logins = """
        SELECT COUNT(*) as last_week_logins 
        FROM users 
        WHERE last_login_at >= %s
    """
    cursor.execute(sql_last_week_logins, (last_week,))
    last_week_logins = cursor.fetchone()['last_week_logins']

    # 查詢今天登入的使用者數量
    sql_today_logins = """
        SELECT COUNT(*) as today_logins 
        FROM users 
        WHERE last_login_at >= %s
    """
    cursor.execute(sql_today_logins, (today_start,))
    today_logins = cursor.fetchone()['today_logins']

    return total_users, new_users, last_week_logins, today_logins


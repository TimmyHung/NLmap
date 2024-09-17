from flask import Blueprint, request, jsonify
import json
from utils.MySQL import get_db_cursor
from utils.util import verify_JWTtoken

favorite_blueprint = Blueprint('favorite', __name__)
root = "/api/user/favorites"

@favorite_blueprint.route(root + '/create', methods=['POST'])
def create_favorite():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
        JWTresponse = verify_JWTtoken(JWTtoken)
        
        if not JWTresponse[0]["status"]:
            return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

        user_id = JWTresponse[0]["data"]["userID"]
        title = request.json.get('title')

        if not title:
            return jsonify({'statusCode': 400, 'message': '請輸入收藏標題'}), 200

        cursor, connection = get_db_cursor()

        insert_sql = """
            INSERT INTO favorites (user_id, title) 
            VALUES (%s, %s)
        """
        cursor.execute(insert_sql, (user_id, title))
        connection.commit()

        return jsonify({'statusCode': 200, 'message': '成功創建收藏清單'}), 200
    except Exception as e:
        print(f"創建收藏清單失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': '無法創建收藏清單', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@favorite_blueprint.route(root + '/item/add', methods=['POST'])
def add_favorite_item():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
        JWTresponse = verify_JWTtoken(JWTtoken)

        if not JWTresponse[0]["status"]:
            return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

        user_id = JWTresponse[0]["data"]["userID"]
        favorite_id = request.json.get('favorite_id')
        new_recordSet = request.json.get('records')

        if not favorite_id or not new_recordSet:
            return jsonify({'statusCode': 400, 'message': 'Favorite ID and Recordset are required'}), 200

        cursor, connection = get_db_cursor()

        # 確認收藏清單屬於該用戶
        check_sql = "SELECT * FROM favorites WHERE id = %s AND user_id = %s"
        cursor.execute(check_sql, (favorite_id, user_id))
        current_favoriteList = cursor.fetchone()

        if not current_favoriteList:
            return jsonify({'statusCode': 404, 'message': '找不到對應的收藏清單'}), 200

        # 如果recordset是None或NULL，則初始化為None
        db_recordset = current_favoriteList.get("recordset")
        duplicatedItems = []
        if db_recordset is None:
            # 空的收藏清單直接寫進資料不用另外處理
            insert_sql = "UPDATE favorites SET recordset = %s WHERE id = %s AND user_id = %s"
            cursor.execute(insert_sql, (json.dumps(new_recordSet), favorite_id, user_id))
            connection.commit()
        else:
            db_recordset = json.loads(current_favoriteList["recordset"])
            # 檢查資料庫的收藏的recordset內的elements id是否有重複，如果沒有就新增進去。
            db_recordset_elements = db_recordset["elements"] if db_recordset.get("elements") != None else {}
            existing_ids = {element['id'] for element in db_recordset_elements}
            for element in new_recordSet['elements']:
                if element['id'] not in existing_ids:
                    db_recordset['elements'].append(element)
                else:
                    if element.get("displayName") != None:
                        duplicatedItems.append(element)

            insert_sql = "UPDATE favorites SET recordset = %s WHERE id = %s AND user_id = %s"

            cursor.execute(insert_sql, (json.dumps(db_recordset), favorite_id, user_id))
            connection.commit()
        
        # 更新 favorite_leaderboard 表
        for element in new_recordSet['elements']:
            osm_type = element.get('type')
            osm_id = element.get('id')
            displayName = element.get('displayName')
            if displayName is None or element in duplicatedItems:
                continue
            # 插入或更新收藏次數
            leaderboard_sql = """
                INSERT INTO favorite_leaderboard (osm_type, osm_id, name, favorite_count)
                VALUES (%s, %s, %s, 1)
                ON DUPLICATE KEY UPDATE favorite_count = favorite_count + 1
            """
            cursor.execute(leaderboard_sql, (osm_type, osm_id, displayName))
            connection.commit()

        return jsonify({'statusCode': 200, 'message': '成功新增至收藏清單', "duplicatedItems": duplicatedItems}), 200
    except Exception as e:
        print(f"添加項目到收藏清單失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': '新增至收藏清單失敗', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@favorite_blueprint.route(root + '/lists', methods=['GET'])
def get_favorite_lists():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
        JWTresponse = verify_JWTtoken(JWTtoken)

        if not JWTresponse[0]["status"]:
            return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

        user_id = JWTresponse[0]["data"]["userID"]

        cursor, connection = get_db_cursor()

        sql = "SELECT * FROM favorites WHERE user_id = %s ORDER BY created_at DESC"
        
        cursor.execute(sql, (user_id,))
        favorite_lists = cursor.fetchall()

        formatted_results = []
        for favorite in favorite_lists:
            formatted_results.append({
                'id': favorite['id'],
                'title': favorite['title'],
                'recordset': json.loads(favorite['recordset']) if favorite['recordset'] != None else {}
            })

        return jsonify({
            'statusCode': 200,
            'message': 'Success',
            'data': formatted_results
        }), 200
    except Exception as e:
        print(f"獲取收藏清單失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': '無法取得收藏清單', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@favorite_blueprint.route(root + '/delete', methods=['DELETE'])
def delete_favorite_list():
    cursor, connection = None, None
    try:
        JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
        JWTresponse = verify_JWTtoken(JWTtoken)

        if not JWTresponse[0]["status"]:
            return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

        user_id = JWTresponse[0]["data"]["userID"]
        favorite_id = request.json.get('favorite_id')

        if not favorite_id:
            return jsonify({'statusCode': 400, 'message': 'Favorite ID is required'}), 200

        cursor, connection = get_db_cursor()

        delete_sql = "DELETE FROM favorites WHERE id = %s AND user_id = %s"
        cursor.execute(delete_sql, (favorite_id, user_id))
        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'statusCode': 200, 'message': '刪除收藏清單成功'}), 200
        else:
            return jsonify({'statusCode': 404, 'message': '找不到對應的收藏清單'}), 200
    except Exception as e:
        print(f"刪除收藏清單失敗: {e}")
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': '無法刪除收藏清單', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

@favorite_blueprint.route(root + '/edit', methods=['PUT'])
def edit_favorite():
    cursor, connection = None, None
    try:
        # 驗證 JWT token
        JWTtoken = request.headers.get('Authorization', '').split(' ')[-1]
        JWTresponse = verify_JWTtoken(JWTtoken)[0]
        if not JWTresponse['status']:
            return jsonify({'statusCode': 401, 'message': '身分驗證無效，請重新登入。'}), 200

        user_id = JWTresponse['data']['userID']
        data = request.json
        favorite_id = data.get('favorite_id')

        if not favorite_id:
            return jsonify({'statusCode': 400, 'message': 'Missing favorite_id'}), 200

        # 根據提供的資料進行動態更新
        cursor, connection = get_db_cursor()

        if 'new_title' in data:
            # 更新 favorites 資料表中的 title
            new_title = data['new_title']
            update_title_sql = """
                UPDATE favorites 
                SET title = %s 
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(update_title_sql, (new_title, favorite_id, user_id))

        if 'new_recordset' in data:
            # 更新 favorite_items 資料表中的 recordset_id
            new_recordset = data['new_recordset']
            update_recordset_sql = """
                UPDATE favorites
                SET recordset = %s 
                WHERE id = %s AND user_id = %s
            """
            cursor.execute(update_recordset_sql, (json.dumps(new_recordset), favorite_id, user_id))

        connection.commit()

        if cursor.rowcount > 0:
            return jsonify({'statusCode': 200, 'message': '成功更新收藏清單'}), 200
        else:
            return jsonify({'statusCode': 400, 'message': '沒有任何更動或找不到對應的收藏清單'}), 200

    except Exception as e:
        if connection:
            connection.rollback()
        return jsonify({'statusCode': 500, 'message': '更新收藏清單失敗', 'error': str(e)}), 200
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
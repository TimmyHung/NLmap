import os
import pymysql
import threading
import time
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return pymysql.connect(
        host=os.getenv('DATABASE_HOST'),
        user=os.getenv('DATABASE_USER'),
        password=os.getenv('DATABASE_PASSWORD'),
        database=os.getenv('DATABASE_SCHEMA')
    )

def get_db_cursor():
    connection = get_db_connection()
    return connection.cursor(), connection

# def keep_alive(connection):
#     while True:
#         try:
#             with connection.cursor() as cursor:
#                 cursor.execute("SELECT 1")
#             connection.commit()
#         except pymysql.MySQLError as e:
#             print(f"[MYSQL]Keep-alive query failed: {e}")
#         time.sleep(3600) # 每小時發送一次，確保SQL連線不會被關閉

# # 啟動keep_alive線程
# threading.Thread(target=keep_alive, args=(db,), daemon=True).start()

import os
import pymysql
import threading
import time
import logging
from dotenv import load_dotenv

# 環境變量
load_dotenv()

# 日志記錄
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# MySQL連接設置
def create_db_connection():
    try:
        connection = pymysql.connect(
            host=os.getenv('DATABASE_HOST'),
            user=os.getenv('DATABASE_USER'),
            password=os.getenv('DATABASE_PASSWORD'),
            database=os.getenv('DATABASE_SCHEMA')
        )
        logger.info("MySQL connection established")
        return connection
    except pymysql.MySQLError as e:
        logger.error(f"Failed to connect to MySQL: {e}")
        return None

db = create_db_connection()

def get_db_cursor():
    return db.cursor() if db else None

def keep_alive(connection):
    while True:
        try:
            if not connection.open:
                logger.warning("MySQL connection lost. Reconnecting...")
                connection = create_db_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            connection.commit()
            logger.info("Keep-alive query executed successfully")
        except pymysql.MySQLError as e:
            logger.error(f"Keep-alive query failed: {e}")
        time.sleep(21600) # 每次應時間發送一次 確保不會斷連

# 啓動keep_alive
if db:
    threading.Thread(target=keep_alive, args=(db,), daemon=True).start()
else:
    logger.error("Failed to start keep-alive thread due to MySQL connection issues")


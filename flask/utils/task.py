import psutil
import time
import threading
from datetime import datetime
from utils.MySQL import get_db_cursor

def collect_system_stats():
    cursor, connection = get_db_cursor()
    
    while True:
        cpu_usage = psutil.cpu_percent(interval=3)
        memory_info = psutil.virtual_memory()
        ram_usage = memory_info.percent
        disk_info = psutil.disk_usage('/')
        disk_usage = disk_info.percent

        # 插入數據到資料庫
        sql = """
            INSERT INTO system_stats (timestamp, cpu_usage, ram_usage, disk_usage)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (datetime.now(), cpu_usage, ram_usage, disk_usage))
        connection.commit()

        time.sleep(60)  # 每分鐘收集一次數據

# 提供一個啟動數據收集的函數
def start_collecting_stats():
    threading.Thread(target=collect_system_stats, daemon=True).start()

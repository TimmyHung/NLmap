import os
import pymysql
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
    cursor = connection.cursor(pymysql.cursors.DictCursor)
    return cursor, connection
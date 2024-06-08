import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

# MySQL connection setup
db = pymysql.connect(
    host=os.getenv('DATABASE_HOST'),
    user=os.getenv('DATABASE_USER'),
    password=os.getenv('DATABASE_PASSWORD'),
    database=os.getenv('DATABASE_SCHEMA')
)

def get_db_cursor():
    return db.cursor()

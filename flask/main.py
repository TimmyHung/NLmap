from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from api.authorization import authorize_blueprint
from api.generateQuery import query_blueprint
from api.gitCommit import git_blueprint
from api.tokenUsage import token_usage_blueprint
from api.historyRecords import history_blueprint
from api.whisper import whisper_blueprint
from api.favorite import favorite_blueprint
from api.dashBoard import dashboard_blueprint
from api.recordVisit import record_visit_blueprint
from api.user import user_blueprint

from utils.task import start_collecting_stats
from flask import send_from_directory

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://timmyhung.pettw.online", "http://localhost", "http://127.0.0.1"]}})
load_dotenv()

# Register blueprints
app.register_blueprint(authorize_blueprint)
app.register_blueprint(git_blueprint)
app.register_blueprint(query_blueprint)
app.register_blueprint(token_usage_blueprint)
app.register_blueprint(history_blueprint)
app.register_blueprint(whisper_blueprint)
app.register_blueprint(favorite_blueprint)
app.register_blueprint(dashboard_blueprint)
app.register_blueprint(record_visit_blueprint)
app.register_blueprint(user_blueprint)

# Default route
@app.route('/', methods=['GET'])
def default_route():
    return "未知的API端點。", 400

# User Avatar
@app.route('/uploads/avatars/<filename>', methods=['GET'])
def uploaded_file(filename):
    uploads_dir = os.path.join(app.root_path, 'uploads', 'avatars')
    return send_from_directory(uploads_dir, filename)

if __name__ == "__main__":
    start_collecting_stats()
    app.run(host="0.0.0.0", port=3000)

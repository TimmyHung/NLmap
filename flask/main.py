from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from api.authorization import authorize_blueprint
from api.generateQuery import query_blueprint
from api.gitCommit import git_blueprint
from api.tokenUsage import token_usage_blueprint
from api.historyRecords import history_blueprint
from api.whisper import whisper_blueprint
from api.favorite import favorite_blueprint

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

# Default route
@app.route('/', methods=['GET'])
def default_route():
    return "未知的API端點。", 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)

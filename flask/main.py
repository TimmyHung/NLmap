# -*- coding: utf-8 -*-

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from api.register import register_blueprint
from api.login import login_blueprint
# from api.generateQuery import query_blueprint
from api.jwt_verify import jwt_verify_blueprint
from api.discordCallback import discord_callback_blueprint
from api.gitCommit import git_blueprint

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://timmyhung.pettw.online"}})
load_dotenv()

# Register blueprints
app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(jwt_verify_blueprint)
app.register_blueprint(discord_callback_blueprint)
app.register_blueprint(git_blueprint)
# app.register_blueprint(query_blueprint)

# Default route
@app.route('/', methods=['GET'])
def default_route():
    return "Invalid APIs", 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)

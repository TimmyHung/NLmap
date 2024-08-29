from flask import Blueprint, request, jsonify
import requests
import os

git_blueprint = Blueprint('gitCommit', __name__)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
REPO_OWNER = "TimmyHung"
REPO_NAME = "Graduation-Project"

@git_blueprint.route('/api/gitCommit', methods=['GET'])
def get_commits():
    url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits'
    headers = {'Authorization': f'token {GITHUB_TOKEN}'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        commits = response.json()
        commit_data = [{'id': commit['sha'][:6], 'author': commit['commit']['author']['name'], 'avatarURL': commit['author']['avatar_url'], 'commitURL': commit['html_url'], 'date': commit['commit']['author']['date'], 'message': commit['commit']['message']} for commit in commits]
        return jsonify({'status': True, 'message': 'Success', 'commit': commit_data}), 200
    except Exception as e:
        return str(e), 500

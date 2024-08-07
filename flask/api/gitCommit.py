from flask import Blueprint, request, jsonify
import requests
import os

git_blueprint = Blueprint('gitCommit', __name__)

GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')
REPO_OWNER = "TimmyHung"
REPO_NAME = "Graduation-Project"

if not GITHUB_TOKEN:
    raise EnvironmentError("GITHUB_TOKEN is not set")

@git_blueprint.route('/api/gitCommit', methods=['GET'])
def get_commits():
    url = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/commits'
    headers = {'Authorization': f'token {GITHUB_TOKEN}'}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        commits = response.json()
        commit_data = [
            {
                'id': commit['sha'][:6],
                'author': commit['commit']['author']['name'],
                'avatarURL': commit['author']['avatar_url'],
                'commitURL': commit['html_url'],
                'date': commit['commit']['author']['date'],
                'message': commit['commit']['message']
            } for commit in commits
        ]
        return jsonify({'status': True, 'message': 'Success', 'commit': commit_data}), 200
    except requests.exceptions.HTTPError as http_err:
        return jsonify({'status': False, 'message': f'HTTP error occurred: {http_err}'}), 500
    except requests.exceptions.RequestException as req_err:
        return jsonify({'status': False, 'message': f'Request error occurred: {req_err}'}), 500
    except Exception as e:
        return jsonify({'status': False, 'message': f'An error occurred: {str(e)}'}), 500






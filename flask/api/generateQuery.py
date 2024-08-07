from flask import Blueprint, request, jsonify
from chromaDB import loadData, query

query_blueprint = Blueprint('query', __name__)
chromaDB = loadData()

@query_blueprint.route('/api/query', methods=['POST'])
def getQuery():
    try:
        data = request.get_json()
        if not data or 'queryNL' not in data:
            return jsonify({'status': False, 'message': 'Invalid input', 'osmquery': None, 'query_name': None}), 400

        promptText = data['queryNL']
        response = query(chromaDB, promptText)

        if not response:
            return jsonify({'status': False, 'message': 'Query Failed: No response', 'osmquery': None, 'query_name': None}), 500

        parts = response.split("|||")
        if len(parts) < 2:
            return jsonify({'status': False, 'message': 'Query Failed: Incomplete response', 'osmquery': None, 'query_name': None}), 500

        query_name = parts[0].replace("query_name=", "")
        osmquery = parts[1].replace("data=", "")

        return jsonify({'status': True, 'message': 'Query Success', 'osmquery': osmquery, 'query_name': query_name}), 200
    except Exception as e:
        return jsonify({'status': False, 'message': f'Query Failed: {str(e)}', 'osmquery': None, 'query_name': None}), 500

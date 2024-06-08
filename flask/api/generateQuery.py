from flask import Blueprint, request, jsonify
from chromaDB import loadData, query

query_blueprint = Blueprint('query', __name__)
chromaDB = loadData()

@query_blueprint.route('/api/query', methods=['POST'])
def getQuery():
    data = request.get_json()
    promptText = data.get('queryNL')
    response = query(chromaDB, promptText)

    osmquery = response.split("|||")[1].replace("data=", "")
    query_name = response.split("|||")[0].replace("query_name=", "")

    if not response:
        return jsonify({'status': False, 'message': 'Query Failed: Max retries exceeded', 'osmquery': None, 'query_name': None}), 200
    else:
        return jsonify({'status': True, 'message': 'Query Success', 'osmquery': osmquery, 'query_name': query_name}), 200

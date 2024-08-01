from flask import Blueprint, request, jsonify
from chromaDB import loadData, query

query_blueprint = Blueprint('query', __name__)
chromaDB = loadData()

@query_blueprint.route('/api/query', methods=['POST'])
def getQuery():
    data = request.get_json()
    promptText = data.get('queryNL')
    model = data.get('model')

    return jsonify(query(chromaDB, model, promptText))

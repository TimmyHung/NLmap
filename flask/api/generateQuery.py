from flask import Blueprint, request, jsonify
from utils.util import chat_completion, verify_JWTtoken
from utils.FAISS import FAISS_initialize, search_similar_questions, log_embedding_to_db

query_blueprint = Blueprint('query', __name__)
index, existing_questions, all_questions_ql = FAISS_initialize()

@query_blueprint.route('/api/query', methods=['GET'])
def getQuery():
    JWTtoken = request.headers.get('Authorization', "")
    userID = None
    
    if len(JWTtoken) == 0:
        userID = None
    else:
        jwtResponse, status_code = verify_JWTtoken(JWTtoken.split(' ')[1])
        if jwtResponse["status"]:
            userID = jwtResponse["data"]["userID"]
    
    
    # 從查詢參數中獲取資料
    promptText = request.args.get('queryNL')
    model = request.args.get('model')
    # bounds = request.args.get('bounds')

    if not promptText or not model:
        return jsonify({"statuscode": 400, "message": "Missing queryNL or model parameters"}), 400
    
    response,tokenUsage = query(model, promptText)

    log_embedding_to_db(userID,tokenUsage)
    
    return jsonify(response),200


def getSimilaritySearch(promptText):
    results, tokenUsage = search_similar_questions(promptText, index, existing_questions, top_k=5)
    similar_queries = []

    for i, (question, distance, idx) in enumerate(results):
        ql_text = all_questions_ql[idx]
        similar_queries.append({
            'nl': question,
            'ql': ql_text,
            'distance': distance,
            'fileline_number': idx,
        })
    
    return similar_queries,tokenUsage

def combineSystemRoleText(search_results, prompt):
    promptText = f"You are an expert in OverpassQL. Please generate an OverpassQL query for a location in Taiwan based on the user input.\n"
    promptText += "Respond ONLY with the query string that comes after 'data=', including the entire query, without any additional explanations or text.\n"
    promptText += "Format your response exactly like this:\n"
    promptText += "data=[out:json][timeout:20];{YOUR_QUERY_HERE};out;>;out skel qt;\n"
    # promptText += "If you determine that the user's input is not a valid or understandable query, respond with:\ndata=null\n"

    print("\n==================\n" + promptText)
    return promptText

def combineUserRoleText(search_results, prompt):
    promptText = "Below are some example inputs and their expected outputs for your reference\n"
    promptText += "If the example input is exactly the same or HIGHLY SIMILAR to the user's input, use the expected output directly.\n"

    for example in search_results:
        promptText += f"Example Input: {example['nl']}\nExpected Output: {example['ql']}\n"

    promptText += f"Now, based on the location {prompt}, generate the best possible OverpassQL query following the specified format."

    print(promptText + "\n==================\n")
    return promptText


def query(model, prompt):
    search_results,token_usage = getSimilaritySearch(prompt)

    promptText = [
        {
            "role": "system",
            "content": combineSystemRoleText(search_results, prompt)
        },
        {
            "role": "user",
            "content": combineUserRoleText(search_results, prompt)
        }
    ]

    # print(promptText)

    response = chat_completion(model, promptText)
    if response == None:
        return {'statuscode': 429, 'message': '查詢失敗: 速率限制'}
    else:
        print(response["content"])
        osmquery = response["content"].replace("data=", "")

        response_metadata = response["response_metadata"]
        response_metadata['token_usage'].pop('completion_tokens_details', None)
        response_metadata['token_usage'].pop('prompt_tokens_details', None)
        
        # 資料返回給前端
        if osmquery == "null":
            return {'statuscode': 400, 'message': '查詢失敗，無效的查詢字詞。', 'osmquery': osmquery, 'response_metadata': response_metadata},token_usage
        else:
            return {'statuscode': 200, 'message': '查詢成功', 'osmquery': osmquery, 'response_metadata': response_metadata},token_usage
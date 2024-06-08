from flask import Blueprint, request, jsonify
import jwt
import os

jwt_verify_blueprint = Blueprint('jwt_verify', __name__)

@jwt_verify_blueprint.route('/api/jwtverify', methods=['POST'])
def jwt_verify():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'no token'}), 401

    try:
        decoded = jwt.decode(token.split(' ')[1], os.getenv('JWT_SECRET_KEY'), algorithms=['HS256'])
        return jsonify({'status': True, 'message': 'Token Normal', 'data': decoded}), 200
    except jwt.ExpiredSignatureError as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Token Expired', 'detail': str(e)}), 200
    except jwt.InvalidTokenError as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Token Invalid', 'detail': str(e)}), 200
    except Exception as e:
        return jsonify({'status': False, 'message': 'JWT Failed: Unknown Error', 'detail': str(e)}), 200

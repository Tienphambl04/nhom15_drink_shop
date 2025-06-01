from flask import request, jsonify, current_app
import jwt
from functools import wraps

def token_required(role=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                token = request.headers['Authorization']
                if token.startswith('Bearer '):
                    token = token[7:]  # bỏ 'Bearer ' ở đầu

            if not token:
                return jsonify({'message': 'Thiếu token'}), 401

            try:
                decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
                if role and decoded['vai_tro'] != role:
                    return jsonify({'message': 'Không đủ quyền'}), 403
                request.user = decoded
            except Exception as e:
                return jsonify({'message': 'Token không hợp lệ hoặc hết hạn'}), 401

            return f(*args, **kwargs)
        return decorated
    return decorator

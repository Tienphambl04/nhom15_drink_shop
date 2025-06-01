from flask import Blueprint, request
from controllers import auth_controller
from middleware.auth_middleware import token_required

user_bp = Blueprint('user_bp', __name__)

user_bp.route('/register', methods=['POST'])(auth_controller.dang_ky)
user_bp.route('/login', methods=['POST'])(auth_controller.dang_nhap)

@user_bp.route('/admin-only', methods=['GET'])
@token_required(role='admin')
def admin_only():
    return {"message": "Chào admin!"}


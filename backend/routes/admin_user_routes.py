from flask import Blueprint
from controllers.admin_user_controller import list_users, reset_password, toggle_account_status, delete_user, add_user
from middleware.auth_middleware import token_required

admin_user_bp = Blueprint('admin_user_bp', __name__)

@admin_user_bp.route('/users', methods=['GET'])
@token_required(role='admin')
def get_users():
    return list_users()

@admin_user_bp.route('/users/<int:user_id>/reset-password', methods=['PUT'])
@token_required(role='admin')
def reset_user_password(user_id):
    return reset_password(user_id)

@admin_user_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@token_required(role='admin')
def toggle_user_status(user_id):
    return toggle_account_status(user_id)

@admin_user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required(role='admin')
def delete_user_account(user_id):
    return delete_user(user_id)

@admin_user_bp.route('/users', methods=['POST'])
@token_required(role='admin')
def create_user():
    return add_user()
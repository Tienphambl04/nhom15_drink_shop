from flask import Blueprint, request
from controllers import auth_controller
from middleware.auth_middleware import token_required
from models.user import NguoiDung
from database import db

user_bp = Blueprint('user_bp', __name__)

# Route đăng ký và đăng nhập
user_bp.route('/register', methods=['POST'])(auth_controller.dang_ky)
user_bp.route('/login', methods=['POST'])(auth_controller.dang_nhap)

# Route cập nhật thông tin cá nhân
@user_bp.route('/update-profile', methods=['GET', 'PUT'])
@token_required()
def update_profile():
    user_id = request.user['ma_nguoi_dung']
    current_user = NguoiDung.query.get(user_id)
    return auth_controller.cap_nhat_thong_tin(current_user)

# Route đổi mật khẩu
@user_bp.route('/change-password', methods=['PUT'])
@token_required()
def change_password():
    user_id = request.user['ma_nguoi_dung']
    current_user = NguoiDung.query.get(user_id)
    return auth_controller.doi_mat_khau(current_user)

# Route dành riêng cho admin
@user_bp.route('/admin-only', methods=['GET'])
@token_required(role='admin')
def admin_only():
    return {"message": "Chào mừng admin!", "success": True}, 200
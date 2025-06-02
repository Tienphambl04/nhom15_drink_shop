from flask import Blueprint
from controllers import admin_user_controller
from middleware.auth_middleware import token_required

admin_user_bp = Blueprint('admin_user_bp', __name__, url_prefix='/api/admin')

@admin_user_bp.route('/users', methods=['GET'])
@token_required(role='admin')
def get_all_users():
    return admin_user_controller.lay_danh_sach_nguoi_dung()

@admin_user_bp.route('/users', methods=['POST'])
@token_required(role='admin')
def create_user():
    return admin_user_controller.them_tai_khoan_moi()

@admin_user_bp.route('/users/<int:ma_nguoi_dung>/toggle-status', methods=['PUT'])
@token_required(role='admin')
def toggle_status(ma_nguoi_dung):
    return admin_user_controller.thay_doi_trang_thai(ma_nguoi_dung)

@admin_user_bp.route('/users/<int:ma_nguoi_dung>/reset-password', methods=['PUT'])
@token_required(role='admin')
def reset_password(ma_nguoi_dung):
    return admin_user_controller.reset_mat_khau(ma_nguoi_dung)

@admin_user_bp.route('/users/<int:ma_nguoi_dung>', methods=['DELETE'])
@token_required(role='admin')
def delete_user(ma_nguoi_dung):
    return admin_user_controller.xoa_tai_khoan(ma_nguoi_dung)

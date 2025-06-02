from flask import Blueprint
from controllers.danh_muc_controller import lay_danh_sach_danh_muc, them_danh_muc, sua_danh_muc, xoa_danh_muc

danh_muc_bp = Blueprint('danh_muc', __name__)  

danh_muc_bp.route('', methods=['GET'])(lay_danh_sach_danh_muc)
danh_muc_bp.route('', methods=['POST'])(them_danh_muc)
danh_muc_bp.route('/<int:ma_danh_muc>', methods=['PUT'])(sua_danh_muc)
danh_muc_bp.route('/<int:ma_danh_muc>', methods=['DELETE'])(xoa_danh_muc)

from flask import Blueprint
from controllers.don_hang_controller import (
    create_don_hang,
    get_don_hang,
    get_don_hang_by_id,
    update_don_hang,
    cancel_don_hang,
    delete_don_hang,
    add_chi_tiet_don_hang,
    update_chi_tiet_don_hang,
    delete_chi_tiet_don_hang
)

don_hang_bp = Blueprint('don_hang', __name__)

don_hang_bp.route('', methods=['POST'])(create_don_hang)
don_hang_bp.route('', methods=['GET'])(get_don_hang)
don_hang_bp.route('/<int:ma_don_hang>', methods=['GET'])(get_don_hang_by_id)
don_hang_bp.route('/<int:ma_don_hang>', methods=['PUT'])(update_don_hang)
don_hang_bp.route('/<int:ma_don_hang>/cancel', methods=['PUT'])(cancel_don_hang)
don_hang_bp.route('/<int:ma_don_hang>', methods=['DELETE'])(delete_don_hang)
don_hang_bp.route('/<int:ma_don_hang>/chi-tiet', methods=['POST'])(add_chi_tiet_don_hang)
don_hang_bp.route('/chi-tiet/<int:ma_chi_tiet>', methods=['PUT'])(update_chi_tiet_don_hang)
don_hang_bp.route('/chi-tiet/<int:ma_chi_tiet>', methods=['DELETE'])(delete_chi_tiet_don_hang)
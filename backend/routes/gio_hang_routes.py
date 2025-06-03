from flask import Blueprint
from controllers.gio_hang_controller import (
    get_gio_hang_by_user,
    add_gio_hang,
    delete_gio_hang,
    update_so_luong,
)

gio_hang_bp = Blueprint("gio_hang", __name__)  # nên đặt tên giống các blueprint khác

gio_hang_bp.route('/<int:ma_nguoi_dung>', methods=['GET'])(get_gio_hang_by_user)
gio_hang_bp.route('', methods=['POST'])(add_gio_hang)
gio_hang_bp.route('/<int:ma_gio_hang>', methods=['DELETE'])(delete_gio_hang)
gio_hang_bp.route('/<int:ma_gio_hang>', methods=['PUT'])(update_so_luong)

from flask import Blueprint
from controllers.tuy_chon_do_uong_controller import (
    lay_tuy_chon_theo_do_uong,
    them_tuy_chon,
    sua_tuy_chon,
    xoa_tuy_chon
)

tuy_chon_bp = Blueprint('tuy_chon', __name__)

tuy_chon_bp.route('/<int:ma_do_uong>', methods=['GET'])(lay_tuy_chon_theo_do_uong)
tuy_chon_bp.route('', methods=['POST'])(them_tuy_chon)
tuy_chon_bp.route('/<int:ma_tuy_chon>', methods=['PUT'])(sua_tuy_chon)
tuy_chon_bp.route('/<int:ma_tuy_chon>', methods=['DELETE'])(xoa_tuy_chon)

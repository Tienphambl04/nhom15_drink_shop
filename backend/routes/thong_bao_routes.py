from flask import Blueprint
from controllers.thong_bao_controller import get_thong_bao, mark_thong_bao_read, delete_thong_bao

thong_bao_bp = Blueprint('thong_bao', __name__)

thong_bao_bp.route('', methods=['GET'])(get_thong_bao)
thong_bao_bp.route('/<int:ma_thong_bao>/read', methods=['PUT'])(mark_thong_bao_read)
thong_bao_bp.route('/<int:ma_thong_bao>', methods=['DELETE'])(delete_thong_bao)
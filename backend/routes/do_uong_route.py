from flask import Blueprint
from controllers.do_uong_controller import *

do_uong_bp = Blueprint("do_uong_bp", __name__)

do_uong_bp.route("", methods=["POST"])(them_do_uong)
do_uong_bp.route("/<int:ma_do_uong>", methods=["PUT"])(sua_do_uong)
do_uong_bp.route("/<int:ma_do_uong>", methods=["DELETE"])(xoa_do_uong)
do_uong_bp.route("/danh-muc/<int:ma_danh_muc>", methods=["GET"])(lay_do_uong_theo_danh_muc)

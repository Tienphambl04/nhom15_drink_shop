from flask import Blueprint
from controllers.binh_luan_controller import *

binh_luan_bp = Blueprint("binh_luan_bp", __name__)

binh_luan_bp.route("", methods=["POST"])(them_binh_luan)
binh_luan_bp.route("/do-uong/<int:ma_do_uong>", methods=["GET"])(lay_binh_luan_theo_do_uong)
binh_luan_bp.route("/<int:ma_binh_luan>", methods=["DELETE"])(xoa_binh_luan)
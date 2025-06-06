# backend/routes/lien_he_routes.py
from flask import Blueprint
from controllers.contact_controller import lay_phan_hoi,gui_phan_hoi,danh_dau_da_doc

lien_he_bp = Blueprint('lien_he_bp', __name__)

lien_he_bp.route('', methods=['POST'])(gui_phan_hoi)
lien_he_bp.route('', methods=['GET'])(lay_phan_hoi)
lien_he_bp.route('/<int:ma_lien_he>', methods=['PATCH'])(danh_dau_da_doc)
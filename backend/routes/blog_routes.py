from flask import Blueprint
from controllers.blog_controller import them_blog, sua_blog, xoa_blog,lay_danh_sach_blog

blog_bp = Blueprint('blog_bp', __name__)

blog_bp.route('', methods=['POST'])(them_blog)
blog_bp.route('/<int:ma_blog>', methods=['PUT'])(sua_blog)
blog_bp.route('/<int:ma_blog>', methods=['DELETE'])(xoa_blog)
blog_bp.route('', methods=['GET'])(lay_danh_sach_blog)
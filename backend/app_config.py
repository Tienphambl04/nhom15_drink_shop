from flask import Flask, send_from_directory
from flask_cors import CORS
from database import db
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Cấu hình cơ sở dữ liệu
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/drink_shop'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_secret_key_here'

    # Cấu hình thư mục upload ảnh
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads', 'hinh_anh')

    # Tạo thư mục upload nếu chưa có
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Khởi tạo database
    db.init_app(app)

    # Đăng ký các blueprint
    from routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/users')

    from routes.admin_user_routes import admin_user_bp
    app.register_blueprint(admin_user_bp, url_prefix='/api/admin')

    from routes.danh_muc_route import danh_muc_bp
    app.register_blueprint(danh_muc_bp, url_prefix='/api/danh-muc')

    from routes.do_uong_route import do_uong_bp
    app.register_blueprint(do_uong_bp, url_prefix='/api/do-uong')

    # Route để phục vụ ảnh đã upload
    @app.route('/uploads/hinh_anh/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    from routes.tuy_chon_route import tuy_chon_bp
    app.register_blueprint(tuy_chon_bp, url_prefix='/api/tuy-chon')


    return app

from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from database import db
import os
from controllers.don_hang_controller import handle_connect, handle_disconnect, handle_join

socketio = SocketIO(cors_allowed_origins="*")

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/drink_shop'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_secret_key_here'

    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'uploads', 'hinh_anh')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    socketio.init_app(app)

    from routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/users')

    from routes.admin_user_routes import admin_user_bp
    app.register_blueprint(admin_user_bp, url_prefix='/api/admin')

    from routes.danh_muc_routes import danh_muc_bp
    app.register_blueprint(danh_muc_bp, url_prefix='/api/danh-muc')

    from routes.do_uong_routes import do_uong_bp
    app.register_blueprint(do_uong_bp, url_prefix='/api/do-uong')

    from routes.gio_hang_routes import gio_hang_bp
    app.register_blueprint(gio_hang_bp, url_prefix='/api/gio-hang')

    from routes.don_hang_routes import don_hang_bp
    app.register_blueprint(don_hang_bp, url_prefix='/api/don-hang')

    from routes.tuy_chon_routes import tuy_chon_bp
    app.register_blueprint(tuy_chon_bp, url_prefix='/api/tuy-chon')

    @app.route('/uploads/hinh_anh/<filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register Socket.IO events
    socketio.on_event('connect', handle_connect, namespace='/don-hang')
    socketio.on_event('disconnect', handle_disconnect, namespace='/don-hang')
    socketio.on_event('join', handle_join, namespace='/don-hang')

    return app
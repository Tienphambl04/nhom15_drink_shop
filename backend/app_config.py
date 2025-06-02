from flask import Flask
from flask_cors import CORS
from database import db

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@localhost/drink_shop'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your_secret_key_here'

    db.init_app(app)

    # Register blueprints
    from routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/api/users')

    from routes.admin_user_routes import admin_user_bp
    app.register_blueprint(admin_user_bp, url_prefix='/api/admin')

    return app

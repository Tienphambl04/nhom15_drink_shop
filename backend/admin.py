from database import db
from models.user import NguoiDung
from werkzeug.security import generate_password_hash
from app import app

with app.app_context():
    if not NguoiDung.query.filter_by(vai_tro='admin').first():
        admin_user = NguoiDung(
            ten_dang_nhap='admin',
            mat_khau=generate_password_hash('admin123'),
            email='admin@example.com',
            ho_ten='Quản trị viên',
            dia_chi='Hà Nội',
            so_dien_thoai='0123456789',
            vai_tro='admin',
            trang_thai='hoat_dong'
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user created successfully!")
    else:
        print("Admin user already exists.")

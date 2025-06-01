from database import db

class NguoiDung(db.Model):
    __tablename__ = 'nguoi_dung'

    ma_nguoi_dung = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_dang_nhap = db.Column(db.String(100), unique=True, nullable=False)
    mat_khau = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    ho_ten = db.Column(db.String(100), nullable=False)
    dia_chi = db.Column(db.Text)
    so_dien_thoai = db.Column(db.String(20))
    vai_tro = db.Column(db.Enum('khach', 'admin'), default='khach', nullable=False)
    trang_thai = db.Column(db.Enum('hoat_dong', 'bi_khoa'), default='hoat_dong', nullable=False)

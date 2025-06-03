from database import db
from datetime import datetime

class GioHang(db.Model):
    __tablename__ = "gio_hang"

    ma_gio_hang = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.ma_nguoi_dung'), nullable=False)
    ma_do_uong = db.Column(db.Integer, db.ForeignKey('do_uong.ma_do_uong'), nullable=False)
    so_luong = db.Column(db.Integer, default=1, nullable=False)
    tuy_chon = db.Column(db.Text)  
    ngay_tao = db.Column(db.DateTime, default=datetime.now, nullable=False)

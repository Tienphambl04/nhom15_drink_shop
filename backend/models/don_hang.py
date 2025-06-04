from database import db
from datetime import datetime, timezone, timedelta

class DonHang(db.Model):
    __tablename__ = 'don_hang'
    ma_don_hang = db.Column(db.Integer, primary_key=True)
    ma_nguoi_dung = db.Column(db.Integer, nullable=True)
    ten_khach = db.Column(db.String(100), nullable=False)
    dia_chi_khach = db.Column(db.String(255), nullable=False)
    sdt_khach = db.Column(db.String(20), nullable=True)
    tong_tien = db.Column(db.Float, nullable=False)
    ngay_dat = db.Column(db.DateTime, default=lambda: datetime.now(timezone(timedelta(hours=7))))
    trang_thai = db.Column(db.String(50), default='cho_xu_ly')
    phuong_thuc_thanh_toan = db.Column(db.String(50), default='tien_mat')
    chi_tiet = db.relationship('ChiTietDonHang', backref='don_hang', lazy=True, cascade='all, delete-orphan')

class ChiTietDonHang(db.Model):
    __tablename__ = 'chi_tiet_don_hang'
    ma_chi_tiet = db.Column(db.Integer, primary_key=True)
    ma_don_hang = db.Column(db.Integer, db.ForeignKey('don_hang.ma_don_hang'), nullable=False)
    ma_do_uong = db.Column(db.String(50), nullable=False)
    ten_do_uong = db.Column(db.String(100), nullable=False)
    so_luong = db.Column(db.Integer, nullable=False)
    don_gia = db.Column(db.Float, nullable=False)
    tuy_chon = db.Column(db.Text, nullable=True)
    ghi_chu = db.Column(db.Text, nullable=True)
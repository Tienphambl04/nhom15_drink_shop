from database import db
from datetime import datetime, timezone, timedelta

class ThongBao(db.Model):
    __tablename__ = 'thong_bao'
    ma_thong_bao = db.Column(db.Integer, primary_key=True)
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.ma_nguoi_dung'), nullable=False)
    ma_don_hang = db.Column(db.Integer, db.ForeignKey('don_hang.ma_don_hang'), nullable=False)
    loai_thong_bao = db.Column(db.Enum('dat_hang', 'huy_don', name='loai_thong_bao'), nullable=False)
    da_doc = db.Column(db.Boolean, default=False)
    ngay_tao = db.Column(db.DateTime, default=lambda: datetime.now(timezone(timedelta(hours=7))))
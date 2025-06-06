from database import db
from datetime import datetime

class Blog(db.Model):
    __tablename__ = 'blog'

    ma_blog = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tieu_de = db.Column(db.String(255), nullable=False)
    noi_dung = db.Column(db.Text, nullable=False)
    hinh_anh = db.Column(db.String(255))
    ma_do_uong = db.Column(db.Integer, db.ForeignKey('do_uong.ma_do_uong', ondelete='CASCADE'), nullable=False)
    hien_thi = db.Column(db.Boolean, default=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
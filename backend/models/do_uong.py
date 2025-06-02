from database import db

class DoUong(db.Model):
    __tablename__ = 'do_uong'

    ma_do_uong = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_do_uong = db.Column(db.String(100), nullable=False)
    gia = db.Column(db.Numeric(10, 2), nullable=False)
    giam_gia_phan_tram = db.Column(db.Integer, default=0)
    mo_ta = db.Column(db.Text)
    hinh_anh = db.Column(db.String(255))
    ma_danh_muc = db.Column(db.Integer, db.ForeignKey('danh_muc.ma_danh_muc', ondelete='CASCADE'), nullable=False)
    hien_thi = db.Column(db.Boolean, default=True)
    ngay_tao = db.Column(db.DateTime, server_default=db.func.now())

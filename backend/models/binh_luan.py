from database import db

class BinhLuan(db.Model):
    __tablename__ = 'binh_luan'

    ma_binh_luan = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.ma_nguoi_dung', ondelete='CASCADE'), nullable=False)
    ma_do_uong = db.Column(db.Integer, db.ForeignKey('do_uong.ma_do_uong', ondelete='CASCADE'), nullable=False)
    ma_cha = db.Column(db.Integer, db.ForeignKey('binh_luan.ma_binh_luan', ondelete='CASCADE'))
    noi_dung = db.Column(db.Text, nullable=False)
    so_sao = db.Column(db.Integer)
    ngay_tao = db.Column(db.DateTime, server_default=db.func.now())
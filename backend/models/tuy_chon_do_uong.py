from database import db

class TuyChonDoUong(db.Model):
    __tablename__ = 'tuy_chon_do_uong'

    ma_tuy_chon = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ma_do_uong = db.Column(db.Integer, db.ForeignKey('do_uong.ma_do_uong', ondelete='CASCADE'), nullable=False)
    loai_tuy_chon = db.Column(db.String(50), nullable=False)  
    gia_tri = db.Column(db.String(100), nullable=False)       
    gia_them = db.Column(db.Numeric(10, 2), default=0)

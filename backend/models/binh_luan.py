from database import db

class BinhLuan(db.Model):
    __tablename__ = 'binh_luan'

    ma_binh_luan = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.ma_nguoi_dung', ondelete='CASCADE'), nullable=False)
    ma_do_uong = db.Column(db.Integer, db.ForeignKey('do_uong.ma_do_uong', ondelete='CASCADE'), nullable=False)
    ma_cha = db.Column(db.Integer, db.ForeignKey('binh_luan.ma_binh_luan', ondelete='CASCADE'), nullable=True)
    noi_dung = db.Column(db.Text, nullable=False)
    so_sao = db.Column(db.Integer, nullable=True)
    ngay_tao = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'ma_binh_luan': self.ma_binh_luan,
            'ma_nguoi_dung': self.ma_nguoi_dung,
            'ma_do_uong': self.ma_do_uong,
            'ma_cha': self.ma_cha,
            'noi_dung': self.noi_dung,
            'so_sao': self.so_sao,
            'ngay_tao': self.ngay_tao.isoformat() if self.ngay_tao else None
        }
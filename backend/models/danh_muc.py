from database import db

class DanhMuc(db.Model):
    __tablename__ = 'danh_muc'

    ma_danh_muc = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten_danh_muc = db.Column(db.String(100), unique=True, nullable=False)

    #do_uongs = db.relationship('DoUong', backref='danh_muc', cascade='all, delete-orphan', lazy=True)

# backend/models/contact.py

from database import db
from datetime import datetime

class Contact(db.Model):
    __tablename__ = 'lien_he'

    ma_lien_he = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ten = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    chu_de = db.Column(db.String(255))
    noi_dung = db.Column(db.Text, nullable=False)
    ngay_gui = db.Column(db.DateTime, default=datetime.utcnow)
    da_doc = db.Column(db.Boolean, default=False)

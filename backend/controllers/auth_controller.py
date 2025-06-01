from flask import request, jsonify, current_app
from models.user import NguoiDung
from database import db
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime

def dang_ky():
    data = request.get_json()

    if NguoiDung.query.filter_by(ten_dang_nhap=data['ten_dang_nhap']).first():
        return jsonify({"message": "Tên đăng nhập đã tồn tại"}), 400
    if NguoiDung.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email đã tồn tại"}), 400

    hashed_password = generate_password_hash(data['mat_khau'])
    
    user = NguoiDung(
        ten_dang_nhap=data['ten_dang_nhap'],
        mat_khau=hashed_password,
        email=data['email'],
        ho_ten=data['ho_ten'],
        dia_chi=data.get('dia_chi', ''),
        so_dien_thoai=data.get('so_dien_thoai', ''),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Đăng ký thành công!"}), 201

def dang_nhap():
    data = request.get_json()
    user = NguoiDung.query.filter_by(ten_dang_nhap=data['ten_dang_nhap']).first()
    if not user or not check_password_hash(user.mat_khau, data['mat_khau']):
        return jsonify({"message": "Sai tên đăng nhập hoặc mật khẩu"}), 401

    token = jwt.encode({
        'ma_nguoi_dung': user.ma_nguoi_dung,
        'vai_tro': user.vai_tro,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({"token": token})

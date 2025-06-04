from flask import request, jsonify, current_app
from models.user import NguoiDung
from database import db
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime

def dang_ky():
    data = request.get_json()

    if NguoiDung.query.filter_by(ten_dang_nhap=data['ten_dang_nhap']).first():
        return jsonify({"message": "Tên đăng nhập đã tồn tại", "success": False}), 400
    if NguoiDung.query.filter_by(email=data['email']).first():
        return jsonify({"message": "Email đã tồn tại", "success": False}), 400

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
    return jsonify({"message": "Đăng ký thành công!", "success": True}), 201

def dang_nhap():
    data = request.get_json()
    user = NguoiDung.query.filter_by(ten_dang_nhap=data['ten_dang_nhap']).first()

    if not user or not check_password_hash(user.mat_khau, data['mat_khau']):
        return jsonify({"message": "Sai tên đăng nhập hoặc mật khẩu", "success": False}), 401

    if getattr(user, 'trang_thai', None) == 'bi_khoa':
        return jsonify({"message": "Tài khoản của bạn đang bị khóa, không thể đăng nhập.", "success": False}), 403

    token = jwt.encode({
        'ma_nguoi_dung': user.ma_nguoi_dung,
        'vai_tro': user.vai_tro,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    }, current_app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "ma_nguoi_dung": user.ma_nguoi_dung,
            "ho_ten": user.ho_ten,
            "vai_tro": user.vai_tro,
            "trang_thai": user.trang_thai,
            "dia_chi": user.dia_chi,
            "so_dien_thoai": user.so_dien_thoai
        }
    }), 200

def cap_nhat_thong_tin(current_user):
    if request.method == 'GET':
        return jsonify({
            "success": True,
            "user": {
                "ho_ten": current_user.ho_ten,
                "email": current_user.email,
                "dia_chi": current_user.dia_chi,
                "so_dien_thoai": current_user.so_dien_thoai
            }
        }), 200

    data = request.get_json()
    
    if 'email' in data and data['email'] != current_user.email:
        if NguoiDung.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email đã tồn tại", "success": False}), 400

    current_user.ho_ten = data.get('ho_ten', current_user.ho_ten)
    current_user.email = data.get('email', current_user.email)
    current_user.dia_chi = data.get('dia_chi', current_user.dia_chi)
    current_user.so_dien_thoai = data.get('so_dien_thoai', current_user.so_dien_thoai)

    db.session.commit()
    return jsonify({
        "message": "Cập nhật thông tin thành công!",
        "success": True,
        "user": {
            "ho_ten": current_user.ho_ten,
            "email": current_user.email,
            "dia_chi": current_user.dia_chi,
            "so_dien_thoai": current_user.so_dien_thoai
        }
    }), 200

def doi_mat_khau(current_user):
    data = request.get_json()
    
    if not check_password_hash(current_user.mat_khau, data['mat_khau_cu']):
        return jsonify({"message": "Mật khẩu cũ không đúng", "success": False}), 401

    if data['mat_khau_moi'] != data['mat_khau_xac_nhan']:
        return jsonify({"message": "Mật khẩu xác nhận không khớp", "success": False}), 400

    current_user.mat_khau = generate_password_hash(data['mat_khau_moi'])
    db.session.commit()
    return jsonify({"message": "Đổi mật khẩu thành công!", "success": True}), 200
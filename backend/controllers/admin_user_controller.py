from flask import request, jsonify
from werkzeug.security import generate_password_hash
from models.user import NguoiDung
from database import db

# Lấy danh sách tất cả người dùng (đã có so_dien_thoai và dia_chi)
def lay_danh_sach_nguoi_dung():
    users = NguoiDung.query.all()
    result = [{
        "ma_nguoi_dung": u.ma_nguoi_dung,
        "ten_dang_nhap": u.ten_dang_nhap,
        "email": u.email,
        "ho_ten": u.ho_ten,
        "so_dien_thoai": u.so_dien_thoai,
        "dia_chi": u.dia_chi,
        "vai_tro": u.vai_tro,
        "trang_thai": u.trang_thai
    } for u in users]
    return jsonify({"success": True, "data": result})

# Thêm tài khoản mới (có nhận thêm so_dien_thoai và dia_chi)
def them_tai_khoan_moi():
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
        so_dien_thoai=data.get('so_dien_thoai', ''),
        dia_chi=data.get('dia_chi', ''),
        vai_tro=data.get('vai_tro', 'khach'),
        trang_thai='hoat_dong'
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Thêm tài khoản thành công", "success": True}), 201

# Các API khác giữ nguyên (khóa mở khóa, reset mk, xóa) vì không liên quan đến so_dien_thoai và dia_chi
def thay_doi_trang_thai(ma_nguoi_dung):
    user = NguoiDung.query.get(ma_nguoi_dung)
    if not user:
        return jsonify({"message": "Người dùng không tồn tại", "success": False}), 404
    user.trang_thai = 'bi_khoa' if user.trang_thai == 'hoat_dong' else 'hoat_dong'
    db.session.commit()
    return jsonify({"message": f"Đã cập nhật trạng thái thành {user.trang_thai}", "success": True})

def reset_mat_khau(ma_nguoi_dung):
    user = NguoiDung.query.get(ma_nguoi_dung)
    if not user:
        return jsonify({"message": "Người dùng không tồn tại", "success": False}), 404
    user.mat_khau = generate_password_hash("123456")  # Mật khẩu mặc định
    db.session.commit()
    return jsonify({"message": "Mật khẩu đã được reset về mặc định", "success": True})

def xoa_tai_khoan(ma_nguoi_dung):
    user = NguoiDung.query.get(ma_nguoi_dung)
    if not user:
        return jsonify({"message": "Người dùng không tồn tại", "success": False}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Xóa tài khoản thành công", "success": True})

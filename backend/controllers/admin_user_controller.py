from flask import jsonify, request
from models.user import NguoiDung
from database import db
from werkzeug.security import generate_password_hash

def list_users():
    """Retrieve a list of all users."""
    users = NguoiDung.query.all()
    user_list = [{
        "ma_nguoi_dung": user.ma_nguoi_dung,
        "ten_dang_nhap": user.ten_dang_nhap,
        "email": user.email,
        "ho_ten": user.ho_ten,
        "dia_chi": user.dia_chi,
        "so_dien_thoai": user.so_dien_thoai,
        "vai_tro": user.vai_tro,
        "trang_thai": user.trang_thai
    } for user in users]
    return jsonify({
        "success": True,
        "message": "Danh sách người dùng",
        "data": user_list
    }), 200

def reset_password(user_id):
    """Reset a user's password."""
    data = request.get_json()
    new_password = data.get('mat_khau_moi')
    if not new_password:
        return jsonify({"success": False, "message": "Mật khẩu mới là bắt buộc"}), 400

    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "Người dùng không tồn tại"}), 404

    user.mat_khau = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({
        "success": True,
        "message": f"Đặt lại mật khẩu thành công cho {user.ten_dang_nhap}"
    }), 200

def toggle_account_status(user_id):
    """Lock or unlock a user account."""
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "Người dùng không tồn tại"}), 404

    # Prevent locking/unlocking self
    current_user_id = request.user['ma_nguoi_dung']
    if user.ma_nguoi_dung == current_user_id:
        return jsonify({"success": False, "message": "Không thể khóa/mở khóa tài khoản của chính bạn"}), 403

    user.trang_thai = 'hoat_dong' if user.trang_thai == 'bi_khoa' else 'bi_khoa'
    db.session.commit()
    status_message = "mở khóa" if user.trang_thai == 'hoat_dong' else "khóa"
    return jsonify({
        "success": True,
        "message": f"Tài khoản {user.ten_dang_nhap} đã được {status_message}"
    }), 200

def delete_user(user_id):
    """Delete a user account."""
    user = NguoiDung.query.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "Người dùng không tồn tại"}), 404

    # Prevent deleting self
    current_user_id = request.user['ma_nguoi_dung']
    if user.ma_nguoi_dung == current_user_id:
        return jsonify({"success": False, "message": "Không thể xóa tài khoản của chính bạn"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({
        "success": True,
        "message": f"Tài khoản {user.ten_dang_nhap} đã được xóa"
    }), 200

def add_user():
    """Add a new user (admin or customer)."""
    data = request.get_json()

    # Validate required fields
    required_fields = ['ten_dang_nhap', 'mat_khau', 'email', 'ho_ten', 'vai_tro']
    for field in required_fields:
        if field not in data:
            return jsonify({"success": False, "message": f"Thiếu trường {field}"}), 400

    # Check for existing username or email
    if NguoiDung.query.filter_by(ten_dang_nhap=data['ten_dang_nhap']).first():
        return jsonify({"success": False, "message": "Tên đăng nhập đã tồn tại"}), 400
    if NguoiDung.query.filter_by(email=data['email']).first():
        return jsonify({"success": False, "message": "Email đã tồn tại"}), 400

    # Validate vai_tro
    if data['vai_tro'] not in ['khach', 'admin']:
        return jsonify({"success": False, "message": "Vai trò không hợp lệ"}), 400

    hashed_password = generate_password_hash(data['mat_khau'])
    new_user = NguoiDung(
        ten_dang_nhap=data['ten_dang_nhap'],
        mat_khau=hashed_password,
        email=data['email'],
        ho_ten=data['ho_ten'],
        dia_chi=data.get('dia_chi', ''),
        so_dien_thoai=data.get('so_dien_thoai', ''),
        vai_tro=data['vai_tro'],
        trang_thai='hoat_dong'
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "success": True,
        "message": "Tạo tài khoản thành công",
        "data": {
            "ma_nguoi_dung": new_user.ma_nguoi_dung,
            "ten_dang_nhap": new_user.ten_dang_nhap,
            "email": new_user.email,
            "ho_ten": new_user.ho_ten,
            "vai_tro": new_user.vai_tro,
            "trang_thai": new_user.trang_thai
        }
    }), 201
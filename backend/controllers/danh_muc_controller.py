from flask import request, jsonify
from models.danh_muc import DanhMuc
from database import db

# Lấy danh sách tất cả danh mục
def lay_danh_sach_danh_muc():
    danh_mucs = DanhMuc.query.all()
    result = [{"ma_danh_muc": dm.ma_danh_muc, "ten_danh_muc": dm.ten_danh_muc} for dm in danh_mucs]
    return jsonify({"success": True, "data": result})

# Thêm danh mục mới
def them_danh_muc():
    data = request.get_json()
    ten = data.get('ten_danh_muc')
    if not ten:
        return jsonify({"message": "Tên danh mục không được để trống", "success": False}), 400

    if DanhMuc.query.filter_by(ten_danh_muc=ten).first():
        return jsonify({"message": "Tên danh mục đã tồn tại", "success": False}), 400

    dm = DanhMuc(ten_danh_muc=ten)
    db.session.add(dm)
    db.session.commit()
    return jsonify({"message": "Thêm danh mục thành công", "success": True}), 201

# Sửa danh mục
def sua_danh_muc(ma_danh_muc):
    dm = DanhMuc.query.get(ma_danh_muc)
    if not dm:
        return jsonify({"message": "Danh mục không tồn tại", "success": False}), 404

    data = request.get_json()
    ten_moi = data.get('ten_danh_muc')
    if not ten_moi:
        return jsonify({"message": "Tên danh mục không được để trống", "success": False}), 400

    # Kiểm tra trùng tên (ngoại trừ chính nó)
    if DanhMuc.query.filter(DanhMuc.ten_danh_muc == ten_moi, DanhMuc.ma_danh_muc != ma_danh_muc).first():
        return jsonify({"message": "Tên danh mục đã tồn tại", "success": False}), 400

    dm.ten_danh_muc = ten_moi
    db.session.commit()
    return jsonify({"message": "Cập nhật danh mục thành công", "success": True})

# Xóa danh mục
def xoa_danh_muc(ma_danh_muc):
    dm = DanhMuc.query.get(ma_danh_muc)
    if not dm:
        return jsonify({"message": "Danh mục không tồn tại", "success": False}), 404

    db.session.delete(dm)
    db.session.commit()
    return jsonify({"message": "Xóa danh mục thành công", "success": True})

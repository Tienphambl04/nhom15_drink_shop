from flask import jsonify, request
from database import db
from models.gio_hang import GioHang
from datetime import datetime
import json

# Lấy tất cả mục giỏ hàng của 1 người dùng
def get_gio_hang_by_user(ma_nguoi_dung):
    gio_hang = GioHang.query.filter_by(ma_nguoi_dung=ma_nguoi_dung).all()
    result = []
    for item in gio_hang:
        try:
            tuy_chon = json.loads(item.tuy_chon) if item.tuy_chon else []
        except json.JSONDecodeError:
            tuy_chon = []

        result.append({
            "ma_gio_hang": item.ma_gio_hang,
            "ma_nguoi_dung": item.ma_nguoi_dung,
            "ma_do_uong": item.ma_do_uong,
            "so_luong": item.so_luong,
            "tuy_chon": tuy_chon,
            "ngay_tao": item.ngay_tao.strftime("%Y-%m-%d %H:%M:%S")
        })
    return jsonify(result), 200

# Thêm vào giỏ hàng
def add_gio_hang():
    data = request.get_json()
    try:
        tuy_chon_data = data.get("tuy_chon", "")
        if isinstance(tuy_chon_data, (dict, list)):
            tuy_chon_data = json.dumps(tuy_chon_data)

        new_item = GioHang(
            ma_nguoi_dung=data["ma_nguoi_dung"],
            ma_do_uong=data["ma_do_uong"],
            so_luong=data.get("so_luong", 1),
            tuy_chon=tuy_chon_data
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Thêm vào giỏ hàng thành công"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# Xóa 1 mục giỏ hàng
def delete_gio_hang(ma_gio_hang):
    item = GioHang.query.get(ma_gio_hang)
    if not item:
        return jsonify({"error": "Không tìm thấy mục giỏ hàng"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Xóa thành công"}), 200

# Cập nhật số lượng và tùy chọn
def update_so_luong(ma_gio_hang):
    data = request.get_json()
    item = GioHang.query.get(ma_gio_hang)
    if not item:
        return jsonify({"error": "Không tìm thấy mục giỏ hàng"}), 404
    try:
        item.so_luong = data.get("so_luong", item.so_luong)
        if "tuy_chon" in data:
            tuy_chon_data = data.get("tuy_chon", "")
            if isinstance(tuy_chon_data, (dict, list)):
                item.tuy_chon = json.dumps(tuy_chon_data)
            else:
                item.tuy_chon = tuy_chon_data
        db.session.commit()
        return jsonify({"message": "Cập nhật thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
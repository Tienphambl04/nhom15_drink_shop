from flask import request, jsonify
from models.tuy_chon_do_uong import TuyChonDoUong
from database import db

# Lấy danh sách tùy chọn theo mã đồ uống
def lay_tuy_chon_theo_do_uong(ma_do_uong):
    tuy_chons = TuyChonDoUong.query.filter_by(ma_do_uong=ma_do_uong).all()
    result = [{
        "ma_tuy_chon": tc.ma_tuy_chon,
        "ma_do_uong": tc.ma_do_uong,
        "loai_tuy_chon": tc.loai_tuy_chon,
        "gia_tri": tc.gia_tri,
        "gia_them": float(tc.gia_them)
    } for tc in tuy_chons]
    return jsonify({"success": True, "data": result})

# Thêm một hoặc nhiều tùy chọn
def them_tuy_chon():
    data = request.get_json()
    if isinstance(data, list):
        # Thêm nhiều tùy chọn
        new_options = []
        for item in data:
            ma_do_uong = item.get('ma_do_uong')
            loai = item.get('loai_tuy_chon')
            gia_tri = item.get('gia_tri')
            gia_them = item.get('gia_them', 0)

            if not all([ma_do_uong, loai, gia_tri]):
                continue  # Bỏ qua tùy chọn thiếu thông tin

            option = TuyChonDoUong(
                ma_do_uong=ma_do_uong,
                loai_tuy_chon=loai,
                gia_tri=gia_tri,
                gia_them=gia_them
            )
            new_options.append(option)
        
        db.session.add_all(new_options)
        db.session.commit()
        return jsonify({"message": f"Đã thêm {len(new_options)} tùy chọn", "success": True}), 201
    else:
        # Thêm 1 tùy chọn
        ma_do_uong = data.get('ma_do_uong')
        loai = data.get('loai_tuy_chon')
        gia_tri = data.get('gia_tri')
        gia_them = data.get('gia_them', 0)

        if not all([ma_do_uong, loai, gia_tri]):
            return jsonify({"message": "Thông tin không đầy đủ", "success": False}), 400

        tuy_chon = TuyChonDoUong(
            ma_do_uong=ma_do_uong,
            loai_tuy_chon=loai,
            gia_tri=gia_tri,
            gia_them=gia_them
        )
        db.session.add(tuy_chon)
        db.session.commit()
        return jsonify({"message": "Thêm tùy chọn thành công", "success": True}), 201

# Sửa tùy chọn
def sua_tuy_chon(ma_tuy_chon):
    data = request.get_json()
    tuy_chon = TuyChonDoUong.query.get(ma_tuy_chon)

    if not tuy_chon:
        return jsonify({"message": "Tùy chọn không tồn tại", "success": False}), 404

    tuy_chon.loai_tuy_chon = data.get("loai_tuy_chon", tuy_chon.loai_tuy_chon)
    tuy_chon.gia_tri = data.get("gia_tri", tuy_chon.gia_tri)
    tuy_chon.gia_them = data.get("gia_them", tuy_chon.gia_them)

    db.session.commit()
    return jsonify({"message": "Cập nhật tùy chọn thành công", "success": True})

# Xóa tùy chọn
def xoa_tuy_chon(ma_tuy_chon):
    tuy_chon = TuyChonDoUong.query.get(ma_tuy_chon)
    if not tuy_chon:
        return jsonify({"message": "Tùy chọn không tồn tại", "success": False}), 404

    db.session.delete(tuy_chon)
    db.session.commit()
    return jsonify({"message": "Xóa tùy chọn thành công", "success": True})

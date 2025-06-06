import os
from flask import request, jsonify
from werkzeug.utils import secure_filename
from models.do_uong import DoUong
from database import db

UPLOAD_FOLDER = 'uploads/hinh_anh'

# Helper: chuyển giá trị "true"/"1"/"yes" => True
def parse_bool(value):
    return str(value).lower() in ['true', '1', 'yes']

# Lấy danh sách đồ uống theo danh mục
def lay_do_uong_theo_danh_muc(ma_danh_muc):
    ds = DoUong.query.filter_by(ma_danh_muc=ma_danh_muc).all()
    result = [{
        "ma_do_uong": d.ma_do_uong,
        "ten_do_uong": d.ten_do_uong,
        "gia": float(d.gia),
        "giam_gia_phan_tram": d.giam_gia_phan_tram,
        "mo_ta": d.mo_ta,
        "hinh_anh": d.hinh_anh,
        "hien_thi": d.hien_thi
    } for d in ds]
    return jsonify({"success": True, "data": result})

# Lấy chi tiết đồ uống theo ID
def lay_do_uong_theo_id(ma_do_uong):
    do_uong = DoUong.query.get(ma_do_uong)
    if not do_uong:
        return jsonify({"success": False, "message": "Không tìm thấy đồ uống"}), 404

    result = {
        "ma_do_uong": do_uong.ma_do_uong,
        "ten_do_uong": do_uong.ten_do_uong,
        "gia": float(do_uong.gia),
        "giam_gia_phan_tram": do_uong.giam_gia_phan_tram,
        "mo_ta": do_uong.mo_ta,
        "hinh_anh": do_uong.hinh_anh,
        "ma_danh_muc": do_uong.ma_danh_muc,
        "hien_thi": do_uong.hien_thi
    }
    return jsonify({"success": True, "data": result})


# Thêm đồ uống mới
def them_do_uong():
    ten = request.form.get('ten_do_uong')
    gia = request.form.get('gia')
    giam_gia = request.form.get('giam_gia_phan_tram', 0)
    mo_ta = request.form.get('mo_ta')
    ma_danh_muc = request.form.get('ma_danh_muc')
    hien_thi = request.form.get('hien_thi', 'true')

    file = request.files.get('hinh_anh')
    filename = None
    if file:
        filename = secure_filename(file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)

    do_uong = DoUong(
        ten_do_uong=ten,
        gia=gia,
        giam_gia_phan_tram=giam_gia,
        mo_ta=mo_ta,
        hinh_anh=filename,
        ma_danh_muc=ma_danh_muc,
        hien_thi=parse_bool(hien_thi)
    )
    db.session.add(do_uong)
    db.session.commit()
    return jsonify({"success": True, "message": "Thêm đồ uống thành công"})

# Xóa đồ uống
def xoa_do_uong(ma_do_uong):
    do_uong = DoUong.query.get(ma_do_uong)
    if not do_uong:
        return jsonify({"success": False, "message": "Không tìm thấy đồ uống"}), 404

    # Xóa ảnh nếu có
    if do_uong.hinh_anh:
        hinh_path = os.path.join(UPLOAD_FOLDER, do_uong.hinh_anh)
        if os.path.exists(hinh_path):
            os.remove(hinh_path)

    db.session.delete(do_uong)
    db.session.commit()
    return jsonify({"success": True, "message": "Đã xóa đồ uống"})


# Cập nhật đồ uống
def sua_do_uong(ma_do_uong):
    do_uong = DoUong.query.get(ma_do_uong)
    if not do_uong:
        return jsonify({"success": False, "message": "Không tìm thấy đồ uống"}), 404

    data = request.form
    do_uong.ten_do_uong = data.get('ten_do_uong', do_uong.ten_do_uong)
    do_uong.gia = data.get('gia', do_uong.gia)
    do_uong.giam_gia_phan_tram = data.get('giam_gia_phan_tram', do_uong.giam_gia_phan_tram)
    do_uong.mo_ta = data.get('mo_ta', do_uong.mo_ta)
    do_uong.ma_danh_muc = data.get('ma_danh_muc', do_uong.ma_danh_muc)
    hien_thi_str = data.get('hien_thi', str(do_uong.hien_thi))
    do_uong.hien_thi = parse_bool(hien_thi_str)

    file = request.files.get('hinh_anh')
    if file and file.filename:
        # Nếu có ảnh mới thì xóa ảnh cũ (nếu có)
        if do_uong.hinh_anh:
            old_path = os.path.join(UPLOAD_FOLDER, do_uong.hinh_anh)
            if os.path.exists(old_path):
                os.remove(old_path)

        # Lưu ảnh mới
        filename = secure_filename(file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        do_uong.hinh_anh = filename

    db.session.commit()
    return jsonify({"success": True, "message": "Cập nhật thành công"})

def lay_danh_sach_do_uong():
    try:
        ds = DoUong.query.filter_by(hien_thi=True).all()
        result = [{"ma_do_uong": d.ma_do_uong, "ten_do_uong": d.ten_do_uong} for d in ds]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

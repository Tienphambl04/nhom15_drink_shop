# backend/controllers/blog_controller.py

import os
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from models.blog import Blog
from database import db
from datetime import datetime

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    filename = secure_filename(file.filename)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    filepath = os.path.join(upload_folder, filename)

    # Tránh ghi đè file
    if os.path.exists(filepath):
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{int(datetime.utcnow().timestamp())}{ext}"
        filepath = os.path.join(upload_folder, filename)

    file.save(filepath)
    return f'Uploads/hinh_anh/{filename}'  # Đường dẫn lưu trong DB

def them_blog():
    if 'hinh_anh' not in request.files:
        return jsonify({"error": "Không có file ảnh"}), 400

    file = request.files['hinh_anh']
    if file.filename == '':
        return jsonify({"error": "Chưa chọn file ảnh"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "File ảnh không hợp lệ (png/jpg/jpeg/gif)"}), 400

    try:
        duong_dan_anh = save_file(file)

        tieu_de = request.form.get('tieu_de')
        noi_dung = request.form.get('noi_dung')
        ma_do_uong = request.form.get('ma_do_uong')
        hien_thi = request.form.get('hien_thi', 'true').lower() == 'true'

        if not all([tieu_de, noi_dung, ma_do_uong]):
            return jsonify({"error": "Thiếu dữ liệu bắt buộc"}), 400

        blog = Blog(
            tieu_de=tieu_de,
            noi_dung=noi_dung,
            hinh_anh=duong_dan_anh,
            ma_do_uong=int(ma_do_uong),
            hien_thi=hien_thi
        )
        db.session.add(blog)
        db.session.commit()
        return jsonify({"message": "Thêm blog thành công", "ma_blog": blog.ma_blog}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def sua_blog(ma_blog):
    blog = Blog.query.get(ma_blog)
    if not blog:
        return jsonify({"error": "Không tìm thấy blog"}), 404

    try:
        # Nếu frontend gửi file ảnh mới
        if 'hinh_anh' in request.files:
            file = request.files['hinh_anh']
            if file.filename != '':
                if not allowed_file(file.filename):
                    return jsonify({"error": "File ảnh không hợp lệ (png/jpg/jpeg/gif)"}), 400

                # Xoá file cũ nếu cần (nếu bạn muốn)
                old_path = os.path.join(current_app.root_path, blog.hinh_anh)
                if os.path.exists(old_path):
                    os.remove(old_path)

                # Lưu file mới và cập nhật đường dẫn
                blog.hinh_anh = save_file(file)

        # Cập nhật các trường khác (lấy từ form hoặc json)
        data = request.form if request.form else request.json

        blog.tieu_de = data.get('tieu_de', blog.tieu_de)
        blog.noi_dung = data.get('noi_dung', blog.noi_dung)
        blog.ma_do_uong = int(data.get('ma_do_uong', blog.ma_do_uong))
        if 'hien_thi' in data:
            blog.hien_thi = data.get('hien_thi').lower() == 'true' if isinstance(data.get('hien_thi'), str) else bool(data.get('hien_thi'))

        db.session.commit()
        return jsonify({"message": "Cập nhật blog thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def xoa_blog(ma_blog):
    try:
        blog = Blog.query.get(ma_blog)
        if not blog:
            return jsonify({"error": "Không tìm thấy blog"}), 404

        # Xoá file ảnh cũ nếu muốn
        old_path = os.path.join(current_app.root_path, blog.hinh_anh)
        if os.path.exists(old_path):
            os.remove(old_path)

        db.session.delete(blog)
        db.session.commit()
        return jsonify({"message": "Xóa blog thành công"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def lay_danh_sach_blog():
    try:
        blogs = Blog.query.order_by(Blog.ngay_tao.desc()).all()
        result = []
        for blog in blogs:
            result.append({
                "ma_blog": blog.ma_blog,
                "tieu_de": blog.tieu_de,
                "noi_dung": blog.noi_dung,
                "hinh_anh": blog.hinh_anh,
                "ma_do_uong": blog.ma_do_uong,
                "hien_thi": blog.hien_thi,
                "ngay_tao": blog.ngay_tao.strftime("%Y-%m-%d %H:%M:%S"),
                "cap_nhat": blog.cap_nhat.strftime("%Y-%m-%d %H:%M:%S") if blog.cap_nhat else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


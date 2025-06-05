from flask import jsonify, request
from database import db
from models.thong_bao import ThongBao
from datetime import datetime, timezone, timedelta

def get_thong_bao():
    ma_nguoi_dung = request.args.get('ma_nguoi_dung')
    da_doc = request.args.get('da_doc')

    if not ma_nguoi_dung:
        return jsonify({'error': 'Thiếu mã người dùng'}), 400

    query = ThongBao.query.filter_by(ma_nguoi_dung=ma_nguoi_dung)
    if da_doc is not None:
        query = query.filter_by(da_doc=bool(int(da_doc)))

    thong_bao_list = query.order_by(ThongBao.ngay_tao.desc()).all()
    vn_tz = timezone(timedelta(hours=7))
    result = [{
        'ma_thong_bao': tb.ma_thong_bao,
        'ma_nguoi_dung': tb.ma_nguoi_dung,
        'ma_don_hang': tb.ma_don_hang,
        'loai_thong_bao': tb.loai_thong_bao,
        'da_doc': tb.da_doc,
        'ngay_tao': tb.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
    } for tb in thong_bao_list]

    return jsonify(result), 200

def mark_thong_bao_read(ma_thong_bao):
    thong_bao = ThongBao.query.get(ma_thong_bao)
    if not thong_bao:
        return jsonify({'error': 'Thông báo không tồn tại'}), 404

    try:
        thong_bao.da_doc = True
        db.session.commit()
        return jsonify({'message': 'Đánh dấu thông báo đã đọc thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

def delete_thong_bao(ma_thong_bao):
    thong_bao = ThongBao.query.get(ma_thong_bao)
    if not thong_bao:
        return jsonify({'error': 'Thông báo không tồn tại'}), 404

    try:
        db.session.delete(thong_bao)
        db.session.commit()
        return jsonify({'message': 'Xóa thông báo thành công'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
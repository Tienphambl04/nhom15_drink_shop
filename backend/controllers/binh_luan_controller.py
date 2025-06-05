
from flask import jsonify, request
from flask_socketio import emit, join_room
from database import db
from models.binh_luan import BinhLuan
from models.user import NguoiDung
import logging
from datetime import datetime, timezone, timedelta

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Socket.IO connect and join event
def handle_connect_binh_luan():
    logger.debug('Client connected to /binh-luan namespace')

def handle_disconnect_binh_luan():
    logger.debug('Client disconnected from /binh-luan namespace')

def handle_join_binh_luan(data):
    ma_nguoi_dung = data.get('ma_nguoi_dung')
    role = data.get('role')
    ma_do_uong = data.get('ma_do_uong')
    if role == 'admin':
        join_room('admin')
        logger.debug('Admin joined room: admin')
    elif ma_nguoi_dung:
        join_room(f'user-{ma_nguoi_dung}')
        if ma_do_uong:
            join_room(f'drink-{ma_do_uong}')
            logger.debug(f'User {ma_nguoi_dung} joined room: drink-{ma_do_uong}')
        logger.debug(f'User {ma_nguoi_dung} joined room: user-{ma_nguoi_dung}')

# Lấy danh sách bình luận theo đồ uống
def lay_binh_luan_theo_do_uong(ma_do_uong):
    try:
        binh_luans = db.session.query(BinhLuan, NguoiDung.ho_ten).\
            join(NguoiDung, BinhLuan.ma_nguoi_dung == NguoiDung.ma_nguoi_dung).\
            filter(BinhLuan.ma_do_uong == ma_do_uong).\
            order_by(BinhLuan.ngay_tao.desc()).all()
        vn_tz = timezone(timedelta(hours=7))
        result = [{
            'ma_binh_luan': bl.ma_binh_luan,
            'ma_nguoi_dung': str(bl.ma_nguoi_dung),
            'ho_ten': ho_ten,
            'ma_do_uong': bl.ma_do_uong,
            'ma_cha': bl.ma_cha,
            'noi_dung': bl.noi_dung,
            'so_sao': bl.so_sao,
            'ngay_tao': bl.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        } for bl, ho_ten in binh_luans]
        return jsonify({'success': True, 'data': result}), 200
    except Exception as e:
        logger.error(f'Error fetching comments for drink {ma_do_uong}: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 400

# Thêm bình luận mới
def them_binh_luan():
    data = request.get_json()
    try:
        ma_nguoi_dung = data.get('ma_nguoi_dung')
        ma_do_uong = data.get('ma_do_uong')
        noi_dung = data.get('noi_dung')
        so_sao = data.get('so_sao')
        ma_cha = data.get('ma_cha')

        if not ma_nguoi_dung or not ma_do_uong or not noi_dung:
            return jsonify({'success': False, 'error': 'Thiếu thông tin bắt buộc'}), 400

        user = NguoiDung.query.get(int(ma_nguoi_dung))
        if not user:
            return jsonify({'success': False, 'error': 'Người dùng không tồn tại'}), 404

        if so_sao is not None and (not isinstance(so_sao, int) or so_sao < 1 or so_sao > 5):
            return jsonify({'success': False, 'error': 'Số sao phải từ 1 đến 5'}), 400

        if ma_cha:
            parent_comment = BinhLuan.query.get(ma_cha)
            if not parent_comment or parent_comment.ma_do_uong != ma_do_uong:
                return jsonify({'success': False, 'error': 'Bình luận cha không hợp lệ'}), 400

        binh_luan = BinhLuan(
            ma_nguoi_dung=int(ma_nguoi_dung),
            ma_do_uong=ma_do_uong,
            noi_dung=noi_dung,
            so_sao=so_sao,
            ma_cha=ma_cha
        )
        db.session.add(binh_luan)
        db.session.commit()

        vn_tz = timezone(timedelta(hours=7))
        binh_luan_data = {
            'ma_binh_luan': binh_luan.ma_binh_luan,
            'ma_nguoi_dung': str(binh_luan.ma_nguoi_dung),
            'ho_ten': user.ho_ten,
            'ma_do_uong': binh_luan.ma_do_uong,
            'ma_cha': binh_luan.ma_cha,
            'noi_dung': binh_luan.noi_dung,
            'so_sao': binh_luan.so_sao,
            'ngay_tao': binh_luan.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }

        emit('binh_luan_moi', binh_luan_data, room=f'drink-{ma_do_uong}', namespace='/binh-luan')
        emit('binh_luan_moi', binh_luan_data, room='admin', namespace='/binh-luan')
        logger.debug(f'Sent binh_luan_moi for drink {ma_do_uong}: {binh_luan_data}')

        return jsonify({
            'success': True,
            'message': 'Thêm bình luận thành công',
            'data': binh_luan_data
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error adding comment: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 400

# Xóa bình luận
def xoa_binh_luan(ma_binh_luan):
    try:
        data = request.get_json()
        ma_nguoi_dung = data.get('ma_nguoi_dung')
        binh_luan = BinhLuan.query.get(ma_binh_luan)

        if not binh_luan:
            return jsonify({'success': False, 'error': 'Bình luận không tồn tại'}), 404

        user = NguoiDung.query.get(int(ma_nguoi_dung)) if ma_nguoi_dung else None
        if not user:
            return jsonify({'success': False, 'error': 'Người dùng không tồn tại'}), 404
        if user.vai_tro != 'admin' and binh_luan.ma_nguoi_dung != int(ma_nguoi_dung):
            return jsonify({'success': False, 'error': 'Không có quyền xóa bình luận này'}), 403

        ma_do_uong = binh_luan.ma_do_uong
        db.session.delete(binh_luan)
        db.session.commit()

        event_data = {'ma_binh_luan': ma_binh_luan, 'ma_do_uong': ma_do_uong}
        emit('xoa_binh_luan', event_data, room=f'drink-{ma_do_uong}', namespace='/binh-luan')
        emit('xoa_binh_luan', event_data, room='admin', namespace='/binh-luan')
        logger.debug(f'Sent xoa_binh_luan for comment {ma_binh_luan}')

        return jsonify({'success': True, 'message': 'Xóa bình luận thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error deleting comment {ma_binh_luan}: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 400

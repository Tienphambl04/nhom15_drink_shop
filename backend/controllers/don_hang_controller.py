from flask import jsonify, request
from flask_socketio import emit, join_room
from database import db
from models.don_hang import DonHang, ChiTietDonHang
from models.gio_hang import GioHang
from models.do_uong import DoUong
from models.thong_bao import ThongBao
from models.user import NguoiDung
import json
from datetime import datetime, timezone, timedelta
import logging

# Thiết lập logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Socket.IO connect and join event
def handle_connect():
    logger.debug('Client connected')

def handle_disconnect():
    logger.debug('Client disconnected')

def handle_join(data):
    ma_nguoi_dung = data.get('ma_nguoi_dung')
    role = data.get('role')
    if role == 'admin':
        join_room('admin')
        logger.debug('Admin joined room: admin')
    elif ma_nguoi_dung:
        join_room(f'user-{ma_nguoi_dung}')
        logger.debug(f'User {ma_nguoi_dung} joined room: user-{ma_nguoi_dung}')

# Lấy danh sách thông báo
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

# Đánh dấu thông báo đã đọc
def mark_thong_bao_read(ma_thong_bao):
    thong_bao = ThongBao.query.get(ma_thong_bao)
    if not thong_bao:
        return jsonify({'error': 'Thông báo không tồn tại'}), 404

    try:
        thong_bao.da_doc = True
        db.session.commit()
        logger.debug(f'Marked notification {ma_thong_bao} as read')
        return jsonify({'message': 'Đánh dấu thông báo đã đọc thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error marking notification {ma_thong_bao} as read: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Xóa thông báo
def delete_thong_bao(ma_thong_bao):
    thong_bao = ThongBao.query.get(ma_thong_bao)
    if not thong_bao:
        return jsonify({'error': 'Thông báo không tồn tại'}), 404

    try:
        db.session.delete(thong_bao)
        db.session.commit()
        logger.debug(f'Deleted notification {ma_thong_bao}')
        return jsonify({'message': 'Xóa thông báo thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error deleting notification {ma_thong_bao}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Tạo đơn hàng mới
def create_don_hang():
    data = request.get_json()
    try:
        ma_nguoi_dung = data.get('ma_nguoi_dung')
        ten_khach = data.get('ten_khach')
        dia_chi_khach = data.get('dia_chi_khach')
        sdt_khach = data.get('sdt_khach')
        phuong_thuc_thanh_toan = data.get('phuong_thuc_thanh_toan', 'tien_mat')
        ma_gio_hang_ids = data.get('ma_gio_hang_ids', [])
        chi_tiet = data.get('chi_tiet', [])

        logger.debug(f'Creating order for user: {ma_nguoi_dung}, cart IDs: {ma_gio_hang_ids}')

        if not ten_khach or not dia_chi_khach:
            return jsonify({'error': 'Thiếu thông tin khách hàng'}), 400

        tong_tien = 0
        chi_tiet_don_hang = []

        if ma_gio_hang_ids:
            gio_hang_items = GioHang.query.filter(GioHang.ma_gio_hang.in_(ma_gio_hang_ids)).all()
            if len(gio_hang_items) != len(ma_gio_hang_ids):
                return jsonify({'error': 'Một số mục giỏ hàng không tồn tại'}), 400

            for item in gio_hang_items:
                do_uong = DoUong.query.get(item.ma_do_uong)
                if not do_uong:
                    return jsonify({'error': f'Đồ uống {item.ma_do_uong} không tồn tại'}), 400

                gia_goc = float(do_uong.gia)
                giam_gia = float(do_uong.giam_gia_phan_tram or 0)
                gia_sau_giam = gia_goc * (1 - giam_gia / 100)
                tuy_chon = json.loads(item.tuy_chon or '[]')
                gia_tuy_chon = sum(float(opt.get('gia_them', 0)) for opt in tuy_chon)
                don_gia = gia_sau_giam + gia_tuy_chon
                tong_tien += don_gia * item.so_luong

                chi_tiet_don_hang.append({
                    'ma_do_uong': item.ma_do_uong,
                    'ten_do_uong': do_uong.ten_do_uong,
                    'so_luong': item.so_luong,
                    'don_gia': don_gia,
                    'tuy_chon': item.tuy_chon,
                    'ghi_chu': None
                })

        elif chi_tiet:
            for item in chi_tiet:
                ma_do_uong = item.get('ma_do_uong')
                so_luong = item.get('so_luong', 1)
                tuy_chon = item.get('tuy_chon', [])
                ghi_chu = item.get('ghi_chu')

                do_uong = DoUong.query.get(ma_do_uong)
                if not do_uong:
                    return jsonify({'error': f'Đồ uống {ma_do_uong} không tồn tại'}), 400

                gia_goc = float(do_uong.gia)
                giam_gia = float(do_uong.giam_gia_phan_tram or 0)
                gia_sau_giam = gia_goc * (1 - giam_gia / 100)
                gia_tuy_chon = sum(float(opt.get('gia_them', 0)) for opt in tuy_chon)
                don_gia = gia_sau_giam + gia_tuy_chon
                tong_tien += don_gia * so_luong

                chi_tiet_don_hang.append({
                    'ma_do_uong': ma_do_uong,
                    'ten_do_uong': do_uong.ten_do_uong,
                    'so_luong': so_luong,
                    'don_gia': don_gia,
                    'tuy_chon': json.dumps(tuy_chon) if tuy_chon else None,
                    'ghi_chu': ghi_chu
                })

        else:
            return jsonify({'error': 'Không có mục nào để tạo đơn hàng'}), 400

        # Tạo đơn hàng
        new_don_hang = DonHang(
            ma_nguoi_dung=ma_nguoi_dung,
            ten_khach=ten_khach,
            dia_chi_khach=dia_chi_khach,
            sdt_khach=sdt_khach,
            tong_tien=tong_tien,
            phuong_thuc_thanh_toan=phuong_thuc_thanh_toan
        )
        db.session.add(new_don_hang)
        db.session.flush()

        # Tạo chi tiết đơn hàng
        for item in chi_tiet_don_hang:
            new_chi_tiet = ChiTietDonHang(
                ma_don_hang=new_don_hang.ma_don_hang,
                ma_do_uong=item['ma_do_uong'],
                ten_do_uong=item['ten_do_uong'],
                so_luong=item['so_luong'],
                don_gia=item['don_gia'],
                tuy_chon=item['tuy_chon'],
                ghi_chu=item['ghi_chu']
            )
            db.session.add(new_chi_tiet)

        # Xóa mục giỏ hàng đã chọn
        if ma_gio_hang_ids:
            GioHang.query.filter(GioHang.ma_gio_hang.in_(ma_gio_hang_ids)).delete()

        # Tạo thông báo cho admin và người dùng
        admin = NguoiDung.query.filter_by(vai_tro='admin').first()
        if not admin:
            logger.error('Admin user not found')
            raise Exception('Không tìm thấy người dùng admin')

        thong_bao_admin = ThongBao(
            ma_nguoi_dung=admin.ma_nguoi_dung,
            ma_don_hang=new_don_hang.ma_don_hang,
            loai_thong_bao='dat_hang'
        )
        db.session.add(thong_bao_admin)

        if ma_nguoi_dung:
            thong_bao_user = ThongBao(
                ma_nguoi_dung=ma_nguoi_dung,
                ma_don_hang=new_don_hang.ma_don_hang,
                loai_thong_bao='dat_hang'
            )
            db.session.add(thong_bao_user)

        db.session.commit()
        logger.debug(f'Order {new_don_hang.ma_don_hang} created successfully')

        # Gửi thông báo qua Socket.IO
        vn_tz = timezone(timedelta(hours=7))
        thong_bao_data_admin = {
            'ma_thong_bao': thong_bao_admin.ma_thong_bao,
            'ma_don_hang': new_don_hang.ma_don_hang,
            'ma_nguoi_dung': thong_bao_admin.ma_nguoi_dung,
            'loai_thong_bao': 'dat_hang',
            'da_doc': False,
            'ngay_tao': thong_bao_admin.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('thong_bao_moi', thong_bao_data_admin, room='admin', namespace='/thong-bao')
        logger.debug(f'Sent thong_bao_moi to admin: {thong_bao_data_admin}')

        if ma_nguoi_dung:
            thong_bao_data_user = {
                'ma_thong_bao': thong_bao_user.ma_thong_bao,
                'ma_don_hang': new_don_hang.ma_don_hang,
                'ma_nguoi_dung': ma_nguoi_dung,
                'loai_thong_bao': 'dat_hang',
                'da_doc': False,
                'ngay_tao': thong_bao_user.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
            }
            emit('thong_bao_moi', thong_bao_data_user, room=f'user-{ma_nguoi_dung}', namespace='/thong-bao')
            logger.debug(f'Sent thong_bao_moi to user-{ma_nguoi_dung}: {thong_bao_data_user}')

        event_data = {
            'ma_don_hang': new_don_hang.ma_don_hang,
            'ma_nguoi_dung': new_don_hang.ma_nguoi_dung,
            'ten_khach': new_don_hang.ten_khach,
            'tong_tien': float(new_don_hang.tong_tien),
            'trang_thai': new_don_hang.trang_thai,
            'ngay_dat': new_don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('don_hang_moi', event_data, room='admin', namespace='/don-hang')
        logger.debug(f'Sent don_hang_moi to admin: {event_data}')
        if ma_nguoi_dung:
            emit('don_hang_moi', event_data, room=f'user-{ma_nguoi_dung}', namespace='/don-hang')
            logger.debug(f'Sent don_hang_moi to user-{ma_nguoi_dung}: {event_data}')

        return jsonify({
            'message': 'Tạo đơn hàng thành công',
            'ma_don_hang': new_don_hang.ma_don_hang
        }), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error creating order: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Lấy danh sách đơn hàng
def get_don_hang():
    trang_thai = request.args.get('trang_thai')
    ma_nguoi_dung = request.args.get('ma_nguoi_dung')

    query = DonHang.query
    if trang_thai:
        query = query.filter(DonHang.trang_thai == trang_thai)
    if ma_nguoi_dung:
        query = query.filter(DonHang.ma_nguoi_dung == ma_nguoi_dung)

    vn_tz = timezone(timedelta(hours=7))
    don_hang_list = query.all()
    result = [{
        'ma_don_hang': dh.ma_don_hang,
        'ma_nguoi_dung': dh.ma_nguoi_dung,
        'ten_khach': dh.ten_khach,
        'dia_chi_khach': dh.dia_chi_khach,
        'sdt_khach': dh.sdt_khach,
        'tong_tien': float(dh.tong_tien),
        'ngay_dat': dh.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S'),
        'trang_thai': dh.trang_thai,
        'phuong_thuc_thanh_toan': dh.phuong_thuc_thanh_toan
    } for dh in don_hang_list]

    return jsonify(result), 200

# Lấy chi tiết đơn hàng
def get_don_hang_by_id(ma_don_hang):
    don_hang = DonHang.query.get(ma_don_hang)
    if not don_hang:
        return jsonify({'error': 'Đơn hàng không tồn tại'}), 404

    chi_tiet = ChiTietDonHang.query.filter_by(ma_don_hang=ma_don_hang).all()
    chi_tiet_list = [{
        'ma_chi_tiet': ct.ma_chi_tiet,
        'ma_do_uong': ct.ma_do_uong,
        'ten_do_uong': ct.ten_do_uong,
        'so_luong': ct.so_luong,
        'don_gia': float(ct.don_gia),
        'tuy_chon': json.loads(ct.tuy_chon) if ct.tuy_chon else [],
        'ghi_chu': ct.ghi_chu
    } for ct in chi_tiet]

    vn_tz = timezone(timedelta(hours=7))
    return jsonify({
        'ma_don_hang': don_hang.ma_don_hang,
        'ma_nguoi_dung': don_hang.ma_nguoi_dung,
        'ten_khach': don_hang.ten_khach,
        'dia_chi_khach': don_hang.dia_chi_khach,
        'sdt_khach': don_hang.sdt_khach,
        'tong_tien': float(don_hang.tong_tien),
        'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S'),
        'trang_thai': don_hang.trang_thai,
        'phuong_thuc_thanh_toan': don_hang.phuong_thuc_thanh_toan,
        'chi_tiet': chi_tiet_list
    }), 200

# Cập nhật đơn hàng
def update_don_hang(ma_don_hang):
    data = request.get_json()
    don_hang = DonHang.query.get(ma_don_hang)
    if not don_hang:
        return jsonify({'error': 'Đơn hàng không tồn tại'}), 404

    try:
        don_hang.ten_khach = data.get('ten_khach', don_hang.ten_khach)
        don_hang.dia_chi_khach = data.get('dia_chi_khach', don_hang.dia_chi_khach)
        don_hang.sdt_khach = data.get('sdt_khach', don_hang.sdt_khach)
        don_hang.phuong_thuc_thanh_toan = data.get('phuong_thuc_thanh_toan', don_hang.phuong_thuc_thanh_toan)
        if 'trang_thai' in data:
            don_hang.trang_thai = data['trang_thai']
        if 'tong_tien' in data:
            don_hang.tong_tien = data['tong_tien']

        db.session.commit()

        vn_tz = timezone(timedelta(hours=7))
        event_data = {
            'ma_don_hang': don_hang.ma_don_hang,
            'ma_nguoi_dung': don_hang.ma_nguoi_dung,
            'ten_khach': don_hang.ten_khach,
            'tong_tien': float(don_hang.tong_tien),
            'trang_thai': don_hang.trang_thai,
            'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('cap_nhat_don_hang', event_data, room='admin', namespace='/don-hang')
        if don_hang.ma_nguoi_dung:
            emit('cap_nhat_don_hang', event_data, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent cap_nhat_don_hang for order {ma_don_hang}')
        return jsonify({'message': 'Cập nhật đơn hàng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating order {ma_don_hang}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Hủy đơn hàng
def cancel_don_hang(ma_don_hang):
    don_hang = DonHang.query.get(ma_don_hang)
    if not don_hang:
        return jsonify({'error': 'Đơn hàng không tồn tại'}), 404

    try:
        if don_hang.trang_thai != 'cho_xu_ly':
            return jsonify({'error': 'Chỉ có thể hủy đơn hàng đang chờ xử lý'}), 400
        don_hang.trang_thai = 'da_huy'

        # Tạo thông báo cho admin và người dùng
        admin = NguoiDung.query.filter_by(vai_tro='admin').first()
        if not admin:
            logger.error('Admin user not found')
            raise Exception('Không tìm thấy người dùng admin')

        thong_bao_admin = ThongBao(
            ma_nguoi_dung=admin.ma_nguoi_dung,
            ma_don_hang=ma_don_hang,
            loai_thong_bao='huy_don'
        )
        db.session.add(thong_bao_admin)

        if don_hang.ma_nguoi_dung:
            thong_bao_user = ThongBao(
                ma_nguoi_dung=don_hang.ma_nguoi_dung,
                ma_don_hang=ma_don_hang,
                loai_thong_bao='huy_don'
            )
            db.session.add(thong_bao_user)

        db.session.commit()
        logger.debug(f'Order {ma_don_hang} cancelled successfully')

        # Gửi thông báo qua Socket.IO
        vn_tz = timezone(timedelta(hours=7))
        thong_bao_data_admin = {
            'ma_thong_bao': thong_bao_admin.ma_thong_bao,
            'ma_don_hang': ma_don_hang,
            'ma_nguoi_dung': thong_bao_admin.ma_nguoi_dung,
            'loai_thong_bao': 'huy_don',
            'da_doc': False,
            'ngay_tao': thong_bao_admin.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('thong_bao_moi', thong_bao_data_admin, room='admin', namespace='/thong-bao')
        logger.debug(f'Sent thong_bao_moi to admin for cancel: {thong_bao_data_admin}')

        if don_hang.ma_nguoi_dung:
            thong_bao_data_user = {
                'ma_thong_bao': thong_bao_user.ma_thong_bao,
                'ma_don_hang': ma_don_hang,
                'ma_nguoi_dung': don_hang.ma_nguoi_dung,
                'loai_thong_bao': 'huy_don',
                'da_doc': False,
                'ngay_tao': thong_bao_user.ngay_tao.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
            }
            emit('thong_bao_moi', thong_bao_data_user, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/thong-bao')
            logger.debug(f'Sent thong_bao_moi to user-{don_hang.ma_nguoi_dung} for cancel: {thong_bao_data_user}')

        event_data = {
            'ma_don_hang': don_hang.ma_don_hang,
            'ma_nguoi_dung': don_hang.ma_nguoi_dung,
            'ten_khach': don_hang.ten_khach,
            'tong_tien': float(don_hang.tong_tien),
            'trang_thai': don_hang.trang_thai,
            'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('cap_nhat_don_hang', event_data, room='admin', namespace='/don-hang')
        if don_hang.ma_nguoi_dung:
            emit('cap_nhat_don_hang', event_data, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent cap_nhat_don_hang for order {ma_don_hang}')

        return jsonify({'message': 'Hủy đơn hàng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error cancelling order {ma_don_hang}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Xóa đơn hàng
def delete_don_hang(ma_don_hang):
    don_hang = DonHang.query.get(ma_don_hang)
    if not don_hang:
        return jsonify({'error': 'Đơn hàng không tồn tại'}), 404

    try:
        ma_nguoi_dung = don_hang.ma_nguoi_dung
        db.session.delete(don_hang)
        db.session.commit()

        event_data = {
            'ma_don_hang': ma_don_hang,
            'ma_nguoi_dung': ma_nguoi_dung
        }
        emit('xoa_don_hang', event_data, room='admin', namespace='/don-hang')
        if ma_nguoi_dung:
            emit('xoa_don_hang', event_data, room=f'user-{ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent xoa_don_hang for order {ma_don_hang}')

        return jsonify({'message': 'Xóa đơn hàng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error deleting order {ma_don_hang}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Thêm chi tiết đơn hàng
def add_chi_tiet_don_hang(ma_don_hang):
    data = request.get_json()
    don_hang = DonHang.query.get(ma_don_hang)
    if not don_hang:
        return jsonify({'error': 'Đơn hàng không tồn tại'}), 404

    try:
        ma_do_uong = data.get('ma_do_uong')
        so_luong = data.get('so_luong', 1)
        tuy_chon = data.get('tuy_chon', [])
        ghi_chu = data.get('ghi_chu')

        do_uong = DoUong.query.get(ma_do_uong)
        if not do_uong:
            return jsonify({'error': f'Đồ uống {ma_do_uong} không tồn tại'}), 400

        gia_goc = float(do_uong.gia)
        giam_gia = float(do_uong.giam_gia_phan_tram or 0)
        gia_sau_giam = gia_goc * (1 - giam_gia / 100)
        gia_tuy_chon = sum(float(opt.get('gia_them', 0)) for opt in tuy_chon)
        don_gia = gia_sau_giam + gia_tuy_chon

        new_chi_tiet = ChiTietDonHang(
            ma_don_hang=ma_don_hang,
            ma_do_uong=ma_do_uong,
            ten_do_uong=do_uong.ten_do_uong,
            so_luong=so_luong,
            don_gia=don_gia,
            tuy_chon=json.dumps(tuy_chon) if tuy_chon else None,
            ghi_chu=ghi_chu
        )
        db.session.add(new_chi_tiet)

        chi_tiet_list = ChiTietDonHang.query.filter_by(ma_don_hang=ma_don_hang).all()
        don_hang.tong_tien = sum(float(ct.don_gia) * ct.so_luong for ct in chi_tiet_list)

        db.session.commit()

        vn_tz = timezone(timedelta(hours=7))
        event_data = {
            'ma_don_hang': don_hang.ma_don_hang,
            'ma_nguoi_dung': don_hang.ma_nguoi_dung,
            'ten_khach': don_hang.ten_khach,
            'tong_tien': float(don_hang.tong_tien),
            'trang_thai': don_hang.trang_thai,
            'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('cap_nhat_don_hang', event_data, room='admin', namespace='/don-hang')
        if don_hang.ma_nguoi_dung:
            emit('cap_nhat_don_hang', event_data, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent cap_nhat_don_hang for order detail addition: {ma_don_hang}')

        return jsonify({'message': 'Thêm chi tiết đơn hàng thành công'}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error adding order detail for order {ma_don_hang}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Cập nhật chi tiết đơn hàng
def update_chi_tiet_don_hang(ma_chi_tiet):
    data = request.get_json()
    chi_tiet = ChiTietDonHang.query.get(ma_chi_tiet)
    if not chi_tiet:
        return jsonify({'error': 'Chi tiết đơn hàng không tồn tại'}), 404

    try:
        so_luong = data.get('so_luong', chi_tiet.so_luong)
        tuy_chon = data.get('tuy_chon', json.loads(chi_tiet.tuy_chon or '[]'))
        ghi_chu = data.get('ghi_chu', chi_tiet.ghi_chu)

        do_uong = DoUong.query.get(chi_tiet.ma_do_uong)
        if not do_uong:
            return jsonify({'error': f'Đồ uống {chi_tiet.ma_do_uong} không tồn tại'}), 400

        gia_goc = float(do_uong.gia)
        giam_gia = float(do_uong.giam_gia_phan_tram or 0)
        gia_sau_giam = gia_goc * (1 - giam_gia / 100)
        gia_tuy_chon = sum(float(opt.get('gia_them', 0)) for opt in tuy_chon)
        chi_tiet.don_gia = gia_sau_giam + gia_tuy_chon
        chi_tiet.so_luong = so_luong
        chi_tiet.tuy_chon = json.dumps(tuy_chon) if tuy_chon else None
        chi_tiet.ghi_chu = ghi_chu

        don_hang = DonHang.query.get(chi_tiet.ma_don_hang)
        chi_tiet_list = ChiTietDonHang.query.filter_by(ma_don_hang=don_hang.ma_don_hang).all()
        don_hang.tong_tien = sum(float(ct.don_gia) * ct.so_luong for ct in chi_tiet_list)

        db.session.commit()

        vn_tz = timezone(timedelta(hours=7))
        event_data = {
            'ma_don_hang': don_hang.ma_don_hang,
            'ma_nguoi_dung': don_hang.ma_nguoi_dung,
            'ten_khach': don_hang.ten_khach,
            'tong_tien': float(don_hang.tong_tien),
            'trang_thai': don_hang.trang_thai,
            'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('cap_nhat_don_hang', event_data, room='admin', namespace='/don-hang')
        if don_hang.ma_nguoi_dung:
            emit('cap_nhat_don_hang', event_data, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent cap_nhat_don_hang for order detail update: {ma_chi_tiet}')

        return jsonify({'message': 'Cập nhật chi tiết đơn hàng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error updating order detail {ma_chi_tiet}: {str(e)}')
        return jsonify({'error': str(e)}), 400

# Xóa chi tiết đơn hàng
def delete_chi_tiet_don_hang(ma_chi_tiet):
    chi_tiet = ChiTietDonHang.query.get(ma_chi_tiet)
    if not chi_tiet:
        return jsonify({'error': 'Chi tiết đơn hàng không tồn tại'}), 404

    try:
        don_hang = DonHang.query.get(chi_tiet.ma_don_hang)
        db.session.delete(chi_tiet)

        chi_tiet_list = ChiTietDonHang.query.filter_by(ma_don_hang=don_hang.ma_don_hang).all()
        don_hang.tong_tien = sum(float(ct.don_gia) * ct.so_luong for ct in chi_tiet_list) if chi_tiet_list else 0

        db.session.commit()

        vn_tz = timezone(timedelta(hours=7))
        event_data = {
            'ma_don_hang': don_hang.ma_don_hang,
            'ma_nguoi_dung': don_hang.ma_nguoi_dung,
            'ten_khach': don_hang.ten_khach,
            'tong_tien': float(don_hang.tong_tien),
            'trang_thai': don_hang.trang_thai,
            'ngay_dat': don_hang.ngay_dat.astimezone(vn_tz).strftime('%Y-%m-%d %H:%M:%S')
        }
        emit('cap_nhat_don_hang', event_data, room='admin', namespace='/don-hang')
        if don_hang.ma_nguoi_dung:
            emit('cap_nhat_don_hang', event_data, room=f'user-{don_hang.ma_nguoi_dung}', namespace='/don-hang')
        logger.debug(f'Sent cap_nhat_don_hang for order detail deletion: {ma_chi_tiet}')

        return jsonify({'message': 'Xóa chi tiết đơn hàng thành công'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f'Error deleting order detail {ma_chi_tiet}: {str(e)}')
        return jsonify({'error': str(e)}), 400
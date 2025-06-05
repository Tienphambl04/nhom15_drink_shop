from flask import Blueprint, request, jsonify
from database import db
from models.binh_luan import BinhLuan
from models.user import NguoiDung
from flask_socketio import emit
from functools import wraps
import logging
import jwt
from datetime import datetime

binh_luan_bp = Blueprint("binh_luan_bp", __name__)

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# JWT secret key (should be stored in environment variable in production)
JWT_SECRET = "your_jwt_secret_key"

# Authentication decorator with JWT validation
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            logger.warning("Invalid or missing token")
            return jsonify({"success": False, "message": "Token không hợp lệ"}), 401
        token = token.split(' ')[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user = NguoiDung.query.filter_by(ma_nguoi_dung=payload['ma_nguoi_dung']).first()
            if not user or user.token != token:
                logger.warning(f"User not found or token mismatch for token: {token}")
                return jsonify({"success": False, "message": "Người dùng không tồn tại hoặc token không hợp lệ"}), 401
            return f(user, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return jsonify({"success": False, "message": "Token đã hết hạn"}), 401
        except jwt.InvalidTokenError:
            logger.warning(f"Invalid token: {token}")
            return jsonify({"success": False, "message": "Token không hợp lệ"}), 401
    return decorated

# Add a new comment
@binh_luan_bp.route("", methods=["POST"])
@auth_required
def them_binh_luan(user):
    try:
        data = request.get_json()
        ma_do_uong = data.get('ma_do_uong')
        noi_dung = data.get('noi_dung')
        so_sao = data.get('so_sao')
        ma_cha = data.get('ma_cha')

        if not ma_do_uong or not noi_dung:
            logger.warning("Missing required fields in comment data")
            return jsonify({"success": False, "message": "Thiếu thông tin bắt buộc"}), 400

        if so_sao is not None and (not isinstance(so_sao, int) or so_sao < 1 or so_sao > 5):
            logger.warning(f"Invalid rating: {so_sao}")
            return jsonify({"success": False, "message": "Số sao phải từ 1 đến 5"}), 400

        binh_luan = BinhLuan(
            ma_nguoi_dung=user.ma_nguoi_dung,
            ma_do_uong=ma_do_uong,
            noi_dung=noi_dung,
            so_sao=so_sao,
            ma_cha=ma_cha
        )
        db.session.add(binh_luan)
        db.session.commit()

        # Prepare comment data for Socket.IO emit
        comment_data = {
            "ma_binh_luan": binh_luan.ma_binh_luan,
            "ma_nguoi_dung": binh_luan.ma_nguoi_dung,
            "ma_do_uong": binh_luan.ma_do_uong,
            "noi_dung": binh_luan.noi_dung,
            "so_sao": binh_luan.so_sao,
            "ma_cha": binh_luan.ma_cha,
            "ngay_tao": binh_luan.ngay_tao.isoformat(),
            "ten_nguoi_dung": user.ho_ten or user.ten_dang_nhap
        }

        # Emit Socket.IO event to specific room based on ma_do_uong
        emit('binh_luan_moi', comment_data, namespace='/binh-luan', room=f"do_uong_{ma_do_uong}")
        logger.debug(f"Emitted binh_luan_moi to room do_uong_{ma_do_uong}: {comment_data}")

        return jsonify({"success": True, "message": "Thêm bình luận thành công", "CommentData": comment_data}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi khi thêm bình luận: {str(e)}")
        return jsonify({"success": False, "message": "Lỗi server khi thêm bình luận"}), 500

# Get comments for a drink
@binh_luan_bp.route("/<int:ma_do_uong>", methods=["GET"])
def lay_binh_luan(ma_do_uong):
    try:
        binh_luans = BinhLuan.query.filter_by(ma_do_uong=ma_do_uong).order_by(BinhLuan.ngay_tao.desc()).all()
        result = []
        for bl in binh_luans:
            user = NguoiDung.query.get(bl.ma_nguoi_dung)
            result.append({
                "ma_binh_luan": bl.ma_binh_luan,
                "ma_nguoi_dung": bl.ma_nguoi_dung,
                "ten_nguoi_dung": user.ho_ten or user.ten_dang_nhap if user else "Ẩn danh",
                "ma_do_uong": bl.ma_do_uong,
                "noi_dung": bl.noi_dung,
                "so_sao": bl.so_sao,
                "ma_cha": bl.ma_cha,
                "ngay_tao": bl.ngay_tao.isoformat()
            })
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        logger.error(f"Lỗi khi lấy bình luận: {str(e)}")
        return jsonify({"success": False, "message": "Lỗi server khi lấy bình luận"}), 500

# Delete a comment
@binh_luan_bp.route("/<int:ma_binh_luan>", methods=["DELETE"])
@auth_required
def xoa_binh_luan(user, ma_binh_luan):
    try:
        binh_luan = BinhLuan.query.get(ma_binh_luan)
        if not binh_luan:
            logger.warning(f"Comment not found: {ma_binh_luan}")
            return jsonify({"success": False, "message": "Bình luận không tồn tại"}), 404

        if binh_luan.ma_nguoi_dung != user.ma_nguoi_dung and user.vai_tro != 'admin':
            logger.warning(f"Unauthorized delete attempt by user {user.ma_nguoi_dung} on comment {ma_binh_luan}")
            return jsonify({"success": False, "message": "Không có quyền xóa bình luận"}), 403

        ma_do_uong = binh_luan.ma_do_uong
        db.session.delete(binh_luan)
        db.session.commit()

        # Emit Socket.IO event to specific room
        emit('binh_luan_xoa', {"ma_binh_luan": ma_binh_luan, "ma_do_uong": ma_do_uong}, namespace='/binh-luan', room=f"do_uong_{ma_do_uong}")
        logger.debug(f"Emitted binh_luan_xoa to room do_uong_{ma_do_uong}: {ma_binh_luan}")

        return jsonify({"success": True, "message": "Xóa bình luận thành công"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi khi xóa bình luận: {str(e)}")
        return jsonify({"success": False, "message": "Lỗi server khi xóa bình luận"}), 500
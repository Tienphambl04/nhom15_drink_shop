from flask import request, jsonify
from models.contact import Contact
from database import db

def gui_phan_hoi():
    data = request.json
    try:
        phan_hoi = Contact(
            ten=data['ten'],
            email=data['email'],
            chu_de=data.get('chu_de', ''),
            noi_dung=data['noi_dung']
        )
        db.session.add(phan_hoi)
        db.session.commit()
        return jsonify({'message': 'Gửi phản hồi thành công'}), 201
    except Exception as e:
        db.session.rollback()
        print("[ERROR gửi liên hệ]", e)
        return jsonify({'Lỗi gửi liên hệ': str(e)}), 500

def lay_phan_hoi():
    try:
        danh_sach = Contact.query.order_by(Contact.ngay_gui.asc()).all()
        result = [
            {
                "ma_lien_he": c.ma_lien_he,
                "ten": c.ten,
                "email": c.email,
                "chu_de": c.chu_de,
                "noi_dung": c.noi_dung,
                "ngay_gui": c.ngay_gui.strftime("%Y-%m-%d %H:%M:%S"),
                "da_doc": c.da_doc
            }
            for c in danh_sach
        ]
        return jsonify(result), 200
    except Exception as e:
        print("[ERROR lấy phản hồi]", e)
        return jsonify({'Lỗi lấy liên hệ': str(e)}), 500
    
def danh_dau_da_doc(ma_lien_he):
    try:
        phan_hoi = Contact.query.get(ma_lien_he)
        if not phan_hoi:
            return jsonify({'message': 'Không tìm thấy liên hệ'}), 404
        phan_hoi.da_doc = 1
        db.session.commit()
        return jsonify({'message': 'Đã đánh dấu là đã đọc'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
import React from "react";
import "./footer.css";


const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <div className="footer-content">
          <div className="footer-column">
            <h4>LIÊN HỆ</h4>
            <p><i className="fas fa-map-marker-alt"></i> 266 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội</p>
            <p><i className="fas fa-phone"></i> 1900 6750</p>
            <p><i className="fas fa-clock"></i> Thứ 2 - Chủ Nhật 9:00 - 18:00</p>
            <p><i className="fas fa-envelope"></i> <a href="mailto:support@sapo.vn">support@sapo.vn</a></p>
          </div>

          <div className="footer-column">
            <h4>HỖ TRỢ KHÁCH HÀNG</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/products">Sản phẩm</a></li>
              <li><a href="/about">Giới thiệu</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/contact">Liên hệ</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>CHÍNH SÁCH MUA HÀNG</h4>
            <ul>
              <li><a href="/dieukhoan">Điều khoản dịch vụ</a></li>
              <li><a href="/baomat">Chính sách bảo mật</a></li>
              <li><a href="/hoantra">Chính sách hoàn trả</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>ĐĂNG KÝ NHẬN TIN</h4>
            <p>Đăng ký nhận thông tin khuyến mãi và món ăn mới</p>
            <input type="email" placeholder="Nhập email của bạn" />
            <button>ĐĂNG KÝ</button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© Bản quyền thuộc về <strong>Nhom 15</strong></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

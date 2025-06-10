import React from "react";
import { NavLink } from "react-router-dom";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h4>LIÊN HỆ</h4>
            <p>
              <i className="fas fa-map-marker-alt"></i> 266 Đội Cấn, Phường Liễu Giai, Quận Ba Đình, Hà Nội
            </p>
            <p>
              <i className="fas fa-phone"></i> 1900 6750
            </p>
            <p>
              <i className="fas fa-clock"></i> Thứ 2 - Chủ Nhật 9:00 - 18:00
            </p>
            <p>
              <i className="fas fa-envelope"></i>{" "}
              <a href="mailto:support@sapo.vn">support@sapo.vn</a>
            </p>
          </div>

          <div className="footer-column">
            <h4>HỖ TRỢ KHÁCH HÀNG</h4>
            <ul className="footer-nav">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Trang chủ
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Sản phẩm
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Giới thiệu
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/blog"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Blog
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Liên hệ
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>CHÍNH SÁCH MUA HÀNG</h4>
            <ul className="footer-nav">
              <li>
                <NavLink
                  to="/dieukhoan"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Điều khoản dịch vụ
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/baomat"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Chính sách bảo mật
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/hoantra"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  Chính sách hoàn trả
                </NavLink>
              </li>
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

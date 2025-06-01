import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./header.css";

const Header = () => {
  const [isDropdown, setIsDropdown] = useState(false);
  const token = localStorage.getItem('token');
  const tenDangNhap = localStorage.getItem('ten_dang_nhap') || 'User';
  const vaiTro = localStorage.getItem('vai_tro');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ten_dang_nhap');
    localStorage.removeItem('vai_tro');
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="hotline">
            <i className="fas fa-phone"></i>
            <span>Hotline: 1900 6750</span>
          </div>
          <div className="search-bar">
            <div className="search-box">
              <input type="text" id="searchInput" placeholder="Tìm sản phẩm" />
              <button className="search-btn" id="searchBtn">
                <i className="fas fa-search"></i>
              </button>
            </div>
            <div className="auth-box">
              {token ? (
                <div className="user-menu">
                  <span
                    className="user-name"
                    onClick={() => setIsDropdown(!isDropdown)}
                  >
                    {tenDangNhap} <i className="fas fa-chevron-down dropdown-icon"></i>
                  </span>
                  {isDropdown && (
                    <ul className="dropdown-menu">
                      {vaiTro === 'admin' && (
                        <li><a href="/admin/dashboard">Quản trị</a></li>
                      )}
                      <li><a href="/profile">Thông tin cá nhân</a></li>
                      <li><a href="/change-password">Đổi mật khẩu</a></li>
                      <li><a href="#" onClick={handleLogout}>Đăng xuất</a></li>
                    </ul>
                  )}
                </div>
              ) : (
                <span className="search-auth">
                  <a href="/login" className="login-link">Đăng nhập</a>
                  <a href="/register" className="register-link">Đăng ký</a>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="logo">
            <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <img src="img/anh1.jpg" alt="Drinkhub Logo" className="logo-img" />
              <div className="logo-text">
                <span className="logo-title">DRINKHUB</span><br />
                <span className="logo-subtitle">CAKE & DRINK</span>
              </div>
            </a>
          </div>

          <nav className="main-menu">
            <ul>
              <li>
                <NavLink to={vaiTro === 'admin' ? '/admin/dashboard' : '/'} activeClassName="active">
                  <i className="fas fa-home"></i> Trang chủ
                </NavLink>
              </li>
              <li className="has-dropdown">
                <a href="#">
                  <i className="fas fa-birthday-cake"></i> Sản phẩm
                  <i className="fas fa-chevron-down dropdown-icon"></i>
                </a>
                <ul className="nav-dropdown">
                  <li>
                    <a href="#">Món ăn nổi bật <i className="fas fa-star" style={{ color: "#e67e22" }}></i></a>
                  </li>
                  <li>
                    <a href="#">Món ăn ưa chuộng <i className="fas fa-fire" style={{ color: "#e74c3c" }}></i></a>
                  </li>
                  <li>
                    <a href="#">Món Ăn Mới <i className="fas fa-utensils"></i></a>
                  </li>
                </ul>
              </li>
              <li><a href="/about"><i className="fas fa-info-circle"></i> Giới thiệu</a></li>
              <li><a href="/blog"><i className="fas fa-blog"></i> Blog</a></li>
              <li><a href="/contact"><i className="fas fa-phone"></i> Liên hệ</a></li>
            </ul>
          </nav>

          <div className="cart">
            <a href="/cart">
              <span className="cart-icon-wrap">
                <img src="img/anh2.png" alt="Cart" className="cart-logo-icon" />
                <span className="cart-count">0</span>
              </span>
              <span className="cart-info">
                <span className="cart-title">GIỎ HÀNG</span><br />
                <span className="cart-desc">(0) sản phẩm</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
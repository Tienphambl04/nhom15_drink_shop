import React from "react";
import "./header.css";


const Header = () => {
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
              <span className="search-auth">
                <a href="/login" className="login-link">Đăng nhập</a>&nbsp; &amp; &nbsp;
                <a href="/register" className="register-link">Đăng ký</a>
              </span>
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
              <li><a href="/"><i className="fas fa-home"></i> Trang chủ</a></li>
              <li className="has-dropdown">
                <a href="#">
                  <i className="fas fa-birthday-cake"></i> Sản phẩm
                  <i className="fas fa-chevron-down" style={{ fontSize: "12px" }}></i>
                </a>
                <ul className="dropdown">
                  <li><a href="#">Món ăn nổi bật <i className="fas fa-star" style={{ color: "#e67e22" }}></i></a></li>
                  <li><a href="#">Món ăn ưa chuộng <i className="fas fa-fire" style={{ color: "#e74c3c" }}></i></a></li>
                  <li><a href="#"><i className="fas fa-utensils"></i> Món Ăn Mới</a></li>
                </ul>
              </li>
              <li><a href="/about"><i className="fas fa-info-circle"></i> Giới thiệu</a></li>
              <li><a href="/blog"><i className="fas fa-external-link-alt"></i> Blog</a></li>
              <li><a href="/contact"><i className="fas fa-phone"></i> Liên hệ</a></li>
            </ul>
          </nav>

          <div className="cart">
            <a href="/cart">
              <span className="cart-icon-wrap">
                <img src="img/anh2.png" alt="Cart" className="cart-bag-icon" />
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

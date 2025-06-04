import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";
import { useCart } from "../../components/gio_hang/cartContext";
import "./header.css";

const Header = () => {
  const [isDropdown, setIsDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token"),
    vaiTro: localStorage.getItem("vai_tro") || "",
    maNguoiDung: localStorage.getItem("ma_nguoi_dung") || "guest",
  });

  const { cartCount, setCartCount, fetchCart } = useCart();
  const tenDangNhap = localStorage.getItem("ten_dang_nhap") || "User";
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchDanhSachDanhMuc();
        if (data && data.success && Array.isArray(data.data)) {
          const cleanedCategories = data.data.map((cat) => ({
            ...cat,
            ma_danh_muc: decodeURIComponent(cat.ma_danh_muc).replace(/[^a-zA-Z0-9-_& ]/g, ''),
          }));
          setCategories(cleanedCategories);
          setError(null);
        } else {
          setError("Dữ liệu danh mục không đúng định dạng");
          setCategories([]);
        }
      } catch (err) {
        setError("Lấy danh mục thất bại");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleLoginEvent = async () => {
      // Update auth state
      const newAuthState = {
        token: localStorage.getItem("token"),
        vaiTro: localStorage.getItem("vai_tro") || "",
        maNguoiDung: localStorage.getItem("ma_nguoi_dung") || "guest",
      };
      setAuthState(newAuthState);

      console.log('Header.js: userLogin event received, authState:', newAuthState);

      // Fetch cart for non-admin users
      if (newAuthState.token && newAuthState.vaiTro !== "admin" && newAuthState.maNguoiDung !== "guest") {
        let attempts = 0;
        const maxAttempts = 3;
        const retryDelay = 100;

        const tryFetchCart = async () => {
          try {
            console.log(`Header.js: Fetching cart, attempt ${attempts + 1}, user: ${newAuthState.maNguoiDung}`);
            await fetchCart();
            console.log('Header.js: Cart fetched, cartCount:', cartCount);
          } catch (err) {
            console.error(`Header.js: Lỗi khi lấy giỏ hàng, attempt ${attempts + 1}:`, err);
            if (attempts < maxAttempts - 1) {
              attempts++;
              setTimeout(tryFetchCart, retryDelay);
            } else {
              setCartCount(0);
              console.log('Header.js: Max fetch attempts reached, cartCount set to 0');
            }
          }
        };

        await tryFetchCart();
      } else {
        setCartCount(0);
        console.log('Header.js: No cart fetch (not logged in or admin), cartCount set to 0');
      }
    };

    window.addEventListener("userLogin", handleLoginEvent);
    return () => window.removeEventListener("userLogin", handleLoginEvent);
  }, [fetchCart, setCartCount, cartCount]);

  useEffect(() => {
    const loadCart = async () => {
      if (authState.token && authState.vaiTro !== "admin" && authState.maNguoiDung !== "guest") {
        try {
          console.log('Header.js: useEffect fetching cart for user:', authState.maNguoiDung);
          await fetchCart();
          console.log('Header.js: useEffect cart fetched, cartCount:', cartCount);
        } catch (err) {
          console.error("Header.js: Lỗi khi lấy giỏ hàng trong useEffect:", err);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };
    loadCart();
  }, [authState.token, authState.maNguoiDung, authState.vaiTro, fetchCart, setCartCount]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ten_dang_nhap");
    localStorage.removeItem("vai_tro");
    localStorage.removeItem("ma_nguoi_dung");
    localStorage.removeItem("ho_ten");
    localStorage.removeItem("dia_chi");
    localStorage.removeItem("so_dien_thoai");
    setCartCount(0);
    setAuthState({
      token: null,
      vaiTro: "",
      maNguoiDung: "guest",
    });
    navigate("/");
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
              {authState.token ? (
                <div className="user-menu" ref={dropdownRef}>
                  <span
                    className="user-name"
                    onClick={() => setIsDropdown(!isDropdown)}
                    style={{ cursor: "pointer" }}
                  >
                    {tenDangNhap} <i className="fas fa-chevron-down dropdown-icon"></i>
                  </span>
                  {isDropdown && (
                    <ul className="dropdown-menu">
                      {authState.vaiTro === "admin" && (
                        <li>
                          <NavLink to="/admin/dashboard">Quản trị</NavLink>
                        </li>
                      )}
                      <li>
                        <NavLink to="/profile">Thông tin cá nhân</NavLink>
                      </li>
                      <li>
                        <NavLink to="/change-password">Đổi mật khẩu</NavLink>
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: 0,
                            margin: 0,
                            color: "inherit",
                            width: "100%",
                            textAlign: "left",
                          }}
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <span className="search-auth">
                  <NavLink to="/login" className="login-link">
                    Đăng nhập
                  </NavLink>
                  <NavLink to="/register" className="register-link">
                    Đăng ký
                  </NavLink>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="logo">
            <NavLink
              to="/"
              style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            >
              <img src="/image/anh1.jpg" alt="Drinkhub Logo" className="logo-img" />
              <div className="logo-text">
                <span className="logo-title">DRINKHUB</span>
                <br />
                <span className="logo-subtitle">CAKE & DRINK</span>
              </div>
            </NavLink>
          </div>

          <nav className="main-menu">
            <ul>
              <li>
                <NavLink
                  to={authState.vaiTro === "admin" ? "/admin/dashboard" : "/"}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <i className="fas fa-home"></i> Trang chủ
                </NavLink>
              </li>
              <li className="has-dropdown">
                <span>
                  <i className="fas fa-birthday-cake"></i> Sản phẩm <i className="fas fa-chevron-down dropdown-icon"></i>
                </span>
                <ul className="nav-dropdown">
                  {loading && <li>Đang tải danh mục...</li>}
                  {error && <li style={{ color: "red" }}>{error}</li>}
                  {!loading && !error && categories.length === 0 && <li>Chưa có danh mục</li>}
                  {!loading &&
                    !error &&
                    categories.map((cat) => (
                      <li key={cat.ma_danh_muc}>
                        <NavLink to={`/danh-muc/${encodeURIComponent(cat.ma_danh_muc)}`}>
                          {cat.ten_danh_muc}
                        </NavLink>
                      </li>
                    ))}
                </ul>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fas fa-info-circle"></i> Giới thiệu
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fas fa-blog"></i> Blog
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                  <i className="fas fa-phone"></i> Liên hệ
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="cart-container">
            {authState.token && authState.vaiTro !== "admin" && (
              <div className="cart">
                <NavLink to={`/gio-hang/${authState.maNguoiDung}`}>
                  <span className="cart-icon-wrap">
                    <img src="/image/anh2.png" alt="Cart" className="cart-logo-icon" />
                    <span className="cart-count">{cartCount}</span>
                  </span>
                  <span className="cart-info">
                    <span className="cart-title">GIỎ HÀNG</span>
                  </span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
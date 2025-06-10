import React from "react";
import { useNavigate } from "react-router-dom";
import './gioiThieu.css';

const GioiThieu = () => {
  const navigate = useNavigate();

  // Header component (tái sử dụng hero section từ HomePage)
  const Header = () => (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Thức uống tại Delicious CAKE & DRINK
        </h1>
        <p className="hero-subtitle">
          Tinh hoa trong từng ngụm nhỏ
        </p>
      </div>
      <div className="hero-decoration"></div>
    </div>
  );

  // Footer component
  const Footer = () => (
    <footer className="footer">
      <p className="footer-text">© 2025 Delicious CAKE & DRINK. All rights reserved.</p>
    </footer>
  );

  return (
    <div className="gioi-thieu-container">
      <Header />
      <main>
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Về Delicious CAKE & DRINK</h2>
            <div className="title-underline"></div>
          </div>
          <p className="section-text">
            Tại Delicious CAKE & DRINK, chúng tôi tin rằng một ly đồ uống không
            chỉ đơn thuần để giải khát, mà còn là trải nghiệm vị giác, cảm xúc và
            phong cách sống. Mỗi món đồ uống tại đây được chọn lọc nguyên liệu kỹ
            lưỡng, pha chế theo công thức riêng biệt, mang đến hương vị độc đáo,
            đậm đà và đầy cảm hứng.
          </p>
        </section>
        <section className="section">
          <h2 className="category-title">
            Không gian thưởng thức đậm chất hiện đại
          </h2>
          <p className="section-text">
            Trong không gian ấm cúng và năng động, bạn có thể dễ dàng tìm thấy góc
            thư giãn lý tưởng để nhâm nhi một tách cà phê nguyên chất, ly trà nóng
            dịu nhẹ hay ly trà sữa mát lành.
          </p>
        </section>
        <section className="section">
          <h2 className="category-title">
            Menu đồ uống phong phú - Đậm đà bản sắc
          </h2>
          <p className="section-text">
            Chúng tôi phục vụ đa dạng các loại thức uống, đáp ứng sở thích của
            nhiều đối tượng khách hàng:
          </p>
          <ul className="menu-list">
            <li className="menu-item">
              ☕ <strong>Cà phê:</strong> Sử dụng hạt cà phê nguyên chất, rang xay
              đúng chuẩn.
            </li>
            <li className="menu-item">
              🍵 <strong>Trà nóng:</strong> Từ những loại trà xanh, trà nhài
              truyền thống.
            </li>
            <li className="menu-item">
              🧋 <strong>Trà sữa:</strong> Hòa quyện giữa hương trà và sữa tươi.
            </li>
          </ul>
        </section>
        <section className="section">
          <h2 className="category-title">
            Trải nghiệm khác biệt – Dành riêng cho bạn
          </h2>
          <p className="section-text">
            Delicious CAKE & DRINK không ngừng đổi mới menu đồ uống để bắt kịp xu
            hướng.
          </p>
        </section>
        <div className="button-container">
          <button
            onClick={() => navigate("/")}
            className="back-button"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </main>
     
    </div>
  );
};

export default GioiThieu;

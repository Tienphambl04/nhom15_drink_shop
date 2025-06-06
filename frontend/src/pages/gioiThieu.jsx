import React from "react";
import { useNavigate } from "react-router-dom";
import './gioiThieu.css'
const GioiThieu = () => {
  const navigate = useNavigate();

  // Placeholder Header component
  const Header = () => (
    <header className="text-center py-8 bg-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
        Thức uống tại Delicious CAKE & DRINK - Tinh hoa trong từng ngụm nhỏ
      </h1>
    </header>
  );

  // Placeholder Footer component
  const Footer = () => (
    <footer className="text-center py-6 bg-gray-800 text-white">
      <p>© 2025 Delicious CAKE & DRINK. All rights reserved.</p>
    </footer>
  );

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Tại Delicious CAKE & DRINK, chúng tôi tin rằng một ly đồ uống không
            chỉ đơn thuần để giải khát, mà còn là trải nghiệm vị giác, cảm xúc và
            phong cách sống. Mỗi món đồ uống tại đây được chọn lọc nguyên liệu kỹ
            lưỡng, pha chế theo công thức riêng biệt, mang đến hương vị độc đáo,
            đậm đà và đầy cảm hứng.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Không gian thưởng thức đậm chất hiện đại
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Trong không gian ấm cúng và năng động, bạn có thể dễ dàng tìm thấy góc
            thư giãn lý tưởng để nhâm nhi một tách cà phê nguyên chất, ly trà nóng
            dịu nhẹ hay ly trà sữa mát lành.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Menu đồ uống phong phú - Đậm đà bản sắc
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Chúng tôi phục vụ đa dạng các loại thức uống, đáp ứng sở thích của
            nhiều đối tượng khách hàng:
          </p>
          <ul className="list-disc pl-6 text-lg text-gray-700">
            <li className="mb-2">
              ☕ <strong>Cà phê:</strong> Sử dụng hạt cà phê nguyên chất, rang xay
              đúng chuẩn.
            </li>
            <li className="mb-2">
              🍵 <strong>Trà nóng:</strong> Từ những loại trà xanh, trà nhài
              truyền thống.
            </li>
            <li className="mb-2">
              🧋 <strong>Trà sữa:</strong> Hòa quyện giữa hương trà và sữa tươi.
            </li>
          </ul>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Trải nghiệm khác biệt – Dành riêng cho bạn
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Delicious CAKE & DRINK không ngừng đổi mới menu đồ uống để bắt kịp xu
            hướng.
          </p>
        </section>
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Quay lại cửa hàng
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GioiThieu;
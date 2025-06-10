import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/gio_hang/cartContext';
import { getGioHangByUser } from '../../api/gioHang';
import { createDonHang, addChiTietDonHang } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';

const OrderForm = () => {
  const { fetchCart, cartCount } = useCart();
  const navigate = useNavigate();
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const token = localStorage.getItem('token');

  const [gioHang, setGioHang] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderInfo, setOrderInfo] = useState({
    ten_khach: '',
    dia_chi_khach: '',
    sdt_khach: '',
    phuong_thuc_thanh_toan: 'tien_mat',
  });
  const [tempChiTiet, setTempChiTiet] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!maNguoiDung || !token) {
        setError('Vui lòng đăng nhập để đặt hàng');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const hoTen = localStorage.getItem('ho_ten') || '';
        const diaChi = localStorage.getItem('dia_chi') || '';
        const soDienThoai = localStorage.getItem('so_dien_thoai') || '';
        setOrderInfo({
          ten_khach: hoTen,
          dia_chi_khach: diaChi,
          sdt_khach: soDienThoai,
          phuong_thuc_thanh_toan: 'tien_mat',
        });

        const res = await getGioHangByUser(maNguoiDung);
        const savedSelectedItems = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
        setSelectedItems(savedSelectedItems);
        const filteredGioHang = res.filter((item) => savedSelectedItems.includes(item.ma_gio_hang));
        setGioHang(filteredGioHang);

        // Đồng bộ tempChiTiet từ buyNowItem
        const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem') || '[]');
        if (buyNowItem.length > 0) {
          setTempChiTiet(buyNowItem);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();

    initSocket(maNguoiDung, (event, data) => {
      alert(`Đơn hàng ${data.ma_don_hang} đã được ${event === 'new' ? 'tạo' : 'cập nhật'}: ${data.trang_thai}`);
    });

    return () => {
      disconnectSocket();
      localStorage.removeItem('buyNowItem');
    };
  }, [maNguoiDung, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderInfo((prev) => ({ ...prev, [name]: value }));
  };

  const resetToDefault = () => {
    setOrderInfo({
      ten_khach: localStorage.getItem('ho_ten') || '',
      dia_chi_khach: localStorage.getItem('dia_chi') || '',
      sdt_khach: localStorage.getItem('so_dien_thoai') || '',
      phuong_thuc_thanh_toan: 'tien_mat',
    });
  };

  const handlePlaceOrder = async () => {
    if (!maNguoiDung || !token) {
      alert('Vui lòng đăng nhập để đặt hàng.');
      navigate('/login');
      return;
    }
    if (selectedItems.length === 0 && tempChiTiet.length === 0) {
      alert('Không có mục nào được chọn để đặt hàng.');
      navigate(`/gio-hang/${maNguoiDung}`);
      return;
    }
    if (!orderInfo.ten_khach || !orderInfo.dia_chi_khach || !orderInfo.sdt_khach) {
      alert('Vui lòng nhập đầy đủ thông tin khách hàng.');
      return;
    }

    try {
      // Chuẩn bị chi_tiet từ tempChiTiet
      const chiTietPayload = tempChiTiet.map((item) => ({
        ma_do_uong: item.ma_do_uong,
        so_luong: item.so_luong,
        tuy_chon: item.tuy_chon || [],
      }));

      // Gửi yêu cầu tạo đơn hàng với chi_tiet
      const result = await createDonHang({
        ma_nguoi_dung: Number(maNguoiDung),
        ten_khach: orderInfo.ten_khach,
        dia_chi_khach: orderInfo.dia_chi_khach,
        sdt_khach: orderInfo.sdt_khach,
        phuong_thuc_thanh_toan: orderInfo.phuong_thuc_thanh_toan,
        ma_gio_hang_ids: selectedItems,
        chi_tiet: chiTietPayload, // Gửi chi_tiet trực tiếp
      });

      if (result.ma_don_hang) {
        alert('Đặt hàng thành công!');
        await fetchCart();
        localStorage.removeItem('selectedCartItems');
        localStorage.removeItem('buyNowItem');
        setGioHang([]);
        setSelectedItems([]);
        setTempChiTiet([]);
        navigate('/lich-su-don-hang');
      } else {
        throw new Error(result.message || 'Đặt hàng thất bại');
      }
    } catch (err) {
      console.error('Error in handlePlaceOrder:', err);
      alert(`Đặt hàng thất bại: ${err.message || 'Không thể kết nối đến máy chủ'}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .order-form-container {
          min-height: 100vh;
          background: white;
          padding: 20px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .order-form {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .order-header {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .order-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .order-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 10px 0;
          position: relative;
          z-index: 1;
        }

        .order-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .order-content {
          padding: 30px;
        }

        .section {
          margin-bottom: 30px;
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .section:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title::before {
          content: '';
          width: 4px;
          height: 24px;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 2px;
        }

        .cart-item, .temp-item {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          position: relative;
          overflow: hidden;
        }

        .cart-item::before, .temp-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
        }

        .item-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .item-name {
          font-weight: 600;
          color: #333;
          font-size: 1.1rem;
        }

        .item-quantity {
          background: #ff6b35;
          color: white;
          padding: 8px 0;
          border-radius: 20px;
          font-weight: 600;
          text-align: center;
          font-size: 0.9rem;
          width: 100%;
        }

        .item-options {
          color: #666;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
          box-sizing: border-box;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          transform: translateY(-1px);
        }

        .form-input::placeholder {
          color: #adb5bd;
        }

        .form-hint {
          font-size: 0.9rem;
          color: #666;
          margin-top: 8px;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .btn {
          padding: 15px 30px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn:hover::before {
          left: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          color: white;
          flex: 1;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 107, 53, 0.3);
        }

        .btn-primary:disabled {
          background: #adb5bd;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
          color: white;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(108, 117, 125, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px 30px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .empty-state h3 {
          color: #666;
          margin-bottom: 15px;
          font-size: 1.3rem;
        }

        .empty-state a {
          color: #ff6b35;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .empty-state a:hover {
          color: #f7931e;
          text-decoration: underline;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .error-card {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
        }

        .error-card h3 {
          color: #dc3545;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .order-form-container {
            padding: 10px;
          }

          .order-title {
            font-size: 2rem;
          }

          .order-content {
            padding: 20px;
          }

          .section {
            padding: 20px;
          }

          .item-content {
            gap: 10px;
          }

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="order-form-container">
        <div className="order-form">
          <div className="order-header">
            <h1 className="order-title">Đặt hàng</h1>
            <p className="order-subtitle">
              {selectedItems.length + tempChiTiet.length} mục đã chọn
            </p>
          </div>

          <div className="order-content">
            {selectedItems.length === 0 && tempChiTiet.length === 0 ? (
              <div className="empty-state">
                <h3>Không có mục nào được chọn</h3>
                <p>
                  <a href={`/gio-hang/${maNguoiDung}`}>Quay lại giỏ hàng</a> để chọn sản phẩm
                </p>
              </div>
            ) : (
              <>
                {gioHang.length > 0 && (
                  <div className="section">
                    <h3 className="section-title">Sản phẩm từ giỏ hàng</h3>
                    {gioHang.map((item) => (
                      <div key={item.ma_gio_hang} className="cart-item">
                        <div className="item-content">
                          <div className="item-name">{item.ten_do_uong}</div>
                          <div className="item-quantity">SL: {item.so_luong}</div>
                          <div className="item-options">
                            {item.tuy_chon?.length > 0
                              ? item.tuy_chon.map((opt) => `${opt.loai_tuy_chon}: ${opt.gia_tri}`).join(', ')
                              : 'Không có tùy chọn'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tempChiTiet.length > 0 && (
                  <div className="section">
                    <h3 className="section-title">Sản phẩm thêm mới</h3>
                    {tempChiTiet.map((item, index) => (
                      <div key={index} className="temp-item">
                        <div className="item-content">
                          <div className="item-name">{item.ten_do_uong}</div>
                          <div className="item-quantity">SL: {item.so_luong}</div>
                          <div className="item-options">
                            {item.tuy_chon?.length > 0 ? item.tuy_chon.map((opt) => `${opt.loai_tuy_chon}: ${opt.gia_tri}`).join(', ') : 'Không có tùy chọn'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="section">
                  <h3 className="section-title">Thông tin khách hàng</h3>
                  <div className="form-group">
                    <label className="form-label">Tên khách hàng</label>
                    <input
                      name="ten_khach"
                      placeholder="Nhập tên khách hàng"
                      value={orderInfo.ten_khach}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Địa chỉ giao hàng</label>
                    <input
                      name="dia_chi_khach"
                      placeholder="Nhập địa chỉ giao hàng"
                      value={orderInfo.dia_chi_khach}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      name="sdt_khach"
                      placeholder="Nhập số điện thoại"
                      value={orderInfo.sdt_khach}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phương thức thanh toán</label>
                    <select
                      name="phuong_thuc_thanh_toan"
                      value={orderInfo.phuong_thuc_thanh_toan}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="tien_mat">Tiền mặt</option>
                      <option value="chuyen_khoan">Chuyển khoản</option>
                      <option value="the">Thẻ tín dụng/ghi nợ</option>
                    </select>
                  </div>

                  <p className="form-hint">
                    Bạn có thể chỉnh sửa thông tin cho đơn hàng này hoặc khôi phục thông tin mặc định.
                  </p>

                  <div className="button-group">
                    <button onClick={resetToDefault} className="btn btn-secondary">
                      Khôi phục mặc định
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={selectedItems.length === 0 && tempChiTiet.length === 0}
                      className="btn btn-primary"
                    >
                      Đặt hàng ngay ({selectedItems.length + tempChiTiet.length} mục)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderForm;

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
  const [newItem, setNewItem] = useState({
    ma_do_uong: '',
    so_luong: 1,
    tuy_chon: [],
  });
  const [doUongList, setDoUongList] = useState([]);
  const [tempChiTiet, setTempChiTiet] = useState([]); // Lưu tạm chi tiết trước khi đặt hàng

  useEffect(() => {
    const loadData = async () => {
      if (!maNguoiDung || !token) {
        setError('Vui lòng đăng nhập để đặt hàng');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Lấy thông tin khách hàng từ localStorage
        const hoTen = localStorage.getItem('ho_ten') || '';
        const diaChi = localStorage.getItem('dia_chi') || '';
        const soDienThoai = localStorage.getItem('so_dien_thoai') || '';
        setOrderInfo({
          ten_khach: hoTen,
          dia_chi_khach: diaChi,
          sdt_khach: soDienThoai,
          phuong_thuc_thanh_toan: 'tien_mat',
        });

        // Lấy giỏ hàng
        const res = await getGioHangByUser(maNguoiDung);
        const savedSelectedItems = JSON.parse(localStorage.getItem('selectedCartItems') || '[]');
        setSelectedItems(savedSelectedItems);
        const filteredGioHang = res.filter((item) => savedSelectedItems.includes(item.ma_gio_hang));
        setGioHang(filteredGioHang);

        // Giả định có API lấy danh sách đồ uống
        // const doUongRes = await getDoUong(); // Cần thêm API này trong backend
        // setDoUongList(doUongRes);
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

    return () => disconnectSocket();
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

  const handleAddChiTiet = () => {
    if (!newItem.ma_do_uong || newItem.so_luong < 1) {
      alert('Vui lòng chọn đồ uống và số lượng hợp lệ');
      return;
    }
    const doUong = doUongList.find((item) => item.ma_do_uong === newItem.ma_do_uong);
    setTempChiTiet([
      ...tempChiTiet,
      {
        ma_do_uong: newItem.ma_do_uong,
        ten_do_uong: doUong ? doUong.ten_do_uong : 'Unknown',
        so_luong: newItem.so_luong,
        tuy_chon: newItem.tuy_chon,
      },
    ]);
    setNewItem({ ma_do_uong: '', so_luong: 1, tuy_chon: [] });
    alert('Thêm chi tiết thành công!');
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
      // Tạo đơn hàng
      const result = await createDonHang({
        ma_nguoi_dung: Number(maNguoiDung),
        ten_khach: orderInfo.ten_khach,
        dia_chi_khach: orderInfo.dia_chi_khach,
        sdt_khach: orderInfo.sdt_khach,
        phuong_thuc_thanh_toan: orderInfo.phuong_thuc_thanh_toan,
        ma_gio_hang_ids: selectedItems,
      });

      if (result.ma_don_hang) {
        // Thêm chi tiết đơn hàng nếu có
        for (const chiTiet of tempChiTiet) {
          await addChiTietDonHang(result.ma_don_hang, {
            ma_do_uong: chiTiet.ma_do_uong,
            so_luong: chiTiet.so_luong,
            tuy_chon: chiTiet.tuy_chon,
          });
        }

        alert('Đặt hàng thành công!');
        await fetchCart();
        localStorage.removeItem('selectedCartItems');
        setGioHang([]);
        setSelectedItems([]);
        setTempChiTiet([]);
        navigate('/lich-su-don-hang');
      } else {
        throw new Error(result.message || 'Đặt hàng thất bại');
      }
    } catch (err) {
      alert(`Đặt hàng thất bại: ${err.message}`);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  if (error) return <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="order-form" style={{ transition: 'all 0.3s ease', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Đặt hàng ({selectedItems.length + tempChiTiet.length} mục)</h2>
      {gioHang.length === 0 && tempChiTiet.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          Không có mục nào được chọn. <a href={`/gio-hang/${maNguoiDung}`}>Quay lại giỏ hàng</a>
        </p>
      ) : (
        <>
          <div className="cart-items" style={{ marginBottom: '20px' }}>
            <h3>Danh sách sản phẩm từ giỏ hàng</h3>
            {gioHang.map((item) => (
              <div
                key={item.ma_gio_hang}
                className="cart-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <span>{item.ten_do_uong}</span>
                <span>Số lượng: {item.so_luong}</span>
                <span>
                  Tùy chọn:{' '}
                  {item.tuy_chon?.length > 0
                    ? item.tuy_chon.map((opt) => `${opt.loai_tuy_chon}: ${opt.gia_tri}`).join(', ')
                    : 'Không có'}
                </span>
              </div>
            ))}
          </div>

          <div className="temp-items" style={{ marginBottom: '20px' }}>
            <h3>Sản phẩm thêm mới</h3>
            {tempChiTiet.map((item, index) => (
              <div
                key={index}
                className="temp-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '10px',
                  borderBottom: '1px solid #ddd',
                }}
              >
                <span>{item.ten_do_uong}</span>
                <span>Số lượng: {item.so_luong}</span>
                <span>Tùy chọn: {item.tuy_chon?.length > 0 ? item.tuy_chon.join(', ') : 'Không có'}</span>
              </div>
            ))}
          </div>

          <div className="order-info" style={{ display: 'grid', gap: '10px' }}>
            <h3>Thông tin khách hàng</h3>
            <input
              name="ten_khach"
              placeholder="Tên khách hàng"
              value={orderInfo.ten_khach}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              name="dia_chi_khach"
              placeholder="Địa chỉ"
              value={orderInfo.dia_chi_khach}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              name="sdt_khach"
              placeholder="Số điện thoại"
              value={orderInfo.sdt_khach}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <p style={{ fontSize: '12px', color: '#555' }}>
              Bạn có thể chỉnh sửa thông tin cho đơn hàng này.
            </p>
            <button
              onClick={resetToDefault}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '5px',
              }}
            >
              Khôi phục thông tin mặc định
            </button>
            <select
              name="phuong_thuc_thanh_toan"
              value={orderInfo.phuong_thuc_thanh_toan}
              onChange={handleInputChange}
              style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="tien_mat">Tiền mặt</option>
              <option value="chuyen_khoan">Chuyển khoản</option>
              <option value="the">Thẻ</option>
            </select>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={selectedItems.length === 0 && tempChiTiet.length === 0}
            style={{
              backgroundColor: selectedItems.length === 0 && tempChiTiet.length === 0 ? '#aaa' : '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedItems.length === 0 && tempChiTiet.length === 0 ? 'not-allowed' : 'pointer',
              marginTop: '10px',
            }}
          >
            Đặt hàng ({selectedItems.length + tempChiTiet.length} mục)
          </button>
        </>
      )}
    </div>
  );
};

export default OrderForm;
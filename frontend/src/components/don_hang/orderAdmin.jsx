import React, { useState, useEffect } from 'react';
import { getDonHang, updateDonHang, cancelDonHang, deleteDonHang, getDonHangById } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';

const OrderAdmin = () => {
  const [donHang, setDonHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await getDonHang({ trang_thai: filter });
        setDonHang(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadOrders();

    initSocket('admin', (event, data) => {
      console.log('WebSocket event:', event, data);
      if (event === 'new' && data.ma_don_hang) {
        setDonHang((prev) => [data, ...prev]);
      } else if (event === 'update' && data.ma_don_hang) {
        setDonHang((prev) =>
          prev.map((dh) =>
            dh.ma_don_hang === data.ma_don_hang ? { ...dh, ...data } : dh
          )
        );
        if (selectedOrder && selectedOrder.ma_don_hang === data.ma_don_hang) {
          setSelectedOrder((prev) => ({ ...prev, ...data }));
        }
      } else if (event === 'delete' && data.ma_don_hang) {
        setDonHang((prev) => prev.filter((dh) => dh.ma_don_hang !== data.ma_don_hang));
        if (selectedOrder && selectedOrder.ma_don_hang === data.ma_don_hang) {
          setSelectedOrder(null);
        }
      }
    });

    return () => disconnectSocket();
  }, [filter]);

  const handleUpdateStatus = async (maDonHang, trangThai) => {
    setActionLoading(`update-${maDonHang}`);
    let prevDonHang = donHang;
    try {
      setDonHang((prev) =>
        prev.map((dh) =>
          dh.ma_don_hang === maDonHang ? { ...dh, trang_thai: trangThai } : dh
        )
      );
      const result = await updateDonHang(maDonHang, { trang_thai: trangThai });
      if (result.message) {
        alert('Cập nhật trạng thái thành công');
      } else {
        throw new Error(result.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      setDonHang(prevDonHang);
      alert(`Cập nhật thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (maDonHang) => {
    setActionLoading(`cancel-${maDonHang}`);
    let prevDonHang = donHang;
    try {
      setDonHang((prev) =>
        prev.map((dh) =>
          dh.ma_don_hang === maDonHang ? { ...dh, trang_thai: 'da_huy' } : dh
        )
      );
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder((prev) => ({ ...prev, trang_thai: 'da_huy' }));
      }
      const result = await cancelDonHang(maDonHang);
      if (result.message) {
        alert('Hủy đơn thành công');
      } else {
        throw new Error(result.error || 'Hủy thất bại');
      }
    } catch (err) {
      setDonHang(prevDonHang);
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder((prev) => ({
          ...prev,
          trang_thai: prevDonHang.find((dh) => dh.ma_don_hang === maDonHang)?.trang_thai || prev.trang_thai,
        }));
      }
      alert(`Hủy thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (maDonHang) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn này?')) return;
    setActionLoading(`delete-${maDonHang}`);
    let prevDonHang = donHang;
    try {
      setDonHang((prev) => prev.filter((dh) => dh.ma_don_hang !== maDonHang));
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder(null);
      }
      const result = await deleteDonHang(maDonHang);
      if (result.message) {
        alert('Xóa đơn thành công');
      } else {
        throw new Error(result.error || 'Xóa thất bại');
      }
    } catch (err) {
      setDonHang(prevDonHang);
      alert(`Xóa thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (maDonHang) => {
    try {
      setActionLoading(`details-${maDonHang}`);
      const orderDetails = await getDonHangById(maDonHang);
      setSelectedOrder(orderDetails);
    } catch (err) {
      alert(`Lấy chi tiết đơn hàng thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatTuyChon = (tuyChon) => {
    if (!tuyChon || (Array.isArray(tuyChon) && tuyChon.length === 0)) {
      return 'Không có';
    }
    if (Array.isArray(tuyChon)) {
      return tuyChon
        .map((option) => {
          if (typeof option === 'object' && option !== null) {
            return Object.entries(option)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
          }
          return String(option);
        })
        .join('; ');
    } else if (typeof tuyChon === 'object' && tuyChon !== null) {
      return Object.entries(tuyChon)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } else if (typeof tuyChon === 'string') {
      try {
        const parsed = JSON.parse(tuyChon);
        return formatTuyChon(parsed);
      } catch {
        return tuyChon;
      }
    }
    return 'Không có';
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  if (error) return <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="admin-dashboard" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Quản lý đơn hàng</h2>
      <div style={{ marginBottom: '20px' }}>
        <select
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
          style={{ padding: '5px', fontSize: '16px' }}
        >
          <option value="">Tất cả</option>
          <option value="cho_xu_ly">Chờ xử lý</option>
          <option value="dang_giao">Đang giao</option>
          <option value="da_giao">Đã giao</option>
          <option value="da_huy">Đã hủy</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mã đơn</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Khách hàng</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tổng tiền</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {donHang.map((dh) => (
            <tr key={dh.ma_don_hang} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', textAlign: 'center' }}>{dh.ma_don_hang}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{dh.ten_khach}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                {dh.tong_tien.toLocaleString('vi-VN')} VNĐ
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>{dh.trang_thai}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <select
                  onChange={(e) => handleUpdateStatus(dh.ma_don_hang, e.target.value)}
                  value={dh.trang_thai}
                  disabled={actionLoading === `update-${dh.ma_don_hang}`}
                  style={{
                    padding: '5px',
                    marginRight: '10px',
                    fontSize: '14px',
                  }}
                >
                  <option value="cho_xu_ly">Chờ xử lý</option>
                  <option value="dang_giao">Đang giao</option>
                  <option value="da_giao">Đã giao</option>
                  <option value="da_huy">Đã hủy</option>
                </select>
                <button
                  onClick={() => handleCancelOrder(dh.ma_don_hang)}
                  disabled={dh.trang_thai !== 'cho_xu_ly' || actionLoading === `cancel-${dh.ma_don_hang}`}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px',
                  }}
                >
                  {actionLoading === `cancel-${dh.ma_don_hang}` ? 'Đang tải...' : 'Hủy'}
                </button>
                <button
                  onClick={() => handleDeleteOrder(dh.ma_don_hang)}
                  disabled={actionLoading === `delete-${dh.ma_don_hang}`}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px',
                  }}
                >
                  {actionLoading === `delete-${dh.ma_don_hang}` ? 'Đang tải...' : 'Xóa'}
                </button>
                <button
                  onClick={() => handleViewDetails(dh.ma_don_hang)}
                  disabled={actionLoading === `details-${dh.ma_don_hang}`}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {actionLoading === `details-${dh.ma_don_hang}` ? 'Đang tải...' : 'Xem chi tiết'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedOrder && (
        <div className="order-details" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}>
          <h3>Chi tiết đơn hàng {selectedOrder.ma_don_hang}</h3>
          <p><strong>Khách hàng:</strong> {selectedOrder.ten_khach}</p>
          <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.ngay_dat).toLocaleString('vi-VN')}</p>
          <p><strong>Tổng tiền:</strong> {selectedOrder.tong_tien.toLocaleString('vi-VN')} VNĐ</p>
          <p><strong>Trạng thái:</strong> {selectedOrder.trang_thai}</p>
          <h4>Sản phẩm</h4>
          {selectedOrder.chi_tiet?.length > 0 ? (
            <ul>
              {selectedOrder.chi_tiet.map((item, index) => (
                <li key={index}>
                  {item.ten_do_uong} - Số lượng: {item.so_luong} - Tùy chọn: {formatTuyChon(item.tuy_chon)}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có chi tiết sản phẩm</p>
          )}
          <button
            onClick={() => setSelectedOrder(null)}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderAdmin;
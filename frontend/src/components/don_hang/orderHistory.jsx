import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDonHang, getDonHangById, cancelDonHang } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';

const OrderHistory = () => {
  const navigate = useNavigate();
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Use refs to avoid stale closures
  const ordersRef = useRef([]);
  const selectedOrderRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    if (!maNguoiDung) {
      setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDonHang({ ma_nguoi_dung: maNguoiDung });
      console.log('API getDonHang response:', data);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [maNguoiDung]);

  // Handle Socket.IO events - Remove dependencies to avoid stale closures
  const handleSocketEvent = useCallback((event, data) => {
    console.log('WebSocket event:', event, data);
    
    // Convert both to numbers for comparison
    const userId = parseInt(maNguoiDung);
    const dataUserId = parseInt(data.ma_nguoi_dung);
    
    console.log('User ID comparison:', { userId, dataUserId, matches: userId === dataUserId });
    
    if (userId !== dataUserId) {
      console.log('Event ignored - user mismatch:', { userId, dataUserId });
      return;
    }

    if (event === 'new' && data.ma_don_hang) {
      console.log('Adding new order:', data);
      setOrders((prevOrders) => {
        // Check if order already exists
        const exists = prevOrders.some(order => order.ma_don_hang === data.ma_don_hang);
        if (exists) {
          console.log('Order already exists, skipping add');
          return prevOrders;
        }
        return [{ ...data }, ...prevOrders];
      });
    } 
    else if (event === 'update' && data.ma_don_hang) {
      console.log('Updating order with data:', data);
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) =>
          order.ma_don_hang === data.ma_don_hang ? { ...order, ...data } : order
        );
        console.log('Updated orders:', updatedOrders);
        return updatedOrders;
      });
      
      // Update selected order if it matches
      setSelectedOrder((prevSelected) => {
        if (prevSelected && prevSelected.ma_don_hang === data.ma_don_hang) {
          console.log('Updating selectedOrder:', data);
          return { ...prevSelected, ...data };
        }
        return prevSelected;
      });
    } 
    else if (event === 'delete' && data.ma_don_hang) {
      console.log('Deleting order:', data.ma_don_hang);
      setOrders((prevOrders) => 
        prevOrders.filter((order) => order.ma_don_hang !== data.ma_don_hang)
      );
      
      setSelectedOrder((prevSelected) => {
        if (prevSelected && prevSelected.ma_don_hang === data.ma_don_hang) {
          return null;
        }
        return prevSelected;
      });
    }
  }, [maNguoiDung]); // Only depend on maNguoiDung

  useEffect(() => {
    loadOrders();

    // Add a small delay to ensure socket connection is established
    const timer = setTimeout(() => {
      initSocket('user', handleSocketEvent);
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnectSocket();
    };
  }, [loadOrders, handleSocketEvent]);

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

  const handleCancelOrder = async (maDonHang) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setActionLoading(`cancel-${maDonHang}`);
    const prevOrders = [...orders];
    const prevSelectedOrder = selectedOrder;
    
    try {
      // Optimistically update UI
      setOrders((prev) =>
        prev.map((order) =>
          order.ma_don_hang === maDonHang ? { ...order, trang_thai: 'da_huy' } : order
        )
      );
      
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder((prev) => ({ ...prev, trang_thai: 'da_huy' }));
      }
      
      const result = await cancelDonHang(maDonHang);
      if (result.message) {
        alert('Hủy đơn hàng thành công!');
      } else {
        throw new Error(result.error || 'Hủy thất bại');
      }
    } catch (err) {
      // Revert on error
      setOrders(prevOrders);
      setSelectedOrder(prevSelectedOrder);
      alert(`Hủy đơn hàng thất bại: ${err.message}`);
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
    <div className="order-history" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Chưa có đơn hàng nào</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mã đơn</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày đặt</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tổng tiền</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Chi tiết</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.ma_don_hang} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', textAlign: 'center' }}>{order.ma_don_hang}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {order.tong_tien?.toLocaleString('vi-VN') || 'N/A'} VNĐ
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{order.trang_thai || 'N/A'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleViewDetails(order.ma_don_hang)}
                    disabled={actionLoading === `details-${order.ma_don_hang}`}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading === `details-${order.ma_don_hang}` ? 'Đang tải...' : 'Xem chi tiết'}
                  </button>
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {order.trang_thai === 'cho_xu_ly' ? (
                    <button
                      onClick={() => handleCancelOrder(order.ma_don_hang)}
                      disabled={actionLoading === `cancel-${order.ma_don_hang}`}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      {actionLoading === `cancel-${order.ma_don_hang}` ? 'Đang tải...' : 'Hủy đơn'}
                    </button>
                  ) : (
                    <span style={{ color: '#888' }}>
                      {order.trang_thai === 'dang_giao'
                        ? 'Đang giao, không thể hủy'
                        : order.trang_thai === 'da_giao'
                        ? 'Đã giao'
                        : 'Đã hủy'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="order-details" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}>
          <h3>Chi tiết đơn hàng {selectedOrder.ma_don_hang}</h3>
          <p><strong>Ngày đặt:</strong> {new Date(selectedOrder.ngay_dat).toLocaleDateString('vi-VN')}</p>
          <p><strong>Tổng tiền:</strong> {selectedOrder.tong_tien?.toLocaleString('vi-VN') || 'N/A'} VNĐ</p>
          <p><strong>Trạng thái:</strong> {selectedOrder.trang_thai || 'N/A'}</p>
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
          {selectedOrder.trang_thai === 'cho_xu_ly' && (
            <button
              onClick={() => handleCancelOrder(selectedOrder.ma_don_hang)}
              disabled={actionLoading === `cancel-${selectedOrder.ma_don_hang}`}
              style={{
                marginTop: '10px',
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {actionLoading === `cancel-${selectedOrder.ma_don_hang}` ? 'Đang tải...' : 'Hủy đơn'}
            </button>
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

export default OrderHistory;
// OrderAdmin.js - Fixed version
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDonHang, updateDonHang, cancelDonHang, deleteDonHang, getDonHangById } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';

const OrderAdmin = () => {
  const [donHang, setDonHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Use refs to avoid stale closures
  const donHangRef = useRef([]);
  const selectedOrderRef = useRef(null);

  // Update refs when state changes
  useEffect(() => {
    donHangRef.current = donHang;
  }, [donHang]);

  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDonHang({ trang_thai: filter });
      console.log('API getDonHang response:', data);
      setDonHang(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [filter]);

  // Handle Socket.IO events - Remove dependencies to avoid stale closures
  const handleSocketEvent = useCallback((event, data) => {
    console.log('WebSocket event:', event, data);
    
    if (event === 'new' && data.ma_don_hang) {
      console.log('Adding new order:', data);
      setDonHang((prevDonHang) => {
        // Check if order already exists
        const exists = prevDonHang.some(dh => dh.ma_don_hang === data.ma_don_hang);
        if (exists) {
          console.log('Order already exists, skipping add');
          return prevDonHang;
        }
        return [{ ...data }, ...prevDonHang];
      });
    } 
    else if (event === 'update' && data.ma_don_hang) {
      console.log('Updating order with data:', data);
      setDonHang((prevDonHang) => {
        const updatedOrders = prevDonHang.map((dh) =>
          dh.ma_don_hang === data.ma_don_hang ? { ...dh, ...data } : dh
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
      setDonHang((prevDonHang) => 
        prevDonHang.filter((dh) => dh.ma_don_hang !== data.ma_don_hang)
      );
      
      setSelectedOrder((prevSelected) => {
        if (prevSelected && prevSelected.ma_don_hang === data.ma_don_hang) {
          return null;
        }
        return prevSelected;
      });
    } 
    else {
      console.log('Event ignored:', { event, data });
    }
  }, []); // Empty dependency array

  useEffect(() => {
    loadOrders();

    // Add a small delay to ensure socket connection is established
    const timer = setTimeout(() => {
      initSocket('admin', handleSocketEvent);
    }, 100);

    return () => {
      clearTimeout(timer);
      disconnectSocket();
    };
  }, [loadOrders, handleSocketEvent]);

  const handleUpdateStatus = async (maDonHang, trangThai) => {
    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái thành "${trangThai}"?`)) return;
    
    setActionLoading(`update-${maDonHang}`);
    const prevDonHang = [...donHang];
    const prevSelectedOrder = selectedOrder;
    
    try {
      // Optimistically update UI
      setDonHang((prev) =>
        prev.map((dh) =>
          dh.ma_don_hang === maDonHang ? { ...dh, trang_thai: trangThai } : dh
        )
      );
      
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder((prev) => ({ ...prev, trang_thai: trangThai }));
      }
      
      const result = await updateDonHang(maDonHang, { trang_thai: trangThai });
      if (result.message) {
        alert('Cập nhật trạng thái thành công');
      } else {
        throw new Error(result.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      // Revert on error
      setDonHang(prevDonHang);
      setSelectedOrder(prevSelectedOrder);
      alert(`Cập nhật thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (maDonHang) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    setActionLoading(`cancel-${maDonHang}`);
    const prevDonHang = [...donHang];
    const prevSelectedOrder = selectedOrder;
    
    try {
      // Optimistically update UI
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
      // Revert on error
      setDonHang(prevDonHang);
      setSelectedOrder(prevSelectedOrder);
      alert(`Hủy thất bại: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (maDonHang) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa đơn này?')) return;
    
    setActionLoading(`delete-${maDonHang}`);
    const prevDonHang = [...donHang];
    const prevSelectedOrder = selectedOrder;
    
    try {
      // Optimistically update UI
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
      // Revert on error
      setDonHang(prevDonHang);
      setSelectedOrder(prevSelectedOrder);
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
        <button
          onClick={loadOrders}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Làm mới
        </button>
      </div>

      {donHang.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Không có đơn hàng nào</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mã đơn</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Khách hàng</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày đặt</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tổng tiền</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {donHang.map((dh) => (
              <tr key={dh.ma_don_hang} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px', textAlign: 'center' }}>{dh.ma_don_hang}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{dh.ten_khach || 'N/A'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {dh.ngay_dat ? new Date(dh.ngay_dat).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {dh.tong_tien?.toLocaleString('vi-VN') || 'N/A'} VNĐ
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{dh.trang_thai || 'N/A'}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <select
                    onChange={(e) => {
                      if (e.target.value !== dh.trang_thai) {
                        handleUpdateStatus(dh.ma_don_hang, e.target.value);
                      }
                    }}
                    value={dh.trang_thai || ''}
                    disabled={actionLoading === `update-${dh.ma_don_hang}`}
                    style={{
                      padding: '5px',
                      marginRight: '5px',
                      fontSize: '12px',
                    }}
                  >
                    <option value="cho_xu_ly">Chờ xử lý</option>
                    <option value="dang_giao">Đang giao</option>
                    <option value="da_giao">Đã giao</option>
                    <option value="da_huy">Đã hủy</option>
                  </select>
                  <br />
                  <button
                    onClick={() => handleViewDetails(dh.ma_don_hang)}
                    disabled={actionLoading === `details-${dh.ma_don_hang}`}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      marginRight: '5px',
                      marginTop: '5px',
                      fontSize: '12px',
                    }}
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleCancelOrder(dh.ma_don_hang)}
                    disabled={dh.trang_thai === 'da_huy' || dh.trang_thai === 'da_giao' || actionLoading === `cancel-${dh.ma_don_hang}`}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: dh.trang_thai === 'da_huy' || dh.trang_thai === 'da_giao' ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: dh.trang_thai === 'da_huy' || dh.trang_thai === 'da_giao' ? 'not-allowed' : 'pointer',
                      marginRight: '5px',
                      fontSize: '12px',
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(dh.ma_don_hang)}
                    disabled={actionLoading === `delete-${dh.ma_don_hang}`}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="order-details" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}>
          <h3>Chi tiết đơn hàng {selectedOrder.ma_don_hang}</h3>
          <p><strong>Khách hàng:</strong> {selectedOrder.ten_khach || 'N/A'}</p>
          <p><strong>Ngày đặt:</strong> {selectedOrder.ngay_dat ? new Date(selectedOrder.ngay_dat).toLocaleString('vi-VN') : 'N/A'}</p>
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
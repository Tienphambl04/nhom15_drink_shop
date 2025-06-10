import React, { useState, useEffect } from 'react';
import { getDonHang, getDonHangById, cancelDonHang } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const navigate = useNavigate();
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [debugUpdate, setDebugUpdate] = useState(0);

  // CSS styles adapted from GioHang for consistency
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '2rem 0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem'
    },
    header: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    badge: {
      backgroundColor: '#fed7aa',
      color: '#ea580c',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px'
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    orderContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    },
    orderItem: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      transition: 'background-color 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    orderDetails: {
      flex: 1,
      minWidth: 0
    },
    orderId: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 0.5rem 0'
    },
    dateText: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.75rem'
    },
    totalPrice: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#ea580c',
      marginBottom: '0.5rem'
    },
    status: {
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      display: 'inline-block'
    },
    statusChoXuLy: {
      backgroundColor: '#fef3c7',
      color: '#d97706'
    },
    statusDangGiao: {
      backgroundColor: '#dbeafe',
      color: '#2563eb'
    },
    statusDaGiao: {
      backgroundColor: '#d1fae5',
      color: '#059669'
    },
    statusDaHuy: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    },
    actions: {
      display: 'flex',
      gap: '0.5rem'
    },
    actionBtn: {
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    detailsBtn: {
      backgroundColor: '#ea580c',
      color: '#ffffff'
    },
    cancelBtn: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    cancelBtnDisabled: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      cursor: 'not-allowed'
    },
    emptyOrders: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '3rem',
      textAlign: 'center'
    },
    emptyIcon: {
      fontSize: '4rem',
      color: '#d1d5db',
      marginBottom: '1rem'
    },
    emptyTitle: {
      fontSize: '1.25rem',
      fontWeight: '500',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    emptyText: {
      color: '#6b7280',
      marginBottom: '1.5rem'
    },
    emptyBtn: {
      backgroundColor: '#ea580c',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    loading: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingContent: {
      textAlign: 'center'
    },
    spinner: {
      width: '3rem',
      height: '3rem',
      border: '2px solid #e5e7eb',
      borderTop: '2px solid #ea580c',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    },
    errorContainer: {
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorContent: {
      textAlign: 'center',
      color: '#dc2626',
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      width: '100%',
      maxWidth: '28rem',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 1.5rem 0 1.5rem',
      marginBottom: '1.5rem'
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1f2937',
      margin: 0
    },
    modalCloseBtn: {
      padding: '0.5rem',
      border: 'none',
      backgroundColor: 'transparent',
      color: '#6b7280',
      cursor: 'pointer',
      borderRadius: '8px',
      transition: 'all 0.2s ease'
    },
    modalBody: {
      padding: '0 1.5rem',
      marginBottom:'1.5rem'
    },
    modalSection: {
      marginBottom: '1.5rem'
    },
    modalLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    modalText: {
      fontSize: '1rem',
      color: '#1f2937',
      marginBottom: '0.5rem'
    },
    modalPrice: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ea580c'
    },
    modalItemList: {
      marginBottom: '1.5rem'
    },
    modalItem: {
      padding: '0.75rem',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    },
    modalItemName: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#1f2937'
    },
    modalItemDetail: {
      fontSize: '0.75rem',
      color: '#6b7280'
    },
    modalActions: {
      display: 'flex',
      gap: '0.75rem',
      padding: '1.5rem',
      borderTop: '1px solid #e5e7eb'
    },
    modalCancelBtn: {
      flex: 1,
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      color: '#374151',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    modalActionBtn: {
      flex: 1,
      padding: '0.5rem 1rem',
      backgroundColor: '#ea580c',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    modalActionBtnDisabled: {
      flex: 1,
      padding: '0.5rem 1rem',
      backgroundColor: '#d1d5db',
      color: '#6b7280',
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed'
    }
  };

  const loadOrders = async () => {
    if (!maNguoiDung) {
      setError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDonHang({ ma_nguoi_dung: maNguoiDung });
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    initSocket('user', (event, data) => {
      const userId = Number(maNguoiDung);
      if (event === 'new' && data.ma_nguoi_dung === userId) {
        setOrders((prev) => [{ ...data }, ...prev]);
      } else if (event === 'update' && data.ma_nguoi_dung === userId) {
        setOrders((prev) => {
          const updatedOrders = prev.map((order) =>
            order.ma_don_hang === data.ma_don_hang ? { ...order, ...data } : order
          );
          return [...updatedOrders];
        });
        if (selectedOrder && selectedOrder.ma_don_hang === data.ma_don_hang) {
          setSelectedOrder((prev) => ({ ...prev, ...data }));
        }
        setDebugUpdate((prev) => prev + 1);
      } else if (event === 'delete' && data.ma_nguoi_dung === userId) {
        setOrders((prev) => prev.filter((order) => order.ma_don_hang !== data.ma_don_hang));
        if (selectedOrder && selectedOrder.ma_don_hang === data.ma_don_hang) {
          setSelectedOrder(null);
        }
      }
    });

    return () => disconnectSocket();
  }, [maNguoiDung]);

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
    let prevOrders = [...orders];
    try {
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
      setOrders(prevOrders);
      if (selectedOrder && selectedOrder.ma_don_hang === maDonHang) {
        setSelectedOrder((prev) => ({
          ...prev,
          trang_thai: prevOrders.find((order) => order.ma_don_hang === maDonHang)?.trang_thai || prev.trang_thai,
        }));
      }
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

  const getStatusStyle = (trang_thai) => {
    switch (trang_thai) {
      case 'cho_xu_ly':
        return styles.statusChoXuLy;
      case 'dang_giao':
        return styles.statusDangGiao;
      case 'da_giao':
        return styles.statusDaGiao;
      case 'da_huy':
        return styles.statusDaHuy;
      default:
        return styles.statusDaHuy;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleBackToCart = () => {
    navigate('/gio-hang');
  };

  // CSS animations
  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <div style={styles.loading}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#6b7280' }}>Đang tải lịch sử đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✕</div>
          <p style={{ fontSize: '1.125rem', fontWeight: '500' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{cssAnimations}</style>
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.headerLeft}>
                <div style={{ fontSize: '2rem' }}>📋</div>
                <h1 style={styles.title}>Lịch sử đơn hàng</h1>
                <span style={styles.badge}>
                  {orders.length} đơn hàng
                </span>
              </div>
             
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Debug Update Count: {debugUpdate}
            </p>
          </div>

          {orders.length === 0 ? (
            <div style={styles.emptyOrders}>
              <div style={styles.emptyIcon}>📦</div>
              <h3 style={styles.emptyTitle}>Chưa có đơn hàng nào</h3>
              <p style={styles.emptyText}>Hãy đặt hàng để xem lịch sử tại đây</p>
              <button 
                style={styles.emptyBtn}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
                onClick={handleBackToCart}
              >
                Quay lại giỏ hàng
              </button>
            </div>
          ) : (
            <div style={styles.orderContainer}>
              {orders.map((order, index) => (
                <div
                  key={order.ma_don_hang}
                  style={{
                    ...styles.orderItem,
                    ...(index === orders.length - 1 ? { borderBottom: 'none' } : {})
                  }}
                >
                  <div style={styles.orderDetails}>
                    <h3 style={styles.orderId}>Mã đơn: {order.ma_don_hang}</h3>
                    <div style={styles.dateText}>
                      Ngày đặt: {formatDate(order.ngay_dat)}
                    </div>
                    <div style={styles.totalPrice}>
                      Tổng tiền: {order.tong_tien?.toLocaleString('vi-VN') || '0'} VNĐ
                    </div>
                    <span style={{ ...styles.status, ...getStatusStyle(order.trang_thai) }}>
                      {order.trang_thai === 'cho_xu_ly' ? 'Chờ xử lý' :
                       order.trang_thai === 'dang_giao' ? 'Đang giao' :
                       order.trang_thai === 'da_giao' ? 'Đã giao' : 'Đã hủy'}
                    </span>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.actionBtn}
                      onClick={() => handleViewDetails(order.ma_don_hang)}
                      disabled={actionLoading === `details-${order.ma_don_hang}`}
                      onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#dc2626')}
                      onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ea580c')}
                    >
                      {actionLoading === `details-${order.ma_don_hang}` ? 'Đang tải...' : 'Xem chi tiết'}
                    </button>
                    {order.trang_thai === 'cho_xu_ly' ? (
                      <button
                        style={{
                          ...styles.actionBtn,
                          ...(actionLoading === `cancel-${order.ma_don_hang}` ? styles.cancelBtnDisabled : styles.cancelBtn)
                        }}
                        onClick={() => handleCancelOrder(order.ma_don_hang)}
                        disabled={actionLoading === `cancel-${order.ma_don_hang}`}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      >
                        {actionLoading === `cancel-${order.ma_don_hang}` ? 'Đang tải...' : 'Hủy đơn'}
                      </button>
                    ) : (
                      <span style={{ ...styles.cancelBtnDisabled, padding: '0.5rem 1rem' }}>
                        {order.trang_thai === 'dang_giao'
                          ? 'Đang giao, không thể hủy'
                          : order.trang_thai === 'da_giao'
                          ? 'Đã giao'
                          : 'Đã hủy'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Chi tiết đơn hàng {selectedOrder.ma_don_hang}</h2>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setSelectedOrder(null)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Ngày đặt</label>
                <p style={styles.modalText}>{formatDate(selectedOrder.ngay_dat)}</p>
              </div>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Tổng tiền</label>
                <p style={styles.modalPrice}>
                  {selectedOrder.tong_tien?.toLocaleString('vi-VN') || '0'} VNĐ
                </p>
              </div>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Trạng thái</label>
                <p style={styles.modalText}>
                  {selectedOrder.trang_thai === 'cho_xu_ly' ? 'Chờ xử lý' :
                   selectedOrder.trang_thai === 'dang_giao' ? 'Đang giao' :
                   selectedOrder.trang_thai === 'da_giao' ? 'Đã giao' : 'Đã hủy'}
                </p>
              </div>
              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Sản phẩm</label>
                {selectedOrder.chi_tiet?.length > 0 ? (
                  <div style={styles.modalItemList}>
                    {selectedOrder.chi_tiet.map((item, index) => (
                      <div key={index} style={styles.modalItem}>
                        <p style={styles.modalItemName}>{item.ten_do_uong}</p>
                        <p style={styles.modalItemDetail}>Số lượng: {item.so_luong}</p>
                        <p style={styles.modalItemDetail}>Tùy chọn: {formatTuyChon(item.tuy_chon)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={styles.modalText}>Không có chi tiết sản phẩm</p>
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={() => setSelectedOrder(null)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                Đóng
              </button>
              {selectedOrder.trang_thai === 'cho_xu_ly' && (
                <button
                  style={{
                    ...(actionLoading === `cancel-${selectedOrder.ma_don_hang}` ? styles.modalActionBtnDisabled : styles.modalActionBtn)
                  }}
                  onClick={() => handleCancelOrder(selectedOrder.ma_don_hang)}
                  disabled={actionLoading === `cancel-${selectedOrder.ma_don_hang}`}
                  onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#dc2626')}
                  onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#ea580c')}
                >
                  {actionLoading === `cancel-${selectedOrder.ma_don_hang}` ? 'Đang tải...' : 'Hủy đơn'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHistory;

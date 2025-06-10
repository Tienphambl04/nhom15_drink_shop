import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getThongBao, markThongBaoRead, deleteThongBao } from '../../api/thongBao';
import { getDonHangById } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';
import { Bell, Trash2, Check, Eye, X, Package, Calendar, User, DollarSign, ShoppingBag } from 'lucide-react';

const ThongBao = () => {
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const role = localStorage.getItem('role') || 'user';
  const [thongBao, setThongBao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedThongBao, setSelectedThongBao] = useState(null);
  const [filter, setFilter] = useState('all');
  const thongBaoRef = useRef([]);

  useEffect(() => {
    thongBaoRef.current = thongBao;
  }, [thongBao]);

  const loadThongBao = useCallback(async () => {
    if (!maNguoiDung && role !== 'admin') {
      setError('Vui lòng đăng nhập để xem thông báo');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getThongBao({ ma_nguoi_dung: maNguoiDung });
      setThongBao(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [maNguoiDung, role]);

  const handleSocketEvent = useCallback((event, data) => {
    console.log('WebSocket event:', event, data);
    if (event === 'thong_bao_moi' && data.ma_thong_bao && (data.loai_thong_bao === 'dat_hang' || data.loai_thong_bao === 'huy_don')) {
      setThongBao((prev) => {
        if (prev.some(tb => tb.ma_thong_bao === data.ma_thong_bao)) {
          return prev;
        }
        return [data, ...prev];
      });
    }
  }, []);

  useEffect(() => {
    loadThongBao();
    const timer = setTimeout(() => {
      initSocket(role === 'admin' ? 'admin' : maNguoiDung, handleSocketEvent, '/thong-bao');
    }, 100);
    return () => {
      clearTimeout(timer);
      disconnectSocket();
    };
  }, [loadThongBao, maNguoiDung, role, handleSocketEvent]);

  const handleMarkRead = async (maThongBao) => {
    try {
      await markThongBaoRead(maThongBao);
      setThongBao((prev) =>
        prev.map((tb) =>
          tb.ma_thong_bao === maThongBao ? { ...tb, da_doc: true } : tb
        )
      );
      if (selectedThongBao && selectedThongBao.ma_thong_bao === maThongBao) {
        setSelectedThongBao({ ...selectedThongBao, da_doc: true });
      }
    } catch (err) {
      alert(`Đánh dấu đã đọc thất bại: ${err.message}`);
    }
  };

  const handleDelete = async (maThongBao) => {
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) return;
    try {
      await deleteThongBao(maThongBao);
      setThongBao((prev) => prev.filter((tb) => tb.ma_thong_bao !== maThongBao));
      if (selectedThongBao && selectedThongBao.ma_thong_bao === maThongBao) {
        setSelectedThongBao(null);
      }
    } catch (err) {
      alert(`Xóa thông báo thất bại: ${err.message}`);
    }
  };

  const handleViewDetails = async (maDonHang) => {
    try {
      const orderDetails = await getDonHangById(maDonHang);
      const tb = thongBao.find(t => t.ma_don_hang === maDonHang);
      setSelectedThongBao({ ...tb, chi_tiet_don_hang: orderDetails });

      if (!tb.da_doc) {
        handleMarkRead(tb.ma_thong_bao);
      }
    } catch (err) {
      alert(`Lấy chi tiết đơn hàng thất bại: ${err.message}`);
    }
  };

  const formatThongBao = (tb) => {
    return tb.loai_thong_bao === 'dat_hang'
      ? `Đơn hàng mới #${tb.ma_don_hang} được đặt`
      : `Đơn hàng #${tb.ma_don_hang} đã bị hủy`;
  };

  const getNotificationIcon = (loaiThongBao) => {
    return loaiThongBao === 'dat_hang' ? (
      <Package className="w-5 h-5 text-green-600" />
    ) : (
      <X className="w-5 h-5 text-red-600" />
    );
  };

  const filteredThongBao = thongBao.filter(tb => {
    if (filter === 'unread') return !tb.da_doc;
    if (filter === 'read') return tb.da_doc;
    return true;
  });

  const unreadCount = thongBao.filter(tb => !tb.da_doc).length;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right,rgb(242, 243, 243), #ffffff, #e6f0fa)',
      padding: '20px',
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
    },
    bellIcon: {
      color: '#ff6b35',
      width: '24px',
      height: '24px',
    },
    unreadBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#ef4444',
      color: 'white',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '10px 0',
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
    },
    filterTabs: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '30px',
    },
    tabContainer: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    tab: {
      padding: '12px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#64748b',
      border: '1px solid transparent',
    },
    tabActive: {
      backgroundColor: '#ff7e5f',
      color: 'white',
      boxShadow: '0 4px 6px rgba(255, 126, 95, 0.3)',
    },
    tabInactive: {
      backgroundColor: 'transparent',
      color: '#64748b',
    },
    tabInactiveHover: {
        backgroundColor: '#f1f5f9',
    },
    notificationList: {
      gridColumn: '1 / span 2',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    notificationCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      '&:hover': {
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-4px)',
      },
    },
    unreadNotification: {
      border: '2px solidrgb(255, 255, 255)',
    },
    notificationContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    iconWrapper: {
      padding: '12px',
      borderRadius: '50%',
    },
    greenIcon: {
      backgroundColor: '#d1fae5',
    },
    redIcon: {
      backgroundColor: '#fee2e2',
    },
    textContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    newBadge: {
      backgroundColor: '#bfdbfe',
      color: '#2563eb',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    notificationTime: {
      fontSize: '14px',
      color: '#64748b',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '8px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#f1f5f9',
      },
    },
    blueButton: { color: '#2563eb' },
    greenButton: { color: '#16a34a' },
    redButton: { color: '#dc2626' },
    sidebar: {
      gridColumn: '3 / span 1',
      position: 'sticky',
      top: '32px',
    },
    sidebarContent: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
    },
    sidebarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    closeButton: {
      padding: '8px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      color: '#9ca3af',
      '&:hover': {
        backgroundColor: '#f1f5f9',
        color: '#374151',
      },
    },
    infoSection: {
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    },
    infoTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '12px',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#64748b',
      marginBottom: '8px',
    },
    statusSection: {
      backgroundColor: '#eff6ff',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    },
    statusText: {
      backgroundColor: '#dbeafe',
      color: '#2563eb',
      padding: '6px 12px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'inline-block',
    },
    productSection: {
      backgroundColor: '#ecfdf5',
      borderRadius: '12px',
      padding: '16px',
    },
    productCard: {
      backgroundColor: 'white',
      border: '1px solid #d1fae5',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px',
    },
    productTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1e293b',
      marginBottom: '4px',
    },
    productDetail: {
      fontSize: '12px',
      color: '#64748b',
      marginBottom: '4px',
    },
    placeholder: {
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '32px',
      textAlign: 'center',
    },
    placeholderIcon: {
      width: '64px',
      height: '64px',
      color: '#d1d5db',
      margin: '0 auto 16px',
    },
    placeholderText: {
      fontSize: '16px',
      color: '#64748b',
    },
    loadingContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #e6f0fa, #ffffff, #e6f0fa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    loadingSpinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    errorContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #fee2e2, #ffffff, #fee2e2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
    },
    errorIcon: {
      width: '64px',
      height: '64px',
      color: '#dc2626',
      margin: '0 auto 16px',
    },
    errorText: {
      fontSize: '18px',
      color: '#dc2626',
      textAlign: 'center',
    },
  };

  // Dynamically inject the @keyframes rule using a <style> element
  useEffect(() => {
    const existingStyle = document.querySelector('#spin-animation');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'spin-animation';
      styleElement.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={{ ...styles.placeholderText, marginTop: '16px' }}>Đang tải thông báo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <X style={styles.errorIcon} />
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Bell className="bellIcon" />
            {unreadCount > 0 && <span style={styles.unreadBadge}>{unreadCount}</span>}
          </div>
          <h1 style={styles.title}>Thông báo</h1>
          <p style={styles.subtitle}>Quản lý thông báo đơn hàng của bạn</p>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <div style={styles.tabContainer}>
            {[
              { key: 'all', label: 'Tất cả', count: thongBao.length },
              { key: 'unread', label: 'Chưa đọc', count: unreadCount },
              { key: 'read', label: 'Đã đọc', count: thongBao.length - unreadCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  ...styles.tab,
                  ...(filter === tab.key ? styles.tabActive : styles.tabInactive),
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
          {/* Notifications List */}
          <div style={styles.notificationList}>
            {filteredThongBao.length === 0 ? (
              <div style={styles.placeholder}>
                <Bell style={styles.placeholderIcon} />
                <p style={styles.placeholderText}>
                  {filter === 'all' ? 'Chưa có thông báo nào' : 
                   filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                   'Không có thông báo đã đọc'}
                </p>
              </div>
            ) : (
              filteredThongBao.map((tb) => (
                <div
                  key={tb.ma_thong_bao}
                  style={{
                    ...styles.notificationCard,
                    ...(tb.da_doc ? {} : styles.unreadNotification),
                  }}
                >
                  <div style={styles.notificationContent}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div
                        style={{
                          ...styles.iconWrapper,
                          ...(tb.loai_thong_bao === 'dat_hang' ? styles.greenIcon : styles.redIcon),
                        }}
                      >
                        {getNotificationIcon(tb.loai_thong_bao)}
                      </div>
                      <div style={styles.textContent}>
                        <div style={styles.notificationTitle}>
                          {formatThongBao(tb)}
                          {!tb.da_doc && <span style={styles.newBadge}>Mới</span>}
                        </div>
                        <p style={styles.notificationTime}>
                          <Calendar style={{ width: '16px', height: '16px', marginRight: '4px', color: '#64748b' }} />
                          {new Date(tb.ngay_tao).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleViewDetails(tb.ma_don_hang)}
                        style={{ ...styles.actionButton, ...styles.blueButton }}
                        title="Xem chi tiết"
                      >
                        <Eye style={{ width: '20px', height: '20px' }} />
                      </button>
                      {!tb.da_doc && (
                        <button
                          onClick={() => handleMarkRead(tb.ma_thong_bao)}
                          style={{ ...styles.actionButton, ...styles.greenButton }}
                          title="Đánh dấu đã đọc"
                        >
                          <Check style={{ width: '20px', height: '20px' }} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(tb.ma_thong_bao)}
                        style={{ ...styles.actionButton, ...styles.redButton }}
                        title="Xóa thông báo"
                      >
                        <Trash2 style={{ width: '20px', height: '20px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Details Sidebar */}
          <div style={styles.sidebar}>
            {selectedThongBao && selectedThongBao.chi_tiet_don_hang ? (
              <div style={styles.sidebarContent}>
                <div style={styles.sidebarHeader}>
                  <h3 style={styles.sidebarTitle}>
                    <ShoppingBag style={{ width: '24px', height: '24px', color: '#2563eb' }} />
                    Chi tiết đơn hàng
                  </h3>
                  <button
                    onClick={() => setSelectedThongBao(null)}
                    style={styles.closeButton}
                  >
                    <X style={{ width: '20px', height: '20px' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={styles.infoSection}>
                    <h4 style={styles.infoTitle}>Thông tin đơn hàng</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={styles.infoItem}>
                        <Package style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span>Mã đơn:</span>
                        <span style={{ marginLeft: '8px', fontWeight: '500' }}>#{selectedThongBao.ma_don_hang}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <User style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span>Khách hàng:</span>
                        <span style={{ marginLeft: '8px', fontWeight: '500' }}>{selectedThongBao.chi_tiet_don_hang.ten_khach || 'N/A'}</span>
                      </div>
                      <div style={styles.infoItem}>
                        <Calendar style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span>Ngày đặt:</span>
                        <span style={{ marginLeft: '8px', fontWeight: '500' }}>
                          {new Date(selectedThongBao.chi_tiet_don_hang.ngay_dat).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <DollarSign style={{ width: '16px', height: '16px', color: '#64748b' }} />
                        <span>Tổng tiền:</span>
                        <span style={{ marginLeft: '8px', fontWeight: '700', color: '#16a34a' }}>
                          {selectedThongBao.chi_tiet_don_hang.tong_tien?.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.statusSection}>
                    <h4 style={styles.infoTitle}>Trạng thái</h4>
                    <span style={styles.statusText}>
                      {selectedThongBao.chi_tiet_don_hang.trang_thai || 'N/A'}
                    </span>
                  </div>
                  <div style={styles.productSection}>
                    <h4 style={styles.infoTitle}>Sản phẩm</h4>
                    {selectedThongBao.chi_tiet_don_hang.chi_tiet?.length > 0 ? (
                      selectedThongBao.chi_tiet_don_hang.chi_tiet.map((item, index) => (
                        <div key={index} style={styles.productCard}>
                          <div style={styles.productTitle}>{item.ten_do_uong}</div>
                          <div style={styles.productDetail}>Số lượng: {item.so_luong}</div>
                          {item.tuy_chon?.length > 0 && (
                            <div style={styles.productDetail}>
                              Tùy chọn: {item.tuy_chon.map(opt => `${opt.loai_tuy_chon || 'N/A'}: ${opt.gia_tri || ''}`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p style={{ ...styles.productDetail, textAlign: 'center' }}>Không có chi tiết sản phẩm</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.placeholder}>
                <Eye style={styles.placeholderIcon} />
                <p style={styles.placeholderText}>Chọn một thông báo để xem chi tiết đơn hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongBao;

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

  // Hàm gọi API để lấy danh sách đơn hàng
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getDonHang({ trang_thai: filter });
      setDonHang(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  }, [filter]); // Chỉ gọi lại loadOrders khi filter thay đổi

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'cho_xu_ly': return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'dang_giao': return { bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6' };
      case 'da_giao': return { bg: '#d1fae5', text: '#047857', border: '#10b981' };
      case 'da_huy': return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default: return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'cho_xu_ly': return 'Chờ xử lý';
      case 'dang_giao': return 'Đang giao';
      case 'da_giao': return 'Đã giao';
      case 'da_huy': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = filter ? donHang.filter(dh => dh.trang_thai === filter) : donHang;

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white', // Đổi màu nền thành trắng
      color: '#1e293b',
      fontSize: '20px',
      fontWeight: '600'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderTop: '4px solid #1e293b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        Đang tải dữ liệu...
      </div>
    </div>
  );

  if (error) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white', // Đổi màu nền thành trắng
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>⚠️</div>
        <h3 style={{
          color: '#dc2626',
          fontSize: '24px',
          marginBottom: '16px'
        }}>
          Có lỗi xảy ra
        </h3>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          {error}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
          
          .fade-in {
            animation: fadeIn 0.6s ease-out;
          }
          
          .slide-in {
            animation: slideIn 0.3s ease-out;
          }
          
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          
          .glass-effect {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .btn-primary {
            background: #ff8c00;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
          }
          
          .btn-primary:hover {
            background: #e07b00;
          }
          
          .btn-warning {
            background: #ff8c00;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
          }
          
          .btn-warning:hover {
            background: #e07b00;
          }
          
          .btn-danger {
            background: #ff8c00;
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
          }
          
          .btn-danger:hover {
            background: #e07b00;
          }
          
          .filter-button {
            background: #ff8c00;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: background 0.3s;
          }
          
          .filter-button:hover {
            background: #e07b00;
          }
        `}
      </style>
      
      <div style={{
        minHeight: '100vh',
        background: 'white', // Đổi màu nền thành trắng
        padding: '40px 20px',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div className="glass-effect card-hover fade-in" style={{
            padding: '40px',
            borderRadius: '24px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '48px',
              fontWeight: '800',
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em'
            }}>
              Quản lý đơn hàng
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              margin: '0',
              fontWeight: '500'
            }}>
              Theo dõi và quản lý tất cả đơn hàng một cách hiệu quả
            </p>
          </div>

          {/* Filter Section */}
          <div className="glass-effect card-hover fade-in" style={{
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b'
              }}>
                Lọc theo trạng thái:
              </span>
              <select
                onChange={(e) => setFilter(e.target.value)} // Chỉ thay đổi filter, không gọi lại loadOrders thủ công
                value={filter}
                style={{
                  padding: '16px 20px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  color: '#1e293b',
                  cursor: 'pointer',
                  fontWeight: '600',
                  minWidth: '180px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="">Tất cả đơn hàng</option>
                <option value="cho_xu_ly">Chờ xử lý</option>
                <option value="dang_giao">Đang giao</option>
                <option value="da_giao">Đã giao</option>
                <option value="da_huy">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Orders Grid */}
          <div style={{
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
          }}>
            {filteredOrders.map((dh, index) => {
              const statusColors = getStatusColor(dh.trang_thai);
              return (
                <div
                  key={dh.ma_don_hang}
                  className="glass-effect card-hover fade-in"
                  style={{
                    padding: '32px',
                    borderRadius: '20px',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '800',
                        color: '#1e293b',
                        margin: '0 0 8px 0'
                      }}>
                        #{dh.ma_don_hang}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#64748b',
                        margin: '0',
                        fontWeight: '500'
                      }}>
                        👤 {dh.ten_khach}
                      </p>
                    </div>
                    <div style={{
                      padding: '8px 16px',
                      borderRadius: '50px',
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      border: `2px solid ${statusColors.border}`,
                      fontSize: '14px',
                      fontWeight: '700',
                      textAlign: 'center',
                      minWidth: '100px'
                    }}>
                      {getStatusText(dh.trang_thai)}
                    </div>
                  </div>

                  {/* Order Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: '#059669'
                      }}>
                        {dh.tong_tien.toLocaleString('vi-VN')} ₫
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        💰 Tổng tiền
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {new Date(dh.ngay_dat).toLocaleDateString('vi-VN')}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        fontWeight: '600'
                      }}>
                        📅 Ngày đặt
                      </div>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div style={{ marginBottom: '24px' }}>
                    <select
                      onChange={(e) => handleUpdateStatus(dh.ma_don_hang, e.target.value)}
                      value={dh.trang_thai}
                      disabled={actionLoading === `update-${dh.ma_don_hang}`}
                      style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '16px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        color: '#1e293b',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="cho_xu_ly">Chờ xử lý</option>
                      <option value="dang_giao">Đang giao</option>
                      <option value="da_giao">Đã giao</option>
                      <option value="da_huy">Đã hủy</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => handleViewDetails(dh.ma_don_hang)}
                      disabled={actionLoading === `details-${dh.ma_don_hang}`}
                      className="btn-primary"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                    >
                      Chi tiết
                    </button>

                    <button
                      onClick={() => handleCancelOrder(dh.ma_don_hang)}
                      disabled={actionLoading === `cancel-${dh.ma_don_hang}` || dh.trang_thai === 'da_huy'}
                      className="btn-warning"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        opacity: dh.trang_thai === 'da_huy' ? 0.5 : 1,
                        cursor: dh.trang_thai === 'da_huy' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Hủy
                    </button>

                    <button
                      onClick={() => handleDeleteOrder(dh.ma_don_hang)}
                      disabled={actionLoading === `delete-${dh.ma_don_hang}`}
                      className="btn-danger"
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px'
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="glass-effect" style={{
              padding: '60px',
              textAlign: 'center',
              borderRadius: '20px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#64748b',
                margin: '0'
              }}>
                Không tìm thấy đơn hàng nào
              </h3>
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="slide-in" style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
              backdropFilter: 'blur(8px)'
            }}>
              <div className="glass-effect" style={{
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}>
                {/* Modal Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '32px',
                  paddingBottom: '20px',
                  borderBottom: '3px solid #f1f5f9'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: '800',
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      📋 Chi tiết đơn hàng
                    </h2>
                    <p style={{
                      fontSize: '18px',
                      color: '#64748b',
                      margin: '0',
                      fontWeight: '600'
                    }}>
                      #{selectedOrder.ma_don_hang}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#f1f5f9';
                      e.target.style.color = '#64748b';
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Order Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  marginBottom: '32px'
                }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '16px',
                    border: '2px solid #bae6fd',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#0c4a6e',
                      marginBottom: '4px'
                    }}>
                      {selectedOrder.ten_khach}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#0369a1',
                      fontWeight: '600'
                    }}>
                      Khách hàng
                    </div>
                  </div>

                  <div style={{
                    padding: '24px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '16px',
                    border: '2px solid #bbf7d0',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#064e3b',
                      marginBottom: '4px'
                    }}>
                      {selectedOrder.tong_tien.toLocaleString('vi-VN')} ₫
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#047857',
                      fontWeight: '600'
                    }}>
                      Tổng tiền
                    </div>
                  </div>

                  <div style={{
                    padding: '24px',
                    backgroundColor: '#fefce8',
                    borderRadius: '16px',
                    border: '2px solid #fef08a',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📅</div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#92400e',
                      marginBottom: '4px'
                    }}>
                      {new Date(selectedOrder.ngay_dat).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#d97706',
                      fontWeight: '600'
                    }}>
                      Ngày đặt
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div style={{
                  padding: '24px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '2px solid #e2e8f0',
                  marginBottom: '32px'
                }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                    Trạng thái
                  </div>
                  <div style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '700',
                    backgroundColor: getStatusColor(selectedOrder.trang_thai).bg,
                    color: getStatusColor(selectedOrder.trang_thai).text,
                    border: `2px solid ${getStatusColor(selectedOrder.trang_thai).border}`
                  }}>
                    {getStatusText(selectedOrder.trang_thai)}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 16px 0'
                  }}>
                    Sản phẩm đã đặt
                  </h4>
                  {selectedOrder.chi_tiet?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {selectedOrder.chi_tiet.map((item, index) => (
                        <div key={index} style={{
                          padding: '20px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '16px',
                          border: '2px solid #e2e8f0'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#1e293b'
                            }}>
                              {item.ten_do_uong}
                            </span>
                            <span style={{
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#065f46',
                              backgroundColor: '#d1fae5',
                              padding: '6px 12px',
                              borderRadius: '12px'
                            }}>
                              x{item.so_luong}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '15px',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            <strong>Tùy chọn:</strong> {formatTuyChon(item.tuy_chon)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: '40px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '16px',
                      border: '2px solid #e2e8f0',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      Không có chi tiết sản phẩm
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderAdmin;

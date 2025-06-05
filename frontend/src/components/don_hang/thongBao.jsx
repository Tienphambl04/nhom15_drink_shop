import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getThongBao, markThongBaoRead, deleteThongBao } from '../../api/thongBao';
import { getDonHangById } from '../../api/donHang';
import { initSocket, disconnectSocket } from '../../socket';

const ThongBao = () => {
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const role = localStorage.getItem('role') || 'user';
  const [thongBao, setThongBao] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedThongBao, setSelectedThongBao] = useState(null);
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
      setSelectedThongBao((prev) => ({ ...prev, chi_tiet_don_hang: orderDetails }));
    } catch (err) {
      alert(`Lấy chi tiết đơn hàng thất bại: ${err.message}`);
    }
  };

  const formatThongBao = (tb) => {
    return tb.loai_thong_bao === 'dat_hang'
      ? `Đơn hàng mới #${tb.ma_don_hang} được đặt`
      : `Đơn hàng #${tb.ma_don_hang} đã bị hủy`;
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
  if (error) return <p style={{ color: 'red', padding: '20px', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="thong-bao" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Thông báo</h2>
      {thongBao.length === 0 ? (
        <p style={{ textAlign: 'center' }}>Chưa có thông báo nào</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {thongBao.map((tb) => (
            <li
              key={tb.ma_thong_bao}
              style={{
                padding: '10px',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: tb.da_doc ? '#f9f9f9' : '#e3f2fd',
              }}
            >
              <span
                style={{ cursor: 'pointer' }}
                onClick={() => handleViewDetails(tb.ma_don_hang)}
              >
                {formatThongBao(tb)} - {new Date(tb.ngay_tao).toLocaleString('vi-VN')}
              </span>
              <div>
                {!tb.da_doc && (
                  <button
                    onClick={() => handleMarkRead(tb.ma_thong_bao)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '5px',
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button
                  onClick={() => handleDelete(tb.ma_thong_bao)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedThongBao && selectedThongBao.chi_tiet_don_hang && (
        <div className="order-details" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd' }}>
          <h3>Chi tiết đơn hàng #{selectedThongBao.ma_don_hang}</h3>
          <p><strong>Khách hàng:</strong> {selectedThongBao.chi_tiet_don_hang.ten_khach || 'N/A'}</p>
          <p><strong>Ngày đặt:</strong> {new Date(selectedThongBao.chi_tiet_don_hang.ngay_dat).toLocaleString('vi-VN') || 'N/A'}</p>
          <p><strong>Tổng tiền:</strong> {selectedThongBao.chi_tiet_don_hang.tong_tien?.toLocaleString('vi-VN') || 'N/A'} VNĐ</p>
          <p><strong>Trạng thái:</strong> {selectedThongBao.chi_tiet_don_hang.trang_thai || 'N/A'}</p>
          <h4>Sản phẩm</h4>
          {selectedThongBao.chi_tiet_don_hang.chi_tiet?.length > 0 ? (
            <ul>
              {selectedThongBao.chi_tiet_don_hang.chi_tiet.map((item, index) => (
                <li key={index}>
                  {item.ten_do_uong} - Số lượng: {item.so_luong} - Tùy chọn: {item.tuy_chon?.length > 0 ? item.tuy_chon.map(opt => `${opt.loai_tuy_chon || 'N/A'}: ${opt.gia_tri || ''}`).join(', ') : 'Không có'}
                </li>
              ))}
            </ul>
          ) : (
            <p>Không có chi tiết sản phẩm</p>
          )}
          <button
            onClick={() => setSelectedThongBao(null)}
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

export default ThongBao;
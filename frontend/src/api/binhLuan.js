import { getToken } from './auth';

const API_BASE = 'http://localhost:5000/api/binh-luan';

function getHeaders(isJson = true) {
  const token = getToken();
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Thêm bình luận mới
 * @param {Object} data - Dữ liệu bình luận { ma_do_uong, noi_dung, so_sao, ma_cha }
 * @returns {Promise<Object>} - Kết quả thêm bình luận
 */
export async function themBinhLuan(data) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập để thêm bình luận');
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Thêm bình luận thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi thêm bình luận');
  }
}

/**
 * Lấy danh sách bình luận theo mã đồ uống
 * @param {string} maDoUong - Mã đồ uống
 * @returns {Promise<Array>} - Danh sách bình luận
 */
export async function layBinhLuan(maDoUong) {
  try {
    const res = await fetch(`${API_BASE}/${maDoUong}`, {
      headers: getHeaders(false),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Lấy bình luận thất bại');
    }
    return result.data || [];
  } catch (error) {
    console.error('Lỗi khi lấy bình luận:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi lấy bình luận');
  }
}

/**
 * Xóa bình luận
 * @param {string} maBinhLuan - Mã bình luận
 * @returns {Promise<Object>} - Kết quả xóa bình luận
 */
export async function xoaBinhLuan(maBinhLuan) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Vui lòng đăng nhập để xóa bình luận');
    }

    const res = await fetch(`${API_BASE}/${maBinhLuan}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Xóa bình luận thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi xóa bình luận');
  }
}
import { getToken } from './auth';

const API_BASE = 'http://localhost:5000/api/thong-bao';

function getHeaders(isJson = true) {
  const token = getToken();
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Lấy danh sách thông báo
 * @param {Object} params - { ma_nguoi_dung, da_doc }
 * @returns {Promise<Array>} - Danh sách thông báo
 */
export async function getThongBao(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}?${query}`, {
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Lấy danh sách thông báo thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thông báo:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi lấy danh sách thông báo');
  }
}

/**
 * Đánh dấu thông báo đã đọc
 * @param {string} maThongBao - Mã thông báo
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export async function markThongBaoRead(maThongBao) {
  try {
    const res = await fetch(`${API_BASE}/${maThongBao}/read`, {
      method: 'PUT', // Sửa từ POST thành PUT để khớp với backend
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Đánh dấu thông báo đã đọc thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi đánh dấu thông báo');
  }
}

/**
 * Xóa thông báo
 * @param {string} maThongBao - Mã thông báo
 * @returns {Promise<Object>} - Kết quả xóa
 */
export async function deleteThongBao(maThongBao) {
  try {
    const res = await fetch(`${API_BASE}/${maThongBao}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Xóa thông báo thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa thông báo:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi xóa thông báo');
  }
}
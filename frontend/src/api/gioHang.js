import { getToken } from './auth';

const API_BASE = 'http://localhost:5000/api/gio-hang';

// Hàm tạo headers cho request, có thể tùy chọn thêm Content-Type JSON
function getHeaders(isJson = true) {
  const token = getToken();
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Lấy toàn bộ giỏ hàng của người dùng
 * @param {string} maNguoiDung - Mã người dùng
 * @returns {Promise<Array>} - Mảng mục giỏ hàng
 */
export async function getGioHangByUser(maNguoiDung) {
  try {
    const res = await fetch(`${API_BASE}/${maNguoiDung}`, {
      headers: getHeaders(false),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Lấy giỏ hàng thất bại');
    }

    return await res.json();
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Thêm đồ uống vào giỏ hàng
 * @param {Object} data - { ma_nguoi_dung, ma_do_uong, so_luong, tuy_chon }
 * @returns {Promise<Object>} - Kết quả thêm giỏ hàng
 */
export async function addGioHang(data) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Thêm vào giỏ hàng thất bại');
    }

    return await res.json();
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Cập nhật số lượng món trong giỏ hàng
 * @param {string} maGioHang - Mã giỏ hàng
 * @param {Object} data - { so_luong: số lượng mới }
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export async function updateSoLuong(maGioHang, data) {
  try {
    const res = await fetch(`${API_BASE}/${maGioHang}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Cập nhật số lượng thất bại');
    }

    return await res.json();
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Xóa mục giỏ hàng theo mã
 * @param {string} maGioHang - Mã mục giỏ hàng cần xóa
 * @returns {Promise<Object>} - Kết quả xóa
 */
export async function deleteGioHang(maGioHang) {
  try {
    const res = await fetch(`${API_BASE}/${maGioHang}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Xóa mục giỏ hàng thất bại');
    }

    return await res.json();
  } catch (error) {
    console.error('Lỗi khi xóa giỏ hàng:', error);
    return { success: false, message: error.message };
  }
}

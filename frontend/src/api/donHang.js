import { getToken } from './auth';

const API_BASE = 'http://localhost:5000/api/don-hang';

function getHeaders(isJson = true) {
  const token = getToken();
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Tạo đơn hàng mới
 * @param {Object} data - Thông tin đơn hàng
 * @returns {Promise<Object>} - Kết quả tạo đơn
 */
export async function createDonHang(data) {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Tạo đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi tạo đơn hàng');
  }
}

/**
 * Lấy danh sách đơn hàng
 * @param {Object} params - { trang_thai, ma_nguoi_dung }
 * @returns {Promise<Array>} - Danh sách đơn hàng
 */
export async function getDonHang(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}?${query}`, {
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Lấy danh sách đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi lấy danh sách đơn hàng');
  }
}

/**
 * Lấy chi tiết đơn hàng
 * @param {string} maDonHang - Mã đơn hàng
 * @returns {Promise<Object>} - Chi tiết đơn hàng
 */
export async function getDonHangById(maDonHang) {
  try {
    const res = await fetch(`${API_BASE}/${maDonHang}`, {
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Lấy chi tiết đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi lấy chi tiết đơn hàng');
  }
}

/**
 * Cập nhật đơn hàng
 * @param {string} maDonHang - Mã đơn hàng
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export async function updateDonHang(maDonHang, data) {
  try {
    const res = await fetch(`${API_BASE}/${maDonHang}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Cập nhật đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi cập nhật đơn hàng');
  }
}

/**
 * Hủy đơn hàng
 * @param {string} maDonHang - Mã đơn hàng
 * @returns {Promise<Object>} - Kết quả hủy
 */
export async function cancelDonHang(maDonHang) {
  try {
    const res = await fetch(`${API_BASE}/${maDonHang}/cancel`, {
      method: 'PUT',
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Hủy đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi hủy đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi hủy đơn hàng');
  }
}

/**
 * Xóa đơn hàng
 * @param {string} maDonHang - Mã đơn hàng
 * @returns {Promise<Object>} - Kết quả xóa
 */
export async function deleteDonHang(maDonHang) {
  try {
    const res = await fetch(`${API_BASE}/${maDonHang}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Xóa đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi xóa đơn hàng');
  }
}

/**
 * Thêm chi tiết đơn hàng
 * @param {string} maDonHang - Mã đơn hàng
 * @param {Object} data - Thông tin chi tiết
 * @returns {Promise<Object>} - Kết quả thêm
 */
export async function addChiTietDonHang(maDonHang, data) {
  try {
    const res = await fetch(`${API_BASE}/${maDonHang}/chi-tiet`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Thêm chi tiết đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi thêm chi tiết đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi thêm chi tiết đơn hàng');
  }
}

/**
 * Cập nhật chi tiết đơn hàng
 * @param {string} maChiTiet - Mã chi tiết
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Kết quả cập nhật
 */
export async function updateChiTietDonHang(maChiTiet, data) {
  try {
    const res = await fetch(`${API_BASE}/chi-tiet/${maChiTiet}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Cập nhật chi tiết đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi cập nhật chi tiết đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi cập nhật chi tiết đơn hàng');
  }
}

/**
 * Xóa chi tiết đơn hàng
 * @param {string} maChiTiet - Mã chi tiết
 * @returns {Promise<Object>} - Kết quả xóa
 */
export async function deleteChiTietDonHang(maChiTiet) {
  try {
    const res = await fetch(`${API_BASE}/chi-tiet/${maChiTiet}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Xóa chi tiết đơn hàng thất bại');
    }
    return result;
  } catch (error) {
    console.error('Lỗi khi xóa chi tiết đơn hàng:', error);
    throw new Error(error.message || 'Lỗi hệ thống khi xóa chi tiết đơn hàng');
  }
}

/**
 * Lấy danh sách đồ uống bán chạy nhất
 * @param {Object} params - { limit }
 * @returns {Promise<Array>} - Danh sách đồ uống bán chạy
 */
export async function getTopDrinks(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    console.log(`Fetching top drinks with query: ${query}`); // Debug query
    const res = await fetch(`${API_BASE}/do-uong/top-drinks?${query}`, {
      headers: getHeaders(false),
    });
    const result = await res.json();
    console.log('Top drinks response:', result); // Debug response
    if (!res.ok) {
      throw new Error(result.error || 'Lấy danh sách đồ uống bán chạy thất bại');
    }
    return result;
  } catch (error) {
    console.error('Error fetching top drinks:', error.message); // Debug error
    throw new Error(error.message || 'Lỗi hệ thống khi lấy danh sách đồ uống bán chạy');
  }
}

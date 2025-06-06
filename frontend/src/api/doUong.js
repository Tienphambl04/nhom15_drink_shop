const API_BASE = 'http://localhost:5000/api/do-uong'; 

// Lấy danh sách đồ uống theo danh mục
export async function getDoUongTheoDanhMuc(maDanhMuc) {
  const res = await fetch(`${API_BASE}/danh-muc/${maDanhMuc}`);
  if (!res.ok) throw new Error('Lấy đồ uống thất bại');
  const data = await res.json();
  return data.data; // mảng đồ uống
}

// Lấy thông tin đồ uống theo ID
export async function getDoUongTheoId(maDoUong) {
  const res = await fetch(`${API_BASE}/${maDoUong}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lấy đồ uống theo ID thất bại');
  }
  const data = await res.json();
  return data.data; // object đồ uống
}

// Thêm đồ uống mới (formData chứa dữ liệu + file ảnh)
export async function themDoUong(formData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Thêm đồ uống thất bại');
  }
  return await res.json();
}

// Sửa đồ uống (formData chứa dữ liệu cập nhật + file ảnh nếu có)
export async function suaDoUong(maDoUong, formData) {
  const res = await fetch(`${API_BASE}/${maDoUong}`, {
    method: 'PUT',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Cập nhật đồ uống thất bại');
  }
  return await res.json();
}

// Xóa đồ uống theo mã
export async function xoaDoUong(maDoUong) {
  const res = await fetch(`${API_BASE}/${maDoUong}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Xóa đồ uống thất bại');
  }
  return await res.json();
} 

// Lấy danh sách tất cả đồ uống
export const layDanhSachDoUong = async () => {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error(`Lấy danh sách đồ uống thất bại`);
  return res.json();
};

// Tìm kiếm đồ uống theo tên (gần đúng)
export const searchDoUong = async (query) => {
  try {
    const drinks = await layDanhSachDoUong();
    if (!Array.isArray(drinks)) {
      throw new Error('Dữ liệu đồ uống không hợp lệ');
    }
    if (!query.trim()) {
      return [];
    }
    const normalizedQuery = query.toLowerCase().trim();
    return drinks.filter(drink =>
      drink.ten_do_uong.toLowerCase().includes(normalizedQuery)
    );
  } catch (error) {
    console.error('Lỗi khi tìm kiếm đồ uống:', error);
    throw new Error(error.message || 'Tìm kiếm đồ uống thất bại');
  }
};
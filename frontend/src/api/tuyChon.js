const API_BASE = 'http://localhost:5000/api/tuy-chon';

// Lấy danh sách tùy chọn theo mã đồ uống
export async function fetchTuyChonByDoUong(maDoUong) {
  const res = await fetch(`${API_BASE}/${maDoUong}`);
  if (!res.ok) throw new Error('Lấy tùy chọn thất bại');
  const result = await res.json();
  return result?.data || [];
}

// Thêm tùy chọn mới
export async function themTuyChon({ ma_do_uong, loai_tuy_chon, gia_tri, gia_them }) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ma_do_uong, loai_tuy_chon, gia_tri, gia_them }),
  });
  if (!res.ok) throw new Error('Thêm tùy chọn thất bại');
  return await res.json();
}

// Sửa tùy chọn theo ID
export async function suaTuyChon(id, { loai_tuy_chon, gia_tri, gia_them }) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loai_tuy_chon, gia_tri, gia_them }),
  });
  if (!res.ok) throw new Error('Sửa tùy chọn thất bại');
  return await res.json();
}

// Xóa tùy chọn theo ID
export async function xoaTuyChon(maTuyChon) {
  const res = await fetch(`${API_BASE}/${maTuyChon}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Xóa tùy chọn thất bại');
  return await res.json();
}

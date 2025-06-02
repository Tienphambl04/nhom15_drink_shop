const API_BASE = 'http://localhost:5000/api/danh-muc';

export async function fetchDanhSachDanhMuc() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Lấy danh sách danh mục thất bại');
  return await res.json(); // Giả sử server trả về mảng danh mục
}

export async function themDanhMuc(tenDanhMuc) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ ten_danh_muc: tenDanhMuc }),
  });
  if (!res.ok) throw new Error('Thêm danh mục thất bại');
  return await res.json();
}

export async function suaDanhMuc(maDanhMuc, tenDanhMucMoi) {
  const res = await fetch(`${API_BASE}/${maDanhMuc}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ ten_danh_muc: tenDanhMucMoi }),
  });
  if (!res.ok) throw new Error('Sửa danh mục thất bại');
  return await res.json();
}

export async function xoaDanhMuc(maDanhMuc) {
  const res = await fetch(`${API_BASE}/${maDanhMuc}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Xóa danh mục thất bại');
  return await res.json();
}

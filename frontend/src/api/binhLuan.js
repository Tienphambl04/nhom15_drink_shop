
import { getToken } from './auth';

const API_BASE = 'http://localhost:5000/api/binh-luan';

function getHeaders(isJson = true) {
  const token = getToken();
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getBinhLuanTheoDoUong(maDoUong) {
  const res = await fetch(`${API_BASE}/do-uong/${maDoUong}`, {
    headers: getHeaders(false),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Lấy bình luận thất bại');
  }
  const data = await res.json();
  return data.data;
}

export async function themBinhLuan(data) {
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ ...data, ma_nguoi_dung: maNguoiDung }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Thêm bình luận thất bại');
  }
  return await res.json();
}

export async function xoaBinhLuan(maBinhLuan) {
  const maNguoiDung = localStorage.getItem('ma_nguoi_dung');
  console.log('Sending xoaBinhLuan with maNguoiDung:', maNguoiDung); // Debug
  const res = await fetch(`${API_BASE}/${maBinhLuan}`, {
    method: 'DELETE',
    headers: getHeaders(true),
    body: JSON.stringify({ ma_nguoi_dung: maNguoiDung }),
  });
  if (!res.ok) {
    const err = await res.json();
    console.error('Xóa bình luận lỗi:', err); // Debug
    throw new Error(err.error || 'Xóa bình luận thất bại');
  }
  return await res.json();
}

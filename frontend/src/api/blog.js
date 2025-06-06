const API_URL = 'http://localhost:5000/api/blog';

// Lấy danh sách blog (có thể mở rộng phân trang, lọc)
export const layDanhSachBlog = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Lấy danh sách blog thất bại');
  return res.json();
};

// Lấy chi tiết blog theo id
export const layChiTietBlog = async (ma_blog) => {
  const res = await fetch(`${API_URL}/${ma_blog}`);
  if (!res.ok) throw new Error('Lấy chi tiết blog thất bại');
  return res.json();
};

// Thêm blog (upload ảnh)
export const themBlog = async (formData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: formData, // formData chứa file và các trường text
  });
  if (!res.ok) throw new Error('Thêm blog thất bại');
  return res.json();
};

// Sửa blog (có thể có file mới hoặc không)
export const suaBlog = async (ma_blog, formData) => {
  const res = await fetch(`${API_URL}/${ma_blog}`, {
    method: 'PUT',
    body: formData, // formData hoặc JSON (tùy backend hỗ trợ)
  });
  if (!res.ok) throw new Error('Cập nhật blog thất bại');
  return res.json();
};

// Xóa blog
export const xoaBlog = async (ma_blog) => {
  const res = await fetch(`${API_URL}/${ma_blog}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Xóa blog thất bại');
  return res.json();
};



import React, { useState } from 'react';
import { addUser } from '../../api/adminUser';

function AddUser() {
  const [formData, setFormData] = useState({
    ho_ten: '',
    ten_dang_nhap: '',
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    mat_khau: '',
    mat_khau_xac_nhan: '',
    vai_tro: 'khach',
  });

  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.mat_khau !== formData.mat_khau_xac_nhan) {
      alert('Mật khẩu xác nhận không khớp.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ.');
      return false;
    }
    // Optional: validate phone number format here nếu cần
    return true;
  };

  const resetForm = () => {
    setFormData({
      ho_ten: '',
      ten_dang_nhap: '',
      email: '',
      so_dien_thoai: '',
      dia_chi: '',
      mat_khau: '',
      mat_khau_xac_nhan: '',
      vai_tro: 'khach',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const payload = {
      ho_ten: formData.ho_ten.trim(),
      ten_dang_nhap: formData.ten_dang_nhap.trim(),
      email: formData.email.trim(),
      so_dien_thoai: formData.so_dien_thoai.trim(),
      dia_chi: formData.dia_chi.trim(),
      mat_khau: formData.mat_khau,
      vai_tro: formData.vai_tro,
    };

    try {
      const res = await addUser(payload, token);
      alert(res.message || 'Thêm người dùng thành công!');
      if (res.success) resetForm();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi thêm người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="adduser-section">
      <div className="adduser-container">
        <h2>Thêm Người Dùng</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ho_ten">Họ và tên *</label>
            <input
              type="text"
              id="ho_ten"
              name="ho_ten"
              value={formData.ho_ten}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ten_dang_nhap">Tên đăng nhập *</label>
            <input
              type="text"
              id="ten_dang_nhap"
              name="ten_dang_nhap"
              value={formData.ten_dang_nhap}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="so_dien_thoai">Số điện thoại</label>
            <input
              type="tel"
              id="so_dien_thoai"
              name="so_dien_thoai"
              value={formData.so_dien_thoai}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dia_chi">Địa chỉ</label>
            <input
              type="text"
              id="dia_chi"
              name="dia_chi"
              value={formData.dia_chi}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mat_khau">Mật khẩu *</label>
            <input
              type="password"
              id="mat_khau"
              name="mat_khau"
              value={formData.mat_khau}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="mat_khau_xac_nhan">Xác nhận mật khẩu *</label>
            <input
              type="password"
              id="mat_khau_xac_nhan"
              name="mat_khau_xac_nhan"
              value={formData.mat_khau_xac_nhan}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="vai_tro">Vai trò *</label>
            <select
              id="vai_tro"
              name="vai_tro"
              value={formData.vai_tro}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="khach">Khách</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Đang thêm...' : 'Thêm người dùng'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddUser;

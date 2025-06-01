import React, { useState } from 'react';
import { registerUser } from '../../api/auth';
import './register.css';

function Register() {
  const [formData, setFormData] = useState({
    ho_ten: '',
    ten_dang_nhap: '',
    so_dien_thoai: '',
    email: '',
    dia_chi: '',
    mat_khau: '',
    mat_khau_xac_nhan: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.mat_khau !== formData.mat_khau_xac_nhan) {
      alert('Mật khẩu xác nhận không khớp.');
      return false;
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(formData.so_dien_thoai)) {
      alert('Số điện thoại không hợp lệ.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ.');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      ho_ten: '',
      ten_dang_nhap: '',
      so_dien_thoai: '',
      email: '',
      dia_chi: '',
      mat_khau: '',
      mat_khau_xac_nhan: '',
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    const payload = {
      ho_ten: formData.ho_ten.trim(),
      ten_dang_nhap: formData.ten_dang_nhap.trim(),
      so_dien_thoai: formData.so_dien_thoai.trim(),
      email: formData.email.trim(),
      dia_chi: formData.dia_chi.trim(),
      mat_khau: formData.mat_khau,
    };

    try {
      const result = await registerUser(payload);
      
      // Kiểm tra thành công - đa dạng các trường hợp
      if (result?.success || result?.status === 'success' || result?.code === 200 || !result?.error) {
        alert('Đăng ký thành công!');
        resetForm();
      } else {
        alert(result?.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra trong quá trình đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="register-section">
      <div className="register-container">
        <h2>THÔNG TIN CÁ NHÂN</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ho_ten">Họ và tên *</label>
            <input
              type="text"
              id="ho_ten"
              name="ho_ten"
              placeholder="Họ và tên"
              value={formData.ho_ten}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ten_dang_nhap">Tên đăng nhập *</label>
            <input
              type="text"
              id="ten_dang_nhap"
              name="ten_dang_nhap"
              placeholder="Tên đăng nhập"
              value={formData.ten_dang_nhap}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="so_dien_thoai">Số điện thoại *</label>
            <input
              type="tel"
              id="so_dien_thoai"
              name="so_dien_thoai"
              placeholder="Số điện thoại"
              value={formData.so_dien_thoai}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dia_chi">Địa chỉ</label>
            <input
              type="text"
              id="dia_chi"
              name="dia_chi"
              placeholder="Địa chỉ"
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
              placeholder="Mật khẩu"
              value={formData.mat_khau}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mat_khau_xac_nhan">Xác nhận mật khẩu *</label>
            <input
              type="password"
              id="mat_khau_xac_nhan"
              name="mat_khau_xac_nhan"
              placeholder="Xác nhận mật khẩu"
              value={formData.mat_khau_xac_nhan}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p>
          Bạn đã có tài khoản? <a href="/login">Đăng nhập tại đây</a>
        </p>

        <div className="social-login">
          <button className="facebook" onClick={() => window.location.href = "https://www.facebook.com/login"}>
            <img src="img/anh24.jpg" alt="Facebook" style={{ width: 20, height: 20, marginRight: 5 }} />
            Facebook
          </button>
          <button className="google" onClick={() => window.location.href = "https://accounts.google.com"}>
            <img src="img/anh23.png" alt="Google" style={{ width: 20, height: 20, marginRight: 5 }} />
            Google
          </button>
        </div>
      </div>
    </section>
  );
}

export default Register;
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

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (formData.mat_khau !== formData.mat_khau_xac_nhan) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!validatePhone(formData.so_dien_thoai)) {
      alert('Số điện thoại phải đúng 10 số.');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Email không hợp lệ.');
      return;
    }

    const payload = {
      ho_ten: formData.ho_ten,
      ten_dang_nhap: formData.ten_dang_nhap,
      so_dien_thoai: formData.so_dien_thoai,
      email: formData.email,
      dia_chi: formData.dia_chi,
      mat_khau: formData.mat_khau,
    };

    try {
      const result = await registerUser(payload);

      if (result.success) {
        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
        setFormData({
          ho_ten: '',
          ten_dang_nhap: '',
          so_dien_thoai: '',
          email: '',
          dia_chi: '',
          mat_khau: '',
          mat_khau_xac_nhan: '',
        });
      } else {
        alert(result.message || 'Đăng ký thất bại.');
      }
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra trong quá trình đăng ký.');
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
              required
            />
          </div>

          <button type="submit" className="login-btn">Đăng ký</button>
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

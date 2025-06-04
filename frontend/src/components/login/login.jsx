import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import './login.css';

function Login() {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const result = await loginUser({ ten_dang_nhap: tenDangNhap, mat_khau: matKhau });

      if (result.success && result.token && result.user) {
        if (result.user.trang_thai === 'bi_khoa') {
          setMessage('Tài khoản của bạn đang bị khóa, không thể đăng nhập.');
          return;
        }

        // Lưu thông tin vào localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('ten_dang_nhap', tenDangNhap);
        localStorage.setItem('vai_tro', result.user.vai_tro);
        localStorage.setItem('ma_nguoi_dung', result.user.ma_nguoi_dung);

        console.log('Login.js: localStorage set:', {
          token: localStorage.getItem('token'),
          ten_dang_nhap: localStorage.getItem('ten_dang_nhap'),
          vai_tro: localStorage.getItem('vai_tro'),
          ma_nguoi_dung: localStorage.getItem('ma_nguoi_dung'),
        });

        alert('Đăng nhập thành công!');
        if (result.user.vai_tro === 'admin') {
          window.location.assign('/admin/dashboard');
        } else {
          window.location.assign('/');
        }
      } else {
        setMessage(result.message || 'Sai tên đăng nhập hoặc mật khẩu!');
      }
    } catch (error) {
      setMessage('Lỗi khi đăng nhập. Vui lòng thử lại sau.');
      console.error('Lỗi đăng nhập:', error);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <h2>ĐĂNG NHẬP</h2>
        <p>Nếu bạn có một tài khoản, xin vui lòng đăng nhập</p>
        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tenDangNhap">Tên đăng nhập *</label>
            <input
              type="text"
              id="tenDangNhap"
              placeholder="Tên đăng nhập"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="matKhau">Mật khẩu *</label>
            <input
              type="password"
              id="matKhau"
              placeholder="Mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <p>
          Bạn chưa có tài khoản? <a href="/register">Đăng ký tại đây</a>
        </p>
        <p>
          Bạn quên mật khẩu? <a href="/reset-password">Lấy lại tại đây</a>
        </p>
      </div>
    </section>
  );
}

export default Login;
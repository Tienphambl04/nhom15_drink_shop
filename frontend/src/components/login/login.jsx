import React, { useState } from 'react';
import { loginUser } from '../../api/auth';  // Đường dẫn đúng với project của bạn
import './login.css';

function Login() {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginUser({ ten_dang_nhap: tenDangNhap, mat_khau: matKhau });

    if (result.token) {
      alert('Đăng nhập thành công!');
      // Ví dụ lưu token vào localStorage
      localStorage.setItem('token', result.token);
      setMessage('');
      // Có thể redirect hoặc cập nhật trạng thái đăng nhập ở đây
    } else {
      setMessage(result.message || 'Sai tên đăng nhập hoặc mật khẩu!');
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
        {message && <p style={{color: 'red'}}>{message}</p>}
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

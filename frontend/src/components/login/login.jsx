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
    const result = await loginUser({ ten_dang_nhap: tenDangNhap, mat_khau: matKhau });

    if (result.success) {
      alert('Đăng nhập thành công!');
      localStorage.setItem('token', result.token);
      localStorage.setItem('ten_dang_nhap', tenDangNhap);
      localStorage.setItem('vai_tro', result.user.vai_tro);
      setMessage('');
      if (result.user.vai_tro === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
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

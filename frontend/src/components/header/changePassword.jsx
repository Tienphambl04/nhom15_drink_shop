import React, { useState } from 'react';
import { changePassword } from '../../api/auth';
import './form.css';

function ChangePassword() {
  const [formData, setFormData] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    mat_khau_xac_nhan: '',
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const result = await changePassword(formData, token);
    if (result.success) {
      alert('Đổi mật khẩu thành công!');
    } else {
      alert(result.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        name="mat_khau_cu"
        type="password"
        value={formData.mat_khau_cu}
        onChange={handleChange}
        placeholder="Mật khẩu cũ"
      />
      <input
        name="mat_khau_moi"
        type="password"
        value={formData.mat_khau_moi}
        onChange={handleChange}
        placeholder="Mật khẩu mới"
      />
      <input
        name="mat_khau_xac_nhan"
        type="password"
        value={formData.mat_khau_xac_nhan}
        onChange={handleChange}
        placeholder="Xác nhận mật khẩu"
      />
      <button type="submit">Đổi mật khẩu</button>
    </form>
  );
}

export default ChangePassword;

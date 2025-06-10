import React, { useState } from 'react';
import { themDanhMuc } from '../../api/danh_muc';
import './themDanhMuc.css'; 

export default function ThemDanhMuc({ onAdded }) {
  const [tenDanhMuc, setTenDanhMuc] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!tenDanhMuc.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }
    try {
      const res = await themDanhMuc(tenDanhMuc);
      alert(res.message); // 
      setTenDanhMuc('');
      if (onAdded) onAdded();
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="drink-options-manager">
      <h3>Quản lý tùy chọn đồ uống</h3>
      <form onSubmit={handleSubmit} className="form-group">
        <label>
          Tên danh mục:
          <input
            type="text"
            className="input-field"
            value={tenDanhMuc}
            onChange={e => setTenDanhMuc(e.target.value)}
            placeholder="Tên danh mục"
          />
        </label>
        <div className="button-group">
          <button className="add-user-button" type="submit">
            Thêm danh mục
          </button>
        </div>
      </form>
     
    </div>
  );
}

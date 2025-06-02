import React, { useState } from 'react';
import { themDanhMuc } from '../../api/danh_muc';

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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={tenDanhMuc}
        onChange={e => setTenDanhMuc(e.target.value)}
        placeholder="Tên danh mục"
      />
      <button type="submit">Thêm danh mục</button>
    </form>
  );
}

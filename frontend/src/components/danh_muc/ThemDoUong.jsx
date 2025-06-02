import React, { useEffect, useState } from 'react';
import { fetchDanhSachDanhMuc } from '../../api/danh_muc';
import { themDoUong } from '../../api/doUong';

export default function ThemDoUong() {
  const [danhMucList, setDanhMucList] = useState([]);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState('');
  const [form, setForm] = useState({
    ten_do_uong: '',
    mo_ta: '',
    gia: '',
    giam_gia_phan_tram: '',
    hinh_anh: null,
    hien_thi: true,
  });

  useEffect(() => {
    fetchDanhSachDanhMuc()
      .then(res => setDanhMucList(res.data))
      .catch(err => alert('Lỗi tải danh mục: ' + err.message));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedDanhMuc) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('ma_danh_muc', selectedDanhMuc);
      formData.append('ten_do_uong', form.ten_do_uong);
      formData.append('mo_ta', form.mo_ta);
      formData.append('gia', form.gia);
      formData.append('giam_gia_phan_tram', form.giam_gia_phan_tram || 0);
      formData.append('hien_thi', form.hien_thi);
      if (form.hinh_anh) {
        formData.append('hinh_anh', form.hinh_anh);
      }

      const res = await themDoUong(formData);
      alert(res.message || 'Thêm đồ uống thành công');
      // Reset form
      setForm({
        ten_do_uong: '',
        mo_ta: '',
        gia: '',
        giam_gia_phan_tram: '',
        hinh_anh: null,
        hien_thi: true,
      });
      setSelectedDanhMuc('');
    } catch (err) {
      alert('Lỗi khi thêm đồ uống: ' + err.message);
    }
  }

  return (
    <div>
      <h2>Thêm đồ uống mới</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Chọn danh mục:</label>
          <select
            value={selectedDanhMuc}
            onChange={e => setSelectedDanhMuc(e.target.value)}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {danhMucList.map(dm => (
              <option key={dm.ma_danh_muc} value={dm.ma_danh_muc}>
                {dm.ten_danh_muc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Tên đồ uống"
            value={form.ten_do_uong}
            onChange={e => setForm({ ...form, ten_do_uong: e.target.value })}
            required
          />
        </div>

        <div>
          <textarea
            placeholder="Mô tả"
            value={form.mo_ta}
            onChange={e => setForm({ ...form, mo_ta: e.target.value })}
          />
        </div>

        <div>
          <input
            type="number"
            placeholder="Giá"
            value={form.gia}
            onChange={e => setForm({ ...form, gia: e.target.value })}
            required
          />
        </div>

        <div>
          <input
            type="number"
            placeholder="Giảm giá (%)"
            value={form.giam_gia_phan_tram}
            onChange={e => setForm({ ...form, giam_gia_phan_tram: e.target.value })}
          />
        </div>

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={e => setForm({ ...form, hinh_anh: e.target.files[0] })}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={form.hien_thi}
              onChange={e => setForm({ ...form, hien_thi: e.target.checked })}
            />
            Hiển thị
          </label>
        </div>

        <button type="submit">Thêm</button>
      </form>
    </div>
  );
}

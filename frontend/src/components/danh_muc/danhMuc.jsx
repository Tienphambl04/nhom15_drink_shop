import React, { useEffect, useState } from 'react';
import { fetchDanhSachDanhMuc, suaDanhMuc, xoaDanhMuc } from '../../api/danh_muc';
import { getDoUongTheoDanhMuc, suaDoUong, xoaDoUong } from '../../api/doUong';

export default function QuanLyDanhMucVaDoUong() {
  const [danhMuc, setDanhMuc] = useState([]);
  const [doUong, setDoUong] = useState([]);
  const [danhMucChon, setDanhMucChon] = useState(null);

  // State sửa danh mục
  const [editingId, setEditingId] = useState(null);
  const [tenMoi, setTenMoi] = useState('');

  // State sửa đồ uống
  const [editingDoUongId, setEditingDoUongId] = useState(null);
  const [doUongMoi, setDoUongMoi] = useState({
    ten_do_uong: '',
    gia: '',
    giam_gia_phan_tram: '',
    mo_ta: '',
    hien_thi: true,
    hinh_anh: null, // file ảnh mới (nếu có)
  });

  // Load danh mục
  useEffect(() => {
    loadDanhMuc();
  }, []);

  // Load đồ uống khi danh mục chọn thay đổi
  useEffect(() => {
    if (danhMucChon === null) {
      setDoUong([]);
      return;
    }
    getDoUongTheoDanhMuc(danhMucChon)
      .then(ds => setDoUong(ds))
      .catch(err => alert('Lỗi lấy đồ uống: ' + err.message));
  }, [danhMucChon]);

  async function loadDanhMuc() {
    try {
      const res = await fetchDanhSachDanhMuc();
      setDanhMuc(res.data);
      if (!danhMucChon && res.data.length > 0) {
        setDanhMucChon(res.data[0].ma_danh_muc);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  // Sửa danh mục
  async function handleSuaDanhMuc(maDanhMuc) {
    if (!tenMoi.trim()) {
      alert('Tên danh mục không được để trống');
      return;
    }
    try {
      const res = await suaDanhMuc(maDanhMuc, tenMoi);
      alert(res.message);
      setEditingId(null);
      setTenMoi('');
      loadDanhMuc();
    } catch (error) {
      alert(error.message);
    }
  }

  // Xóa danh mục
  async function handleXoaDanhMuc(maDanhMuc) {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const res = await xoaDanhMuc(maDanhMuc);
      alert(res.message);
      if (maDanhMuc === danhMucChon) setDanhMucChon(null);
      loadDanhMuc();
    } catch (error) {
      alert(error.message);
    }
  }

  // Bắt đầu sửa đồ uống: fill dữ liệu vào form sửa
  function handleEditDoUong(doUong) {
    setEditingDoUongId(doUong.ma_do_uong);
    setDoUongMoi({
      ten_do_uong: doUong.ten_do_uong,
      gia: doUong.gia,
      giam_gia_phan_tram: doUong.giam_gia_phan_tram,
      mo_ta: doUong.mo_ta,
      hien_thi: doUong.hien_thi,
      hinh_anh: null, // reset ảnh mới
    });
  }

  // Hủy sửa đồ uống
  function handleCancelEditDoUong() {
    setEditingDoUongId(null);
    setDoUongMoi({
      ten_do_uong: '',
      gia: '',
      giam_gia_phan_tram: '',
      mo_ta: '',
      hien_thi: true,
      hinh_anh: null,
    });
  }

  // Xử lý khi chọn file ảnh mới
  function handleChangeFile(e) {
    const file = e.target.files[0];
    setDoUongMoi(prev => ({ ...prev, hinh_anh: file || null }));
  }

  // Lưu sửa đồ uống (gửi formData)
  async function handleSaveDoUong(maDoUong) {
    if (!doUongMoi.ten_do_uong.trim()) {
      alert('Tên đồ uống không được để trống');
      return;
    }
    if (isNaN(doUongMoi.gia) || doUongMoi.gia <= 0) {
      alert('Giá phải là số lớn hơn 0');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('ten_do_uong', doUongMoi.ten_do_uong);
      formData.append('gia', doUongMoi.gia);
      formData.append('giam_gia_phan_tram', doUongMoi.giam_gia_phan_tram || 0);
      formData.append('mo_ta', doUongMoi.mo_ta);
      formData.append('hien_thi', doUongMoi.hien_thi ? '1' : '0');
      if (doUongMoi.hinh_anh) {
        formData.append('hinh_anh', doUongMoi.hinh_anh);
      }

      const res = await suaDoUong(maDoUong, formData);
      alert(res.message);
      setEditingDoUongId(null);

      // Reload đồ uống
      const ds = await getDoUongTheoDanhMuc(danhMucChon);
      setDoUong(ds);
    } catch (error) {
      alert(error.message);
    }
  }

  // Xóa đồ uống
  async function handleDeleteDoUong(maDoUong) {
    if (!window.confirm('Bạn có chắc muốn xóa đồ uống này?')) return;
    try {
      const res = await xoaDoUong(maDoUong);
      alert(res.message);
      // Reload đồ uống
      const ds = await getDoUongTheoDanhMuc(danhMucChon);
      setDoUong(ds);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 30 }}>
      {/* Danh mục */}
      <div style={{ flex: '1 1 300px' }}>
        <h2>Danh sách danh mục</h2>
        <ul>
          {danhMuc.map(dm => (
            <li
              key={dm.ma_danh_muc}
              style={{
                cursor: 'pointer',
                backgroundColor: danhMucChon === dm.ma_danh_muc ? '#d0f0fd' : 'transparent',
                padding: '8px',
                borderRadius: 4,
              }}
              onClick={() => setDanhMucChon(dm.ma_danh_muc)}
            >
              {editingId === dm.ma_danh_muc ? (
                <>
                  <input
                    type="text"
                    value={tenMoi}
                    onChange={e => setTenMoi(e.target.value)}
                    placeholder="Tên danh mục mới"
                  />
                  <button onClick={() => handleSuaDanhMuc(dm.ma_danh_muc)}>Lưu</button>
                  <button onClick={() => { setEditingId(null); setTenMoi(''); }}>Hủy</button>
                </>
              ) : (
                <>
                  {dm.ten_danh_muc}{' '}
                  <button onClick={e => { e.stopPropagation(); setEditingId(dm.ma_danh_muc); setTenMoi(dm.ten_danh_muc); }}>Sửa</button>
                  <button onClick={e => { e.stopPropagation(); handleXoaDanhMuc(dm.ma_danh_muc); }}>Xóa</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Đồ uống */}
      <div style={{ flex: '2 1 600px' }}>
        <h2>Đồ uống trong danh mục: {danhMuc.find(dm => dm.ma_danh_muc === danhMucChon)?.ten_danh_muc || 'Chưa chọn'}</h2>
        {!danhMucChon && <p>Vui lòng chọn danh mục bên trái để xem đồ uống.</p>}

        <ul>
          {doUong.map(d => (
            <li key={d.ma_do_uong} style={{ marginBottom: 20, borderBottom: '1px solid #ccc', paddingBottom: 10 }}>
              {editingDoUongId === d.ma_do_uong ? (
                <>
                  <input
                    type="text"
                    value={doUongMoi.ten_do_uong}
                    onChange={e => setDoUongMoi({ ...doUongMoi, ten_do_uong: e.target.value })}
                    placeholder="Tên đồ uống"
                  />
                  <input
                    type="number"
                    value={doUongMoi.gia}
                    onChange={e => setDoUongMoi({ ...doUongMoi, gia: e.target.value })}
                    placeholder="Giá"
                  />
                  <input
                    type="number"
                    value={doUongMoi.giam_gia_phan_tram}
                    onChange={e => setDoUongMoi({ ...doUongMoi, giam_gia_phan_tram: e.target.value })}
                    placeholder="Giảm giá %"
                    min="0"
                    max="100"
                  />
                  <input
                    type="text"
                    value={doUongMoi.mo_ta}
                    onChange={e => setDoUongMoi({ ...doUongMoi, mo_ta: e.target.value })}
                    placeholder="Mô tả"
                  />
                  <label>
                    Hiển thị:
                    <input
                      type="checkbox"
                      checked={doUongMoi.hien_thi}
                      onChange={e => setDoUongMoi({ ...doUongMoi, hien_thi: e.target.checked })}
                    />
                  </label>
                  <br />
                  <label>
                    Ảnh mới:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleChangeFile}
                    />
                  </label>
                  <br />
                  <button onClick={() => handleSaveDoUong(d.ma_do_uong)}>Lưu</button>
                  <button onClick={handleCancelEditDoUong}>Hủy</button>
                </>
              ) : (
                <>
                  <h3>{d.ten_do_uong}</h3>
                  <p>Giá: {Number(d.gia).toLocaleString()} VNĐ</p>
                  <p>Giảm giá: {d.giam_gia_phan_tram || 0}%</p>
                  <p style={{ color: 'red', fontWeight: 'bold' }}>
                    Giá bán: {(d.gia * (1 - (d.giam_gia_phan_tram || 0) / 100)).toLocaleString()} VNĐ
                  </p>
                  <p>Mô tả: {d.mo_ta}</p>
                  {d.hinh_anh && (
                    <img
                      src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                      alt={d.ten_do_uong}
                      style={{ width: 150, marginTop: 10 }}
                    />
                  )}
                  <p>Hiển thị: {d.hien_thi ? 'Có' : 'Không'}</p>
                  <button onClick={() => handleEditDoUong(d)}>Sửa</button>
                  <button onClick={() => handleDeleteDoUong(d.ma_do_uong)}>Xóa</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

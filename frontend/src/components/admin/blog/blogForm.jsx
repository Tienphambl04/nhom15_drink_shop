import React, { useState, useEffect } from 'react';
import { layDanhSachDoUong } from '../../../api/doUong';
import { themBlog, suaBlog } from '../../../api/blog';
import './blogForm.css';

function BlogForm({ blogEdit = null, onSuccess }) {
  const isEdit = !!blogEdit;
  const [form, setForm] = useState({
    tieu_de: '',
    noi_dung: '',
    ma_do_uong: '',
    hien_thi: true,
  });
  const [file, setFile] = useState(null);
  const [doUongList, setDoUongList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDoUong = async () => {
      try {
        const ds = await layDanhSachDoUong();
        setDoUongList(ds);
      } catch {
        alert('Lấy danh sách đồ uống thất bại!');
      }
    };
    fetchDoUong();
  }, []);

  useEffect(() => {
    if (isEdit && blogEdit) {
      setForm({
        tieu_de: blogEdit.tieu_de || '',
        noi_dung: blogEdit.noi_dung || '',
        ma_do_uong: blogEdit.ma_do_uong || '',
        hien_thi: blogEdit.hien_thi ?? true,
      });
    }
  }, [isEdit, blogEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tieu_de || !form.noi_dung || !form.ma_do_uong) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const formData = new FormData();
    formData.append('tieu_de', form.tieu_de);
    formData.append('noi_dung', form.noi_dung);
    formData.append('ma_do_uong', form.ma_do_uong);
    formData.append('hien_thi', form.hien_thi);
    if (file) formData.append('hinh_anh', file);

    setLoading(true);
    try {
      if (isEdit) {
        await suaBlog(blogEdit.ma_blog, formData);
        alert('Cập nhật blog thành công!');
      } else {
        if (!file) {
          alert('Vui lòng chọn ảnh cho blog');
          return;
        }
        await themBlog(formData);
        alert('Thêm blog thành công!');
      }

      setForm({
        tieu_de: '',
        noi_dung: '',
        ma_do_uong: '',
        hien_thi: true,
      });
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.message || (isEdit ? 'Cập nhật thất bại!' : 'Thêm blog thất bại!'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <label>
        Tiêu đề:
        <input
          type="text"
          name="tieu_de"
          value={form.tieu_de}
          onChange={handleChange}
          required
          placeholder="Nhập tiêu đề"
        />
      </label>

      <label>
        Nội dung:
        <textarea
          name="noi_dung"
          value={form.noi_dung}
          onChange={handleChange}
          required
          placeholder="Nhập nội dung"
        />
      </label>

      <label>
        Đồ uống:
        <select
          name="ma_do_uong"
          value={form.ma_do_uong}
          onChange={handleChange}
          required
        >
          <option value="">-- Chọn đồ uống --</option>
          {doUongList.map((item) => (
            <option key={item.ma_do_uong} value={item.ma_do_uong}>
              {item.ten_do_uong}
            </option>
          ))}
        </select>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="hien_thi"
          checked={form.hien_thi}
          onChange={handleChange}
        />
        Hiển thị
      </label>

      <label>
        Ảnh blog:
        <input type="file" accept="image/*" onChange={handleFileChange} {...(!isEdit && { required: true })} />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Đang gửi...' : isEdit ? 'Cập nhật blog' : 'Thêm blog'}
      </button>
    </form>
  );
}

export default BlogForm;

import React, { useEffect, useState } from 'react';
import { layDanhSachPhanHoi, capNhatDaDoc } from '../../../api/lienHeApi';
import { useNavigate } from 'react-router-dom';
import './contactList.css';

const ContactList = () => {
  const [phanHoiList, setPhanHoiList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('tat_ca'); // 'tat_ca', 'chua_doc', 'da_doc'
  const navigate = useNavigate();
  const vaiTro = localStorage.getItem('vai_tro');

  useEffect(() => {
    if (vaiTro !== 'admin') {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    } else {
      fetchData();
    }
  }, [vaiTro, navigate]);

  const fetchData = async () => {
    const data = await layDanhSachPhanHoi();
    setPhanHoiList(data);
  };

  const handleSelect = async (item) => {
    if (!item.da_doc) {
      await capNhatDaDoc(item.ma_lien_he);
    }
    setSelected(item);
    fetchData();
  };

  const filteredList = phanHoiList.filter((item) => {
    if (filter === 'chua_doc') return item.da_doc === 0 || item.da_doc === false;
    if (filter === 'da_doc') return item.da_doc === 1 || item.da_doc === true;
    return true; // tất cả
  });

  return (
    <div className="contact-list-container">
      <h2>Danh sách phản hồi từ người dùng</h2>

      <div className="filter-bar">
        <label>Lọc: </label>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
          className="filter-dropdown"
        >
          <option value="tat_ca">Tất cả</option>
          <option value="chua_doc">Chưa đọc</option>
          <option value="da_doc">Đã đọc</option>
        </select>
      </div>

      <table className="contact-table">
        <thead>
          <tr>
            <th>#</th><th>Tên</th><th>Email</th><th>Chủ đề</th><th>Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 ? (
            <tr><td colSpan="5">Không có phản hồi nào</td></tr>
          ) : (
            filteredList.map((item, index) => (
              <tr
                key={item.ma_lien_he}
                className={item.da_doc ? '' : 'chua-doc'}
                onClick={() => handleSelect(item)}
              >
                <td>{index + 1}</td>
                <td>{item.ten}</td>
                <td>{item.email}</td>
                <td>{item.chu_de}</td>
                <td>{new Date(item.ngay_gui).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selected && (
        <div className="chi-tiet-phan-hoi">
          <h3>Chi tiết phản hồi</h3>
          <p><strong>Tên:</strong> {selected.ten}</p>
          <p><strong>Email:</strong> {selected.email}</p>
          <p><strong>Chủ đề:</strong> {selected.chu_de}</p>
          <p><strong>Nội dung:</strong><br />{selected.noi_dung}</p>
          <p><strong>Ngày gửi:</strong> {new Date(selected.ngay_gui).toLocaleString()}</p>
          <button
            onClick={() => setSelected(null)}
            className="close-button"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactList;

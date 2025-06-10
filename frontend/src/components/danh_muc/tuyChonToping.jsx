import React, { useEffect, useState } from 'react';
import { fetchDanhSachDanhMuc } from '../../api/danh_muc';
import { getDoUongTheoDanhMuc } from '../../api/doUong';
import { fetchTuyChonByDoUong, themTuyChon, xoaTuyChon, suaTuyChon } from '../../api/tuyChon';
import './tuyChonToping.css';

export default function DrinkOptionsManager() {
  const [danhMucList, setDanhMucList] = useState([]);
  const [doUongList, setDoUongList] = useState([]);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState('');
  const [selectedDoUong, setSelectedDoUong] = useState('');
  const [tuyChonList, setTuyChonList] = useState([]);

  const [optionInputs, setOptionInputs] = useState([
    { loai_tuy_chon: '', gia_tri: '', gia_them: 0 }
  ]);

  const [editingOptions, setEditingOptions] = useState({});

  // Load danh mục
  useEffect(() => {
    fetchDanhSachDanhMuc()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.data || [];
        setDanhMucList(data);
        if (data.length > 0) setSelectedDanhMuc(data[0].ma_danh_muc);
      })
      .catch(err => alert('Lỗi tải danh mục: ' + err.message));
  }, []);

  // Load đồ uống theo danh mục
  useEffect(() => {
    if (!selectedDanhMuc) {
      setDoUongList([]);
      setSelectedDoUong('');
      return;
    }
    getDoUongTheoDanhMuc(selectedDanhMuc)
      .then(res => {
        const data = Array.isArray(res) ? res : res?.data || [];
        setDoUongList(data);
        setSelectedDoUong('');
        setTuyChonList([]);
        setOptionInputs([{ loai_tuy_chon: '', gia_tri: '', gia_them: 0 }]);
      })
      .catch(err => alert('Lỗi tải đồ uống: ' + err.message));
  }, [selectedDanhMuc]);

  // Load tùy chọn khi đồ uống thay đổi
  useEffect(() => {
    if (!selectedDoUong) {
      setTuyChonList([]);
      setOptionInputs([{ loai_tuy_chon: '', gia_tri: '', gia_them: 0 }]);
      setEditingOptions({});
      return;
    }
    fetchTuyChonByDoUong(selectedDoUong)
      .then(data => {
        setTuyChonList(data);
        setEditingOptions({});
      })
      .catch(err => alert('Lỗi tải tùy chọn: ' + err.message));
  }, [selectedDoUong]);

  function addOptionInput() {
    setOptionInputs([...optionInputs, { loai_tuy_chon: '', gia_tri: '', gia_them: 0 }]);
  }

  function removeOptionInput(index) {
    if (optionInputs.length === 1) return; 
    const newInputs = optionInputs.filter((_, i) => i !== index);
    setOptionInputs(newInputs);
  }

  function handleOptionChange(index, field, value) {
    const newInputs = [...optionInputs];
    newInputs[index][field] = value;
    if (field === 'loai_tuy_chon') {
      newInputs[index]['gia_tri'] = '';
    }
    setOptionInputs(newInputs);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!selectedDoUong) {
      alert('Vui lòng chọn đồ uống!');
      return;
    }

    for (let i = 0; i < optionInputs.length; i++) {
      const { loai_tuy_chon, gia_tri } = optionInputs[i];
      if (!loai_tuy_chon || !gia_tri) {
        alert(`Vui lòng điền đầy đủ thông tin cho tùy chọn thứ ${i + 1}`);
        return;
      }
    }

    try {
      for (const option of optionInputs) {
        await themTuyChon({
          ma_do_uong: selectedDoUong,
          loai_tuy_chon: option.loai_tuy_chon,
          gia_tri: option.gia_tri,
          gia_them: Number(option.gia_them) || 0,
        });
      }
      alert('Thêm tùy chọn thành công!');

      const updatedList = await fetchTuyChonByDoUong(selectedDoUong);
      setTuyChonList(updatedList);

      setOptionInputs([{ loai_tuy_chon: '', gia_tri: '', gia_them: 0 }]);
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể thêm tùy chọn'));
    }
  }

  async function handleDeleteOption(id) {
    if (!window.confirm('Bạn có chắc muốn xóa tùy chọn này?')) return;
    try {
      await xoaTuyChon(id);
      setTuyChonList(tuyChonList.filter(tc => tc.ma_tuy_chon !== id));
      alert('Xóa tùy chọn thành công!');
      setEditingOptions(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      alert('Lỗi xóa tùy chọn: ' + err.message);
    }
  }

  function startEditOption(tc) {
    if (editingOptions.hasOwnProperty(tc.ma_tuy_chon)) {
        // If already editing, save the changes
        saveEditOption(tc.ma_tuy_chon);
    } else {
        // Start editing
        setEditingOptions(prev => ({
            ...prev,
            [tc.ma_tuy_chon]: {
                loai_tuy_chon: tc.loai_tuy_chon,
                gia_tri: tc.gia_tri,
                gia_them: tc.gia_them,
            }
        }));
    }
  }

  function cancelEditOption(id) {
    setEditingOptions(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }

  function handleEditChange(id, field, value) {
    setEditingOptions(prev => {
      const newEdit = { ...prev };
      if (field === 'loai_tuy_chon') {
        newEdit[id] = {
          ...newEdit[id],
          loai_tuy_chon: value,
          gia_tri: '', 
        };
      } else {
        newEdit[id] = {
          ...newEdit[id],
          [field]: value,
        };
      }
      return newEdit;
    });
  }

  async function saveEditOption(id) {
    const data = editingOptions[id];
    if (!data) return;

    if (!data.loai_tuy_chon || !data.gia_tri) {
      alert('Vui lòng điền đầy đủ thông tin khi sửa tùy chọn!');
      return;
    }

    try {
      await suaTuyChon(id, {
        loai_tuy_chon: data.loai_tuy_chon,
        gia_tri: data.gia_tri,
        gia_them: Number(data.gia_them) || 0,
      });

      alert('Sửa tùy chọn thành công!');
      const updatedList = await fetchTuyChonByDoUong(selectedDoUong);
      setTuyChonList(updatedList);

      cancelEditOption(id);
    } catch (err) {
      alert('Lỗi sửa tùy chọn: ' + (err.message || 'Không thể sửa tùy chọn'));
    }
  }

  return (
    <div className="drink-options-manager">
      <h3>Quản lý tùy chọn đồ uống</h3>

      <label>
        Chọn danh mục:
        <select value={selectedDanhMuc} onChange={e => setSelectedDanhMuc(e.target.value)} required>
          <option value="">-- Chọn danh mục --</option>
          {danhMucList.map(dm => (
            <option key={dm.ma_danh_muc} value={dm.ma_danh_muc}>
              {dm.ten_danh_muc}
            </option>
          ))}
        </select>
      </label>

      <br />

      <label>
        Chọn đồ uống:
        <select
          value={selectedDoUong}
          onChange={e => setSelectedDoUong(e.target.value)}
          disabled={!doUongList.length}
          required
        >
          <option value="">-- Chọn đồ uống --</option>
          {doUongList.map(du => (
            <option key={du.ma_do_uong} value={du.ma_do_uong}>
              {du.ten_do_uong}
            </option>
          ))}
        </select>
      </label>

      {selectedDoUong && (
        <>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
            <h4>Thêm nhiều tùy chọn</h4>
            {optionInputs.map((option, idx) => (
              <div
                key={idx}
                className="option-input-group"
                style={{
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              >
                <label>
                  Loại tùy chọn:
                  <select
                    value={option.loai_tuy_chon}
                    onChange={e => handleOptionChange(idx, 'loai_tuy_chon', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn loại --</option>
                    <option value="size">Size</option>
                    <option value="sugar">Đường</option>
                    <option value="ice">Đá</option>
                    <option value="topping">Topping</option>
                  </select>
                </label>

                <br />

                <label>
                  Giá trị:
                  <select
                    value={option.gia_tri}
                    onChange={e => handleOptionChange(idx, 'gia_tri', e.target.value)}
                    required
                  >
                    <option value="">-- Chọn giá trị --</option>
                    {(option.loai_tuy_chon === 'size' && (
                      <>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                      </>
                    )) ||
                      (option.loai_tuy_chon === 'sugar' && (
                        <>
                          <option value="0%">0 đường</option>
                          <option value="50%">1/2 đường</option>
                          <option value="100%">Nguyên bản</option>
                        </>
                      )) ||
                      (option.loai_tuy_chon === 'ice' && (
                        <>
                          <option value="Nóng">Nóng</option>
                          <option value="Lạnh">Lạnh</option>
                        </>
                      )) ||
                      (option.loai_tuy_chon === 'topping' && (
                        <>
                          <option value="Thạch">Thạch</option>
                          <option value="Trân châu">Trân châu</option>
                          <option value="Pudding">Pudding</option>
                          <option value="Kem cheese">Kem cheese</option>
                        </>
                      ))}
                  </select>
                </label>

                <br />

                <label>
                  Giá thêm (VNĐ):
                  <input
                    type="number"
                    min="0"
                    value={option.gia_them}
                    onChange={e => handleOptionChange(idx, 'gia_them', e.target.value)}
                  />
                </label>

                <br />

                <div className="button-group">
                    <button 
                        type="button" 
                        className="remove-option-button" 
                        onClick={() => removeOptionInput(idx)} 
                        disabled={optionInputs.length === 1}
                    >
                        Xóa tùy chọn này
                    </button>
                    <button className="add-option-button" onClick={addOptionInput}>
                        Thêm tùy chọn mới
                    </button>
                    <button className="add-user-button" type="submit">
                        Thêm tùy chọn
                    </button>
                </div>
              </div>
            ))}
          </form>

          <h4 style={{ marginTop: '2rem' }}>Danh sách tùy chọn hiện có</h4>

          {tuyChonList.length === 0 ? (
            <p>Chưa có tùy chọn nào.</p>
          ) : (
            <table border="1" cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>Loại tùy chọn</th>
                  <th>Giá trị</th>
                  <th>Giá thêm (VNĐ)</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tuyChonList.map(tc => {
                  const isEditing = editingOptions.hasOwnProperty(tc.ma_tuy_chon);
                  return (
                    <tr key={tc.ma_tuy_chon}>
                      <td>{tc.loai_tuy_chon}</td>
                      <td>{tc.gia_tri}</td>
                      <td>{tc.gia_them}</td>
                      <td>
                        <button className="edit-button" onClick={() => startEditOption(tc)}>
                          {isEditing ? 'Lưu' : 'Sửa'}
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteOption(tc.ma_tuy_chon)}>Xóa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

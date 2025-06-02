import React, { useState, useEffect } from 'react';
import { getUsers, resetUserPassword, toggleUserStatus, deleteUser } from '../../api/adminUser';

function UserList() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    async function fetchUsers() {
      const res = await getUsers(token);
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        console.error(res.message || 'Lấy danh sách người dùng thất bại');
        setUsers([]);
      }
    }
    fetchUsers();
  }, [token]);

  const handleResetPassword = async (userId) => {
  const confirmReset = window.confirm('Bạn có chắc muốn reset mật khẩu về mặc định là "123456" không?');
  if (!confirmReset) return;

  const res = await resetUserPassword(userId, {}, token); 
  alert(res.message || (res.success ? 'Đổi mật khẩu thành công' : 'Đổi mật khẩu thất bại'));
};


  const handleToggleStatus = async (userId) => {
    const res = await toggleUserStatus(userId, token);
    if (res.success) {
      setUsers(users.map(user =>
        user.ma_nguoi_dung === userId
          ? { ...user, trang_thai: user.trang_thai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong' }
          : user
      ));
    }
    alert(res.message);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Xác nhận xóa người dùng này?')) return;

    const res = await deleteUser(userId, token);
    if (res.success) {
      setUsers(users.filter(user => user.ma_nguoi_dung !== userId));
    }
    alert(res.message);
  };

  return (
    <div>
      <h2>Danh sách người dùng</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr><td colSpan="9">Không có người dùng nào</td></tr>
          ) : (
            users.map(user => (
              <tr key={user.ma_nguoi_dung}>
                <td>{user.ma_nguoi_dung}</td>
                <td>{user.ten_dang_nhap}</td>
                <td>{user.ho_ten}</td>
                <td>{user.email}</td>
                <td>{user.so_dien_thoai || '-'}</td>
                <td>{user.dia_chi || '-'}</td>
                <td>{user.vai_tro}</td>
                <td>{user.trang_thai}</td>
                <td>
                  <button onClick={() => handleResetPassword(user.ma_nguoi_dung)}>Reset MK</button>
                  <button onClick={() => handleToggleStatus(user.ma_nguoi_dung)}>
                    {user.trang_thai === 'hoat_dong' ? 'Khóa' : 'Mở khóa'}
                  </button>
                  <button onClick={() => handleDelete(user.ma_nguoi_dung)}>Xóa</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;

 import React, { useState, useEffect } from 'react';
 import { getUsers, resetUserPassword, toggleUserStatus, deleteUser } from '../../api/adminUser';

   function UserList() {
     const [users, setUsers] = useState([]);
     const token = localStorage.getItem('token');

     useEffect(() => {
       getUsers(token).then(res => {
         if (res.success) setUsers(res.data);
         else console.error(res.message);
       });
     }, [token]);

     const handleResetPassword = async (userId) => {
       const newPassword = prompt('Nhập mật khẩu mới:');
       if (newPassword) {
         const res = await resetUserPassword(userId, { mat_khau_moi: newPassword }, token);
         alert(res.message);
       }
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
       if (window.confirm('Xác nhận xóa?')) {
         const res = await deleteUser(userId, token);
         if (res.success) setUsers(users.filter(user => user.ma_nguoi_dung !== userId));
         alert(res.message);
       }
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
               <th>Vai trò</th>
               <th>Trạng thái</th>
               <th>Hành động</th>
             </tr>
           </thead>
           <tbody>
             {users.map(user => (
               <tr key={user.ma_nguoi_dung}>
                 <td>{user.ma_nguoi_dung}</td>
                 <td>{user.ten_dang_nhap}</td>
                 <td>{user.ho_ten}</td>
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
             ))}
           </tbody>
         </table>
       </div>
     );
   }

   export default UserList;
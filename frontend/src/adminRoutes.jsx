import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/adminDashboard';
import UserList from './components/user/userList';
import AddUser from './components/user/addUser';
import DanhSachDanhMuc from './components/danh_muc/danhMuc';
import ThemDanhMuc from './components/danh_muc/themDanhMuc';

import ThemDoUong from './components/danh_muc/ThemDoUong';
// import BlogList from './pages/admin/BlogList';
// import AddBlog from './pages/admin/AddBlog';
// import OrderList from './pages/admin/OrderList';
// import ContactList from './pages/admin/ContactList';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route path="users" element={<UserList />} />
        <Route path="users/add" element={<AddUser />} />
        
        <Route path="danh-muc" element={<DanhSachDanhMuc />} />
        <Route path="danh-muc/add" element={<ThemDanhMuc />} />

        <Route path="do-uong/add" element={<ThemDoUong />} />
        {/* <Route path="blogs" element={<BlogList />} />
        <Route path="blogs/add" element={<AddBlog />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="contacts" element={<ContactList />} /> */}
      </Route>
    </Routes>
  );
}

export default AdminRoutes;

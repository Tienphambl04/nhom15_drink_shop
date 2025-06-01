import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/adminDashboard';
import UserList from './components/user/userList';
import AddUser from './components/user/addUser';
// import CategoryList from '../pages/admin/CategoryList';
// import AddCategory from '../pages/admin/AddCategory';
// import AddDrink from '../pages/admin/AddDrink';
// import BlogList from '../pages/admin/BlogList';
// import AddBlog from '../pages/admin/AddBlog';
// import OrderList from '../pages/admin/OrderList';
// import ContactList from '../pages/admin/ContactList';

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminDashboard />}>
        <Route path="users" element={<UserList />} />
        <Route path="users/add" element={<AddUser />} />
        {/* <Route path="categories" element={<CategoryList />} />
        <Route path="categories/add" element={<AddCategory />} />
        <Route path="drinks/add" element={<AddDrink />} />
        <Route path="blogs" element={<BlogList />} />
        <Route path="blogs/add" element={<AddBlog />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="contacts" element={<ContactList />} /> */}
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
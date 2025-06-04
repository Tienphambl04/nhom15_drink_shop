import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './adminSidebar.css';

function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState({
    users: false,
    categories: false,
    blogs: false,
    orders: false,
    contacts: false,
  });

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <nav className="admin-sidebar">
      <h2>Quản Trị Viên</h2>
      <ul>
        <li>
          <div className="menu-header" onClick={() => toggleMenu('users')}>
            <span>Quản lí người dùng</span>
            <span className="toggle-icon">{openMenus.users ? '−' : '+'}</span>
          </div>
          {openMenus.users && (
            <ul className="submenu">
              <li>
                <NavLink to="/admin/users" activeClassName="active">Danh sách người dùng</NavLink>
              </li>
              <li>
                <NavLink to="/admin/users/add" activeClassName="active">Thêm người dùng</NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div className="menu-header" onClick={() => toggleMenu('categories')}>
            <span>Quản lí danh mục</span>
            <span className="toggle-icon">{openMenus.categories ? '−' : '+'}</span>
          </div>
          {openMenus.categories && (
            <ul className="submenu">
              <li>
                <NavLink to="/admin/danh-muc" activeClassName="active">Danh sách danh mục</NavLink>
              </li>
              <li>
                <NavLink to="/admin/danh-muc/add" activeClassName="active">Thêm danh mục mới</NavLink>
              </li>
              <li>
                <NavLink to="/admin/do-uong/add" activeClassName="active">Thêm đồ uống mới</NavLink>
              </li>
              <li>
                <NavLink to="/admin/tuy-chon/add" activeClassName="active">Thêm tùy chọn mới</NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div className="menu-header" onClick={() => toggleMenu('blogs')}>
            <span>Quản lí blog</span>
            <span className="toggle-icon">{openMenus.blogs ? '−' : '+'}</span>
          </div>
          {openMenus.blogs && (
            <ul className="submenu">
              <li>
                <NavLink to="/admin/blogs" activeClassName="active">Danh sách blog</NavLink>
              </li>
              <li>
                <NavLink to="/admin/blogs/add" activeClassName="active">Thêm blog mới</NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div className="menu-header" onClick={() => toggleMenu('orders')}>
            <span>Quản lí đơn hàng</span>
            <span className="toggle-icon">{openMenus.orders ? '−' : '+'}</span>
          </div>
          {openMenus.orders && (
            <ul className="submenu">
              <li>
                <NavLink to="/admin/don-hang" activeClassName="active">Danh sách đơn hàng</NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div className="menu-header" onClick={() => toggleMenu('contacts')}>
            <span>Quản lí liên hệ</span>
            <span className="toggle-icon">{openMenus.contacts ? '−' : '+'}</span>
          </div>
          {openMenus.contacts && (
            <ul className="submenu">
              <li>
                <NavLink to="/admin/contacts" activeClassName="active">Danh sách liên hệ</NavLink>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default AdminSidebar;

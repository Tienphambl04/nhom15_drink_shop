import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/adminSidebar';
import './adminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const vaiTro = localStorage.getItem('vai_tro');

  useEffect(() => {
    if (!token || vaiTro !== 'admin') {
      navigate('/login');
    }
  }, [token, vaiTro, navigate]);

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminDashboard;

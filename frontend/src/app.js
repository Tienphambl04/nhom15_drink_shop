import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Register from './components/login/register';
import Login from './components/login/login';
import ChangePassword from './components/header/changePassword';
import Profile from './components/header/profile';
import AdminDashboard from './pages/adminDashboard';
import AdminRoutes from './adminRoutes';
import HienThiDoUongTheoDanhMuc from './components/danh_muc/danhMuc_khach';
import GioHang from './components/gio_hang/gioHang';
import OrderForm from './components/don_hang/orderForm';
import OrderHistory from './components/don_hang/orderHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
            </MainLayout>
          }
        />
        <Route
          path="/register"
          element={
            <MainLayout>
              <Register />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <Login />
            </MainLayout>
          }
        />
        <Route
          path="/change-password"
          element={
            <MainLayout>
              <ChangePassword />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/danh-muc/:ma_danh_muc"
          element={
            <MainLayout>
              <HienThiDoUongTheoDanhMuc />
            </MainLayout>
          }
        />
        <Route
          path="/gio-hang/:maNguoiDung"
          element={
            <MainLayout>
              <GioHang />
            </MainLayout>
          }
        />
        <Route
          path="/don-hang"
          element={
            <MainLayout>
              <OrderForm />
            </MainLayout>
          }
        />
        <Route
          path="/lich-su-don-hang"
          element={
            <MainLayout>
              <OrderHistory />
            </MainLayout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          }
        />
        <Route
          path="/admin/*"
          element={
            <MainLayout>
              <AdminRoutes />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
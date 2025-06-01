import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/mainLayout';
import Register from './components/login/register';
import Login from './components/login/login';


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
          path="/register" element={
            <MainLayout>
            <Register />
            </MainLayout>
            }
        />
        <Route
          path="/login" element={
            <MainLayout>
            <Login />
            </MainLayout>
            }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
// import './index.css'; 
import { CartProvider } from './components/gio_hang/cartContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CartProvider> {/*  bọc App để toàn app dùng được context */}
    <App />
  </CartProvider>
);

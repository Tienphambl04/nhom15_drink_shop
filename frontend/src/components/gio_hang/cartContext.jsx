// context/CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getGioHangByUser } from "../../api/gioHang";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const maNguoiDung = localStorage.getItem("ma_nguoi_dung") || "guest";

  const fetchCart = async () => {
    if (maNguoiDung === "guest") return setCartCount(0);
    try {
      const res = await getGioHangByUser(maNguoiDung);
      if (res.success === false) setCartCount(0);
      else setCartCount(res.length);
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [maNguoiDung]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../components/gio_hang/cartContext";
import {
  getGioHangByUser,
  updateSoLuong,
  deleteGioHang,
} from "../../api/gioHang";
import { getDoUongTheoId } from "../../api/doUong";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";
import { toast } from "react-toastify";

const GioHang = () => {
  const [gioHang, setGioHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editOptions, setEditOptions] = useState({});
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const maNguoiDung = localStorage.getItem("ma_nguoi_dung");
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "2rem 0",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    maxWidth: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1rem",
    },
    header: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      marginBottom: "1.5rem",
    },
    headerContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: 0,
    },
    badge: {
      backgroundColor: "#fed7aa",
      color: "#ea580c",
      fontSize: "0.875rem",
      fontWeight: "500",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
    },
    historyBtn: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: "#f3f4f6",
      color: "#374151",
      padding: "0.5rem 1rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "500",
      transition: "background-color 0.2s ease",
      textDecoration: "none",
    },
    cartContainer: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      marginBottom: "1.5rem",
    },
    selectAllHeader: {
      borderBottom: "1px solid #e5e7eb",
      padding: "1rem",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      cursor: "pointer",
    },
    checkbox: {
      width: "1rem",
      height: "1rem",
      accentColor: "#ea580c",
      cursor: "pointer",
    },
    cartItem: {
      padding: "1.5rem",
      borderBottom: "1px solid #e5e7eb",
      transition: "background-color 0.2s ease",
    },
    cartItemSelected: {
      backgroundColor: "#fff7ed",
    },
    cartItemContent: {
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    },
    productImage: {
      width: "80px",
      height: "80px",
      borderRadius: "8px",
      objectFit: "cover",
      flexShrink: 0,
    },
    productImagePlaceholder: {
      width: "80px",
      height: "80px",
      backgroundColor: "#f3f4f6",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.875rem",
      color: "#6b7280",
      flexShrink: 0,
    },
    productDetails: {
      flex: 1,
      minWidth: 0,
    },
    productName: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#1f2937",
      margin: "0 0 0.5rem 0",
    },
    options: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.5rem",
      marginBottom: "0.75rem",
    },
    optionTag: {
      display: "inline-flex",
      alignItems: "center",
      padding: "0.25rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "500",
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    optionPrice: {
      marginLeft: "0.25rem",
      color: "#ea580c",
    },
    dateText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      marginBottom: "0.75rem",
    },
    priceQuantityRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
    },
    leftPriceQuantity: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    price: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#ea580c",
    },
    quantityControls: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      overflow: "hidden",
    },
    quantityBtn: {
      padding: "0.5rem",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s ease",
    },
    quantityBtnDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    quantityValue: {
      padding: "0.5rem 0.75rem",
      fontWeight: "500",
      minWidth: "3rem",
      textAlign: "center",
    },
    totalPrice: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#1f2937",
      textAlign: "right",
    },
    actions: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    actionBtn: {
      padding: "0.5rem",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    orderSummary: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
    },
    summaryContent: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: "1px solid #e5e7eb",
      paddingTop: "1.5rem",
      marginBottom: "1.5rem",
    },
    summaryText: {
      fontSize: "1.125rem",
      fontWeight: "500",
      color: "#1f2937",
      margin: 0,
    },
    summarySubtext: {
      fontSize: "0.875rem",
      color: "#6b7280",
      margin: "0.25rem 0 0",
    },
    totalAmount: {
      fontSize: "1.875rem",
      fontWeight: "700",
      color: "#ea580c",
      textAlign: "right",
      margin: 0,
    },
    actionButtons: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
    },
    orderBtn: {
      flex: 1,
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      fontWeight: "500",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontSize: "1rem",
      minWidth: "200px",
    },
    orderBtnEnabled: {
      backgroundColor: "#ea580c",
      color: "#ffffff",
    },
    orderBtnDisabled: {
      backgroundColor: "#d1d5db",
      color: "#6b7280",
      cursor: "not-allowed",
    },
    continueBtn: {
      padding: "0.75rem 1.5rem",
      border: "1px solid #d1d5db",
      color: "#374151",
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontWeight: "500",
      fontSize: "1rem",
    },
    emptyCart: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      padding: "3rem",
      textAlign: "center",
    },
    emptyIcon: {
      fontSize: "4rem",
      color: "#d1d5db",
      marginBottom: "1rem",
    },
    emptyTitle: {
      fontSize: "1.25rem",
      fontWeight: "500",
      color: "#1f2937",
      marginBottom: "0.5rem",
    },
    emptyText: {
      color: "#6b7280",
      marginBottom: "1.5rem",
    },
    emptyBtn: {
      backgroundColor: "#ea580c",
      color: "#ffffff",
      padding: "0.75rem 1.5rem",
      border: "none",
      borderRadius: "8px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    loading: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContent: {
      textAlign: "center",
    },
    spinner: {
      width: "3rem",
      height: "3rem",
      border: "2px solid #e5e7eb",
      borderTop: "2px solid #ea580c",
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto 1rem",
    },
    errorContainer: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    errorContent: {
      textAlign: "center",
      color: "#dc2626",
      backgroundColor: "#ffffff",
      padding: "2rem",
      borderRadius: "8px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem",
    },
    modalContent: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
      width: "100%",
      maxWidth: "28rem",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    modalHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.5rem 1.5rem 0 1.5rem",
      marginBottom: "1.5rem",
    },
    modalTitle: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "#1f2937",
      margin: 0,
    },
    modalCloseBtn: {
      padding: "0.5rem",
      border: "none",
      backgroundColor: "transparent",
      color: "#6b7280",
      cursor: "pointer",
      borderRadius: "8px",
      transition: "background-color 0.2s ease",
    },
    modalBody: {
      padding: "0 1.5rem",
      marginBottom: "1.5rem",
    },
    modalSection: {
      marginBottom: "1.5rem",
    },
    modalProductInfo: {
      marginBottom: "1.5rem",
    },
    modalProductName: {
      fontWeight: "500",
      color: "#1f2937",
      marginBottom: "0.5rem",
    },
    modalProductPrice: {
      color: "#ea580c",
      fontWeight: "600",
    },
    modalLabel: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.5rem",
    },
    modalQuantityControls: {
      display: "flex",
      alignItems: "center",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      width: "fit-content",
    },
    modalQuantityBtn: {
      padding: "0.5rem",
      border: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    modalQuantityValue: {
      padding: "0.5rem 1rem",
      fontWeight: "500",
    },
    modalOptionSection: {
      marginBottom: "1.5rem",
    },
    modalOptionLabel: {
      display: "block",
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
      marginBottom: "0.75rem",
    },
    modalOptionList: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    modalOptionItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      cursor: "pointer",
      padding: "0.5rem",
      borderRadius: "8px",
      transition: "background-color 0.2s ease",
    },
    modalOptionRadio: {
      width: "1rem",
      height: "1rem",
      accentColor: "#ea580c",
    },
    modalOptionText: {
      flex: 1,
    },
    modalOptionPrice: {
      marginLeft: "0.5rem",
      color: "#ea580c",
      fontWeight: "500",
    },
    modalActions: {
      display: "flex",
      gap: "0.75rem",
      padding: "1.5rem",
      borderTop: "1px solid #e5e7eb",
    },
    modalCancelBtn: {
      flex: 1,
      padding: "0.5rem 1rem",
      border: "1px solid #d1d5db",
      color: "#374151",
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
    modalConfirmBtn: {
      flex: 1,
      padding: "0.5rem 1rem",
      backgroundColor: "#ea580c",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "background-color 0.2s ease",
    },
  };

  // Format ngày giờ
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Tính tổng tiền các sản phẩm được chọn
  const calculateTongTien = () => {
    return gioHang.reduce((tong, item) => {
      if (selectedItems.includes(item.ma_gio_hang)) {
        return tong + (item.tong_gia || 0);
      }
      return tong;
    }, 0);
  };

  // Lấy danh sách giỏ hàng từ API
  const fetchGioHang = async () => {
    if (!maNguoiDung) {
      setError("Bạn chưa đăng nhập.");
      setGioHang([]);
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching cart for user:", maNguoiDung);
      const res = await getGioHangByUser(maNguoiDung);
      if (res.success === false) {
        setError(res.message || "Lấy giỏ hàng thất bại");
        setGioHang([]);
      } else {
        const gioHangChiTiet = await Promise.all(
          res.map(async (item) => {
            try {
              const resDoUong = await getDoUongTheoId(item.ma_do_uong);
              const doUong = resDoUong.data || resDoUong;

              const giaGoc = parseFloat(doUong.gia) || 0;
              const giamGiaPhanTram = parseInt(doUong.giam_gia_phan_tram) || 0;
              const giaSauGiam = giaGoc * (1 - giamGiaPhanTram / 100);

              let tongGiaThem = 0;
              const tuyChon = item.tuy_chon;
              if (Array.isArray(tuyChon)) {
                tongGiaThem = tuyChon.reduce(
                  (sum, tc) => sum + (tc.gia_them || 0),
                  0
                );
              } else if (typeof tuyChon === "object" && tuyChon !== null) {
                tongGiaThem = tuyChon.gia_them || 0;
              }

              const tongGia = (giaSauGiam + tongGiaThem) * item.so_luong;

              return {
                ...item,
                ten_do_uong: doUong.ten_do_uong || "Không rõ tên",
                hinh_anh: doUong.hinh_anh || null,
                gia_sau_giam: giaSauGiam,
                tong_gia: tongGia,
                ngay_tao: item.ngay_tao || null,
              };
            } catch (err) {
              return {
                ...item,
                ten_do_uong: "Lỗi tải",
                hinh_anh: null,
                gia_sau_giam: 0,
                tong_gia: 0,
                ngay_tao: null,
              };
            }
          })
        );

        setGioHang(gioHangChiTiet);
        setError(null);
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi lấy giỏ hàng.");
      setGioHang([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGioHang();
  }, [maNguoiDung]);

  // Chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (ma_gio_hang) => {
    setSelectedItems((prev) =>
      prev.includes(ma_gio_hang)
        ? prev.filter((id) => id !== ma_gio_hang)
        : [...prev, ma_gio_hang]
    );
  };

  // Chọn/bỏ chọn tất cả sản phẩm
  const handleSelectAll = () => {
    if (selectedItems.length === gioHang.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(gioHang.map((item) => item.ma_gio_hang));
    }
  };

  // Cập nhật số lượng sản phẩm
  const handleUpdateSoLuong = async (maGioHang, newSoLuong) => {
    if (newSoLuong < 1 || isUpdating || isDeleting) return;

    setIsUpdating(true);
    const oldGioHang = [...gioHang];
    const item = gioHang.find((i) => i.ma_gio_hang === maGioHang);
    const tongGiaThem = Array.isArray(item.tuy_chon)
      ? item.tuy_chon.reduce((sum, tc) => sum + (tc.gia_them || 0), 0)
      : item.tuy_chon?.gia_them || 0;

    setGioHang((prev) =>
      prev.map((i) =>
        i.ma_gio_hang === maGioHang
          ? {
              ...i,
              so_luong: newSoLuong,
              tong_gia: (i.gia_sau_giam + tongGiaThem) * newSoLuong,
            }
          : i
      )
    );

    try {
      console.log("Updating quantity:", maGioHang, newSoLuong);
      const res = await updateSoLuong(maGioHang, { so_luong: newSoLuong });
      if (res.success === false) {
        setGioHang(oldGioHang);
        toast.error("Cập nhật số lượng thất bại: " + res.message, {
          toastId: "update-quantity-error",
        });
      } else {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Cập nhật số lượng thành công", {
          toastId: "update-quantity-success",
        });
      }
    } catch (err) {
      setGioHang(oldGioHang);
      toast.error("Cập nhật số lượng thất bại: " + err.message, {
        toastId: "update-quantity-error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleDelete = async (maGioHang) => {
    if (
      !window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?") ||
      isDeleting
    )
      return;

    setIsDeleting(true);
    const oldGioHang = [...gioHang];
    setGioHang((prev) => prev.filter((item) => item.ma_gio_hang !== maGioHang));
    setSelectedItems((prev) => prev.filter((id) => id !== maGioHang));

    try {
      console.log("Deleting cart item:", maGioHang);
      const res = await deleteGioHang(maGioHang);
      if (res.success === false) {
        setGioHang(oldGioHang);
        toast.error("Xóa thất bại: " + res.message, {
          toastId: "delete-cart-error",
        });
      } else {
        console.log("Delete successful, fetching cart...");
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng", {
          toastId: "delete-cart-success",
        });
      }
    } catch (err) {
      setGioHang(oldGioHang);
      toast.error("Xóa thất bại: " + err.message, {
        toastId: "delete-cart-error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Mở modal chỉnh sửa sản phẩm
  const handleEdit = async (item) => {
    setEditItem(item);
    setEditQuantity(item.so_luong);
    setEditOptions(
      Array.isArray(item.tuy_chon)
        ? item.tuy_chon.reduce(
            (acc, opt) => ({
              ...acc,
              [opt.loai_tuy_chon]: {
                gia_tri: opt.gia_tri,
                gia_them: opt.gia_them,
              },
            }),
            {}
          )
        : {}
    );

    try {
      const options = await fetchTuyChonByDoUong(item.ma_do_uong);
      const grouped = {};
      options.forEach((opt) => {
        if (!grouped[opt.loai_tuy_chon]) grouped[opt.loai_tuy_chon] = [];
        grouped[opt.loai_tuy_chon].push(opt);
      });
      setDrinkOptions(grouped);
    } catch (err) {
      console.error("Lỗi tải tùy chọn:", err);
      setDrinkOptions({});
      toast.error("Lỗi tải tùy chọn sản phẩm", {
        toastId: "edit-options-error",
      });
    }
  };

  // Thay đổi tùy chọn trong modal chỉnh sửa
  const handleChangeOption = (loai, gia_tri) => {
    const opt = drinkOptions[loai].find((o) => o.gia_tri === gia_tri);
    setEditOptions((prev) => ({
      ...prev,
      [loai]: {
        gia_tri: opt.gia_tri,
        gia_them: opt.gia_them,
      },
    }));
  };

  // Lưu chỉnh sửa sản phẩm
  const handleSaveEdit = async () => {
    if (!editItem || isUpdating) return;

    setIsUpdating(true);
    const oldGioHang = [...gioHang];
    const tuyChonArr = Object.entries(editOptions).map(([loai, opt]) => ({
      loai_tuy_chon: loai,
      gia_tri: opt.gia_tri,
      gia_them: opt.gia_them,
    }));
    const tongGiaThem = tuyChonArr.reduce(
      (sum, opt) => sum + (opt.gia_them || 0),
      0
    );
    setGioHang((prev) =>
      prev.map((item) =>
        item.ma_gio_hang === editItem.ma_gio_hang
          ? {
              ...item,
              so_luong: editQuantity,
              tuy_chon: tuyChonArr,
              tong_gia: (item.gia_sau_giam + tongGiaThem) * editQuantity,
            }
          : item
      )
    );

    try {
      console.log("Saving edit:", editItem.ma_gio_hang, editQuantity, tuyChonArr);
      const res = await updateSoLuong(editItem.ma_gio_hang, {
        so_luong: editQuantity,
        tuy_chon: tuyChonArr,
      });
      if (res.success === false) {
        setGioHang(oldGioHang);
        toast.error("Cập nhật thất bại: " + res.message, {
          toastId: "save-edit-error",
        });
      } else {
        await fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Đã cập nhật sản phẩm", {
          toastId: "save-edit-success",
        });
      }
      setEditItem(null);
    } catch (err) {
      setGioHang(oldGioHang);
      toast.error("Cập nhật thất bại: " + err.message, {
        toastId: "save-edit-error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Hủy chỉnh sửa sản phẩm
  const handleCancelEdit = () => {
    setEditItem(null);
    setEditQuantity(1);
    setEditOptions({});
    setDrinkOptions({});
  };

  // Đặt hàng với các sản phẩm được chọn
  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một mục để mua.", {
        toastId: "place-order-warn",
      });
      return;
    }
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    navigate("/don-hang");
  };

  // Xem lịch sử đơn hàng
  const handleViewOrderHistory = () => {
    if (!maNguoiDung) {
      toast.warn("Vui lòng đăng nhập để xem lịch sử đơn hàng.", {
        toastId: "view-history-warn",
      });
      navigate("/login");
      return;
    }
    navigate("/lich-su-don-hang");
  };

  // Tiếp tục mua sắm
  const handleContinueShopping = () => {
    navigate("/");
  };

  const cssAnimations = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <div style={styles.loading}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p style={{ color: "#6b7280" }}>Đang tải giỏ hàng...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✕</div>
          <p style={{ fontSize: "1.125rem", fontWeight: "500" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{cssAnimations}</style>
      <div style={styles.container}>
        <div style={styles.maxWidth}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.headerLeft}>
                <div style={{ fontSize: "2rem" }}>🛒</div>
                <h1 style={styles.title}>Giỏ hàng của bạn</h1>
                <span style={styles.badge}>{gioHang.length} sản phẩm</span>
              </div>
              <button
                onClick={handleViewOrderHistory}
                style={styles.historyBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e5e7eb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
              >
                <span style={{ fontSize: "1rem" }}>📋</span>
                <span>Lịch sử đơn hàng</span>
              </button>
            </div>
          </div>

          {gioHang.length === 0 ? (
            <div style={styles.emptyCart}>
              <div style={styles.emptyIcon}>📦</div>
              <h3 style={styles.emptyTitle}>Giỏ hàng trống</h3>
              <p style={styles.emptyText}>
                Hãy thêm một số sản phẩm vào giỏ hàng của bạn
              </p>
              <button
                style={styles.emptyBtn}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ea580c")
                }
                onClick={handleContinueShopping}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              <div style={styles.cartContainer}>
                <div style={styles.selectAllHeader}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      style={styles.checkbox}
                      checked={
                        selectedItems.length === gioHang.length &&
                        gioHang.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                    <span style={{ fontWeight: "500", color: "#374151" }}>
                      Chọn tất cả ({selectedItems.length}/{gioHang.length})
                    </span>
                  </label>
                </div>

                {gioHang.map((item, index) => (
                  <div
                    key={item.ma_gio_hang}
                    style={{
                      ...styles.cartItem,
                      ...(selectedItems.includes(item.ma_gio_hang)
                        ? styles.cartItemSelected
                        : {}),
                      ...(index === gioHang.length - 1
                        ? { borderBottom: "none" }
                        : {}),
                    }}
                  >
                    <div style={styles.cartItemContent}>
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={selectedItems.includes(item.ma_gio_hang)}
                        onChange={() => handleSelectItem(item.ma_gio_hang)}
                      />

                      {item.hinh_anh ? (
                        <img
                          src={`http://localhost:5000/uploads/hinh_anh/${item.hinh_anh}`}
                          alt={item.ten_do_uong}
                          style={styles.productImage}
                        />
                      ) : (
                        <div style={styles.productImagePlaceholder}>
                          Không có hình ảnh
                        </div>
                      )}

                      <div style={styles.productDetails}>
                        <h3 style={styles.productName}>{item.ten_do_uong}</h3>

                        <div style={styles.options}>
                          {Array.isArray(item.tuy_chon) &&
                            item.tuy_chon.map((option, idx) => (
                              <span key={idx} style={styles.optionTag}>
                                {option.loai_tuy_chon}: {option.gia_tri}
                                {option.gia_them > 0 && (
                                  <span style={styles.optionPrice}>
                                    +{option.gia_them.toLocaleString()}₫
                                  </span>
                                )}
                              </span>
                            ))}
                        </div>

                        <div style={styles.dateText}>
                          Thêm vào: {formatDate(item.ngay_tao)}
                        </div>

                        <div style={styles.priceQuantityRow}>
                          <div style={styles.leftPriceQuantity}>
                            <div style={styles.price}>
                              {item.gia_sau_giam.toLocaleString()}₫
                            </div>

                            <div style={styles.quantityControls}>
                              <button
                                style={{
                                  ...styles.quantityBtn,
                                  ...(item.so_luong <= 1 || isUpdating
                                    ? styles.quantityBtnDisabled
                                    : {}),
                                }}
                                onClick={() =>
                                  handleUpdateSoLuong(
                                    item.ma_gio_hang,
                                    item.so_luong - 1
                                  )
                                }
                                disabled={item.so_luong <= 1 || isUpdating}
                                onMouseEnter={(e) =>
                                  !(item.so_luong <= 1 || isUpdating) &&
                                  (e.currentTarget.style.backgroundColor =
                                    "#f3f4f6")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                −
                              </button>
                              <span style={styles.quantityValue}>
                                {item.so_luong}
                              </span>
                              <button
                                style={{
                                  ...styles.quantityBtn,
                                  ...(isUpdating
                                    ? styles.quantityBtnDisabled
                                    : null),
                                }}
                                onClick={() =>
                                  handleUpdateSoLuong(
                                    item.ma_gio_hang,
                                    item.so_luong + 1
                                  )
                                }
                                disabled={isUpdating}
                                onMouseEnter={(e) =>
                                  !isUpdating &&
                                  (e.currentTarget.style.backgroundColor =
                                    "#f3f4f6")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "transparent")
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div style={styles.totalPrice}>
                            {item.tong_gia.toLocaleString()}₫
                          </div>
                        </div>
                      </div>

                      <div style={styles.actions}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleEdit(item)}
                          disabled={isDeleting || isUpdating}
                          onMouseEnter={(e) =>
                            !(isDeleting || isUpdating) &&
                            (e.currentTarget.style.backgroundColor = "#f3f4f6")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleDelete(item.ma_gio_hang)}
                          disabled={isDeleting || isUpdating}
                          onMouseEnter={(e) =>
                            !(isDeleting || isUpdating) &&
                            (e.currentTarget.style.backgroundColor = "#f3f4f6")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                          title="Xóa"
                        >
                          {isDeleting ? "⌛" : "🗑️"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.orderSummary}>
                <div style={styles.summaryContent}>
                  <div>
                    <p style={styles.summaryText}>
                      Tổng cộng ({selectedItems.length} sản phẩm):
                    </p>
                    <p style={styles.summarySubtext}>Đã bao gồm thuế và phí</p>
                  </div>
                  <p style={styles.totalAmount}>
                    {calculateTongTien().toLocaleString()}₫
                  </p>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    style={styles.continueBtn}
                    onClick={handleContinueShopping}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#ffffff")
                    }
                  >
                    Tiếp tục mua sắm
                  </button>
                  <button
                    style={{
                      ...styles.orderBtn,
                      ...(selectedItems.length > 0
                        ? styles.orderBtnEnabled
                        : styles.orderBtnDisabled),
                    }}
                    onClick={handlePlaceOrder}
                    disabled={selectedItems.length === 0}
                    onMouseEnter={(e) =>
                      selectedItems.length > 0 &&
                      (e.currentTarget.style.backgroundColor = "#dc2626")
                    }
                    onMouseLeave={(e) =>
                      selectedItems.length > 0 &&
                      (e.currentTarget.style.backgroundColor = "#ea580c")
                    }
                  >
                    Đặt hàng ({selectedItems.length} sản phẩm)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {editItem && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Chỉnh sửa sản phẩm</h2>
              <button
                style={styles.modalCloseBtn}
                onClick={handleCancelEdit}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalProductInfo}>
                <p style={styles.modalProductName}>{editItem.ten_do_uong}</p>
                <p style={styles.modalProductPrice}>
                  {editItem.gia_sau_giam.toLocaleString()}₫
                </p>
              </div>

              <div style={styles.modalSection}>
                <label style={styles.modalLabel}>Số lượng</label>
                <div style={styles.modalQuantityControls}>
                  <button
                    style={{
                      ...styles.modalQuantityBtn,
                      ...(editQuantity <= 1 || isUpdating
                        ? { opacity: 0.5, cursor: "not-allowed" }
                        : {}),
                    }}
                    onClick={() =>
                      editQuantity > 1 &&
                      !isUpdating &&
                      setEditQuantity(editQuantity - 1)
                    }
                    disabled={editQuantity <= 1 || isUpdating}
                    onMouseEnter={(e) =>
                      !(editQuantity <= 1 || isUpdating) &&
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    −
                  </button>
                  <span style={styles.modalQuantityValue}>{editQuantity}</span>
                  <button
                    style={{
                      ...styles.modalQuantityBtn,
                      ...(isUpdating ? { opacity: 0.5, cursor: "not-allowed" } : {}),
                    }}
                    onClick={() =>
                      !isUpdating && setEditQuantity(editQuantity + 1)
                    }
                    disabled={isUpdating}
                    onMouseEnter={(e) =>
                      !isUpdating &&
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {Object.entries(drinkOptions).map(([loai, opts]) => (
                <div key={loai} style={styles.modalOptionSection}>
                  <label style={styles.modalOptionLabel}>{loai}</label>
                  <div style={styles.modalOptionList}>
                    {opts.map((opt) => (
                      <label
                        key={opt.id || `${loai}-${opt.gia_tri}`}
                        style={styles.modalOptionItem}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f3f4f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <input
                          type="radio"
                          style={styles.modalOptionRadio}
                          name={loai}
                          value={opt.gia_tri}
                          checked={editOptions[loai]?.gia_tri === opt.gia_tri}
                          onChange={() => handleChangeOption(loai, opt.gia_tri)}
                          disabled={isUpdating}
                        />
                        <span style={styles.modalOptionText}>{opt.gia_tri}</span>
                        {opt.gia_them > 0 && (
                          <span style={styles.modalOptionPrice}>
                            +{opt.gia_them.toLocaleString()}₫
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancelBtn}
                onClick={handleCancelEdit}
                disabled={isUpdating}
                onMouseEnter={(e) =>
                  !isUpdating &&
                  (e.currentTarget.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  !isUpdating &&
                  (e.currentTarget.style.backgroundColor = "#ffffff")
                }
              >
                Hủy
              </button>
              <button
                style={styles.modalConfirmBtn}
                onClick={handleSaveEdit}
                disabled={isUpdating}
                onMouseEnter={(e) =>
                  !isUpdating &&
                  (e.currentTarget.style.backgroundColor = "#dc2626")
                }
                onMouseLeave={(e) =>
                  !isUpdating &&
                  (e.currentTarget.style.backgroundColor = "#ea580c")
                }
              >
                {isUpdating ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GioHang;

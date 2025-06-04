import React, { useEffect, useState, useContext } from "react";
import {
  getGioHangByUser,
  updateSoLuong,
  deleteGioHang,
} from "../../api/gioHang";
import { getDoUongTheoId } from "../../api/doUong";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";
import { useCart } from "../../components/gio_hang/cartContext";
import { useNavigate } from "react-router-dom";

const GioHang = () => {
  const [gioHang, setGioHang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editOptions, setEditOptions] = useState({});
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const { fetchCart } = useCart();
  const maNguoiDung = localStorage.getItem("ma_nguoi_dung");
  const navigate = useNavigate();

  // Hàm định dạng ngày từ "YYYY-MM-DD HH:mm:ss" thành "DD/MM/YYYY HH:mm"
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

  const calculateTongTien = () => {
    return gioHang.reduce((tong, item) => {
      if (selectedItems.includes(item.ma_gio_hang)) {
        return tong + (item.tong_gia || 0);
      }
      return tong;
    }, 0);
  };

  const fetchGioHang = async () => {
    if (!maNguoiDung) {
      setError("Bạn chưa đăng nhập.");
      setGioHang([]);
      setLoading(false);
      return;
    }

    try {
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
                tongGiaThem = tuyChon.reduce((sum, tc) => sum + (tc.gia_them || 0), 0);
              } else if (typeof tuyChon === "object" && tuyChon !== null) {
                tongGiaThem = tuyChon.gia_them || 0;
              }

              const tongGia = (giaSauGiam + tongGiaThem) * item.so_luong;

              return {
                ...item,
                ten_do_uong: doUong.ten_do_uong || "Không rõ tên",
                gia_sau_giam: giaSauGiam,
                tong_gia: tongGia,
                ngay_tao: item.ngay_tao || null, // Lưu ngay_tao từ API
              };
            } catch (err) {
              return {
                ...item,
                ten_do_uong: "Lỗi tải",
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

  const handleSelectItem = (ma_gio_hang) => {
    setSelectedItems((prev) =>
      prev.includes(ma_gio_hang)
        ? prev.filter((id) => id !== ma_gio_hang)
        : [...prev, ma_gio_hang]
    );
  };

  const handleUpdateSoLuong = async (maGioHang, newSoLuong) => {
    if (newSoLuong < 1) return;

    const oldGioHang = [...gioHang];
    setGioHang((prev) =>
      prev.map((item) =>
        item.ma_gio_hang === maGioHang
          ? { ...item, so_luong: newSoLuong, tong_gia: item.gia_sau_giam * newSoLuong }
          : item
      )
    );

    try {
      const res = await updateSoLuong(maGioHang, { so_luong: newSoLuong });
      if (res.success === false) {
        setGioHang(oldGioHang);
        alert("Cập nhật số lượng thất bại: " + res.message);
      } else {
        await fetchCart();
      }
    } catch (err) {
      setGioHang(oldGioHang);
      alert("Cập nhật số lượng thất bại: " + err.message);
    }
  };

  const handleDelete = async (maGioHang) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;

    const oldGioHang = [...gioHang];
    setGioHang((prev) => prev.filter((item) => item.ma_gio_hang !== maGioHang));
    setSelectedItems((prev) => prev.filter((id) => id !== maGioHang));

    try {
      const res = await deleteGioHang(maGioHang);
      if (res.success === false) {
        setGioHang(oldGioHang);
        alert("Xóa thất bại: " + res.message);
      } else {
        await fetchCart();
      }
    } catch (err) {
      setGioHang(oldGioHang);
      alert("Xóa thất bại: " + err.message);
    }
  };

  const handleEdit = async (item) => {
    setEditItem(item);
    setEditQuantity(item.so_luong);
    setEditOptions(
      Array.isArray(item.tuy_chon)
        ? item.tuy_chon.reduce((acc, opt) => ({
            ...acc,
            [opt.loai_tuy_chon]: { gia_tri: opt.gia_tri, gia_them: opt.gia_them },
          }), {})
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
    }
  };

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

  const handleSaveEdit = async () => {
    if (!editItem) return;

    const oldGioHang = [...gioHang];
    const tuyChonArr = Object.entries(editOptions).map(([loai, opt]) => ({
      loai_tuy_chon: loai,
      gia_tri: opt.gia_tri,
      gia_them: opt.gia_them,
    }));
    const tongGiaThem = tuyChonArr.reduce((sum, opt) => sum + (opt.gia_them || 0), 0);
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
      const res = await updateSoLuong(editItem.ma_gio_hang, {
        so_luong: editQuantity,
        tuy_chon: tuyChonArr,
      });
      if (res.success === false) {
        setGioHang(oldGioHang);
        alert("Cập nhật thất bại: " + res.message);
      } else {
        await fetchCart();
        setEditItem(null);
      }
    } catch (err) {
      setGioHang(oldGioHang);
      alert("Cập nhật thất bại: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditItem(null);
    setEditQuantity(1);
    setEditOptions({});
    setDrinkOptions({});
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một mục để mua.");
      return;
    }
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedItems));
    navigate("/don-hang");
  };

  const handleViewOrderHistory = () => {
    if (!maNguoiDung) {
      alert("Vui lòng đăng nhập để xem lịch sử đơn hàng.");
      navigate("/login");
      return;
    }
    navigate("/lich-su-don-hang");
  };

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ transition: "all 0.3s ease", padding: "20px" }}>
      <h2>Giỏ hàng của bạn</h2>
      <button
        onClick={handleViewOrderHistory}
        style={{
          backgroundColor: "#2196F3",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        title="Xem danh sách các đơn hàng đã đặt"
      >
        Xem lịch sử đơn hàng
      </button>
      {gioHang.length === 0 ? (
        <p>Giỏ hàng trống. <a href="/">Quay lại cửa hàng</a></p>
      ) : (
        <>
          <table border={1} cellPadding={8} cellSpacing={0}>
            <thead>
              <tr>
                <th>Chọn</th>
                <th>Tên đồ uống</th>
                <th>Giá sau giảm (VNĐ)</th>
                <th>Số lượng</th>
                <th>Tùy chọn</th>
                <th>Ngày tạo</th>
                <th>Tổng giá (VNĐ)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {gioHang.map((item) => {
                let renderTuyChon = "Không có";
                const tuyChon = item.tuy_chon;

                if (Array.isArray(tuyChon)) {
                  renderTuyChon = tuyChon.map((tc, idx) => (
                    <div key={idx}>
                      {tc.loai_tuy_chon} - {tc.gia_tri} (+{tc.gia_them.toLocaleString()} VNĐ)
                    </div>
                  ));
                } else if (typeof tuyChon === "object" && tuyChon !== null) {
                  renderTuyChon = (
                    <div>
                      {tuyChon.loai_tuy_chon} - {tuyChon.gia_tri} (+{(tuyChon.gia_them || 0).toLocaleString()} VNĐ)
                    </div>
                  );
                } else if (typeof tuyChon === "string") {
                  renderTuyChon = tuyChon;
                }

                return (
                  <tr key={item.ma_gio_hang} style={{ transition: "opacity 0.3s ease" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.ma_gio_hang)}
                        onChange={() => handleSelectItem(item.ma_gio_hang)}
                      />
                    </td>
                    <td>{item.ten_do_uong}</td>
                    <td>{item.gia_sau_giam.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.so_luong}
                        onChange={(e) =>
                          handleUpdateSoLuong(item.ma_gio_hang, Number(e.target.value))
                        }
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>{renderTuyChon}</td>
                    <td>{formatDate(item.ngay_tao)}</td>
                    <td>{item.tong_gia.toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} style={{ marginRight: 8 }}>
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(item.ma_gio_hang)}>Xóa</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h3 style={{ marginTop: "20px" }}>
            Tổng tiền (các mục đã chọn): {calculateTongTien().toLocaleString()} VNĐ
          </h3>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              onClick={handlePlaceOrder}
              disabled={selectedItems.length === 0}
              style={{
                backgroundColor: selectedItems.length === 0 ? "#aaa" : "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Mua ({selectedItems.length} mục)
            </button>
          </div>
        </>
      )}

      {editItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            transition: "opacity 0.3s ease",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h3>Sửa sản phẩm: {editItem.ten_do_uong}</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>Số lượng: </label>
              <input
                type="number"
                min={1}
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                style={{ width: "60px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Tùy chọn: </label>
              {Object.entries(drinkOptions).map(([loai, opts]) => (
                <div key={loai}>
                  <p><strong>{loai}</strong></p>
                  {opts.map((opt) => (
                    <label key={opt.id || `${loai}-${opt.gia_tri}`}>
                      <input
                        type="radio"
                        name={loai}
                        value={opt.gia_tri}
                        checked={editOptions[loai]?.gia_tri === opt.gia_tri}
                        onChange={() => handleChangeOption(loai, opt.gia_tri)}
                      />
                      {opt.gia_tri} (+{opt.gia_them.toLocaleString()} VNĐ)
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={handleCancelEdit}>Hủy</button>
              <button onClick={handleSaveEdit}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GioHang;
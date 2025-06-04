import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../../api/doUong";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";
import { addGioHang } from "../../api/gioHang";
import { useCart } from "../../components/gio_hang/cartContext";

const HienThiDoUongTheoDanhMuc = () => {
  const { ma_danh_muc } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [dsDoUong, setDsDoUong] = useState([]);
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isBuyNow, setIsBuyNow] = useState(false); // Flag to differentiate between "Add to Cart" and "Buy Now"

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dataDoUong = await getDoUongTheoDanhMuc(ma_danh_muc);
        setDsDoUong(dataDoUong);

        const resDanhMuc = await fetchDanhSachDanhMuc();
        if (resDanhMuc && Array.isArray(resDanhMuc.data)) {
          const dm = resDanhMuc.data.find(
            (item) => String(item.ma_danh_muc) === String(ma_danh_muc)
          );
          setTenDanhMuc(dm ? dm.ten_danh_muc : "Không xác định");
        } else {
          setTenDanhMuc("Không xác định");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi gọi API");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ma_danh_muc]);

  const doUongHienThi = dsDoUong.filter((d) => d.hien_thi);

  const handleThemGioHang = async (drink) => {
    setIsBuyNow(false); // Set to false for "Add to Cart"
    await loadDrinkOptions(drink);
  };

  const handleBuyNow = async (drink) => {
    setIsBuyNow(true); // Set to true for "Buy Now"
    await loadDrinkOptions(drink);
  };

  const loadDrinkOptions = async (drink) => {
    try {
      const options = await fetchTuyChonByDoUong(drink.ma_do_uong);
      const grouped = {};
      options.forEach((opt) => {
        if (!grouped[opt.loai_tuy_chon]) grouped[opt.loai_tuy_chon] = [];
        grouped[opt.loai_tuy_chon].push(opt);
      });

      setSelectedDrink(drink);
      setDrinkOptions(grouped);
      setSelectedOptions({});
      setShowModal(true);
    } catch (err) {
      alert("Lỗi khi tải tùy chọn đồ uống");
      console.error("Lỗi tải tùy chọn:", err);
    }
  };

  const handleChangeOption = (loai, gia_tri) => {
    const opt = drinkOptions[loai].find((o) => o.gia_tri === gia_tri);
    setSelectedOptions((prev) => ({
      ...prev,
      [loai]: {
        gia_tri: opt.gia_tri,
        gia_them: opt.gia_them,
      },
    }));
  };

  const tinhTongTien = () => {
    if (!selectedDrink) return 0;

    const giamGia = selectedDrink.giam_gia_phan_tram || 0;
    const giaGoc = selectedDrink.gia || 0;
    const giaSauGiam = Math.round(giaGoc * (1 - giamGia / 100));

    const tongGiaThem = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + (opt.gia_them || 0),
      0
    );

    return giaSauGiam + tongGiaThem;
  };

  const handleXacNhan = async () => {
    if (!selectedDrink) return;

    const maNguoiDung = localStorage.getItem("ma_nguoi_dung");
    const token = localStorage.getItem("token");

    if (!maNguoiDung || !token) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      setShowModal(false);
      navigate("/login");
      return;
    }

    const tuyChonArr = Object.entries(selectedOptions).map(([loai, opt]) => ({
      loai_tuy_chon: loai,
      gia_tri: opt.gia_tri,
      gia_them: opt.gia_them,
    }));

    try {
      if (isBuyNow) {
        // For "Buy Now", store the item in localStorage and navigate to OrderForm
        const tempItem = {
          ma_do_uong: selectedDrink.ma_do_uong,
          ten_do_uong: selectedDrink.ten_do_uong,
          so_luong: 1,
          tuy_chon: tuyChonArr,
          tong_gia: tinhTongTien(),
        };
        localStorage.setItem("buyNowItem", JSON.stringify([tempItem]));
        localStorage.removeItem("selectedCartItems"); // Clear cart items to avoid conflicts
        setShowModal(false);
        setSelectedOptions({});
        setSelectedDrink(null);
        setDrinkOptions({});
        navigate("/don-hang");
      } else {
        // For "Add to Cart", call the addGioHang API
        const result = await addGioHang({
          ma_nguoi_dung: Number(maNguoiDung),
          ma_do_uong: selectedDrink.ma_do_uong,
          so_luong: 1,
          tuy_chon: tuyChonArr,
        });

        const isSuccess =
          result &&
          (result.success === true ||
            result.success === "true" ||
            result.status === "success" ||
            result.status === 200 ||
            result.message === "success" ||
            result.message === "Thành công" ||
            (result.data && !result.error) ||
            (typeof result === "object" &&
              !result.error &&
              !result.message?.toLowerCase().includes("lỗi")));

        if (isSuccess) {
          alert(
            `Đã thêm "${selectedDrink.ten_do_uong}" vào giỏ hàng!\nTổng tiền: ${tinhTongTien().toLocaleString()} VNĐ`
          );
          setShowModal(false);
          setSelectedOptions({});
          setSelectedDrink(null);
          setDrinkOptions({});
          await fetchCart();
        } else {
          const errorMessage =
            result?.message || result?.error || "Phản hồi từ server không hợp lệ";
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Lỗi:", err);
      let errorMessage = "Lỗi không xác định";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      alert(`Thao tác thất bại!\nLỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="category-drinks">
      <h2>Đồ uống theo danh mục: {tenDanhMuc}</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && doUongHienThi.length === 0 && (
        <p>Không có đồ uống nào được hiển thị trong danh mục này.</p>
      )}

      <div className="drink-list">
        {doUongHienThi.map((d) => {
          const giaGiam =
            d.giam_gia_phan_tram && d.giam_gia_phan_tram > 0
              ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
              : d.gia;

          return (
            <div key={d.ma_do_uong} className="drink-item">
              <h3>{d.ten_do_uong}</h3>
              <p>Giá gốc: {Number(d.gia).toLocaleString()} VNĐ</p>
              <p>Giảm giá: {d.giam_gia_phan_tram || 0}%</p>
              <p>Mô tả: {d.mo_ta}</p>
              {d.hinh_anh && (
                <img
                  src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                  alt={d.ten_do_uong}
                  style={{ width: 150, height: 120, objectFit: "cover" }}
                />
              )}
              {d.giam_gia_phan_tram > 0 && (
                <p style={{ fontWeight: "bold", color: "red" }}>
                  Giá sau giảm: {giaGiam.toLocaleString()} VNĐ
                </p>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => handleThemGioHang(d)}>
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={() => handleBuyNow(d)}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedDrink && (
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
            <h3>
              {isBuyNow ? "Mua ngay" : "Thêm vào giỏ hàng"}: {selectedDrink.ten_do_uong}
            </h3>

            {Object.entries(drinkOptions).map(([loai, opts]) => (
              <div key={loai} style={{ marginBottom: "10px" }}>
                <p>
                  <strong>{loai}</strong>
                </p>
                {opts.map((opt) => (
                  <label
                    key={opt.id || `${loai}-${opt.gia_tri}`}
                    style={{ display: "block", margin: "5px 0" }}
                  >
                    <input
                      type="radio"
                      name={loai}
                      value={opt.gia_tri}
                      checked={selectedOptions[loai]?.gia_tri === opt.gia_tri}
                      onChange={() => handleChangeOption(loai, opt.gia_tri)}
                    />
                    {opt.gia_tri} (+{opt.gia_them.toLocaleString()} VNĐ)
                  </label>
                ))}
              </div>
            ))}

            <div style={{ marginTop: "10px" }}>
              <p>Tổng tiền: {tinhTongTien().toLocaleString()} VNĐ</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOptions({});
                }}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleXacNhan}
                style={{
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {isBuyNow ? "Xác nhận mua" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HienThiDoUongTheoDanhMuc;
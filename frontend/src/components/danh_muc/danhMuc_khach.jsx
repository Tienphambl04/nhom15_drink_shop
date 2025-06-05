import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../../api/doUong";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";
import { addGioHang } from "../../api/gioHang";
import { useCart } from "../../components/gio_hang/cartContext";
import CommentSection from "./binhLuan";


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
  const [isBuyNow, setIsBuyNow] = useState(false);

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
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [ma_danh_muc]);

  const doUongHienThi = dsDoUong.filter((d) => d.hien_thi);

  const handleThemGioHang = async (drink) => {
    setIsBuyNow(false);
    await loadDrinkOptions(drink);
  };

  const handleBuyNow = async (drink) => {
    setIsBuyNow(true);
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

    const token = localStorage.getItem("token");
    const maNguoiDung = token ? localStorage.getItem("ma_nguoi_dung") : null;

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
        const tempItem = {
          ma_do_uong: selectedDrink.ma_do_uong,
          ten_do_uong: selectedDrink.ten_do_uong,
          so_luong: 1,
          tuy_chon: tuyChonArr,
          tong_gia: tinhTongTien(),
        };
        localStorage.setItem("buyNowItem", JSON.stringify([tempItem]));
        localStorage.removeItem("selectedCartItems");
        setShowModal(false);
        setSelectedOptions({});
        setSelectedDrink(null);
        setDrinkOptions({});
        navigate("/don-hang");
      } else {
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
              <div className="drink-content">
                <div className="drink-details">
                  <h3>{d.ten_do_uong}</h3>
                  {d.hinh_anh && (
                    <img
                      src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                      alt={d.ten_do_uong}
                      className="drink-image"
                    />
                  )}
                  <p>
                    <strong>Giá gốc:</strong> {Number(d.gia).toLocaleString()} VNĐ
                  </p>
                  {d.giam_gia_phan_tram > 0 && (
                    <p>
                      <strong>Giảm giá:</strong> {d.giam_gia_phan_tram}%{' '}
                      <span style={{ color: "red" }}>
                        (Giá sau giảm: {giaGiam.toLocaleString()} VNĐ)
                      </span>
                    </p>
                  )}
                  <p>
                    <strong>Mô tả:</strong> {d.mo_ta || "Không có mô tả"}
                  </p>
                  <div className="drink-actions">
                    <button onClick={() => handleThemGioHang(d)}>
                      Thêm vào giỏ hàng
                    </button>
                    <button className="buy-now" onClick={() => handleBuyNow(d)}>
                      Mua ngay
                    </button>
                  </div>
                </div>
                <div className="drink-comments">
                  <CommentSection maDoUong={d.ma_do_uong} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && selectedDrink && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {isBuyNow ? "Mua ngay" : "Thêm vào giỏ hàng"}: {selectedDrink.ten_do_uong}
            </h3>

            {Object.entries(drinkOptions).map(([loai, opts]) => (
              <div key={loai} className="option-group">
                <p>
                  <strong>{loai}</strong>
                </p>
                {opts.map((opt) => (
                  <label
                    key={opt.id || `${loai}-${opt.gia_tri}`}
                    className="option-label"
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

            <div className="total-price">
              <p>Tổng tiền: {tinhTongTien().toLocaleString()} VNĐ</p>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedOptions({});
                }}
                className="cancel-button"
              >
                Hủy
              </button>
              <button onClick={handleXacNhan} className="confirm-button">
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
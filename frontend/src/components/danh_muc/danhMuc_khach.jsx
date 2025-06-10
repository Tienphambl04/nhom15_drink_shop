import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../../api/doUong";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";
import { addGioHang } from "../../api/gioHang";
import { useCart } from "../../components/gio_hang/cartContext";
import CommentSection from "./binhLuan";
import "./danhMuc_khach.css";

const HienThiDoUongTheoDanhMuc = () => {
  const { ma_danh_muc } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [dsDoUong, setDsDoUong] = useState([]);
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
        console.log(
          "Drink images:",
          dataDoUong.map((d) => d.hinh_anh)
        );
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

  // Reset current page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [ma_danh_muc]);

  const doUongHienThi = dsDoUong.filter((d) => d.hien_thi);

  // Pagination calculations
  const totalItems = doUongHienThi.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = doUongHienThi.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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
            `Đã thêm "${
              selectedDrink.ten_do_uong
            }" vào giỏ hàng!\nTổng tiền: ${tinhTongTien().toLocaleString()} VNĐ`
          );
          setShowModal(false);
          setSelectedOptions({});
          setSelectedDrink(null);
          setDrinkOptions({});
          await fetchCart();
        } else {
          const errorMessage =
            result?.message ||
            result?.error ||
            "Phản hồi từ server không hợp lệ";
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

  // Handle click outside to close modal
  const handleOverlayClick = (e) => {
    if (e.target.className.includes("modal-overlay")) {
      setShowModal(false);
      setSelectedOptions({});
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

      {!loading && totalItems > 0 && (
        <div className="items-info">
          Hiển thị <span>{startIndex + 1}</span> - <span>{Math.min(endIndex, totalItems)}</span> 
          {' '}trong tổng số <span>{totalItems}</span> sản phẩm
        </div>
      )}

      <div className="drink-list">
        {currentItems.map((d) => {
          const giaGiam =
            d.giam_gia_phan_tram && d.giam_gia_phan_tram > 0
              ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
              : d.gia;

          return (
            <div key={d.ma_do_uong} className="drink-item">
              <div className="drink-content">
                <div className="drink-details">
                  {d.hinh_anh ? (
                    <img
                      src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                      alt={d.ten_do_uong}
                      style={{ width: "100%", height: 200, objectFit: "cover" }}
                      onClick={() => handleThemGioHang(d)}
                    />
                  ) : (
                    <p>Không có hình ảnh</p>
                  )}
                  <h3>{d.ten_do_uong}</h3>
                  <p>
                    <strong>Giá:</strong>{" "}
                    {d.giam_gia_phan_tram > 0 ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#888",
                          }}
                        >
                          {Number(d.gia).toLocaleString()} VNĐ
                        </span>{" "}
                        <span style={{ color: "#dc2626" }}>
                          {giaGiam.toLocaleString()} VNĐ
                        </span>
                      </>
                    ) : (
                      <span>{Number(d.gia).toLocaleString()} VNĐ</span>
                    )}
                  </p>
                  <div className="drink-actions">
                    <button className="addToCartBtn" onClick={() => handleThemGioHang(d)}>
                      Thêm vào giỏ
                    </button>
                    <button className="buyNowBtn" onClick={() => handleBuyNow(d)}>
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-button pagination-prev"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ‹ Trước
          </button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="pagination-dots">...</span>
              ) : (
                <button
                  className={`pagination-button ${
                    currentPage === page ? 'active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            className="pagination-button pagination-next"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Sau ›
          </button>

          <div className="pagination-info">
            Trang {currentPage} / {totalPages}
          </div>
        </div>
      )}

      {showModal && selectedDrink && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-content">
            <h3>
              {isBuyNow ? "Mua ngay" : "Thêm vào giỏ hàng"}:{" "}
              {selectedDrink.ten_do_uong}
            </h3>
            <div className="modal-product-details">
              {selectedDrink.hinh_anh ? (
                <img
                  src={`http://localhost:5000/uploads/hinh_anh/${selectedDrink.hinh_anh}`}
                  alt={selectedDrink.ten_do_uong}
                  style={{ width: "100%", height: 200, objectFit: "cover" }}
                />
              ) : (
                <p>Không có hình ảnh</p>
              )}
              <p>
                <strong>Giá gốc:</strong>{" "}
                {Number(selectedDrink.gia).toLocaleString()} VNĐ
              </p>
              {selectedDrink.giam_gia_phan_tram > 0 && (
                <p>
                  <strong>Giảm giá:</strong> {selectedDrink.giam_gia_phan_tram}%{" "}
                  <span style={{ color: "#dc2626" }}>
                    (Giá sau giảm: {tinhTongTien().toLocaleString()} VNĐ)
                  </span>
                </p>
              )}
            </div>
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
            <div className="drink-comments">
              <CommentSection maDoUong={selectedDrink.ma_do_uong} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HienThiDoUongTheoDanhMuc;

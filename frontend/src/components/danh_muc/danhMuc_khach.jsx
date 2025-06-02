import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../../api/doUong";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";
import { fetchTuyChonByDoUong } from "../../api/tuyChon";

const HienThiDoUongTheoDanhMuc = () => {
  const { ma_danh_muc } = useParams();
  const [dsDoUong, setDsDoUong] = useState([]);
  const [tenDanhMuc, setTenDanhMuc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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

        setError(null);
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
    try {
      const options = await fetchTuyChonByDoUong(drink.ma_do_uong);
      const grouped = {};
      options.forEach((opt) => {
        if (!grouped[opt.loai_tuy_chon]) {
          grouped[opt.loai_tuy_chon] = [];
        }
        grouped[opt.loai_tuy_chon].push(opt);
      });

      setSelectedDrink(drink);
      setDrinkOptions(grouped);
      setSelectedOptions({});
      setShowModal(true);
    } catch (err) {
      alert("Lỗi khi tải tùy chọn");
    }
  };

  const handleChangeOption = (loai, gia_tri) => {
    const selected = drinkOptions[loai].find((opt) => opt.gia_tri === gia_tri);
    setSelectedOptions((prev) => ({
      ...prev,
      [loai]: {
        gia_tri: selected.gia_tri,
        gia_them: selected.gia_them
      }
    }));
  };

  const tinhTongTien = () => {
    if (!selectedDrink) return 0;
    const giamGia = selectedDrink.giam_gia_phan_tram || 0;
    const giaSauGiam = Math.round(selectedDrink.gia * (1 - giamGia / 100));
    const tongGiaThem = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + (opt.gia_them || 0),
      0
    );
    return giaSauGiam + tongGiaThem;
  };

  const handleXacNhan = () => {
    const tongTien = tinhTongTien();
    console.log("🛒 Đã thêm vào giỏ:", {
      drink: selectedDrink,
      options: selectedOptions,
      tong_tien: tongTien,
    });
    alert(`Đã thêm vào giỏ hàng!\nTổng tiền: ${tongTien.toLocaleString()} VNĐ`);
    setShowModal(false);
  };

  return (
    <div className="container">
      <h2>Đồ uống theo danh mục: {tenDanhMuc}</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && doUongHienThi.length === 0 && (
        <p>Không có đồ uống nào được hiển thị trong danh mục này.</p>
      )}

      <div
        className="drink-list"
        style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
      >
        {doUongHienThi.map((d) => {
          const giaGiam =
            d.giam_gia_phan_tram && d.giam_gia_phan_tram > 0
              ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
              : d.gia;

          return (
            <div
              key={d.ma_do_uong}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                width: 220,
                boxSizing: "border-box",
              }}
            >
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
              <button onClick={() => handleThemGioHang(d)}>Thêm vào giỏ hàng</button>
            </div>
          );
        })}
      </div>

      {/* Modal tùy chọn */}
      {showModal && selectedDrink && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center",
          }}
        >
          <div style={{ background: "white", padding: 20, borderRadius: 10, width: 400 }}>
            <h3>Chọn tùy chọn cho: {selectedDrink.ten_do_uong}</h3>

            {Object.entries(drinkOptions).map(([loai, ds]) => (
              <div key={loai} style={{ marginBottom: 10 }}>
                <label><b>{loai}</b>: </label>
                <select
                  value={selectedOptions[loai]?.gia_tri || ""}
                  onChange={(e) => handleChangeOption(loai, e.target.value)}
                >
                  <option value="">--Chọn {loai}--</option>
                  {ds.map((opt) => (
                    <option key={opt.id} value={opt.gia_tri}>
                      {opt.gia_tri} {opt.gia_them > 0 ? `(+${opt.gia_them}đ)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <p><b>Tổng tiền:</b> {tinhTongTien().toLocaleString()} VNĐ</p>

            <button onClick={handleXacNhan} style={{ marginRight: 10 }}>
              Xác nhận
            </button>
            <button onClick={() => setShowModal(false)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HienThiDoUongTheoDanhMuc;

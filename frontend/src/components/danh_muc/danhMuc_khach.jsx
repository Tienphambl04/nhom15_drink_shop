import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../../api/doUong";
import { fetchDanhSachDanhMuc } from "../../api/danh_muc";

const HienThiDoUongTheoDanhMuc = () => {
  const { ma_danh_muc } = useParams();
  const [dsDoUong, setDsDoUong] = useState([]);
  const [tenDanhMuc, setTenDanhMuc] = useState(""); // Lưu tên danh mục
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Lấy danh sách đồ uống theo mã danh mục
        const dataDoUong = await getDoUongTheoDanhMuc(ma_danh_muc);
        setDsDoUong(dataDoUong);

        // Lấy toàn bộ danh sách danh mục
        const resDanhMuc = await fetchDanhSachDanhMuc();
        if (resDanhMuc && Array.isArray(resDanhMuc.data)) {
          // Tìm danh mục theo ma_danh_muc
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

  return (
    <div className="container">
      <h2>Đồ uống theo danh mục: {tenDanhMuc}</h2>

      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && dsDoUong.length === 0 && (
        <p>Không có đồ uống nào trong danh mục này.</p>
      )}

      <div
        className="drink-list"
        style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
      >
        {dsDoUong.map((d) => {
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
              <p>Hiển thị: {d.hien_thi ? "Có" : "Không"}</p>
              {d.giam_gia_phan_tram > 0 && (
                <p style={{ fontWeight: "bold", color: "red" }}>
                  Giá sau giảm: {giaGiam.toLocaleString()} VNĐ
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HienThiDoUongTheoDanhMuc;

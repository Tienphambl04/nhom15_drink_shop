import React, { useEffect, useState } from "react";
import {
  getBinhLuanTheoDoUong,
  themBinhLuan,
  xoaBinhLuan,
} from "../../api/binhLuan";
import { initSocket, disconnectSocket } from "../../socket";
import { getToken } from "../../api/auth";
import "./binhLuan.css";

const CommentSection = ({ maDoUong }) => {
  const [binhLuans, setBinhLuans] = useState([]);
  const [noiDung, setNoiDung] = useState("");
  const [soSao, setSoSao] = useState(0);
  const [maCha, setMaCha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const maNguoiDung = localStorage.getItem("ma_nguoi_dung");
  const vaiTro = localStorage.getItem("vai_tro");

  // Tính trung bình đánh giá
  const tinhTrungBinhDanhGia = () => {
    const danhGias = binhLuans.filter((bl) => bl.so_sao && bl.so_sao > 0);
    if (danhGias.length === 0) return { trungBinh: 0, soLuot: 0 };
    const tongSao = danhGias.reduce((sum, bl) => sum + bl.so_sao, 0);
    const trungBinh = (tongSao / danhGias.length).toFixed(1);
    return { trungBinh, soLuot: danhGias.length };
  };

  // Hàm định dạng ngày
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

  // Lấy danh sách bình luận ban đầu
  const fetchBinhLuan = async () => {
    try {
      const data = await getBinhLuanTheoDoUong(maDoUong);
      console.log("Dữ liệu bình luận:", data); // Debug
      setBinhLuans(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Lấy bình luận không thành công");
      setBinhLuans([]);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo SocketIO và lấy bình luận ban đầu
  useEffect(() => {
    fetchBinhLuan();

    if (maNguoiDung) {
      initSocket(
        "user",
        (event, data) => {
          console.log("Socket event:", event, data); // Debug
          if (event === "new" && data.ma_do_uong == maDoUong) {
            setBinhLuans((prev) => [...prev, data]);
          } else if (event === "delete" && data.ma_do_uong == maDoUong) {
            setBinhLuans((prev) =>
              prev.filter((bl) => bl.ma_binh_luan !== data.ma_binh_luan)
            );
          }
        },
        "/binh-luan",
        maDoUong
      ); // Truyền maDoUong
    }

    return () => {
      disconnectSocket("/binh-luan");
    };
  }, [maDoUong, maNguoiDung]);

  // Thêm bình luận
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!maNguoiDung || !getToken()) {
      alert("Vui lòng đăng nhập để bình luận.");
      return;
    }
    if (!noiDung.trim()) {
      alert("Nội dung bình luận không được để trống.");
      return;
    }

    try {
      const data = await themBinhLuan({
        ma_do_uong: maDoUong,
        noi_dung: noiDung,
        so_sao: soSao > 0 ? soSao : null,
        ma_cha: maCha,
      });
      if (data.success) {
        setNoiDung("");
        setSoSao(0);
        setMaCha(null);
      } else {
        throw new Error(data.error || "Thêm bình luận thất bại");
      }
    } catch (err) {
      alert("Thêm bình luận thất bại: " + err.message);
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (maBinhLuan) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      const data = await xoaBinhLuan(maBinhLuan);
      if (!data.success) {
        throw new Error(data.error || "Xóa bình luận thất bại");
      }
    } catch (err) {
      alert("Xóa bình luận thất bại: " + err.message);
    }
  };

  // Trả lời bình luận
  const handleReply = (maBinhLuan) => {
    setMaCha(maBinhLuan);
  };

  // Hiển thị sao đánh giá
  const renderStars = (soSao) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ color: i < soSao ? "#FFD700" : "#ccc" }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const { trungBinh, soLuot } = tinhTrungBinhDanhGia();

  if (loading) return <p>Đang tải bình luận...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="comment-section">
      <h3>Bình luận</h3>
      <div className="average-rating">
        <p>
          Đánh giá trung bình: {trungBinh} ★ ({soLuot} lượt đánh giá)
        </p>
        {renderStars(Math.round(trungBinh))}
      </div>
      {maNguoiDung && getToken() ? (
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="comment-textarea"
          />
          <div className="star-rating">
            <label>Đánh giá: </label>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setSoSao(star)}
                style={{
                  cursor: "pointer",
                  color: star <= soSao ? "#FFD700" : "#ccc",
                }}
              >
                ★
              </span>
            ))}
          </div>
          {maCha && (
            <p>
              Đang trả lời bình luận #{maCha}{" "}
              <button
                type="button"
                onClick={() => setMaCha(null)}
                className="cancel-reply"
              >
                Hủy trả lời
              </button>
            </p>
          )}
          <button type="submit" className="submit-comment">
            Gửi bình luận
          </button>
        </form>
      ) : (
        <p>
          Vui lòng <a href="/login">đăng nhập</a> để bình luận.
        </p>
      )}
      {binhLuans.length === 0 ? (
        <p>Chưa có bình luận nào.</p>
      ) : (
        <div className="comment-list">
          {binhLuans.map((bl) => (
            <div
              key={bl.ma_binh_luan}
              className="comment-item"
              style={{ marginLeft: bl.ma_cha ? "20px" : "0" }}
            >
              <p>
                <strong>{bl.ho_ten}</strong> - {formatDate(bl.ngay_tao)}
              </p>
              <p>{bl.noi_dung}</p>
              {bl.so_sao && renderStars(bl.so_sao)}
              <div className="comment-actions">
                <button
                  onClick={() => handleReply(bl.ma_binh_luan)}
                  className="reply-button"
                >
                  Trả lời
                </button>
                {(bl.ma_nguoi_dung === maNguoiDung || vaiTro === "admin") && (
                  <button
                    onClick={() => handleDeleteComment(bl.ma_binh_luan)}
                    className="delete-button"
                  >
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;

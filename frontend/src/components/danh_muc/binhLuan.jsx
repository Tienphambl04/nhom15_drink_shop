import React, { useState, useEffect, useRef } from "react";
import { themBinhLuan, layBinhLuan, xoaBinhLuan } from "../../api/binhLuan";
import { initSocket, disconnectSocket } from "../../socket";


const CommentSection = ({ maDoUong }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [parentCommentId, setParentCommentId] = useState(null);
  const [error, setError] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const isMounted = useRef(true);

  const token = localStorage.getItem("token");
  const maNguoiDung = token ? localStorage.getItem("ma_nguoi_dung") : null;
  const vaiTro = token ? localStorage.getItem("vai_tro") : "khach";

  // Tải bình luận ban đầu
  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await layBinhLuan(maDoUong);
        if (isMounted.current) {
          setComments(data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError("Lấy bình luận thất bại");
          console.error("Lỗi khi tải bình luận:", err);
        }
      }
    };
    loadComments();

    return () => {
      isMounted.current = false;
    };
  }, [maDoUong]);

  // Thiết lập Socket.IO
  useEffect(() => {
    if (!socketRef.current) {
      const handleSocketEvent = (event, data) => {
        if (event === "binh_luan_moi" && data.ma_do_uong === maDoUong) {
          setComments((prev) => [...prev, data]);
          console.log("Nhận bình luận mới:", data);
        } else if (event === "binh_luan_xoa" && data.ma_do_uong === maDoUong) {
          setComments((prev) =>
            prev.filter((c) => c.ma_binh_luan !== data.ma_binh_luan)
          );
          console.log("Bình luận đã xóa:", data);
        }
      };

      socketRef.current = initSocket(vaiTro, handleSocketEvent, "/binh-luan", {
        onConnect: () => {
          setIsSocketConnected(true);
          socketRef.current.emit("join_room", { room: `do_uong_${maDoUong}` });
          console.log(`Kết nối Socket.IO thành công trên /binh-luan với vai trò ${vaiTro}, phòng do_uong_${maDoUong}`);
        },
        onDisconnect: () => {
          setIsSocketConnected(false);
          console.log("Ngắt kết nối Socket.IO trên /binh-luan");
        },
        onError: (err) => console.error("Lỗi Socket.IO:", err),
        reconnectOptions: {
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 5000,
          randomizationFactor: 0.5,
        },
      });
    }

    // Dự phòng tải lại bình luận nếu socket ngắt quá lâu
    const intervalId = setInterval(() => {
      if (!isSocketConnected && isMounted.current) {
        console.log("Socket ngắt kết nối, đang tải lại bình luận");
        layBinhLuan(maDoUong)
          .then((data) => isMounted.current && setComments(data))
          .catch((err) => console.error("Lỗi tải bình luận dự phòng:", err));
      }
    }, 30000); // Tăng interval để giảm tải

    return () => {
      clearInterval(intervalId);
      if (socketRef.current) {
        disconnectSocket("/binh-luan");
        socketRef.current = null;
      }
    };
  }, [maDoUong, vaiTro]); // Loại bỏ isSocketConnected khỏi dependencies

  // Xử lý gửi bình luận
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Vui lòng đăng nhập để bình luận");
      return;
    }
    if (!newComment.trim()) {
      setError("Nội dung bình luận không được để trống");
      return;
    }

    try {
      const commentData = {
        ma_do_uong: maDoUong,
        noi_dung: newComment,
        so_sao: rating || null,
        ma_cha: parentCommentId || null,
      };
      await themBinhLuan(commentData);
      setNewComment("");
      setRating(0);
      setParentCommentId(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Thêm bình luận thất bại");
      console.error("Lỗi khi gửi bình luận:", err);
    }
  };

  // Xử lý xóa bình luận
  const handleDelete = async (maBinhLuan) => {
    if (!token) {
      setError("Vui lòng đăng nhập để xóa bình luận");
      return;
    }
    try {
      await xoaBinhLuan(maBinhLuan);
      setError(null);
    } catch (err) {
      setError(err.message || "Xóa bình luận thất bại");
      console.error("Lỗi khi xóa bình luận:", err);
    }
  };

  // Xử lý trả lời bình luận
  const handleReply = (commentId) => {
    setParentCommentId(commentId);
  };

  // Hiển thị bình luận đệ quy
  const renderComments = (comments, parentId = null, indentLevel = 0) => {
    return comments
      .filter((comment) => comment.ma_cha === parentId)
      .map((comment) => (
        <div
          key={comment.ma_binh_luan}
          style={{ marginLeft: `${indentLevel * 20}px` }}
        >
          <div className="comment">
            <p>
              <strong>{comment.ten_nguoi_dung}</strong> (
              {new Date(comment.ngay_tao).toLocaleString()}):
            </p>
            <p>{comment.noi_dung}</p>
            {comment.so_sao && <p>Đánh giá: {"★".repeat(comment.so_sao)}</p>}
            <button onClick={() => handleReply(comment.ma_binh_luan)}>
              Trả lời
            </button>
            {(comment.ma_nguoi_dung === maNguoiDung || vaiTro === "admin") && (
              <button
                onClick={() => handleDelete(comment.ma_binh_luan)}
                style={{ marginLeft: "10px" }}
              >
                Xóa
              </button>
            )}
          </div>
          {renderComments(comments, comment.ma_binh_luan, indentLevel + 1)}
        </div>
      ));
  };

  return (
    <div className="comment-section">
      <h3>Bình luận</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Viết bình luận của bạn..."
          rows="4"
          className="comment-textarea"
        />
        <div className="rating">
          <label>Đánh giá: </label>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating ? "star active" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>
        {parentCommentId && (
          <p>
            Đang trả lời bình luận #{parentCommentId}{" "}
            <button onClick={() => setParentCommentId(null)}>Hủy</button>
          </p>
        )}
        <button type="submit" className="submit-button">
          Gửi bình luận
        </button>
      </form>
      <div className="comments-list">
        {comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <p>Chưa có bình luận nào.</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
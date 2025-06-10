import React, { useEffect, useState } from "react";
import {
  fetchDanhSachDanhMuc,
  suaDanhMuc,
  xoaDanhMuc,
} from "../../api/danh_muc";
import { getDoUongTheoDanhMuc, suaDoUong, xoaDoUong } from "../../api/doUong";

export default function QuanLyDanhMucVaDoUong() {
  const [danhMuc, setDanhMuc] = useState([]);
  const [doUong, setDoUong] = useState([]);
  const [danhMucChon, setDanhMucChon] = useState(null);

  // State sửa danh mục
  const [editingId, setEditingId] = useState(null);
  const [tenMoi, setTenMoi] = useState("");

  // State sửa đồ uống
  const [editingDoUongId, setEditingDoUongId] = useState(null);
  const [doUongMoi, setDoUongMoi] = useState({
    ten_do_uong: "",
    gia: "",
    giam_gia_phan_tram: "",
    mo_ta: "",
    hien_thi: true,
    hinh_anh: null,
  });
  // State để lưu URL tạm thời của ảnh được chọn
  const [previewImage, setPreviewImage] = useState(null);

  // Load danh mục
  useEffect(() => {
    loadDanhMuc();
  }, []);

  // Load đồ uống khi danh mục chọn thay đổi
  useEffect(() => {
    if (danhMucChon === null) {
      setDoUong([]);
      return;
    }
    getDoUongTheoDanhMuc(danhMucChon)
      .then((ds) => setDoUong(ds))
      .catch((err) => alert("Lỗi lấy đồ uống: " + err.message));
  }, [danhMucChon]);

  // Hủy sửa đồ uống
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  async function loadDanhMuc() {
    try {
      const res = await fetchDanhSachDanhMuc();
      setDanhMuc(res.data);
      if (!danhMucChon && res.data.length > 0) {
        setDanhMucChon(res.data[0].ma_danh_muc);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  // Sửa danh mục
  async function handleSuaDanhMuc(maDanhMuc) {
    if (!tenMoi.trim()) {
      alert("Tên danh mục không được để trống");
      return;
    }
    try {
      const res = await suaDanhMuc(maDanhMuc, tenMoi);
      alert(res.message);
      setEditingId(null);
      setTenMoi("");
      loadDanhMuc();
    } catch (error) {
      alert(error.message);
    }
  }

  // Xóa danh mục
  async function handleXoaDanhMuc(maDanhMuc) {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      const res = await xoaDanhMuc(maDanhMuc);
      alert(res.message);
      if (maDanhMuc === danhMucChon) setDanhMucChon(null);
      loadDanhMuc();
    } catch (error) {
      alert(error.message);
    }
  }

  // Bắt đầu sửa đồ uống: fill dữ liệu vào form sửa
  function handleEditDoUong(doUong) {
    setEditingDoUongId(doUong.ma_do_uong);
    setDoUongMoi({
      ten_do_uong: doUong.ten_do_uong,
      gia: doUong.gia,
      giam_gia_phan_tram: doUong.giam_gia_phan_tram,
      mo_ta: doUong.mo_ta,
      hien_thi: doUong.hien_thi,
      hinh_anh: null,
    });
    // Đặt lại previewImage khi bắt đầu sửa
    setPreviewImage(null);
  }

  // Hủy sửa đồ uống
  function handleCancelEditDoUong() {
    setEditingDoUongId(null);
    setDoUongMoi({
      ten_do_uong: "",
      gia: "",
      giam_gia_phan_tram: "",
      mo_ta: "",
      hien_thi: true,
      hinh_anh: null,
    });
    // Đặt lại previewImage khi hủy
    setPreviewImage(null);
  }

  // Xử lý khi chọn file ảnh mới
  function handleChangeFile(e) {
    const file = e.target.files[0];
    setDoUongMoi((prev) => ({ ...prev, hinh_anh: file || null }));
    // Tạo URL tạm thời để hiển thị ảnh
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage(null);
    }
  }

  // Lưu sửa đồ uống (gửi formData)
  async function handleSaveDoUong(maDoUong) {
    if (!doUongMoi.ten_do_uong.trim()) {
      alert("Tên đồ uống không được để trống");
      return;
    }
    if (isNaN(doUongMoi.gia) || doUongMoi.gia <= 0) {
      alert("Giá phải là số lớn hơn 0");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ten_do_uong", doUongMoi.ten_do_uong);
      formData.append("gia", doUongMoi.gia);
      formData.append("giam_gia_phan_tram", doUongMoi.giam_gia_phan_tram || 0);
      formData.append("mo_ta", doUongMoi.mo_ta);
      formData.append("hien_thi", doUongMoi.hien_thi ? "1" : "0");
      if (doUongMoi.hinh_anh) {
        formData.append("hinh_anh", doUongMoi.hinh_anh);
      }

      const res = await suaDoUong(maDoUong, formData);
      alert(res.message);
      setEditingDoUongId(null);
      // Đặt lại previewImage sau khi lưu
      setPreviewImage(null);

      // Reload đồ uống
      const ds = await getDoUongTheoDanhMuc(danhMucChon);
      setDoUong(ds);
    } catch (error) {
      alert(error.message);
    }
  }

  // Xóa đồ uống
  async function handleDeleteDoUong(maDoUong) {
    if (!window.confirm("Bạn có chắc muốn xóa đồ uống này?")) return;
    try {
      const res = await xoaDoUong(maDoUong);
      alert(res.message);
      // Reload đồ uống
      const ds = await getDoUongTheoDanhMuc(danhMucChon);
      setDoUong(ds);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div style={styles.container}>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

        * {
          box-sizing: border-box;
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-in {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .scale-in {
          animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @media (max-width: 1200px) {
          .main-content {
            flex-direction: column !important;
          }

          .category-section {
            width: 100% !important;
            margin-bottom: 2rem !important;
          }

          .drinks-section {
            width: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column !important;
          }

          .form-row > * {
            width: 100% !important;
            margin-bottom: 1rem !important;
          }

          .drink-info {
            flex-direction: column !important;
          }

          .drink-image {
            width: 100% !important;
            max-width: 300px !important;
            margin-top: 1rem !important;
          }
        }

        .delete-button {
          background: linear-gradient(
            135deg,
            rgb(243, 98, 9),
            rgb(254, 155, 34)
          );
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .delete-button:hover {
          background: linear-gradient(135deg, #ff8c00, #ff6b11);
        }

        .edit-button {
          background: linear-gradient(135deg, #ff6b11, #ff8c00);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .edit-button:hover {
          background: linear-gradient(135deg, #ff8c00, #ff6b11);
        }

        .secondaryBtn {
          background: linear-gradient(135deg, #ff6b11, #ff8c00);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .secondaryBtn:hover {
          background: linear-gradient(135deg, #ff8c00, #ff6b11);
        }

        .editbutton: {
          background: linear-gradient(135deg, #ff6b11, #ff8c00);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          borderradius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .deletebutton: {
          background: linear-gradient(135deg, #ff6b11, #ff8c00);
          color: white;
          padding: 0.5rem 1rem;
          border: none;
          borderradius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .buttonActive {
          background: #ff6b11;
        }
      `}</style>

      <div style={styles.header} className="fade-in">
        <h1 style={styles.mainTitle}>
          <span style={styles.titleIcon}></span>
          Quản Lý Danh Mục & Đồ Uống
        </h1>
        <p style={styles.subtitle}>Hệ thống quản lý hiện đại và thông minh</p>
      </div>

      <div style={styles.mainContent} className="main-content">
        <div
          style={styles.categorySection}
          className="category-section slide-in"
        >
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}></span>
              Danh Mục
            </h2>
            <div style={styles.badge}>{danhMuc.length} danh mục</div>
          </div>

          <div style={styles.categoryList}>
            {danhMuc.map((dm, index) => (
              <div
                key={dm.ma_danh_muc}
                style={{
                  ...styles.categoryItem,
                  ...(danhMucChon === dm.ma_danh_muc
                    ? styles.categoryItemActive
                    : {}),
                  animationDelay: `${index * 0.1}s`,
                }}
                className="scale-in"
                onClick={() => setDanhMucChon(dm.ma_danh_muc)}
              >
                {editingId === dm.ma_danh_muc ? (
                  <div style={styles.editForm}>
                    <input
                      type="text"
                      style={styles.editInput}
                      value={tenMoi}
                      onChange={(e) => setTenMoi(e.target.value)}
                      placeholder="Tên danh mục mới"
                      autoFocus
                    />
                    <div style={styles.editActions}>
                      <button
                        style={styles.saveBtn}
                        onClick={() => handleSuaDanhMuc(dm.ma_danh_muc)}
                      >
                        ✓ Lưu
                      </button>
                      <button
                        style={styles.cancelBtn}
                        onClick={() => {
                          setEditingId(null);
                          setTenMoi("");
                        }}
                      >
                        ✕ Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={styles.categoryContent}>
                      <span style={styles.categoryName}>{dm.ten_danh_muc}</span>
                      <div style={styles.categoryActions}>
                        <button
                          className="edit-button"
                          onClick={() => {
                            setEditingId(dm.ma_danh_muc);
                            setTenMoi(dm.ten_danh_muc);
                          }}
                          title="Sửa danh mục"
                        >
                          Sửa
                        </button>
                        <button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleXoaDanhMuc(dm.ma_danh_muc);
                          }}
                          title="Xóa danh mục"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.drinksSection} className="drinks-section fade-in">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>☕</span>
              Đồ Uống
            </h2>
            <div style={styles.categoryInfo}>
              {danhMuc.find((dm) => dm.ma_danh_muc === danhMucChon)
                ?.ten_danh_muc || "Chưa chọn danh mục"}
            </div>
          </div>

          {!danhMucChon ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}></div>
              <h3 style={styles.emptyTitle}>Chọn danh mục để xem đồ uống</h3>
              <p style={styles.emptyDesc}>
                Vui lòng chọn một danh mục bên trái để bắt đầu quản lý đồ uống
              </p>
            </div>
          ) : (
            <div style={styles.drinksList}>
              {doUong.map((d, index) => (
                <div
                  key={d.ma_do_uong}
                  style={{
                    ...styles.drinkItem,
                    animationDelay: `${index * 0.1}s`,
                  }}
                  className="scale-in"
                >
                  {editingDoUongId === d.ma_do_uong ? (
                    <div style={styles.drinkEditForm}>
                      <h3 style={styles.editFormTitle}> Chỉnh sửa đồ uống</h3>

                      <div style={styles.formRow} className="form-row">
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Tên đồ uống</label>
                          <input
                            type="text"
                            style={styles.input}
                            value={doUongMoi.ten_do_uong}
                            onChange={(e) =>
                              setDoUongMoi({
                                ...doUongMoi,
                                ten_do_uong: e.target.value,
                              })
                            }
                            placeholder="Nhập tên đồ uống"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Giá (VNĐ)</label>
                          <input
                            type="number"
                            style={styles.input}
                            value={doUongMoi.gia}
                            onChange={(e) =>
                              setDoUongMoi({
                                ...doUongMoi,
                                gia: e.target.value,
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div style={styles.formRow} className="form-row">
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Giảm giá (%)</label>
                          <input
                            type="number"
                            style={styles.input}
                            value={doUongMoi.giam_gia_phan_tram}
                            onChange={(e) =>
                              setDoUongMoi({
                                ...doUongMoi,
                                giam_gia_phan_tram: e.target.value,
                              })
                            }
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              style={styles.checkbox}
                              checked={doUongMoi.hien_thi}
                              onChange={(e) =>
                                setDoUongMoi({
                                  ...doUongMoi,
                                  hien_thi: e.target.checked,
                                })
                              }
                            />
                            <span style={styles.checkboxText}>
                              Hiển thị sản phẩm
                            </span>
                          </label>
                        </div>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Mô tả</label>
                        <textarea
                          style={styles.textarea}
                          value={doUongMoi.mo_ta}
                          onChange={(e) =>
                            setDoUongMoi({
                              ...doUongMoi,
                              mo_ta: e.target.value,
                            })
                          }
                          placeholder="Nhập mô tả sản phẩm..."
                          rows="3"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Hình ảnh mới</label>
                        <input
                          type="file"
                          style={styles.fileInput}
                          accept="image/*"
                          onChange={handleChangeFile}
                        />
                        {previewImage && (
                          <div style={{ marginTop: "1rem" }}>
                            <img
                              src={previewImage}
                              alt="Preview"
                              style={{
                                ...styles.drinkImage,
                                maxWidth: "200px",
                                maxHeight: "200px",
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div style={styles.formActions}>
                        <button
                          className="secondaryBtn"
                          onClick={() => handleSaveDoUong(d.ma_do_uong)}
                        >
                          Lưu thay đổi
                        </button>
                        <button
                          className="secondaryBtn"
                          onClick={handleCancelEditDoUong}
                        >
                          Hủy bỏ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={styles.drinkHeader}>
                        <h3 style={styles.drinkName}>{d.ten_do_uong}</h3>
                        <div style={styles.drinkActions}>
                          <button
                            style={styles.editBtn}
                            onClick={() => handleEditDoUong(d)}
                            title="Sửa đồ uống"
                          >
                            Sửa
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDeleteDoUong(d.ma_do_uong)}
                            title="Xóa đồ uống"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      <div style={styles.drinkInfo} className="drink-info">
                        <div style={styles.drinkDetails}>
                          <div style={styles.priceSection}>
                            <div style={styles.priceItem}>
                              <span style={styles.priceLabel}>Giá gốc:</span>
                              <span style={styles.priceValue}>
                                {Number(d.gia).toLocaleString()} VNĐ
                              </span>
                            </div>

                            {d.giam_gia_phan_tram > 0 && (
                              <>
                                <div style={styles.priceItem}>
                                  <span style={styles.priceLabel}>
                                    Giảm giá:
                                  </span>
                                  <span style={styles.discountValue}>
                                    -{d.giam_gia_phan_tram}%
                                  </span>
                                </div>
                                <div style={styles.priceItem}>
                                  <span style={styles.priceLabel}>
                                    Giá bán:
                                  </span>
                                  <span style={styles.finalPrice}>
                                    {(
                                      d.gia *
                                      (1 - (d.giam_gia_phan_tram || 0) / 100)
                                    ).toLocaleString()}{" "}
                                    VNĐ
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          <div style={styles.descriptionSection}>
                            <span style={styles.descLabel}>Mô tả:</span>
                            <p style={styles.descText}>
                              {d.mo_ta || "Chưa có mô tả"}
                            </p>
                          </div>

                          <div style={styles.statusSection}>
                            <span
                              style={{
                                ...styles.statusBadge,
                                ...(d.hien_thi
                                  ? styles.statusActive
                                  : styles.statusInactive),
                              }}
                            >
                              {d.hien_thi ? " Đang hiển thị" : " Đã ẩn"}
                            </span>
                          </div>
                        </div>

                        {d.hinh_anh && (
                          <div style={styles.imageContainer}>
                            <img
                              src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                              alt={d.ten_do_uong}
                              style={styles.drinkImage}
                              className="drink-image"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}

              {doUong.length === 0 && (
                <div style={styles.emptyDrinks}>
                  <div style={styles.emptyIcon}></div>
                  <h3 style={styles.emptyTitle}>Chưa có đồ uống nào</h3>
                  <p style={styles.emptyDesc}>
                    Danh mục này chưa có đồ uống nào được thêm vào
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(135deg,white)",
    padding: "2rem",
    color: "#333",
  },

  header: {
    textAlign: "center",
    marginBottom: "3rem",
    color: "white",
  },

  mainTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    margin: "0 0 1rem 0",
    textShadow: "0 4px 8px rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  },

  titleIcon: {
    fontSize: "3.5rem",
    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
  },

  subtitle: {
    fontSize: "1.2rem",
    opacity: 0.9,
    margin: 0,
    fontWeight: "300",
  },

  mainContent: {
    display: "flex",
    gap: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  categorySection: {
    width: "350px",
    flexShrink: 0,
  },

  drinksSection: {
    flex: 1,
    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    padding: "1.5rem",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },

  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#2d3748",
  },

  sectionIcon: {
    fontSize: "1.5rem",
  },

  badge: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },

  categoryInfo: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "500",
  },

  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },

  categoryItem: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "12px",
    padding: "1rem",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "2px solid transparent",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
  },

  categoryItemActive: {
    background: "linear-gradient(135deg,#ff6b11)",
    color: "white",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
  },

  categoryContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryName: {
    fontSize: "1.1rem",
    fontWeight: "500",
  },

  categoryActions: {
    display: "flex",
    gap: "0.5rem",
    opacity: 0.7,
    transition: "opacity 0.2s",
  },

  editBtnSmall: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    borderRadius: "6px",
    transition: "background-color 0.2s",
    fontSize: "1rem",
  },

  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  editInput: {
    padding: "0.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "border-color 0.2s",
    outline: "none",
  },

  editActions: {
    display: "flex",
    gap: "0.5rem",
  },

  saveBtn: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.875rem",
    transition: "all 0.2s",
  },

  cancelBtn: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.875rem",
    transition: "all 0.2s",
  },

  drinksList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  drinkItem: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    padding: "1.5rem",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  drinkHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    paddingBottom: "1rem",
    borderBottom: "2px solid #f1f5f9",
  },

  drinkName: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: 0,
    color: "#2d3748",
  },

  drinkActions: {
    display: "flex",
    gap: "0.75rem",
  },

  editBtn: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.875rem",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },

  deleteBtn: {
    background: "linear-gradient(135deg,#ff6b35,#f7931e)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.875rem",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },

  drinkInfo: {
    display: "flex",
    gap: "2rem",
    alignItems: "flex-start",
  },

  drinkDetails: {
    flex: 1,
  },

  priceSection: {
    marginBottom: "1.5rem",
  },

  priceItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f1f5f9",
  },

  priceLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "500",
  },

  priceValue: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2d3748",
  },

  discountValue: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#f56565",
    background: "rgba(245, 101, 101, 0.1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
  },

  finalPrice: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#48bb78",
    background: "rgba(72, 187, 120, 0.1)",
    padding: "0.25rem 0.5rem",
    borderRadius: "6px",
  },

  descriptionSection: {
    marginBottom: "1.5rem",
  },

  descLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "500",
    display: "block",
    marginBottom: "0.5rem",
  },

  descText: {
    fontSize: "0.875rem",
    color: "#4a5568",
    lineHeight: "1.6",
    margin: 0,
    background: "#f8fafc",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid #667eea",
  },

  statusSection: {
    display: "flex",
    alignItems: "center",
  },

  statusBadge: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontSize: "0.875rem",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
  },

  statusActive: {
    background: "rgba(72, 187, 120, 0.1)",
    color: "#38a169",
    border: "2px solid rgba(72, 187, 120, 0.3)",
  },

  statusInactive: {
    background: "rgba(245, 101, 101, 0.1)",
    color: "#e53e3e",
    border: "2px solid rgba(245, 101, 101, 0.3)",
  },

  imageContainer: {
    flexShrink: 0,
  },

  drinkImage: {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    transition: "transform 0.3s ease",
  },

  drinkEditForm: {
    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
    padding: "2rem",
    borderRadius: "12px",
    border: "2px solid #cbd5e0",
  },

  editFormTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 1.5rem 0",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  formRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
  },

  formGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "0.5rem",
  },

  input: {
    padding: "0.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    background: "white",
  },

  textarea: {
    padding: "0.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "1rem",
    transition: "all 0.2s",
    outline: "none",
    background: "white",
    resize: "vertical",
    minHeight: "80px",
  },

  fileInput: {
    padding: "0.75rem",
    border: "2px dashed #cbd5e0",
    borderRadius: "8px",
    fontSize: "1rem",
    background: "white",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    marginTop: "1.5rem",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#667eea",
  },

  checkboxText: {
    fontSize: "0.875rem",
    fontWeight: "500",
    color: "#374151",
  },

  formActions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "2px solid #e2e8f0",
  },

  primaryBtn: {
    background: "linear-gradient(135deg, #48bb78, #38a169)",
    color: "white",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "1rem",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
};

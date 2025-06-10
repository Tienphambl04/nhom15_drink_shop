import React, { useState, useEffect } from "react";
import { updateProfile, getProfile, getToken } from "../../api/auth";
import "./profile.css";

function Profile() {
  const [formData, setFormData] = useState({
    ho_ten: localStorage.getItem("ho_ten") || "",
    email: localStorage.getItem("email") || "",
    dia_chi: localStorage.getItem("dia_chi") || "",
    so_dien_thoai: localStorage.getItem("so_dien_thoai") || "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (token) {
        const result = await getProfile(token);
        if (result.success) {
          setFormData({
            ho_ten: result.user.ho_ten || "",
            email: result.user.email || "",
            dia_chi: result.user.dia_chi || "",
            so_dien_thoai: result.user.so_dien_thoai || "",
          });
          // Update localStorage with latest email (not stored during login)
          localStorage.setItem("email", result.user.email || "");
          localStorage.setItem("ho_ten", result.user.ho_ten || "");
          localStorage.setItem("dia_chi", result.user.dia_chi || "");
          localStorage.setItem(
            "so_dien_thoai",
            result.user.so_dien_thoai || ""
          );
        } else {
          alert(result.message || "Không thể tải thông tin người dùng");
        }
      } else {
        alert("Vui lòng đăng nhập để xem thông tin cá nhân");
      }
    };

    fetchProfile();
  }, []); // Empty dependency array to run only on mount

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { ho_ten, email, dia_chi, so_dien_thoai } = formData;

    // Kiểm tra các trường không được để trống
    if (!ho_ten || !email || !dia_chi || !so_dien_thoai) {
      alert("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Email không hợp lệ.");
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(so_dien_thoai)) {
      alert("Số điện thoại không hợp lệ.");
      return;
    }

    // Gửi dữ liệu nếu hợp lệ
    const token = getToken();
    const result = await updateProfile(formData, token);

    if (result.success) {
      alert("Cập nhật thông tin thành công!");
      localStorage.setItem("ho_ten", result.user.ho_ten);
      localStorage.setItem("email", result.user.email || "");
      localStorage.setItem("dia_chi", result.user.dia_chi || "");
      localStorage.setItem("so_dien_thoai", result.user.so_dien_thoai || "");
    } else {
      alert(result.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        name="ho_ten"
        value={formData.ho_ten}
        onChange={handleChange}
        placeholder="Họ tên"
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="dia_chi"
        value={formData.dia_chi}
        onChange={handleChange}
        placeholder="Địa chỉ"
      />
      <input
        name="so_dien_thoai"
        value={formData.so_dien_thoai}
        onChange={handleChange}
        placeholder="Số điện thoại"
      />
      <button type="submit">Cập nhật</button>
    </form>
  );
}

export default Profile;

import React, { useState } from "react";
import { guiPhanHoi } from "../../api/lienHeApi";
import "./contactForm.css";

function ContactForm() {
  const [form, setForm] = useState({
    ten: "",
    email: "",
    chu_de: "",
    noi_dung: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await guiPhanHoi(form);
      alert("Gửi phản hồi thành công!");
      setForm({ ten: "", email: "", chu_de: "", noi_dung: "" });
    } catch (error) {
      alert("Gửi thất bại!");
    }
  };

  return (
    <div className="contact-form-container">
      <div className="section-header">
        <div className="title-underline"></div>
      </div>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          name="ten"
          placeholder="Tên của bạn"
          value={form.ten}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email của bạn"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="chu_de"
          placeholder="Chủ đề"
          value={form.chu_de}
          onChange={handleChange}
        />
        <textarea
          name="noi_dung"
          placeholder="Nội dung phản hồi"
          value={form.noi_dung}
          onChange={handleChange}
          required
        />
        <button type="submit">Gửi Phản Hồi</button>
      </form>
    </div>
  );
}

export default ContactForm;

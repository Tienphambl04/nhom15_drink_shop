import React, { useEffect, useState, useRef } from "react";
import { layDanhSachBlog } from "../../api/blog";
import "./blogList.css";

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await layDanhSachBlog();
        setBlogs(data);
      } catch {
        alert("Lấy danh sách blog thất bại!");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Kiểm tra trạng thái scroll để enable/disable nút
  const checkScroll = () => {
    if (!scrollRef.current) return;
    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
    setCanScrollRight(
      scrollRef.current.scrollLeft + scrollRef.current.clientWidth <
        scrollRef.current.scrollWidth
    );
  };

  useEffect(() => {
    const currentRef = scrollRef.current;
    if (!currentRef) return;

    currentRef.addEventListener("scroll", checkScroll);
    return () => currentRef.removeEventListener("scroll", checkScroll);
  }, []);

  const scrollByItem = 300; // Kích thước 1 card + gap

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollByItem, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollByItem, behavior: "smooth" });
    }
  };

  const handleDragStart = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftStart(scrollRef.current.scrollLeft);
  };

  const handleDragMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Speed of drag
    scrollRef.current.scrollLeft = scrollLeftStart - walk;
    checkScroll();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  if (selectedBlog) {
    return (
      <div className="blog-detail">
        <button className="back-btn" onClick={() => setSelectedBlog(null)}>
          ← Quay lại
        </button>
        <h2 className="detail-title">{selectedBlog.tieu_de}</h2>
        <img
          className="detail-image"
          src={`http://localhost:5000/uploads/hinh_anh/${selectedBlog.hinh_anh
            .split("/")
            .pop()}`}
          alt={selectedBlog.tieu_de}
        />
        <p className="detail-content">{selectedBlog.noi_dung}</p>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      <h1>Danh sách Blog</h1>

      <div className="carousel-wrapper">
        <button
          className="scroll-btn left"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Cuộn trái"
        >
          ←
        </button>

        <div
          className="blog-carousel"
          ref={scrollRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {blogs.map((blog) => (
            <div
              key={blog.ma_blog}
              className="blog-card"
              onClick={() => setSelectedBlog(blog)}
            >
              <img
                className="blog-thumb"
                src={`http://localhost:5000/uploads/hinh_anh/${blog.hinh_anh
                  .split("/")
                  .pop()}`}
                alt={blog.tieu_de}
              />
              <h3 className="blog-title">{blog.tieu_de}</h3>
            </div>
          ))}
        </div>

        <button
          className="scroll-btn right"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Cuộn phải"
        >
          →
        </button>
      </div>
    </div>
  );
}

export default BlogList;

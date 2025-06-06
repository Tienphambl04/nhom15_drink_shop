import React, { useEffect, useState, useRef } from 'react';
import { layDanhSachBlog} from '../../api/blog'
import './blogList.css';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await layDanhSachBlog();
        setBlogs(data);
      } catch {
        alert('Lấy danh sách blog thất bại!');
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
      scrollRef.current.scrollLeft + scrollRef.current.clientWidth < scrollRef.current.scrollWidth
    );
  };

  useEffect(() => {
  const currentRef = scrollRef.current;
  if (!currentRef) return;

  currentRef.addEventListener('scroll', checkScroll);
  return () => currentRef.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollByItem = 300; // Kích thước 1 card + gap

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollByItem, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollByItem, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  if (selectedBlog) {
    return (
      <div className="blog-detail">
        <button className="back-btn" onClick={() => setSelectedBlog(null)}>← Quay lại</button>
        <h2 className="detail-title">{selectedBlog.tieu_de}</h2>
        <img
          className="detail-image"
          src={`http://localhost:5000/${selectedBlog.hinh_anh}`}
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
          &#8592;
        </button>

        <div className="blog-carousel" ref={scrollRef}>
          {blogs.map(blog => (
            <div
              key={blog.ma_blog}
              className="blog-card"
              onClick={() => setSelectedBlog(blog)}
            >
              <img
                className="blog-thumb"
                src={`http://localhost:5000/${blog.hinh_anh}`}
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
          &#8594;
        </button>
      </div>
    </div>
  );
}

export default BlogList;

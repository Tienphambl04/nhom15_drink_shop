import React, { useState, useEffect } from 'react';
import './adminblogList.css';
import { layDanhSachBlog, xoaBlog } from '../../../api/blog';
import BlogForm from './blogForm';

function AdminBlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleBlogs, setVisibleBlogs] = useState(6);
  const [dangSuaBlog, setDangSuaBlog] = useState(null);

  const fetchBlogs = async () => {
    try {
      const data = await layDanhSachBlog();
      setBlogs(data);
    } catch (error) {
      alert('Lấy danh sách blog thất bại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (ma_blog) => {
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa blog này?');
    if (!confirm) return;

    try {
      await xoaBlog(ma_blog);
      setBlogs(blogs.filter(blog => blog.ma_blog !== ma_blog));
      alert('Xóa blog thành công!');
    } catch (error) {
      alert('Xóa blog thất bại!');
    }
  };

  const handleLoadMore = () => {
    setVisibleBlogs(prev => prev + 6);
  };

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;

  return (
    <div className="wrapper-grid">
      <div className="admin-blog-list">
        

        {dangSuaBlog ? (
          <>
            <BlogForm
              blogEdit={dangSuaBlog}
              onSuccess={() => {
                setDangSuaBlog(null);
                fetchBlogs();
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                className="delete-btn"
                style={{ padding: '10px 20px' }}
                onClick={() => setDangSuaBlog(null)}
              >
                Huỷ chỉnh sửa
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="blog-list-flex">
              {blogs.slice(0, visibleBlogs).map(blog => (
                <div key={blog.ma_blog} className="blog-card">
                  <img
                    className="blog-thumb"
                    src={`http://localhost:5000/${blog.hinh_anh}`}
                    alt={blog.tieu_de}
                  />
                  <h3 className="blog-title">
                    {blog.tieu_de.length > 50
                      ? blog.tieu_de.slice(0, 50) + '...'
                      : blog.tieu_de}
                  </h3>

                  <div className="blog-actions">
                    <button
                      className="edit-btn"
                      onClick={() => setDangSuaBlog(blog)}
                    >
                      Sửa
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(blog.ma_blog)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {visibleBlogs < blogs.length && (
              <div className="load-more">
                <button onClick={handleLoadMore}>Xem thêm</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminBlogList;

import React, { useState, useEffect } from 'react';
import AdminBlogList from './adminblogList';

function BlogPage(){
  const [dangSuaBlog, setDangSuaBlog] = useState(null);
  return (
    <div style={{ padding: '2rem' }}>
      <h2>{dangSuaBlog ? 'Chỉnh sửa Blog' : 'Danh sách Blog'}</h2>
      <AdminBlogList />
    </div>
  );
}

export default BlogPage;

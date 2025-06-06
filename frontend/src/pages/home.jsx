import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoUongTheoDanhMuc } from '../api/doUong';
import { fetchDanhSachDanhMuc } from '../api/danh_muc';
import { fetchTuyChonByDoUong } from '../api/tuyChon';
import { addGioHang } from '../api/gioHang';
import { layDanhSachBlog } from '../api/blog';
import { getTopDrinks } from '../api/donHang';
import { useCart } from '../components/gio_hang/cartContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  // State for categories and drinks
  const [danhMucList, setDanhMucList] = useState([]);
  const [doUongByDanhMuc, setDoUongByDanhMuc] = useState({});
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [error, setError] = useState(null);

  // State for top drinks
  const [topDrinks, setTopDrinks] = useState([]);
  const [loadingTopDrinks, setLoadingTopDrinks] = useState(true);

  // State for drink options modal
  const [showModal, setShowModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isBuyNow, setIsBuyNow] = useState(false);

  // State for blogs
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  // Refs for carousel scroll
  const scrollRefs = useRef({});

  // Fetch categories and drinks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingDrinks(true);
        setError(null);

        // Fetch categories
        const resDanhMuc = await fetchDanhSachDanhMuc();
        if (resDanhMuc && Array.isArray(resDanhMuc.data)) {
          setDanhMucList(resDanhMuc.data);

          // Fetch drinks for each category
          const drinksData = {};
          for (const dm of resDanhMuc.data) {
            const drinks = await getDoUongTheoDanhMuc(dm.ma_danh_muc);
            drinksData[dm.ma_danh_muc] = drinks.filter(d => d.hien_thi);
          }
          setDoUongByDanhMuc(drinksData);
        } else {
          setError('Không thể tải danh sách danh mục');
        }
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu đồ uống');
        console.error('Error loading drinks:', err);
      } finally {
        setLoadingDrinks(false);
      }
    };

    loadData();
  }, []);

  // Fetch top drinks
  useEffect(() => {
    const fetchTopDrinks = async () => {
      try {
        setLoadingTopDrinks(true);
        const data = await getTopDrinks({ limit: 10 });
        console.log('Top drinks fetched:', data); // Debug data
        setTopDrinks(data);
      } catch (err) {
        console.error('Error fetching top drinks:', err.message); // Debug error
        setError('Không thể tải danh sách đồ uống bán chạy');
      } finally {
        setLoadingTopDrinks(false);
      }
    };
    fetchTopDrinks();
  }, []);

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const data = await layDanhSachBlog();
        setBlogs(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        alert('Lấy danh sách blog thất bại!');
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  // Scroll handling for each category and top drinks carousel
  const checkScroll = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (!scrollRef) return;
    scrollRef.dataset.canScrollLeft = scrollRef.scrollLeft > 0;
    scrollRef.dataset.canScrollRight =
      scrollRef.scrollLeft + scrollRef.clientWidth < scrollRef.scrollWidth;
  };

  useEffect(() => {
    const currentScrollRefs = scrollRefs.current;
    Object.keys(currentScrollRefs).forEach(key => {
      const scrollRef = currentScrollRefs[key];
      if (scrollRef) {
        scrollRef.addEventListener('scroll', () => checkScroll(key));
        checkScroll(key); // Initial check
      }
    });

    return () => {
      Object.keys(currentScrollRefs).forEach(key => {
        const scrollRef = currentScrollRefs[key];
        if (scrollRef) {
          scrollRef.removeEventListener('scroll', () => checkScroll(key));
        }
      });
    };
  }, [doUongByDanhMuc, topDrinks]);

  const scrollLeft = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (scrollRef) {
      scrollRef.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (scrollRef) {
      scrollRef.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Handle drink options
  const handleThemGioHang = async (drink) => {
    setIsBuyNow(false);
    await loadDrinkOptions(drink);
  };

  const handleBuyNow = async (drink) => {
    setIsBuyNow(true);
    await loadDrinkOptions(drink);
  };

  const loadDrinkOptions = async (drink) => {
    try {
      const options = await fetchTuyChonByDoUong(drink.ma_do_uong);
      const grouped = {};
      options.forEach(opt => {
        if (!grouped[opt.loai_tuy_chon]) grouped[opt.loai_tuy_chon] = [];
        grouped[opt.loai_tuy_chon].push(opt);
      });

      setSelectedDrink(drink);
      setDrinkOptions(grouped);
      setSelectedOptions({});
      setShowModal(true);
    } catch (err) {
      alert('Lỗi khi tải tùy chọn đồ uống');
      console.error('Error loading drink options:', err);
    }
  };

  const handleChangeOption = (loai, gia_tri) => {
    const opt = drinkOptions[loai].find(o => o.gia_tri === gia_tri);
    setSelectedOptions(prev => ({
      ...prev,
      [loai]: { gia_tri: opt.gia_tri, gia_them: opt.gia_them },
    }));
  };

  const tinhTongTien = () => {
    if (!selectedDrink) return 0;
    const giamGia = selectedDrink.giam_gia_phan_tram || 0;
    const giaGoc = selectedDrink.gia || 0;
    const giaSauGiam = Math.round(giaGoc * (1 - giamGia / 100));
    const tongGiaThem = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + (opt.gia_them || 0),
      0
    );
    return giaSauGiam + tongGiaThem;
  };

  const handleXacNhan = async () => {
    if (!selectedDrink) return;

    const token = localStorage.getItem('token');
    const maNguoiDung = token ? localStorage.getItem('ma_nguoi_dung') : null;

    if (!maNguoiDung || !token) {
      alert('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
      setShowModal(false);
      navigate('/login');
      return;
    }

    const tuyChonArr = Object.entries(selectedOptions).map(([loai, opt]) => ({
      loai_tuy_chon: loai,
      gia_tri: opt.gia_tri,
      gia_them: opt.gia_them,
    }));

    try {
      if (isBuyNow) {
        const tempItem = {
          ma_do_uong: selectedDrink.ma_do_uong,
          ten_do_uong: selectedDrink.ten_do_uong,
          so_luong: 1,
          tuy_chon: tuyChonArr,
          tong_gia: tinhTongTien(),
        };
        localStorage.setItem('buyNowItem', JSON.stringify([tempItem]));
        localStorage.removeItem('selectedCartItems');
        setShowModal(false);
        setSelectedOptions({});
        setSelectedDrink(null);
        setDrinkOptions({});
        navigate('/don-hang');
      } else {
        const result = await addGioHang({
          ma_nguoi_dung: Number(maNguoiDung),
          ma_do_uong: selectedDrink.ma_do_uong,
          so_luong: 1,
          tuy_chon: tuyChonArr,
        });

        if (result && result.success) {
          alert(`Đã thêm "${selectedDrink.ten_do_uong}" vào giỏ hàng!\nTổng tiền: ${tinhTongTien().toLocaleString()} VNĐ`);
          setShowModal(false);
          setSelectedOptions({});
          setSelectedDrink(null);
          setDrinkOptions({});
          await fetchCart();
        } else {
          throw new Error(result?.message || 'Thêm vào giỏ hàng thất bại');
        }
      }
    } catch (err) {
      alert(`Thao tác thất bại!\nLỗi: ${err.message}`);
    }
  };

  // Render blog detail if selected
  if (selectedBlog) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
          onClick={() => setSelectedBlog(null)}
        >
          ← Quay lại
        </button>
        <h2 className="text-2xl font-bold mb-4">{selectedBlog.tieu_de}</h2>
        <img
          className="w-full h-64 object-cover rounded mb-4"
          src={`http://localhost:5000/${selectedBlog.hinh_anh}`}
          alt={selectedBlog.tieu_de}
        />
        <p className="text-gray-700">{selectedBlog.noi_dung}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Top Drinks Section */}
      <h1 className="text-3xl font-bold mb-6">Đồ Uống Bán Chạy</h1>
      {loadingTopDrinks && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingTopDrinks && topDrinks.length === 0 && (
        <p className="text-center">Không có đồ uống bán chạy nào.</p>
      )}
      {topDrinks.length > 0 && (
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
            onClick={() => scrollLeft('top-drinks')}
            disabled={!scrollRefs.current['top-drinks']?.dataset.canScrollLeft}
          >
            ←
          </button>
          <div
            className="flex overflow-x-auto scroll-smooth gap-4 pb-4"
            ref={el => (scrollRefs.current['top-drinks'] = el)}
          >
            {topDrinks.map(d => {
              const giaGiam =
                d.giam_gia_phan_tram > 0
                  ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
                  : d.gia;

              return (
                <div
                  key={d.ma_do_uong}
                  className="min-w-[250px] bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                >
                  {d.hinh_anh ? (
                    <img
                      src={`http://localhost:5000/Uploads/hinh_anh/${d.hinh_anh}`}
                      alt={d.ten_do_uong}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => console.error(`Failed to load image: ${e.target.src}`)}
                    />
                  ) : (
                    <p className="text-center">Không có hình ảnh</p>
                  )}
                  <h3 className="text-lg font-semibold">{d.ten_do_uong}</h3>
                  <p className="text-gray-600">
                    Giá: {Number(d.gia).toLocaleString()} VNĐ
                    {d.giam_gia_phan_tram > 0 && (
                      <span className="text-red-500">
                        {' '}
                        (Giảm: {giaGiam.toLocaleString()} VNĐ)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Đã bán: {d.total_quantity} đơn
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                      onClick={() => handleThemGioHang(d)}
                    >
                      Thêm vào giỏ
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                      onClick={() => handleBuyNow(d)}
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
            onClick={() => scrollRight('top-drinks')}
            disabled={!scrollRefs.current['top-drinks']?.dataset.canScrollRight}
          >
            →
          </button>
        </div>
      )}

      {/* Drinks Section */}
      <h1 className="text-3xl font-bold mb-6 mt-12">Danh Sách Đồ Uống</h1>
      {loadingDrinks && <p className="text-center">Đang tải...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loadingDrinks && danhMucList.length === 0 && (
        <p className="text-center">Không có danh mục nào.</p>
      )}

      {danhMucList.map(dm => (
        <div key={dm.ma_danh_muc} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{dm.ten_danh_muc}</h2>
          {doUongByDanhMuc[dm.ma_danh_muc]?.length > 0 ? (
            <div className="relative">
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                onClick={() => scrollLeft(dm.ma_danh_muc)}
                disabled={!scrollRefs.current[dm.ma_danh_muc]?.dataset.canScrollLeft}
              >
                ←
              </button>
              <div
                className="flex overflow-x-auto scroll-smooth gap-4 pb-4"
                ref={el => (scrollRefs.current[dm.ma_danh_muc] = el)}
              >
                {doUongByDanhMuc[dm.ma_danh_muc].map(d => {
                  const giaGiam =
                    d.giam_gia_phan_tram > 0
                      ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
                      : d.gia;

                  return (
                    <div
                      key={d.ma_do_uong}
                      className="min-w-[250px] bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
                    >
                      {d.hinh_anh ? (
                        <img
                          src={`http://localhost:5000/Uploads/hinh_anh/${d.hinh_anh}`}
                          alt={d.ten_do_uong}
                          className="w-full h-32 object-cover rounded mb-2"
                          onError={(e) => console.error(`Failed to load image: ${e.target.src}`)}
                        />
                      ) : (
                        <p className="text-center">Không có hình ảnh</p>
                      )}
                      <h3 className="text-lg font-semibold">{d.ten_do_uong}</h3>
                      <p className="text-gray-600">
                        Giá: {Number(d.gia).toLocaleString()} VNĐ
                        {d.giam_gia_phan_tram > 0 && (
                          <span className="text-red-500">
                            {' '}
                            (Giảm: {giaGiam.toLocaleString()} VNĐ)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {d.mo_ta || 'Không có mô tả'}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                          onClick={() => handleThemGioHang(d)}
                        >
                          Thêm vào giỏ
                        </button>
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          onClick={() => handleBuyNow(d)}
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
                onClick={() => scrollRight(dm.ma_danh_muc)}
                disabled={!scrollRefs.current[dm.ma_danh_muc]?.dataset.canScrollRight}
              >
                →
              </button>
            </div>
          ) : (
            <p>Không có đồ uống nào trong danh mục này.</p>
          )}
        </div>
      ))}

      {/* Modal for drink options */}
      {showModal && selectedDrink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {isBuyNow ? 'Mua ngay' : 'Thêm vào giỏ hàng'}: {selectedDrink.ten_do_uong}
            </h3>
            {Object.entries(drinkOptions).map(([loai, opts]) => (
              <div key={loai} className="mb-4">
                <p className="font-semibold">{loai}</p>
                {opts.map(opt => (
                  <label key={`${loai}-${opt.gia_tri}`} className="block">
                    <input
                      type="radio"
                      name={loai}
                      value={opt.gia_tri}
                      checked={selectedOptions[loai]?.gia_tri === opt.gia_tri}
                      onChange={() => handleChangeOption(loai, opt.gia_tri)}
                      className="mr-2"
                    />
                    {opt.gia_tri} (+{opt.gia_them.toLocaleString()} VNĐ)
                  </label>
                ))}
              </div>
            ))}
            <p className="font-bold mt-4">
              Tổng tiền: {tinhTongTien().toLocaleString()} VNĐ
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                onClick={() => {
                  setShowModal(false);
                  setSelectedOptions({});
                }}
              >
                Hủy
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                onClick={handleXacNhan}
              >
                {isBuyNow ? 'Xác nhận mua' : 'Thêm vào giỏ hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Section */}
      <h1 className="text-3xl font-bold mb-6 mt-12">Danh Sách Blog</h1>
      {loadingBlogs && <p className="text-center">Đang tải...</p>}
      {!loadingBlogs && blogs.length === 0 && (
        <p className="text-center">Không có blog nào.</p>
      )}
      <div className="relative">
        <button
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={() => scrollLeft('blog')}
          disabled={!scrollRefs.current['blog']?.dataset.canScrollLeft}
        >
          ←
        </button>
        <div
          className="flex overflow-x-auto scroll-smooth gap-4 pb-4"
          ref={el => (scrollRefs.current['blog'] = el)}
        >
          {blogs.map(blog => (
            <div
              key={blog.ma_blog}
              className="min-w-[250px] bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedBlog(blog)}
            >
              <img
                className="w-full h-32 object-cover rounded mb-2"
                src={`http://localhost:5000/${blog.hinh_anh}`}
                alt={blog.tieu_de}
              />
              <h3 className="text-lg font-semibold">{blog.tieu_de}</h3>
            </div>
          ))}
        </div>
        <button
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
          onClick={() => scrollRight('blog')}
          disabled={!scrollRefs.current['blog']?.dataset.canScrollRight}
        >
          →
        </button>
      </div>
    </div>
  );
};

export default HomePage;
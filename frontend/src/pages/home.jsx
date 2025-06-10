import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDoUongTheoDanhMuc } from "../api/doUong";
import { fetchDanhSachDanhMuc } from "../api/danh_muc";
import { fetchTuyChonByDoUong } from "../api/tuyChon";
import { addGioHang } from "../api/gioHang";
import { layDanhSachBlog } from "../api/blog";
import { getTopDrinks } from "../api/donHang";
import { useCart } from "../components/gio_hang/cartContext";

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 16px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "white",
    minHeight: "100vh",
  },

  // Hero Section
  hero: {
    position: "relative",
    background: "linear-gradient(135deg, #a7c5eb 0%, #d6a4e0 100%)",
    borderRadius: "20px",
    padding: "80px 60px",
    margin: "20px 0 40px",
    color: "#333",
    textAlign: "center",
    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
    overflow: "hidden",
  },
  heroContent: {
    position: "relative",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: "3.5rem",
    fontWeight: "700",
    marginBottom: "20px",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  heroSubtitle: {
    fontSize: "1.3rem",
    opacity: 0.9,
    fontWeight: "300",
  },
  heroDecoration: {
    position: "absolute",
    top: "-50%",
    right: "-10%",
    width: "300px",
    height: "300px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    zIndex: 1,
  },

  // Section
  section: {
    marginBottom: "80px",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "50px",
  },
  sectionTitle: {
    fontSize: "2.5rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "10px",
  },
  titleUnderline: {
    width: "80px",
    height: "4px",
    background: "linear-gradient(90deg, #667eea, #764ba2)",
    margin: "0 auto",
    borderRadius: "2px",
  },

  // Carousel
  carouselContainer: {
    position: "relative",
    marginTop: "30px",
  },
  scrollButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #ff6b35, #ff9f73)",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
    transition: "all 0.3s ease",
    left: "-25px",
    opacity: 1,
  },
  scrollButtonRight: {
    left: "auto",
    right: "-25px",
  },
  scrollButtonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  carousel: {
    display: "flex",
    overflowX: "auto",
    scrollBehavior: "smooth",
    gap: "25px",
    padding: "20px 0",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    touchAction: "pan-y",
    userSelect: "none",
    cursor: "grab",
    "&:active": {
      cursor: "grabbing",
    },
  },

  // Drink Card
  drinkCard: {
    minWidth: "250px",
    width: "250px",
    height: "400px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    },
  },
  cardImageContainer: {
    position: "relative",
    height: "180px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "20px 20px 0 0",
  },
  cardImagePlaceholder: {
    color: "#718096",
    fontSize: "20px",
    fontWeight: "600",
    textAlign: "center",
  },
  discountBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "#e53e3e",
    color: "white",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  cardContent: {
    padding: "25px",
    height: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "10px",
  },
  cardDescription: {
    fontSize: "0.875rem",
    color: "#718096",
    marginBottom: "10px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  priceContainer: {
    marginBottom: "10px",
  },
  originalPrice: {
    textDecoration: "line-through",
    color: "#718096",
    fontSize: "14px",
    marginRight: "10px",
  },
  salePrice: {
    color: "#e53e3e",
    fontSize: "18px",
    fontWeight: "600",
  },
  regularPrice: {
    color: "#2d3748",
    fontSize: "18px",
    fontWeight: "600",
  },
  soldInfo: {
    color: "#718096",
    fontSize: "14px",
    marginBottom: "15px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  addToCartBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    backgroundColor: "#ff6b35",
    color: "white",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e65c00",
    },
  },
  buyNowBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    backgroundColor: "#ff6b35",
    color: "white",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e65c00",
    },
  },

  // Category Section
  categorySection: {
    marginBottom: "60px",
  },
  categoryTitle: {
    fontSize: "2rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "30px",
    paddingLeft: "20px",
    borderLeft: "4px solid #667eea",
  },

  // Blog Section
  blogCard: {
    minWidth: "250px",
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    },
  },
  blogImageContainer: {
    height: "128px",
    background: "linear-gradient(135deg, #764ba2, #667eea)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  blogImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "20px 20px 0 0",
  },
  blogImagePlaceholder: {
    color: "white",
    fontSize: "20px",
    fontWeight: "600",
    textAlign: "center",
  },
  blogCardContent: {
    padding: "25px",
  },
  blogCardTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "15px",
  },
  readMore: {
    color: "#667eea",
    fontSize: "14px",
    fontWeight: "500",
  },

  // Modal
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
    padding: "1rem",
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
    width: "100%",
    maxWidth: "28rem",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #ffcc80, #ffab40)",
    color: "white",
    padding: "30px",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "10px",
  },
  modalDrinkName: {
    fontSize: "1.2rem",
    fontWeight: "400",
    opacity: 0.9,
  },
  modalBody: {
    padding: "30px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  optionGroup: {
    marginBottom: "25px",
  },
  optionLabel: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "15px",
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "#667eea",
    },
  },
  radioInput: {
    marginRight: "12px",
    accentColor: "#667eea",
  },
  optionText: {
    fontSize: "14px",
    color: "#2d3748",
  },
  extraPrice: {
    color: "#667eea",
    fontWeight: "600",
  },
  totalPrice: {
    background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "18px",
    color: "#2d3748",
    marginTop: "20px",
  },
  modalFooter: {
    display: "flex",
    gap: "15px",
    padding: "20px 30px 30px",
    borderTop: "1px solid #e2e8f0",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    border: "2px solid #ff9f73",
    backgroundColor: "#f8f9fa",
    color: "#ff6b35",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#ff6b35",
      color: "white",
    },
  },
  confirmBtn: {
    flex: 2,
    padding: "12px",
    border: "none",
    backgroundColor: "#ff6b35",
    color: "white",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      filter: "brightness(1.1)",
      backgroundColor: "#e65c00",
      transform: "translateY(-3px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    },
  },
  quantityBtn: {
    padding: "0.5rem",
    border: "none",
    backgroundColor: "#ff9f73",
    color: "white",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "#ff6b35",
    },
  },
  quantityInput: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    textAlign: "center",
    width: "60px",
  },

  // Blog Detail
  blogDetail: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  backButton: {
    marginBottom: "30px",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #e2e8f0, #cbd5e0)",
    color: "#2d3748",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #cbd5e0, #a0aec0)",
    },
  },
  blogTitle: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: "30px",
    lineHeight: "1.2",
  },
  blogDetailImageContainer: {
    height: "300px",
    background: "linear-gradient(135deg, #764ba2, #667eea)",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "30px",
  },
  blogDetailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "15px",
  },
  blogDetailImagePlaceholder: {
    color: "white",
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
  },
  blogContent: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#4a5568",
    textAlign: "justify",
  },

  // Loading and Error
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#667eea",
    padding: "40px",
  },
  error: {
    textAlign: "center",
    fontSize: "16px",
    color: "#e53e3e",
    background: "#fed7d7",
    padding: "15px",
    borderRadius: "12px",
    margin: "20px 0",
  },

  // Empty Message
  emptyMessage: {
    textAlign: "center",
    color: "#718096",
    fontSize: "16px",
    padding: "40px",
  },

  // Product Detail Modal
  productDetailModal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1002,
    padding: "1rem",
  },
  productDetailContent: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
    width: "100%",
    maxWidth: "28rem",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "30px",
    textAlign: "center",
  },
  productDetailTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "20px",
    color: "#2d3748",
  },
  productDetailDescription: {
    fontSize: "14px",
    color: "#4a5568",
    marginBottom: "20px",
    lineHeight: "1.5",
  },
  productDetailPrice: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#e53e3e",
    marginBottom: "20px",
  },
  closeBtn: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#ff6b35",
    color: "white",
    borderRadius: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e65c00",
    },
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  // State
  const [danhMucList, setDanhMucList] = useState([]);
  const [doUongByDanhMuc, setDoUongByDanhMuc] = useState({});
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [topDrinks, setTopDrinks] = useState([]);
  const [loadingTopDrinks, setLoadingTopDrinks] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkOptions, setDrinkOptions] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isBuyNow, setIsBuyNow] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const scrollRefs = useRef({});
  const dragRefs = useRef({});

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingDrinks(true);
        setError(null);
        const resDanhMuc = await fetchDanhSachDanhMuc();
        if (resDanhMuc && Array.isArray(resDanhMuc.data)) {
          setDanhMucList(resDanhMuc.data);
          const drinksData = {};
          for (const dm of resDanhMuc.data) {
            const drinks = await getDoUongTheoDanhMuc(dm.ma_danh_muc);
            drinksData[dm.ma_danh_muc] = drinks.filter((d) => d.hien_thi);
          }
          setDoUongByDanhMuc(drinksData);
        } else {
          setError("Không thể tải danh sách danh mục");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu đồ uống");
        console.error("Error loading drinks:", err);
      } finally {
        setLoadingDrinks(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const fetchTopDrinks = async () => {
      try {
        setLoadingTopDrinks(true);
        const data = await getTopDrinks({ limit: 10 });
        setTopDrinks(data);
      } catch (err) {
        console.error("Error fetching top drinks:", err.message);
        setError("Không thể tải danh sách đồ uống bán chạy");
      } finally {
        setLoadingTopDrinks(false);
      }
    };
    fetchTopDrinks();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoadingBlogs(true);
        const data = await layDanhSachBlog();
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Lấy danh sách blog thất bại!");
      } finally {
        setLoadingBlogs(false);
      }
    };
    fetchBlogs();
  }, []);

  // Scroll and Drag handling
  const checkScroll = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (!scrollRef) return;
    scrollRef.dataset.canScrollLeft = scrollRef.scrollLeft > 0;
    scrollRef.dataset.canScrollRight =
      scrollRef.scrollLeft + scrollRef.clientWidth < scrollRef.scrollWidth - 1;
  };

  const handleDragStart = (key, e) => {
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.pageX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.pageY;
    dragRefs.current[key] = {
      startX: clientX,
      startY: clientY,
      scrollLeft: scrollRefs.current[key]?.scrollLeft || 0,
      isDragging: true,
      startTime: Date.now(),
    };
  };

  const handleDragMove = (key, e) => {
    const dragRef = dragRefs.current[key];
    if (!dragRef || !dragRef.isDragging) return;

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.pageX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.pageY;
    const deltaX = Math.abs(clientX - dragRef.startX);
    const deltaY = Math.abs(clientY - dragRef.startY);

    if (deltaY > deltaX && deltaY > 10) {
      dragRef.isDragging = false;
      return;
    }

    e.preventDefault();

    const scrollRef = scrollRefs.current[key];
    if (scrollRef) {
      const walk = (clientX - dragRef.startX) * 1.5;
      scrollRef.scrollLeft = dragRef.scrollLeft - walk;
    }
  };

  const handleDragEnd = (key) => {
    const dragRef = dragRefs.current[key];
    if (dragRef) {
      dragRef.isDragging = false;
    }
  };

  useEffect(() => {
    const currentScrollRefs = scrollRefs.current;
    Object.keys(currentScrollRefs).forEach((key) => {
      const scrollRef = currentScrollRefs[key];
      if (scrollRef) {
        if (!dragRefs.current[key]) {
          dragRefs.current[key] = {
            isDragging: false,
            startX: 0,
            startY: 0,
            scrollLeft: 0,
            startTime: 0,
          };
        }
        const handleScroll = () => checkScroll(key);
        const handleStart = (e) => handleDragStart(key, e);
        const handleMove = (e) => handleDragMove(key, e);
        const handleEnd = () => handleDragEnd(key);

        scrollRef.addEventListener("scroll", handleScroll);
        scrollRef.addEventListener("mousedown", handleStart);
        scrollRef.addEventListener("mousemove", handleMove);
        scrollRef.addEventListener("mouseup", handleEnd);
        scrollRef.addEventListener("mouseleave", handleEnd);
        scrollRef.addEventListener("touchstart", handleStart, {
          passive: false,
        });
        scrollRef.addEventListener("touchmove", handleMove, { passive: false });
        scrollRef.addEventListener("touchend", handleEnd);

        checkScroll(key);

        return () => {
          scrollRef.removeEventListener("scroll", handleScroll);
          scrollRef.removeEventListener("mousedown", handleStart);
          scrollRef.removeEventListener("mousemove", handleMove);
          scrollRef.removeEventListener("mouseup", handleEnd);
          scrollRef.removeEventListener("mouseleave", handleEnd);
          scrollRef.removeEventListener("touchstart", handleStart);
          scrollRef.removeEventListener("touchmove", handleMove);
          scrollRef.removeEventListener("touchend", handleEnd);
        };
      }
    });
  }, [doUongByDanhMuc, topDrinks, blogs, selectedBlog]);

  const scrollLeft = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (scrollRef) scrollRef.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = (key) => {
    const scrollRef = scrollRefs.current[key];
    if (scrollRef) scrollRef.scrollBy({ left: 300, behavior: "smooth" });
  };

  // Handle drink options
  const handleThemGioHang = async (drink) => {
    setIsBuyNow(false);
    await loadDrinkOptions(drink);
    setQuantity(1);
  };

  const handleBuyNow = async (drink) => {
    setIsBuyNow(true);
    await loadDrinkOptions(drink);
    setQuantity(1);
  };

  const loadDrinkOptions = async (drink) => {
    try {
      const options = await fetchTuyChonByDoUong(drink.ma_do_uong);
      const grouped = {};
      options.forEach((opt) => {
        if (!grouped[opt.loai_tuy_chon]) grouped[opt.loai_tuy_chon] = [];
        grouped[opt.loai_tuy_chon].push(opt);
      });
      setSelectedDrink(drink);
      setDrinkOptions(grouped);
      setSelectedOptions({});
      setShowModal(true);
    } catch (err) {
      alert("Lỗi khi tải tùy chọn đồ uống");
      console.error("Error loading drink options:", err);
    }
  };

  const handleChangeOption = (loai, gia_tri) => {
    const opt = drinkOptions[loai].find((o) => o.gia_tri === gia_tri);
    setSelectedOptions((prev) => ({
      ...prev,
      [loai]: { gia_tri: opt.gia_tri, gia_them: opt.gia_them },
    }));
  };

  const tinhTongTien = useMemo(() => {
    if (!selectedDrink) return 0;
    const giamGia = selectedDrink.giam_gia_phan_tram || 0;
    const giaGoc = selectedDrink.gia || 0;
    const giaSauGiam = Math.round(giaGoc * (1 - giamGia / 100));
    const tongGiaThem = Object.values(selectedOptions).reduce(
      (sum, opt) => sum + (opt.gia_them || 0),
      0
    );
    const total = (giaSauGiam + tongGiaThem) * quantity;
    console.log("TinhTongTien debug:", {
      giaGoc,
      giamGia,
      giaSauGiam,
      tongGiaThem,
      quantity,
      total,
    });
    return total;
  }, [selectedDrink, selectedOptions, quantity]);

  const handleXacNhan = async () => {
    if (!selectedDrink) return;

    const token = localStorage.getItem("token");
    const maNguoiDung = token ? localStorage.getItem("ma_nguoi_dung") : null;

    if (!maNguoiDung || !token) {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      setShowModal(false);
      navigate("/login");
      return;
    }

    const tuyChonArr = Object.entries(selectedOptions).map(([loai, opt]) => ({
      loai_tuy_chon: loai,
      gia_tri: opt.gia_tri,
      gia_them: opt.gia_them,
    }));

    try {
      const payload = {
        ma_nguoi_dung: Number(maNguoiDung),
        ma_do_uong: selectedDrink.ma_do_uong,
        so_luong: quantity,
        tuy_chon: tuyChonArr,
      };
      console.log("Validated payload:", payload);

      if (isBuyNow) {
        const tempItem = {
          ma_do_uong: selectedDrink.ma_do_uong,
          ten_do_uong: selectedDrink.ten_do_uong,
          so_luong: quantity,
          tuy_chon: tuyChonArr,
          tong_gia: tinhTongTien,
        };
        localStorage.setItem("buyNowItem", JSON.stringify([tempItem]));
        localStorage.removeItem("selectedCartItems");
        setShowModal(false);
        setSelectedOptions({});
        setSelectedDrink(null);
        setDrinkOptions({});
        setQuantity(1);
        navigate("/don-hang");
      } else {
        const result = await addGioHang(payload);

        const isSuccess =
          result &&
          (result.success === true ||
            result.success === "true" ||
            result.status === "success" ||
            result.status === 200 ||
            result.message === "success" ||
            result.message === "Thành công" ||
            (result.data && !result.error) ||
            (typeof result === "object" &&
              !result.error &&
              !result.message?.toLowerCase().includes("lỗi")));

        if (isSuccess) {
          alert(
            `Đã thêm "${
              selectedDrink.ten_do_uong
            }" vào giỏ hàng!\nTổng tiền: ${tinhTongTien.toLocaleString()} VNĐ`
          );
          setShowModal(false);
          setSelectedOptions({});
          setSelectedDrink(null);
          setDrinkOptions({});
          setQuantity(1);
          await fetchCart();
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          const errorMessage =
            result?.message ||
            result?.error ||
            "Phản hồi từ server không hợp lệ";
          throw new Error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
      let errorMessage = "Lỗi không xác định";
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      alert(`Thao tác thất bại!\nLỗi: ${errorMessage}`);
    }
  };

  // Search functionality
  const filteredDoUongByDanhMuc = useMemo(() => {
    if (!searchTerm) return doUongByDanhMuc;
    const filtered = {};
    Object.keys(doUongByDanhMuc).forEach((key) => {
      filtered[key] = doUongByDanhMuc[key].filter((drink) =>
        drink.ten_do_uong.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    return filtered;
  }, [doUongByDanhMuc, searchTerm]);

  const filteredTopDrinks = useMemo(() => {
    if (!searchTerm) return topDrinks;
    return topDrinks.filter((drink) =>
      drink.ten_do_uong.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topDrinks, searchTerm]);

  // Render blog detail
  if (selectedBlog) {
    return (
      <div style={styles.blogDetail}>
        <button
          style={styles.backButton}
          onClick={() => setSelectedBlog(null)}
          aria-label="Quay lại trang chủ"
        >
          ← Quay lại
        </button>
        <h2 style={styles.blogTitle}>{selectedBlog.tieu_de}</h2>
        <div style={styles.blogDetailImageContainer}>
          {selectedBlog.hinh_anh ? (
            <img
              src={`http://localhost:5000/uploads/hinh_anh/${selectedBlog.hinh_anh
                .split("/")
                .pop()}`}
              alt={selectedBlog.tieu_de}
              style={styles.blogDetailImage}
              onError={(e) =>
                console.error(`Failed to load image: ${e.target.src}`)
              }
            />
          ) : (
            <div style={styles.blogDetailImagePlaceholder}>
              📸 {selectedBlog.tieu_de}
            </div>
          )}
        </div>
        <p style={styles.blogContent}>{selectedBlog.noi_dung}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Chào Mừng Đến Với DRINKHUB</h1>
          <p style={styles.heroSubtitle}>
            Khám phá hương vị tuyệt vời trong từng giọt
          </p>
        </div>
        <div style={styles.heroDecoration}></div>
      </div>

      {/* Top Drinks Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>🔥 Đồ Uống Bán Chạy</h2>
          <div style={styles.titleUnderline}></div>
        </div>

        {loadingTopDrinks && <p style={styles.loading}>Đang tải...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loadingTopDrinks && filteredTopDrinks.length === 0 && (
          <p style={styles.emptyMessage}>Không có đồ uống bán chạy nào.</p>
        )}

        {filteredTopDrinks.length > 0 && (
          <div style={styles.carouselContainer}>
            <button
              style={{
                ...styles.scrollButton,
                ...(scrollRefs.current["top-drinks"]?.dataset.canScrollLeft ===
                "true"
                  ? {}
                  : styles.scrollButtonDisabled),
              }}
              onClick={() => scrollLeft("top-drinks")}
              aria-label="Cuộn trái danh sách đồ uống bán chạy"
            >
              ←
            </button>
            <div
              style={styles.carousel}
              ref={(el) => (scrollRefs.current["top-drinks"] = el)}
              role="region"
              aria-label="Danh sách đồ uống bán chạy"
            >
              {filteredTopDrinks.map((d) => {
                const giaGiam =
                  d.giam_gia_phan_tram > 0
                    ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
                    : d.gia;

                return (
                  <div
                    key={d.ma_do_uong}
                    style={styles.drinkCard}
                    role="article"
                  >
                    <div
                      style={styles.cardImageContainer}
                      onClick={() => {
                        setSelectedProduct(d);
                        setShowProductDetail(true);
                      }}
                    >
                      {d.hinh_anh ? (
                        <img
                          src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                          alt={d.ten_do_uong}
                          style={styles.cardImage}
                          onError={(e) =>
                            console.error(
                              `Failed to load image: ${e.target.src}`
                            )
                          }
                        />
                      ) : (
                        <div style={styles.cardImagePlaceholder}>
                          🥤 {d.ten_do_uong}
                        </div>
                      )}
                      {d.giam_gia_phan_tram > 0 && (
                        <span style={styles.discountBadge}>
                          -{d.giam_gia_phan_tram}%
                        </span>
                      )}
                    </div>
                    <div style={styles.cardContent}>
                      <h3 style={styles.cardTitle}>{d.ten_do_uong}</h3>
                      <p style={styles.cardDescription}>
                        {d.mo_ta || "Không có mô tả"}
                      </p>
                      <div style={styles.priceContainer}>
                        {d.giam_gia_phan_tram > 0 ? (
                          <>
                            <span style={styles.originalPrice}>
                              {Number(d.gia).toLocaleString()}đ
                            </span>
                            <span style={styles.salePrice}>
                              {giaGiam.toLocaleString()}đ
                            </span>
                          </>
                        ) : (
                          <span style={styles.regularPrice}>
                            {Number(d.gia).toLocaleString()}đ
                          </span>
                        )}
                      </div>
                      <p style={styles.soldInfo}>
                        Đã bán: {d.total_quantity || 0} đơn
                      </p>
                      <div style={styles.buttonGroup}>
                        <button
                          style={styles.addToCartBtn}
                          onClick={() => handleThemGioHang(d)}
                          aria-label={`Thêm ${d.ten_do_uong} vào giỏ hàng`}
                        >
                          Thêm vào giỏ
                        </button>
                        <button
                          style={styles.buyNowBtn}
                          onClick={() => handleBuyNow(d)}
                          aria-label={`Mua ngay ${d.ten_do_uong}`}
                        >
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              style={{
                ...styles.scrollButton,
                ...styles.scrollButtonRight,
                ...(scrollRefs.current["top-drinks"]?.dataset.canScrollRight ===
                "true"
                  ? {}
                  : styles.scrollButtonDisabled),
              }}
              onClick={() => scrollRight("top-drinks")}
              aria-label="Cuộn phải danh sách đồ uống bán chạy"
            >
              →
            </button>
          </div>
        )}
      </section>

      {/* Drinks by Category */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>☕ Danh Sách Đồ Uống</h2>
          <div style={styles.titleUnderline}></div>
        </div>

        {loadingDrinks && <p style={styles.loading}>Đang tải...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loadingDrinks && danhMucList.length === 0 && (
          <p style={styles.emptyMessage}>Không có danh mục nào.</p>
        )}

        {danhMucList.map((dm) => (
          <div key={dm.ma_danh_muc} style={styles.categorySection}>
            <h3 style={styles.categoryTitle}>{dm.ten_danh_muc}</h3>
            {filteredDoUongByDanhMuc[dm.ma_danh_muc]?.length > 0 ? (
              <div style={styles.carouselContainer}>
                <button
                  style={{
                    ...styles.scrollButton,
                    ...(scrollRefs.current[dm.ma_danh_muc]?.dataset
                      .canScrollLeft === "true"
                      ? {}
                      : styles.scrollButtonDisabled),
                  }}
                  onClick={() => scrollLeft(dm.ma_danh_muc)}
                  aria-label={`Cuộn trái danh sách đồ uống ${dm.ten_danh_muc}`}
                >
                  ←
                </button>
                <div
                  style={styles.carousel}
                  ref={(el) => (scrollRefs.current[dm.ma_danh_muc] = el)}
                  role="region"
                  aria-label={`Danh sách đồ uống ${dm.ten_danh_muc}`}
                >
                  {filteredDoUongByDanhMuc[dm.ma_danh_muc].map((d) => {
                    const giaGiam =
                      d.giam_gia_phan_tram > 0
                        ? Math.round(d.gia * (1 - d.giam_gia_phan_tram / 100))
                        : d.gia;

                    return (
                      <div
                        key={d.ma_do_uong}
                        style={styles.drinkCard}
                        role="article"
                      >
                        <div
                          style={styles.cardImageContainer}
                          onClick={() => {
                            setSelectedProduct(d);
                            setShowProductDetail(true);
                          }}
                        >
                          {d.hinh_anh ? (
                            <img
                              src={`http://localhost:5000/uploads/hinh_anh/${d.hinh_anh}`}
                              alt={d.ten_do_uong}
                              style={styles.cardImage}
                              onError={(e) =>
                                console.error(
                                  `Failed to load image: ${e.target.src}`
                                )
                              }
                            />
                          ) : (
                            <div style={styles.cardImagePlaceholder}>
                              🥤 {d.ten_do_uong}
                            </div>
                          )}
                          {d.giam_gia_phan_tram > 0 && (
                            <span style={styles.discountBadge}>
                              -{d.giam_gia_phan_tram}%
                            </span>
                          )}
                        </div>
                        <div style={styles.cardContent}>
                          <h3 style={styles.cardTitle}>{d.ten_do_uong}</h3>
                          <p style={styles.cardDescription}>
                            {d.mo_ta || "Không có mô tả"}
                          </p>
                          <div style={styles.priceContainer}>
                            {d.giam_gia_phan_tram > 0 ? (
                              <>
                                <span style={styles.originalPrice}>
                                  {Number(d.gia).toLocaleString()}đ
                                </span>
                                <span style={styles.salePrice}>
                                  {giaGiam.toLocaleString()}đ
                                </span>
                              </>
                            ) : (
                              <span style={styles.regularPrice}>
                                {Number(d.gia).toLocaleString()}đ
                              </span>
                            )}
                          </div>
                          <p style={styles.soldInfo}>
                            Đã bán: {d.total_quantity || 0} đơn
                          </p>
                          <div style={styles.buttonGroup}>
                            <button
                              style={styles.addToCartBtn}
                              onClick={() => handleThemGioHang(d)}
                              aria-label={`Thêm ${d.ten_do_uong} vào giỏ hàng`}
                            >
                              Thêm vào giỏ
                            </button>
                            <button
                              style={styles.buyNowBtn}
                              onClick={() => handleBuyNow(d)}
                              aria-label={`Mua ngay ${d.ten_do_uong}`}
                            >
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  style={{
                    ...styles.scrollButton,
                    ...styles.scrollButtonRight,
                    ...(scrollRefs.current[dm.ma_danh_muc]?.dataset
                      .canScrollRight === "true"
                      ? {}
                      : styles.scrollButtonDisabled),
                  }}
                  onClick={() => scrollRight(dm.ma_danh_muc)}
                  aria-label={`Cuộn phải danh sách đồ uống ${dm.ten_danh_muc}`}
                >
                  →
                </button>
              </div>
            ) : (
              <p style={styles.emptyMessage}>
                Không tìm thấy đồ uống nào trong danh mục này.
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Blog Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>📝 Danh Sách Blog</h2>
          <div style={styles.titleUnderline}></div>
        </div>

        {loadingBlogs && <p style={styles.loading}>Đang tải...</p>}
        {!loadingBlogs && blogs.length === 0 && (
          <p style={styles.emptyMessage}>Không có blog nào.</p>
        )}

        <div style={styles.carouselContainer}>
          <button
            style={{
              ...styles.scrollButton,
              ...(scrollRefs.current["blogs"]?.dataset.canScrollLeft === "true"
                ? {}
                : styles.scrollButtonDisabled),
            }}
            onClick={() => scrollLeft("blogs")}
            aria-label="Cuộn trái danh sách blog"
          >
            ←
          </button>
          <div
            style={styles.carousel}
            ref={(el) => (scrollRefs.current["blogs"] = el)}
            role="region"
            aria-label="Danh sách blog"
          >
            {blogs.map((blog) => (
              <div
                key={blog.ma_blog}
                style={styles.blogCard}
                onClick={() => setSelectedBlog(blog)}
                role="article"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedBlog(blog)}
                aria-label={`Xem chi tiết ${blog.tieu_de}`}
              >
                <div style={styles.blogImageContainer}>
                  {blog.hinh_anh ? (
                    <img
                      src={`http://localhost:5000/uploads/hinh_anh/${blog.hinh_anh
                        .split("/")
                        .pop()}`}
                      alt={blog.tieu_de}
                      style={styles.blogImage}
                    />
                  ) : (
                    <div style={styles.blogImagePlaceholder}>
                      📖 {blog.tieu_de}
                    </div>
                  )}
                </div>
                <div style={styles.blogCardContent}>
                  <h3 style={styles.blogCardTitle}>{blog.tieu_de}</h3>
                  <p style={styles.readMore}>Đọc thêm →</p>
                </div>
              </div>
            ))}
          </div>
          <button
            style={{
              ...styles.scrollButton,
              ...styles.scrollButtonRight,
              ...(scrollRefs.current["blogs"]?.dataset.canScrollRight === "true"
                ? {}
                : styles.scrollButtonDisabled),
            }}
            onClick={() => scrollRight("blogs")}
            aria-label="Cuộn phải danh sách blog"
          >
            →
          </button>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedDrink && (
        <div
          style={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setSelectedOptions({});
              setQuantity(1);
            }
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle} id="modal-title">
                {isBuyNow ? "🛒 Mua ngay" : "Thêm vào giỏ hàng"}
              </h3>
              <h4 style={styles.modalDrinkName}>{selectedDrink.ten_do_uong}</h4>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.optionGroup}>
                <p style={styles.optionLabel}>Số lượng</p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <button
                    style={styles.quantityBtn}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    style={styles.quantityInput}
                    aria-label="Số lượng"
                  />
                  <button
                    style={styles.quantityBtn}
                    onClick={() => setQuantity((prev) => prev + 1)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>

              {Object.entries(drinkOptions).map(([loai, opts]) => (
                <div key={loai} style={styles.optionGroup}>
                  <p style={styles.optionLabel}>{loai}</p>
                  <div style={styles.optionList}>
                    {opts.map((opt) => (
                      <label
                        key={`${loai}-${opt.gia_tri}`}
                        style={styles.optionItem}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleChangeOption(loai, opt.gia_tri)
                        }
                      >
                        <input
                          type="radio"
                          name={loai}
                          value={opt.gia_tri}
                          checked={
                            selectedOptions[loai]?.gia_tri === opt.gia_tri
                          }
                          onChange={() => handleChangeOption(loai, opt.gia_tri)}
                          style={styles.radioInput}
                          aria-label={`${loai}: ${opt.gia_tri}`}
                        />
                        <span style={styles.optionText}>
                          {opt.gia_tri}
                          {opt.gia_them > 0 && (
                            <span style={styles.extraPrice}>
                              (+{Number(opt.gia_them).toLocaleString()}đ)
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div style={styles.totalPrice}>
                💰 Tổng tiền: <strong>{tinhTongTien.toLocaleString()}đ</strong>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => {
                  setShowModal(false);
                  setSelectedOptions({});
                  setQuantity(1);
                }}
                aria-label="Hủy"
              >
                Hủy
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleXacNhan}
                aria-label={isBuyNow ? "Xác nhận mua" : "Thêm vào giỏ hàng"}
              >
                {isBuyNow ? "Xác nhận mua" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showProductDetail && selectedProduct && (
        <div
          style={styles.productDetailModal}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProductDetail(false);
              setSelectedProduct(null);
            }
          }}
        >
          <div style={styles.productDetailContent}>
            <h3 style={styles.productDetailTitle}>
              {selectedProduct.ten_do_uong}
            </h3>
            <div style={styles.cardImageContainer}>
              {selectedProduct.hinh_anh ? (
                <img
                  src={`http://localhost:5000/uploads/hinh_anh/${selectedProduct.hinh_anh}`}
                  alt={selectedProduct.ten_do_uong}
                  style={styles.cardImage}
                  onError={(e) =>
                    console.error(`Failed to load image: ${e.target.src}`)
                  }
                />
              ) : (
                <div style={styles.cardImagePlaceholder}>
                  🥤 {selectedProduct.ten_do_uong}
                </div>
              )}
              {selectedProduct.giam_gia_phan_tram > 0 && (
                <span style={styles.discountBadge}>
                  -{selectedProduct.giam_gia_phan_tram}%
                </span>
              )}
            </div>
            <p style={styles.productDetailDescription}>
              {selectedProduct.mo_ta || "Không có mô tả"}
            </p>
            <div style={styles.productDetailPrice}>
              {selectedProduct.giam_gia_phan_tram > 0 ? (
                <>
                  <span style={styles.originalPrice}>
                    {Number(selectedProduct.gia).toLocaleString()}đ
                  </span>
                  <span style={styles.salePrice}>
                    {Math.round(
                      selectedProduct.gia *
                        (1 - selectedProduct.giam_gia_phan_tram / 100)
                    ).toLocaleString()}
                    đ
                  </span>
                </>
              ) : (
                <span style={styles.regularPrice}>
                  {Number(selectedProduct.gia).toLocaleString()}đ
                </span>
              )}
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => {
                setShowProductDetail(false);
                setSelectedProduct(null);
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

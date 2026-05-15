import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Filter } from 'lucide-react';
import Breadcrumbs from '../../components/Breadcrumbs';
import CategoryNav from '../../components/CategoryNav';
import FilterSidebar from '../../components/FilterSidebar';
import RecommendedProducts from '../../components/RecommendedProducts';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import HotProducts from '../../components/HotProducts';
import BuyNowModal from '../../components/BuyNowModal';

import CategoryDiscovery from '../../components/CategoryDiscovery';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../lib/api';
import { inflateProducts, normalizeProduct } from '../../lib/products';

// 1. FeaturedMonitorSlider Component for Dynamic Carousel
const FeaturedMonitorSlider = ({ products: externalProducts = [] }) => {
  const [index, setIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const apiProducts = inflateProducts(externalProducts, 8, 'featured-monitor');
  const products = (apiProducts || []).map((item) => ({
    ...item,
    img: item?.image || item?.img || '',
    price: item?.priceDisplay || (item?.priceNum ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.priceNum) : 'Liên hệ'),
    oldPrice: item?.oldPriceNum
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.oldPriceNum)
      : '',
    discount: item?.discount ? `-${String(item.discount).replace(/^-+/, '')}` : '',
  }));

  const maxIndex = products.length > 0 ? Math.ceil(products.length / 4) - 1 : 0;

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [maxIndex, products.length]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-2xl relative group">
      {/* Header with Premium Gradient */}
      <div className="relative h-[100px] sm:h-[130px] w-full flex items-center px-6 sm:px-12 overflow-hidden bg-gradient-to-r from-[#0066cc] via-[#008d71] to-[#00c2a8]">
        {/* Abstract decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
          <div className="flex flex-col">
            <h2 className="text-[22px] sm:text-[32px] font-black text-white uppercase italic tracking-tighter drop-shadow-lg leading-none">
              SẢN PHẨM NỔI BẬT
            </h2>
            <div className="h-1 w-20 bg-white/50 rounded-full mt-2 hidden sm:block"></div>
          </div>

          <button className="px-6 py-2.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold text-[13px] flex items-center gap-2 hover:bg-white hover:text-[#008d71] transition-all shadow-xl uppercase tracking-wider">
            Khám phá ngay <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Slider Navigation Arrows */}
      <button
        onClick={() => setIndex(prev => Math.max(0, prev - 1))}
        className={`absolute left-4 top-[60%] -translate-y-1/2 w-10 h-10 bg-white shadow-xl rounded-full z-20 flex items-center justify-center text-gray-800 hover:bg-[#008d71] hover:text-white transition-all opacity-0 group-hover:opacity-100 ${index === 0 ? 'hidden' : ''}`}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => setIndex(prev => Math.min(maxIndex, prev + 1))}
        className={`absolute right-4 top-[60%] -translate-y-1/2 w-10 h-10 bg-white shadow-xl rounded-full z-20 flex items-center justify-center text-gray-800 hover:bg-[#008d71] hover:text-white transition-all opacity-0 group-hover:opacity-100 ${index === maxIndex ? 'hidden' : ''}`}
      >
        <ChevronRight size={24} />
      </button>

      {/* Product Cards Grid - Animated Slider */}
      <div className="p-6 overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {products.map((p, idx) => (
            <div key={idx} className="min-w-full sm:min-w-[calc(50%-8px)] lg:min-w-[calc(25%-12px)] bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all border border-transparent hover:border-blue-100 group flex flex-col">
              <div className="aspect-square mb-4 overflow-hidden flex items-center justify-center p-2">
                <img src={p.img} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-[14px] font-bold text-gray-800 line-clamp-2 mb-auto text-center">{p.name}</h4>
              <div className="mt-4 text-center">
                <div className="text-[16px] font-black text-red-500">{p.price}</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[12px] text-gray-400 line-through">{p.oldPrice}</span>
                  <span className="text-[12px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">{p.discount}</span>
                </div>
                <button
                  onClick={() => {
                    const priceVal = String(p.price || '0').replace(/[^\d]/g, '');
                    const oldPriceVal = String(p.oldPrice || '0').replace(/[^\d]/g, '');
                    setSelectedProduct({
                      ...p,
                      id: p.id || `p-${idx}`,
                      priceNum: parseInt(priceVal) || 0,
                      oldPriceNum: parseInt(oldPriceVal) || 0
                    });
                  }}
                  className="mt-4 w-full bg-[#008d71] text-white py-2 rounded-xl text-[12px] font-bold uppercase transition-all hover:bg-[#007b63] hover:shadow-lg active:scale-95"
                >
                  MUA NGAY
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BuyNowModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

const CategoryPage = () => {
  const { t } = useLanguage();
  const { id: slug } = useParams();
  const [backendProducts, setBackendProducts] = useState([]);

  // Danh sách brand hợp lệ trong hệ thống
  const validBrands = ['samsung', 'iphone', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'sony', 'huawei', 'honor', 'motorola', 'tcl'];
  const slugBrand = slug && validBrands.includes(slug.toLowerCase()) ? slug.toLowerCase() : null;

  const categoryMetadata = {
    'dien-thoai': {
      title: 'Điện thoại',
      backendCategories: ['Smartphone', 'Điện thoại', 'Dien thoai', 'Mobile', 'dien-thoai'],
      desc: 'Xu hướng điện thoại di động AI đang bùng nổ với những công nghệ vượt bậc như camera AI chụp ảnh thông minh, nhận diện khuôn mặt siêu tốc, trợ lý ảo cá nhân hóa... Trong đó, các hãng lớn như Apple, Samsung đã và đang cạnh tranh để biến smartphone trở thành "trợ lý" đắc lực trong cuộc sống hàng ngày.'
    },
    'laptop': {
      title: 'Laptop / Máy tính xách tay',
      backendCategories: ['Laptop', 'Máy tính xách tay'],
      desc: 'Khám phá thế giới Laptop đỉnh cao từ MacBook, ASUS, Dell, HP đến các dòng Gaming mạnh mẽ. Dù bạn là sinh viên, nhân viên văn phòng hay game thủ chuyên nghiệp, PhoneSin luôn có lựa chọn hoàn hảo hỗ trợ học tập và làm việc hiệu quả nhất.'
    },
    'tablet': {
      title: 'Máy tính bảng / Tablet',
      backendCategories: ['Tablet', 'Máy tính bảng'],
      desc: 'Sự kết hợp hoàn hảo giữa điện thoại và máy tính. iPad, Samsung Galaxy Tab và các dòng máy tính bảng Android mang đến trải nghiệm giải trí, đồ họa và ghi chú tuyệt vời với màn hình sắc nét và bút cảm ứng linh hoạt.'
    },
    'dong-ho': {
      title: 'Đồng hồ thông minh / Smartwatch',
      backendCategories: ['Smartwatch', 'Đồng hồ'],
      desc: 'Theo dõi sức khỏe, nhịp tim, giấc ngủ và nhận thông báo tức thì với Apple Watch, Samsung Galaxy Watch, Garmin... Phụ kiện thời trang không thể thiếu cho lối sống hiện đại và năng động.'
    },
    'am-thanh': {
      title: 'Thiết bị Âm thanh',
      backendCategories: ['Audio', 'Sound', 'Tai nghe', 'Loa'],
      desc: 'Tận hưởng âm nhạc đỉnh cao với các dòng tai nghe True Wireless, tai nghe chống ồn Sony, Marshall, Apple AirPods và loa Bluetooth công suất lớn. Mang cả rạp hát về không gian của bạn.'
    },
    'man-hinh': {
      title: 'Màn hình máy tính',
      backendCategories: ['Monitor', 'Màn hình'],
      desc: 'Màn hình đồ họa chuẩn màu, màn hình Gaming 144Hz, 240Hz sắc nét. Tăng cường hiệu suất làm việc và trải nghiệm giải trí với dải màu rộng và độ phân giải cao.'
    },
    'linh-kien-may-tinh': {
      title: 'Linh kiện máy tính',
      backendCategories: ['Component', 'Linh kiện'],
      desc: 'Xây dựng cấu hình PC mơ ước với đầy đủ linh kiện từ CPU, VGA, RAM, Mainboard đến ổ cứng SSD tốc độ cao. PhoneSin cung cấp linh kiện chính hãng từ các thương hiệu hàng đầu thế giới với mức giá cạnh tranh nhất.'
    },
    'smart-home': {
      title: 'Thiết bị nhà thông minh (smart home)',
      backendCategories: ['Smart Home'],
      desc: 'Nhà thông minh (Smart Home) là ngôi nhà được trang bị hệ thống các thiết bị điện tử có khả năng kết nối Internet và được điều khiển tự động hoặc bán tự động từ xa thông qua smartphone, máy tính bảng hoặc giọng nói.'
    },
    'phu-kien': {
      title: 'Phụ kiện',
      backendCategories: ['Accessory', 'Phụ kiện'],
      desc: 'Ốp lưng, bao da, cáp sạc, tai nghe và các phụ kiện chính hãng khác.'
    },
    'dich-vu': {
      title: 'Dịch vụ & Gói cước',
      backendCategories: ['Service', 'Dịch vụ'],
      desc: 'Cung cấp các gói sim, thẻ cào, gói cước data tốc độ cao và các dịch vụ tiện ích khác dành cho điện thoại.'
    },
    'tivi-dien-may': {
      title: 'TiVi, Điện máy',
      backendCategories: ['TV', 'Tivi', 'TiVi', 'Điện máy', 'tivi-dien-may', 'Appliance', 'Gia dụng'],
      desc: 'Nâng tầm không gian sống với các dòng Smart TV 4K, 8K đỉnh cao từ Samsung, Sony, LG. PhoneSin còn cung cấp các thiết bị điện máy gia dụng hiện đại như máy giặt, tủ lạnh, giúp cuộc sống của bạn tiện nghi và thông minh hơn.'
    },
    'tivi,-dien-may': {
      title: 'TiVi, Điện máy',
      backendCategories: ['TV', 'Tivi', 'TiVi', 'Điện máy', 'tivi-dien-may', 'Appliance', 'Gia dụng'],
      desc: 'Nâng tầm không gian sống với các dòng Smart TV 4K, 8K đỉnh cao từ Samsung, Sony, LG. PhoneSin còn cung cấp các thiết bị điện máy gia dụng hiện đại như máy giặt, tủ lạnh, giúp cuộc sống của bạn tiện nghi và thông minh hơn.'
    }
  };

  const currentMeta = useMemo(() => {
    if (categoryMetadata[slug]) return categoryMetadata[slug];
    if (slugBrand) {
      const brandNames = { 'iphone': 'iPhone', 'samsung': 'Samsung', 'xiaomi': 'Xiaomi', 'oppo': 'OPPO', 'vivo': 'VIVO', 'sony': 'Sony' };
      const displayName = brandNames[slugBrand.toLowerCase()] || (slugBrand.charAt(0).toUpperCase() + slugBrand.slice(1));
      return {
        title: `Điện thoại ${displayName}`,
        desc: `Khám phá các dòng sản phẩm ${displayName} mới nhất, chính hãng với ưu đãi tốt nhất tại PhoneSin.`
      };
    }
    return categoryMetadata['dien-thoai'];
  }, [slug, slugBrand]);

  // 2. State quản lý bộ lọc (Khởi tạo từ URL nếu có)
  const [filters, setFilters] = useState({
    brand: slugBrand,
    priceRange: 'Tất cả',
    os: null,
    ram: null,
    rom: null,
    batteryTier: 'Tất cả',
    network: null,
    nfc: false,
    memoryCard: 'Tất cả',
    screenSize: 'Tất cả',
    screenStandard: null,
    refreshRate: null,
    camera: 'Tất cả',
    specialFeatures: 'Tất cả',
    sortBy: 'highlight'
  });

  // 3. Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 12;

  // Reset page khi bộ lọc thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Cập nhật brand nếu slug thay đổi
  useEffect(() => {
    const newBrand = slug && validBrands.includes(slug.toLowerCase()) ? slug.toLowerCase() : null;
    setFilters(prev => ({ ...prev, brand: newBrand }));
  }, [slug]);

  const parsePriceRange = (range) => {
    if (!range || range === 'Tất cả') return {};
    const isTrieu = range.includes('triệu');
    const multiplier = isTrieu ? 1000000 : 1000;

    if (range.includes('Dưới')) {
      const max = parseInt(range.replace(/[^\d]/g, '') || '0') * multiplier;
      return { maxPrice: max - 1 };
    }
    if (range.includes('Trên')) {
      const min = parseInt(range.replace(/[^\d]/g, '') || '0') * multiplier;
      return { minPrice: min };
    }
    if (range.includes('đến')) {
      const parts = range.split('đến');
      const min = parseInt(parts[0].replace(/[^\d]/g, '') || '0') * multiplier;
      const max = parseInt(parts[1].replace(/[^\d]/g, '') || '0') * multiplier;
      return { minPrice: min, maxPrice: max };
    }
    if (range.includes('Từ')) {
      const parts = range.replace('Từ ', '').replace(/k/g, '000').split('-');
      return { minPrice: parseInt(parts[0]) || 0, maxPrice: parseInt(parts[1]) || undefined };
    }
    return {};
  };

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const params = { 
          page: currentPage, 
          limit: itemsPerPage,
          sortBy: filters.sortBy 
        };

        // 1. Brand context
        if (filters.brand) {
          params.brand = filters.brand;
        } else if (slugBrand) {
          params.brand = slugBrand;
        }

        // 2. Category context
        const meta = categoryMetadata[slug];
        if (meta && meta.backendCategories) {
          params.category = meta.backendCategories.join(',');
        } else if (slug && !slugBrand) {
           params.category = slug;
        }

        // 3. Price range
        const priceParams = parsePriceRange(filters.priceRange);
        if (priceParams.minPrice) params.minPrice = priceParams.minPrice;
        if (priceParams.maxPrice) params.maxPrice = priceParams.maxPrice;

        // 4. Specs filters (Server-side)
        if (filters.ram && filters.ram !== 'Tất cả') params.ram = filters.ram;
        if (filters.rom && filters.rom !== 'Tất cả') params.rom = filters.rom;
        if (filters.network && filters.network !== 'Tất cả') params.network = filters.network;
        if (filters.nfc && filters.nfc !== 'Tất cả') params.nfc = filters.nfc;
        if (filters.refreshRate && filters.refreshRate !== 'Tất cả') params.refreshRate = filters.refreshRate;
        if (filters.screenSize && filters.screenSize !== 'Tất cả') params.screenSize = filters.screenSize;
        if (filters.batteryTier && filters.batteryTier !== 'Tất cả') params.battery = filters.batteryTier;
        if (filters.os && filters.os !== 'Tất cả') params.os = filters.os;
        if (filters.camera && filters.camera !== 'Tất cả') params.camera = filters.camera;
        if (filters.screenStandard && filters.screenStandard !== 'Tất cả') params.screenStandard = filters.screenStandard;
        if (filters.memoryCard && filters.memoryCard !== 'Tất cả') params.memoryCard = filters.memoryCard;
        if (filters.specialFeatures && filters.specialFeatures !== 'Tất cả') params.specialFeatures = filters.specialFeatures;
        if (filters.storage && filters.storage !== 'Tất cả') params.storage = filters.storage;
        if (filters.cpu && filters.cpu !== 'Tất cả') params.cpu = filters.cpu;
        if (filters.gpu && filters.gpu !== 'Tất cả') params.gpu = filters.gpu;

        const response = await api.get('/api/products', { params });
        if (!ignore) {
          const rawProducts = response.data?.data || [];
          setBackendProducts(rawProducts.map(normalizeProduct));
          setTotalPages(response.data?.pagination?.totalPages || 1);
          setTotalItems(response.data?.pagination?.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          setBackendProducts([]);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadProducts();
    return () => { ignore = true; };
  }, [slug, filters, currentPage]);

  // Use products directly from backend (already filtered and paginated)
  const filteredProducts = backendProducts;


  // 4.5 Dynamic Filter Counts
  const filterCounts = useMemo(() => {
    const counts = { brand: {}, priceRange: {}, ram: {}, rom: {}, cpu: {}, network: {}, refreshRate: {}, screenSize: {} };
    const normalize = (val) => String(val || '').replace(/\s/g, '').toLowerCase();

    // Pool products by current category context
    const categoryPool = backendProducts.filter(p => {
      if (categoryMetadata[slug]) {
        return p.category === slug ||
          p.backendCategory?.toLowerCase() === categoryMetadata[slug].backendCategory?.toLowerCase();
      }
      if (slug && validBrands.includes(slug.toLowerCase())) return (p.brandKey || p.brand || '').toLowerCase() === slug.toLowerCase();
      return true;
    });

    categoryPool.forEach(p => {
      // Brands
      const b = p.brand;
      if (b) counts.brand[b] = (counts.brand[b] || 0) + 1;

      // Specs
      const ram = p.ram || p.specs?.ram;
      if (ram) counts.ram[ram] = (counts.ram[ram] || 0) + 1;
      const rom = p.rom || p.specs?.rom;
      if (rom) counts.rom[rom] = (counts.rom[rom] || 0) + 1;
      const cpu = p.cpu || p.specs?.chip;
      if (cpu) counts.cpu[cpu] = (counts.cpu[cpu] || 0) + 1;
      const rr = p.refreshRate || p.specs?.refreshRate;
      if (rr) counts.refreshRate[rr] = (counts.refreshRate[rr] || 0) + 1;

      // Price Ranges
      const price = p.priceNum || 0;
      const config = categoryMetadata[slug] || { priceRanges: [] };
      (config.priceRanges || []).forEach(range => {
        const isTrieu = range.includes('triệu');
        const M = isTrieu ? 1000000 : 1000;
        let match = false;
        if (range.includes('Dưới')) match = price < (parseInt(range.replace(/[^\d]/g, '')) * M);
        else if (range.includes('Trên')) match = price >= (parseInt(range.replace(/[^\d]/g, '')) * M);
        else if (range.includes('đến')) {
          const pts = range.split('đến');
          match = price >= (parseInt(pts[0].replace(/[^\d]/g, '')) * M) && price <= (parseInt(pts[1].replace(/[^\d]/g, '')) * M);
        }
        if (match) counts.priceRange[range] = (counts.priceRange[range] || 0) + 1;
      });
    });

    return counts;
  }, [backendProducts, slug]);


  const toggleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setFilters({
      brand: null,
      priceRange: 'Tất cả',
      ram: null,
      rom: null,
      cpu: null,
      screenSize: 'Tất cả',
      refreshRate: null,
      sortBy: 'relate'
    });
  };

  const setSingleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const currentProducts = filteredProducts;

  const [currentBanner, setCurrentBanner] = useState(0);


  const bannerMap = {
    'dich-vu': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/03/07/sim-the.jpg"
    ],
    'hang-cu': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-05.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-06.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-07.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/03/may-cu-gia-re-banner.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-01.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-02.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-03.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-04.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/08/banner-chuyen-muc-trang-may-cu-05.jpg"
    ],
    'sim': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/03/07/sim-the.jpg"
    ],
    'goi-cuoc': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/03/07/sim-the.jpg"
    ],
    'dien-thoai': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/19/redmagic-11-pro-cat.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/07/04/web-benco-v91-1200x200-1.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/02/galaxy-a57-a37-5g-1200x200-0204.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/01/s26-ultra-1200x200-0104.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/31/honor-x7d-07.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/18/x6c-cat.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/09/xiaomi-redmi-note-14.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/18/magic-v5-cat.jpg"
    ],
    'am-thanh': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/11/web-sony-wh-1000xm5.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/11/wh-1000xm6-cm.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/24/deal-sony-1200x200-2403c.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/23/wf-1000xm6-1200x200-2303.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/10/airpod-pro3.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/07/28/1200x200.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/11/web-sony-wh-1000xm5.jpg"
    ],
    'smart-home': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/07/24/jmgo-n1s-nano.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/05/may-loc-kk-clair-04.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/05/may-loc-kk-xiaomi-04.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/17/philips-01.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/05/robot-xiaomi-1.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/31/vacuum-h50-series-1200x200-3103.png"
    ],
    'laptop': [
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/02/14/banner-laptop-cat.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/01/30/zenbook-1200x200-3001.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/06/mac-air-m5-cat.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/10/macbook-neo-cat.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/12/02/rog-stix-g16-1200x200-0212.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/07/18/laptop-lenovo-1200x200.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/11/27/m5-moi-rs-cm.png'
    ],
    'man-hinh': [
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/01/09/banner-chuyen-muc-man-hinh-xiaomi.jpg',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/12/asus-proart-pa248qfv-pa278qgv-1200x200-1203.jpg',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/13/msi-mp-series-jpg.jpeg',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/30/viewsonic-1200x200-3010.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/24/gigabyte-gs24f14-1200x200-2403.png'
    ],
    'tablet': [
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2024/12/09/ipad-air-mini-banner-cat-2.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/11/22/ipad-m5-cat.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2024/11/25/tab-lenovo-1200x200.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/11/11/redmagic-astra-gaming-cat.png',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/02/27/xiaomi-pad-8-cat.jpg',
      'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/09/redmi-pad-2-web-cat.jpg'
    ],
    'dong-ho': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/18/watch-se3-ldp.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/01/dong-ho-kieslect-cat.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/18/watch-ultra-3-cat.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/05/19/dong-ho-dinh-vi-tre-em-myalo-hoang-ha-banner-1200x200.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/09/16/rvs.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/02/gt-runner-2-web-1200x200-0204.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/11/xiaomi-watch-5-1200x200-1103.png",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/01/17/amazfit-t-rex-3-pro-48mm.jpg"
    ],
    'linh-kien-may-tinh': [
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/08/08/banner-chuyen-muc-linh-kien-may-tinh-02.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/08/08/banner-chuyen-muc-linh-kien-may-tinh-01.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/08/08/banner-chuyen-muc-linh-kien-may-tinh-03.jpg",
      "https://cdn.hoanghamobile.vn/i/home/Uploads/2025/08/08/banner-chuyen-muc-linh-kien-may-tinh-02.jpg"
    ],
    'sua-chua': [
      "/banners/suachua-1.png",
      "/banners/suachua-2.png",
      "/banners/suachua-3.png",
      "/banners/suachua-4.png"
    ]
  };

  const categoryBanners = bannerMap[slug] || bannerMap['dien-thoai'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % categoryBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [categoryBanners.length]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-20 font-sans">
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden sticky top-[128px] z-40 px-4 py-3 bg-[#f0f2f5]/80 backdrop-blur-md">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 shadow-sm font-bold text-gray-700 active:scale-95 transition-all"
        >
          <Filter size={18} className="text-[#008d71]" />
          Bộ lọc & Tìm kiếm
          {Object.values(filters).filter(v => v !== null && v !== 'Tất cả' && v !== 'relate' && v !== false).length > 0 && (
            <span className="ml-1 w-5 h-5 bg-[#008d71] text-white text-[11px] rounded-full flex items-center justify-center">
              {Object.values(filters).filter(v => v !== null && v !== 'Tất cả' && v !== 'relate' && v !== false).length}
            </span>
          )}
        </button>
      </div>

      <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row gap-6 pt-6 px-4 sm:px-6 relative items-start">

        {/* LEFT POSTER - Hidden on most screens */}
        <div className="hidden 2xl:block w-[185px] shrink-0 sticky top-[130px] h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/50 group">
          <img src="https://cdn.hoanghamobile.vn/Uploads/2026/03/19/sua-chua-thay-pin-man-hinh-iphone-02.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner Trái" />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <Breadcrumbs />

          {/* 1. Category Hero Banner Slider */}
          <div className="w-full h-[200px] md:h-[320px] rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl mb-8 mt-4 relative group border-4 border-white bg-white">
            <div
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) h-full"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {categoryBanners.map((src, idx) => (
                <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center bg-white">
                  <img
                    src={src}
                    className="w-full h-full object-contain transition-opacity duration-500"
                    alt={`Banner ${idx + 1}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {categoryBanners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBanner(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${currentBanner === idx ? 'bg-[#008d71] w-8' : 'bg-gray-200 w-1.5'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 2. Sidebar Filters - Responsive Drawer for Mobile */}
            <div className={`
                ${showMobileFilters ? 'fixed inset-0 z-[100] p-4 bg-black/60 backdrop-blur-sm overflow-y-auto block' : 'hidden'} 
                lg:relative lg:block lg:inset-auto lg:p-0 lg:bg-transparent lg:z-0 lg:w-[320px] shrink-0
              `}>
              <div className="relative bg-white lg:bg-transparent rounded-3xl p-4 sm:p-6 lg:p-0 shadow-2xl lg:shadow-none min-h-screen lg:min-h-0">
                <div className="flex lg:hidden justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Bộ lọc sản phẩm</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">&times;</button>
                </div>
                <FilterSidebar
                  category={slug}
                  filters={filters}
                  setFilters={setFilters}
                  onToggleFilter={toggleFilter}
                  onSetSingleFilter={setSingleFilter}
                  counts={filterCounts}
                />
                <div className="lg:hidden sticky bottom-0 pt-4 pb-2 bg-white mt-4 border-t border-gray-100">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full h-14 bg-[#008d71] text-white rounded-xl font-bold shadow-lg shadow-[#008d71]/30 active:scale-95 transition-all"
                  >
                    ÁP DỤNG BỘ LỌC
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Product Area */}
            <div className="flex-1 w-full overflow-hidden">
              {/* Sort Bar */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mb-6 shadow-sm border border-white/40">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-gray-500 ml-2 font-medium">Sắp xếp:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'relate', label: 'Liên quan' },
                      { id: 'newest', label: 'Mới nhất' },
                      { id: 'bestseller', label: 'Bán chạy' },
                      { id: 'price', label: 'Giá tiền', icon: <ChevronsUpDown size={14} className="ml-2" /> }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setFilters(f => ({ ...f, sortBy: opt.id }))}
                        className={`px-4 sm:px-6 py-2 bg-white border border-gray-200 rounded-lg text-[13px] flex items-center justify-center transition-all shadow-sm ${filters.sortBy === opt.id
                          ? 'text-[#008d71] font-bold border-[#008d71]'
                          : 'text-gray-800 hover:border-[#008d71]'
                          }`}
                      >
                        {opt.label}
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {Object.values(filters).some(v => v !== null && v !== 'Tất cả' && v !== 'relate' && v !== false) && (
                  <button
                    onClick={clearFilters}
                    className="text-[12px] font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Filter size={14} /> XÓA BỘ LỌC
                  </button>
                )}
              </div>

              <div className="mb-4">
                <RecommendedProducts category={slug} />
              </div>

              {/* Category Discovery (Laptop specific) */}
              <CategoryDiscovery category={slug} />

              {/* EXPLORE CATEGORIES (Only for Monitors - Moved here) */}
              {slug === 'man-hinh' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 overflow-hidden">
                  <h3 className="text-[17px] font-bold text-gray-800 mb-6 uppercase tracking-tight">Khám phá danh mục</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      { name: 'Màn hình đồ họa', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-50.gif' },
                      { name: 'Màn hình gaming', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-49.gif' },
                      { name: 'Màn hình văn phòng', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-47.gif' },
                      { name: 'Màn hình di động', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-46.gif' },
                      { name: 'Phụ kiện màn hình', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-45.gif' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover:shadow-md cursor-pointer group bg-[#ffe9e1]"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden">
                          <img src={item.icon} alt={item.name} className="w-full h-full object-contain transition-transform group-hover:scale-110" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-800 text-center leading-tight transition-colors group-hover:text-[#008d71]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPLORE REPAIR CATEGORIES (Only for Phones) */}
              {slug === 'dien-thoai' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 overflow-hidden">
                  <h3 className="text-[17px] font-bold text-gray-800 mb-6 uppercase tracking-tight">Khám phá danh mục</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      { name: 'Sửa Điện Thoại', icon: 'https://cdn.hoanghamobile.vn/i/productlist/dsp/Uploads/2024/01/18/s24-ultra-grey.png', link: 'https://hoanghamobile.com/dich-vu-sua-chua/sua-dien-thoai' },
                      { name: 'Sửa MacBook', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2020/09/16/Macbook-air.png', link: '#' },
                      { name: 'Sửa Máy Tính Bảng', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/06/11/ipad-air.png', link: '#' },
                      { name: 'Sửa AirPods', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2026/04/08/airpods-3-removebg-preview.png', link: '#' },
                      { name: 'Sửa Apple Watch', icon: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/11/17/icon-apple-watch-series.png', link: '#' }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href={item.link}
                        target={item.link !== '#' ? "_blank" : "_self"}
                        rel="noreferrer"
                        className="flex flex-col items-center justify-start gap-4 pt-5 pb-3 px-2 rounded-xl transition-all hover:shadow-md cursor-pointer group bg-[#ffe9e1] min-h-[140px]"
                      >
                        <span className="text-[13px] font-bold text-gray-800 text-center leading-tight transition-colors group-hover:text-[#008d71] px-1">{item.name}</span>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center overflow-hidden">
                          <img src={item.icon} alt={item.name} className="max-w-full max-h-full object-contain transition-transform group-hover:scale-110 drop-shadow-sm" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Title + Description */}
              <div className="mb-8">
                <h1 className="text-[22px] font-black text-gray-900 mb-2">{currentMeta.title}</h1>
                <p className="text-[15px] text-gray-600 leading-[1.7]">
                  {currentMeta.desc}
                </p>
              </div>

              {/* FEATURED PRODUCTS (SẢN PHẨM NỔI BẬT - Slider Version) */}
              {slug === 'man-hinh' && currentProducts.length > 0 && (
                <FeaturedMonitorSlider products={currentProducts} />
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/60 shadow-inner min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-[#008d71]/20 border-t-[#008d71] rounded-full animate-spin mb-6"></div>
                  <p className="text-[#008d71] font-black uppercase tracking-[0.2em] animate-pulse">Đang tải sản phẩm...</p>
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (

                <div className="flex flex-col items-center py-10">
                  <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center w-full max-w-2xl">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Filter size={28} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 mb-2">Hic! Không tìm thấy sản phẩm phù hợp</h3>
                    <p className="text-gray-500 text-sm">Tuy nhiên, bạn có thể tham khảo các mẫu điện thoại đang cực "Hot" dưới đây:</p>
                  </div>

                  {/* Suggestions when empty */}
                  {backendProducts.length > 0 && (
                    <div className="mt-12 w-full">
                      <div className="flex items-center gap-3 mb-8 justify-center">
                        <div className="h-px w-10 bg-gray-200"></div>
                        <h2 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase text-center">GỢI Ý CHO BẠN</h2>
                        <div className="h-px w-10 bg-gray-200"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {backendProducts.slice(0, 4).map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination */}
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Hot Products Section */}
              <HotProducts category={slug} />


            </div>
          </div>
        </div>

        {/* RIGHT POSTER - Refined Height & Shadow */}
        <div className="hidden 2xl:block w-[185px] shrink-0 sticky top-[130px] h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/50 bg-white group">
          <img src="/banner-pc-tai-nghe.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Banner Phải" />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
        </div>

      </div>
    </div>
  );
};

export default CategoryPage;

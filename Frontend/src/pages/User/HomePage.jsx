import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Zap, Smartphone, Laptop, Tablet, Monitor, MousePointer2, Tv, Watch, Headphones, Home, Settings, Wrench, ClipboardList, Info, Flame, History, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../../components/HeroCarousel';
import ProductCard from '../../components/ProductCard';
import FeaturedCategories from '../../components/FeaturedCategories';
import CustomerFeedback from '../../components/CustomerFeedback';
import PromotionSlider from '../../components/PromotionSlider';
import api from '../../lib/api';
import { inflateProducts, normalizeProduct } from '../../lib/products';

const HomePage = () => {
    const [timeLeft, setTimeLeft] = useState({ h: 8, m: 0, s: 51 });
    const [backendProducts, setBackendProducts] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.s > 0) return { ...prev, s: prev.s - 1 };
                if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
                if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const categories = [
        { name: 'Điện thoại', icon: <img src="/categories/phone.png" alt="Điện thoại" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Laptop', icon: <img src="/categories/laptop.png" alt="Laptop" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Tablet', icon: <img src="/categories/tablet.png" alt="Tablet" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Màn hình', icon: <img src="/categories/monitor.png" alt="Màn hình" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Linh kiện máy tính', icon: <img src="/categories/mouse.png" alt="Linh kiện" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Tivi, Điện máy', icon: <img src="/categories/tv.png" alt="Tivi" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Đồng hồ', icon: <img src="/categories/watch.png" alt="Đồng hồ" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Âm thanh', icon: <img src="/categories/headphone.png" alt="Âm thanh" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Smart home', icon: <img src="/categories/smarthome.png" alt="Smart home" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Phụ kiện', icon: <img src="/categories/accessory.png" alt="Phụ kiện" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Sửa chữa', icon: <img src="/categories/repair.png" alt="Sửa chữa" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Dịch vụ', icon: <img src="/categories/service.png" alt="Dịch vụ" className="w-[26px] h-[26px] object-contain" /> },
    ];

    const oldMarket = [
        { name: 'Hàng cũ', icon: <img src="/categories/old-store.png" alt="Hàng cũ" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Thu cũ đổi mới', icon: <img src="/categories/trade-in.png" alt="Thu cũ" className="w-[26px] h-[26px] object-contain" /> },
    ];

    const news = [
        { name: 'Tin công nghệ', icon: <img src="/categories/news.png" alt="Tin tức" className="w-[26px] h-[26px] object-contain" /> },
        { name: 'Khuyến mãi hot', icon: <img src="/categories/flame.png" alt="Khuyến mãi" className="w-[26px] h-[26px] object-contain" /> },
    ];

    const [activeTab, setActiveTab] = useState('Tất cả');
    const flashSaleRef = useRef(null);

    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            try {
                const response = await api.get('/api/products', {
                    params: { limit: 50 },
                });

                if (!ignore) {
                    setBackendProducts((response.data?.data || []).map(normalizeProduct));
                }
            } catch (error) {
                if (!ignore) {
                    setBackendProducts([]);
                }
            }
        };

        loadProducts();

        return () => {
            ignore = true;
        };
    }, []);

    const flashSaleSource = React.useMemo(() => {
        const tabs = {
            'Tất cả': () => true,
            'Điện thoại/Tablet': (product) => ['dien-thoai', 'tablet'].includes(product.category),
            'Laptop/Màn hình': (product) => ['laptop', 'man-hinh'].includes(product.category),
            'Phụ kiện công nghệ': (product) =>
                ['am-thanh', 'dong-ho', 'linh-kien-may-tinh', 'smart-home'].includes(
                    product.category
                ),
        };

        const filtered = backendProducts.filter(tabs[activeTab] || tabs['Tất cả']);
        return filtered.length > 0 ? filtered : backendProducts;
    }, [activeTab, backendProducts]);

    const flashSaleProducts = React.useMemo(
        () => inflateProducts(flashSaleSource, 8, `home-flash-${activeTab}`),
        [activeTab, flashSaleSource]
    );

    const forYouProducts = React.useMemo(
        () => inflateProducts(backendProducts, 27, 'home-for-you'),
        [backendProducts]
    );

    const primaryProducts = forYouProducts.slice(0, 8);
    const secondaryProducts = forYouProducts.slice(8, 12);
    const accessoryProducts = forYouProducts.slice(12, 14);
    const mixedProducts = forYouProducts.slice(14, 20);
    const budgetProducts = forYouProducts.slice(20, 24);
    const endingProducts = forYouProducts.slice(24, 27);

    // Auto scroll logic for Flash Sale
    useEffect(() => {
        const interval = setInterval(() => {
            if (flashSaleRef.current) {
                const maxScroll = flashSaleRef.current.scrollWidth - flashSaleRef.current.offsetWidth;
                if (flashSaleRef.current.scrollLeft >= maxScroll - 10) {
                    flashSaleRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    flashSaleRef.current.scrollBy({ left: 240, behavior: 'smooth' });
                }
            }
        }, 4000); // Scroll every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-20 font-sans">
            <div className="max-w-[1850px] mx-auto flex gap-4 lg:gap-6 pt-3 sm:pt-6 px-3 sm:px-8 relative items-start">
                
                {/* 1. LEFT POSTER - Refined Height & Premium Look */}
                <div className="hidden 2xl:block w-[185px] shrink-0 sticky top-[130px] h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/50 group">
                    <img src="https://cdn.hoanghamobile.vn/Uploads/2026/03/19/sua-chua-thay-pin-man-hinh-iphone-02.jpg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Sửa chữa iPhone" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* CATEGORY SIDEBAR */}
                <div className="hidden lg:flex w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 p-3 flex-col gap-4 shrink-0 sticky top-[130px] self-start z-20 max-h-[calc(100vh-140px)] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <div>
                        <h3 className="px-3 py-2 text-[13px] font-black uppercase text-gray-400 tracking-wider">Danh mục</h3>
                        <div className="flex flex-col gap-1">
                            {categories.map((cat, i) => (
                                <Link 
                                    key={i} 
                                    to={`/category/${cat.name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")}`}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="text-gray-500 group-hover:text-[#007b63] transition-colors">{cat.icon}</span>
                                        <span className="text-[16px] font-bold text-gray-700">{cat.name}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#007b63] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-gray-50 pt-3">
                        <h3 className="px-3 py-2 text-[13px] font-black uppercase text-gray-400 tracking-wider">Hàng cũ</h3>
                        <div className="flex flex-col gap-1">
                            {oldMarket.map((cat, i) => (
                                <Link 
                                    key={i} 
                                    to={`/category/${cat.name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")}`}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="text-gray-500 group-hover:text-[#007b63] transition-colors">{cat.icon}</span>
                                        <span className="text-[16px] font-bold text-gray-700">{cat.name}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#007b63] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-gray-50 pt-3">
                        <h3 className="px-3 py-2 text-[13px] font-black uppercase text-gray-400 tracking-wider">Tin tức</h3>
                        <div className="flex flex-col gap-1">
                            {news.map((cat, i) => (
                                <Link 
                                    key={i} 
                                    to={`/category/${cat.name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")}`}
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <span className="group-hover:text-[#007b63] transition-colors">{cat.icon}</span>
                                        <span className="text-[16px] font-bold text-gray-700">{cat.name}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#007b63] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MAIN RIGHT CONTENT */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    
                    {/* HERO AREA (Carousel + 4 sub-banners) */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                        <div className="rounded-xl overflow-hidden shadow-sm">
                            <HeroCarousel />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {[
                                { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/16/iphone-17e-hot-sp.png', link: '/category/iphone' },
                                { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/11/22/sanphamhot2-x6c.png', link: '/category/honor' },
                                { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/01/19/web-poco-m7.png', link: '/category/xiaomi' },
                                { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/06/a17-a07-sp-hot.png', link: '/category/samsung' }
                            ].map((banner, i) => (
                                <Link to={banner.link} key={i} className="aspect-[1.8/1] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 group relative">
                                     <img src={banner.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="sub banner" />
                                     <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* FLASH SALE SECTION */}
                    <div className="mb-10 relative">
                        {/* Header Image (Festive Banner) */}
                        <div className="w-full relative rounded-t-2xl overflow-hidden shadow-lg border-x border-t border-[#c00]">
                            <img src="https://cdn.hoanghamobile.vn/i/home/Uploads/2026/01/19/khung-sale-tet-fill-danh-muc.png" className="w-full h-auto" alt="Flash Sale Banner" />
                            <Link to="/flash-sale" className="hidden sm:flex absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold items-center gap-1 transition-all shadow-md group">
                                Xem thêm <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Main Content Area (White Box) */}
                        <div className="bg-white rounded-b-2xl shadow-xl border-x border-b border-[#c00] p-4">
                            {/* Header: Countdown + Chips (Stacked) */}
                            <div className="flex flex-col gap-6 mb-8 items-center md:items-start">
                                {/* Countdown Timer Digital Style */}
                                <div className="bg-[#fff1f0] border border-red-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 w-full md:w-fit">
                                    <div className="text-red-600 font-black text-sm uppercase italic tracking-wider">
                                        Đang diễn ra • {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-gray-700 font-black text-[11px] uppercase">Kết thúc trong</span>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {[
                                                { val: timeLeft.h.toString().padStart(2, '0')[0] },
                                                { val: timeLeft.h.toString().padStart(2, '0')[1] },
                                                { sep: true },
                                                { val: timeLeft.m.toString().padStart(2, '0')[0] },
                                                { val: timeLeft.m.toString().padStart(2, '0')[1] },
                                                { sep: true },
                                                { val: timeLeft.s.toString().padStart(2, '0')[0] },
                                                { val: timeLeft.s.toString().padStart(2, '0')[1] },
                                            ].map((item, i) => (
                                                item.sep ? <span key={i} className="font-black text-[#ff424e] px-0.5">:</span> :
                                                <span key={i} className="bg-[#ff424e] text-white w-6 h-8 flex items-center justify-center rounded-md font-black text-lg shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]">
                                                    {item.val}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Filter Pills (Below Countdown) */}
                                <div className="flex flex-wrap gap-2 w-full">
                                    {[
                                        { name: 'Tất cả' },
                                        { name: 'Điện thoại/Tablet' },
                                        { name: 'Laptop/Màn hình' },
                                        { name: 'Phụ kiện công nghệ' },
                                    ].map((tab, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setActiveTab(tab.name)}
                                            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-[13px] font-black transition-all border-2 ${
                                                activeTab === tab.name 
                                                ? 'bg-[#00917a] text-white border-[#00917a] shadow-md' 
                                                : 'bg-white text-[#00917a] border-[#00917a] hover:bg-emerald-50'
                                            }`}
                                        >
                                            {tab.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Flash Sale Product Grid (Scrollable Carousel - Refactored for Smoothness) */}
                            <div className="relative group/carousel">
                                <div 
                                    ref={flashSaleRef}
                                    className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
                                    style={{ 
                                        scrollbarWidth: 'none', 
                                        msOverflowStyle: 'none',
                                        WebkitOverflowScrolling: 'touch'
                                    }}
                                >
                                    {flashSaleProducts.map((item, i) => (
                                        <div key={item.uiKey || item.id || i} className="min-w-[178px] sm:min-w-[210px] md:min-w-[240px] flex-shrink-0 snap-start">
                                            <ProductCard product={item} />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Carousel Navigation - Fixed Precision and Visibility */}
                                <button 
                                    onClick={() => flashSaleRef.current.scrollBy({ left: -flashSaleRef.current.offsetWidth/2, behavior: 'smooth' })}
                                    className="hidden sm:flex absolute -left-4 top-[40%] -translate-y-1/2 bg-white/95 backdrop-blur-md w-11 h-11 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.2)] items-center justify-center opacity-0 group-hover/carousel:opacity-100 z-50 transition-all hover:scale-110 active:scale-90 border border-gray-100"
                                >
                                    <ChevronLeft size={24} className="text-[#00917a]" strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={() => flashSaleRef.current.scrollBy({ left: flashSaleRef.current.offsetWidth/2, behavior: 'smooth' })}
                                    className="hidden sm:flex absolute -right-4 top-[40%] -translate-y-1/2 bg-white/95 backdrop-blur-md w-11 h-11 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.2)] items-center justify-center opacity-0 group-hover/carousel:opacity-100 z-50 transition-all hover:scale-110 active:scale-90 border border-gray-100"
                                >
                                    <ChevronRight size={24} className="text-[#00917a]" strokeWidth={3} />
                                </button>
                            </div>
                            
                            {/* Improved Dots Progress Indicator */}
                            <div className="flex justify-center gap-2 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === 0 ? 'bg-[#00917a] w-12' : 'bg-gray-200 w-2'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>



                    {/* DÀNH CHO BẠN - GIANT MASTER GRID */}
                    <div className="mt-10">
                            <div className="flex items-center justify-between mb-6 px-1">
                                <h2 className="text-[20px] font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                                <div className="bg-[#cc0000] w-1.5 h-6 rounded-full"></div>
                                Dành cho bạn
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[auto] grid-flow-dense">
                            
                            {/* Xiaomi 17 Ultra Banner */}
                            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200 hover:border-gray-300 transition-all bg-white flex flex-col h-full">
                                <div className="flex-1 w-full relative overflow-hidden bg-gray-50/50">
                                    <img src="https://cdn.hoanghamobile.vn//Uploads/2026/03/18/xiaomi-17-ultra-webb.png" className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-1000" alt="Xiaomi 17 Ultra" />
                                </div>
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 z-10 bg-white">
                                    <div className="text-left sm:pr-4 min-w-0">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Xiaomi 17 | 17 Pro | 17 Ultra</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Trải nghiệm nhiếp ảnh Leica đỉnh sáng tạo, cấu hình vượt trội.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0 self-start sm:self-auto">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Apple and Samsung products (normal) */}
                            {primaryProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                            {/* Samsung Banner */}
                            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200 hover:border-gray-300 transition-all flex flex-col h-full bg-white">
                                <div className="flex-1 w-full relative overflow-hidden bg-gray-50/50 min-h-[160px]">
                                    <img src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Samsung Special Banner" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1428A0]/90 via-[#1428A0]/40 to-transparent flex flex-col justify-end p-6 items-center text-center">
                                        <h3 className="text-white font-black text-2xl lg:text-[28px] mb-1 uppercase drop-shadow-lg">Ưu đãi độc quyền Samsung</h3>
                                        <p className="text-blue-100 font-medium mb-2 drop-shadow-md pb-2">Giảm thêm 2.000.000đ qua VNPAY</p>
                                    </div>
                                </div>
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 z-10 bg-white">
                                    <div className="text-left sm:pr-4 min-w-0">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Galaxy S25 | Z Fold6 | Z Flip6</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Trợ lý AI quyền năng, thế hệ gập mở tiên phong nhất.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0 self-start sm:self-auto">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Other mixed products part 1 */}
                            {secondaryProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                            {/* Máy Cũ Banner (Horizontal) */}
                            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200 flex flex-col h-full bg-blue-900">
                                <div className="flex-1 w-full relative overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Used machine" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent flex flex-col justify-end p-6 items-center text-center">
                                        <h3 className="text-white font-black text-2xl uppercase italic drop-shadow-xl mb-1">Máy cũ<br/>giá tốt</h3>
                                        <p className="text-yellow-300 font-black text-[24px] uppercase tracking-tighter drop-shadow-md pb-2">Trả góp 0%</p>
                                    </div>
                                </div>
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 z-10 bg-white">
                                    <div className="text-left sm:pr-4 min-w-0">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">iPhone, Samsung, OPPO 99%</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Hàng zin ngoại hình đẹp, bảo hành dài hạn - Trả góp 0đ.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0 self-start sm:self-auto">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                            
                            {/* Other mixed products part 2 */}
                            {accessoryProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                            {/* More random products */}
                            {mixedProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                            {/* Redmi Note 15 Banner (Horizontal) */}
                            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200 bg-white flex flex-col h-full">
                                <div className="flex-1 w-full relative overflow-hidden bg-white">
                                    <img src="https://cdn.hoanghamobile.vn/Uploads/2026/04/06/note-15-series-web.png" className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-1000" alt="Redmi Note 15 Series" />
                                </div>
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 z-10 bg-white">
                                    <div className="text-left sm:pr-4 min-w-0">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Redmi Note 15 | 15 Pro | 15 Pro+</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Hiệu năng bền bỉ, vô địch phân khúc với mức giá siêu ưu đãi.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0 self-start sm:self-auto">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Even more products part 1 */}
                            {budgetProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                            {/* Bao da Banner (Vertical) */}
                            <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
                                <img src="https://cdn.hoanghamobile.vn/Uploads/2026/04/07/baoda-web.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Bao da" />
                            </div>

                            {/* Even more products part 2 */}
                            {endingProducts.map((item) => (
                                <div key={item.uiKey || item.id} className="col-span-1">
                                    <ProductCard product={item} />
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* FEATURED CATEGORIES */}
                    <FeaturedCategories />

                    {/* CUSTOMER FEEDBACK */}
                    <CustomerFeedback />
                </div>

                {/* 5. RIGHT POSTER - Refined Height & Premium Look */}
                <div className="hidden 2xl:block w-[185px] shrink-0 sticky top-[130px] h-[700px] rounded-2xl overflow-hidden shadow-2xl border border-white/50 flex-shrink-0 bg-white group">
                    <img src="/banner-pc-tai-nghe.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Nâng cấp PC & Tai nghe" />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                </div>
            </div>

            {/* FULL WIDTH PROMOTION BANNERS (Outside main columns) */}
            <div className="max-w-[1450px] mx-auto px-4 sm:px-8 mt-10">
                <PromotionSlider />
            </div>
        </div>
    );
};

export default HomePage;

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Zap, Smartphone, Laptop, Tablet, Monitor, MousePointer2, Tv, Watch, Headphones, Home, Settings, Wrench, ClipboardList, Info, Flame, History, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../../components/HeroCarousel';
import ProductCard from '../../components/ProductCard';
import FeaturedCategories from '../../components/FeaturedCategories';
import CustomerFeedback from '../../components/CustomerFeedback';
import PromotionSlider from '../../components/PromotionSlider';

const HomePage = () => {
    const [timeLeft, setTimeLeft] = useState({ h: 8, m: 0, s: 51 });

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
            <div className="max-w-[1850px] mx-auto flex gap-6 pt-6 px-4 sm:px-8 relative items-start">
                
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
                        <div className="grid grid-cols-4 gap-2">
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
                            <Link to="/flash-sale" className="absolute top-4 right-4 bg-white/95 hover:bg-white text-gray-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-md group">
                                Xem thêm <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Main Content Area (White Box) */}
                        <div className="bg-white rounded-b-2xl shadow-xl border-x border-b border-[#c00] p-4">
                            {/* Header: Countdown + Chips (Stacked) */}
                            <div className="flex flex-col gap-6 mb-8 items-center md:items-start">
                                {/* Countdown Timer Digital Style */}
                                <div className="bg-[#fff1f0] border border-red-100 rounded-xl p-3 flex items-center gap-6 w-fit">
                                    <div className="text-red-600 font-black text-sm uppercase italic tracking-wider">
                                        Đang diễn ra • {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700 font-black text-[11px] uppercase">Kết thúc trong</span>
                                        <div className="flex items-center gap-1">
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
                                            className={`px-5 py-2 rounded-full text-[13px] font-black transition-all border-2 ${
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
                                    {[
                                        { id: 1, name: 'iPhone 15 Pro Max 256GB - Titanium', price: 29990000, oldPrice: 34990000, discount: '-14%', img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop' },
                                        { id: 2, name: 'Samsung Galaxy S24 Ultra 5G (12GB/256GB)', price: 28490000, oldPrice: 33990000, discount: '-16%', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop' },
                                        { id: 3, name: 'Xiaomi 14 Ultra 5G (16GB/512GB)', price: 29990000, oldPrice: 32990000, discount: '-9%', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop' },
                                        { id: 4, name: 'Google Pixel 8 Pro (12GB/128GB)', price: 18490000, oldPrice: 21990000, discount: '-15%', img: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop' },
                                        { id: 5, name: 'iPhone 15 Pink 128GB - New', price: 17490000, oldPrice: 19990000, discount: '-12%', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop' },
                                        { id: 6, name: 'Nothing Phone (2) 12GB/256GB', price: 14990000, oldPrice: 17990000, discount: '-17%', img: 'https://images.unsplash.com/photo-1690463428387-930f781df052?q=80&w=800&auto=format&fit=crop' },
                                        { id: 7, name: 'Redmi Note 13 Pro 5G', price: 8490000, oldPrice: 9990000, discount: '-15%', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop' },
                                        { id: 8, name: 'Sony Xperia 5 V 5G', price: 20990000, oldPrice: 22990000, discount: '-8%', img: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=800&auto=format&fit=crop' },
                                    ].map((item, i) => (
                                        <div key={i} className="min-w-[210px] md:min-w-[240px] flex-shrink-0 snap-start">
                                            <ProductCard 
                                                product={{
                                                    id: 'flash-phone-' + item.id,
                                                    name: item.name,
                                                    priceNum: item.price,
                                                    image: item.img,
                                                    discount: item.discount,
                                                    oldPrice: item.oldPrice.toLocaleString() + 'đ',
                                                    specs: {
                                                        camera: i % 2 === 0 ? '50MP' : '200MP',
                                                        chip: i % 2 === 0 ? 'Apple A17' : 'Snapdragon 8 Gen 3',
                                                        pin: '5000mAh'
                                                    }
                                                }} 
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Carousel Navigation - Fixed Precision and Visibility */}
                                <button 
                                    onClick={() => flashSaleRef.current.scrollBy({ left: -flashSaleRef.current.offsetWidth/2, behavior: 'smooth' })}
                                    className="absolute -left-4 top-[40%] -translate-y-1/2 bg-white/95 backdrop-blur-md w-11 h-11 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 z-50 transition-all hover:scale-110 active:scale-90 border border-gray-100"
                                >
                                    <ChevronLeft size={24} className="text-[#00917a]" strokeWidth={3} />
                                </button>
                                <button 
                                    onClick={() => flashSaleRef.current.scrollBy({ left: flashSaleRef.current.offsetWidth/2, behavior: 'smooth' })}
                                    className="absolute -right-4 top-[40%] -translate-y-1/2 bg-white/95 backdrop-blur-md w-11 h-11 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 z-50 transition-all hover:scale-110 active:scale-90 border border-gray-100"
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
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 z-10 bg-white">
                                    <div className="text-left pr-4">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Xiaomi 17 | 17 Pro | 17 Ultra</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Trải nghiệm nhiếp ảnh Leica đỉnh sáng tạo, cấu hình vượt trội.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Apple and Samsung products (normal) */}
                            {[
                                { id: 'm-1', name: 'iPhone 17 Pro Max 256GB - Chính hãng Apple Việt Nam', price: 36790000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/13/iphone-15-pro-max-titan-tu-nhien-1.png', specs: { chip: 'A19 Pro', pin: '4422mAh', camera: '48MP' } },
                                { id: 'm-2', name: 'iPhone 16e 128GB - Chính hãng VN/A', price: 12490000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2021/10/11/apple-iphone-13-1.png', specs: { chip: 'A18', pin: '3110mAh', camera: '12MP' } },
                                { id: 'm-3', name: 'iPhone 13 128GB - Chính hãng VN/A', price: 12590000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2021/10/11/apple-iphone-13-1.png', specs: { chip: 'A15', pin: '3240mAh', camera: '12MP' } },
                                { id: 'm-4', name: 'MacBook Air M4 13 inch 16GB/256GB', price: 25090000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/11/mac-air-m3-gray.png', specs: { chip: 'Apple M4', pin: '18h lướt web', camera: 'Liquid Retina' } },
                                { id: 'm-5', name: 'Samsung Galaxy S26 Ultra - 12GB/512GB', price: 36990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/01/18/titan-black-1_638411516247055417.png', specs: { chip: 'Snap 8 Gen 5', pin: '5000mAh', camera: '200MP' } },
                                { id: 'm-6', name: 'Samsung Galaxy S26 Ultra - 12GB/256GB', price: 30990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/01/18/titan-gray-1_638411516361546200.png', specs: { chip: 'Snap 8 Gen 5', pin: '5000mAh', camera: '200MP' } },
                                { id: 'm-6-1', name: 'iPad Pro M4 11-inch (2024)', price: 28990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/08/ipad-pro-11-den.png', specs: { chip: 'Apple M4', pin: '10h web', camera: 'OLED 120Hz' } },
                                { id: 'm-6-2', name: 'Apple Watch Series 9 GPS 41mm', price: 9290000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/13/watch-s9-nhom-vien-hong.png', specs: { chip: 'Apple S9', pin: '18h', camera: 'Retina' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '10%' }} />
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
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 z-10 bg-white">
                                    <div className="text-left pr-4">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Galaxy S25 | Z Fold6 | Z Flip6</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Trợ lý AI quyền năng, thế hệ gập mở tiên phong nhất.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Other mixed products part 1 */}
                            {[
                                { id: 'm-7', name: 'Samsung Galaxy A57 5G - 8GB/128GB', price: 11290000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/15/samsung-galaxy-a35-5g-vang.png', specs: { chip: 'Exynos 1680', pin: '5000mAh', camera: '50MP' } },
                                { id: 'm-8', name: 'Xiaomi 17 Ultra 16GB/512GB', price: 36990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/17/mi-14-u.png', specs: { chip: 'Snap 8 Gen 5', pin: '6000mAh', camera: 'Leica 50MP' } },
                                { id: 'm-8-1', name: 'Samsung Galaxy Z Fold6 5G', price: 41990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/07/11/z-fold6-xam-1.png', specs: { chip: 'Snap 8 Gen 3', pin: '4400mAh', camera: '50MP' } },
                                { id: 'm-8-2', name: 'Samsung Galaxy Z Flip6 5G', price: 26990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/07/11/z-flip6-xanh-1.png', specs: { chip: 'Snap 8 Gen 3', pin: '4000mAh', camera: '50MP' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '8%' }} />
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
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 z-10 bg-white">
                                    <div className="text-left pr-4">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">iPhone, Samsung, OPPO 99%</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Hàng zin ngoại hình đẹp, bảo hành dài hạn - Trả góp 0đ.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                            
                            {/* Other mixed products part 2 */}
                            {[
                                { id: 'm-8-3', name: 'OPPO Find N3 Flip 5G', price: 19990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/01/18/titan-black-1_638411516247055417.png', specs: { chip: 'Dimensity 9200', pin: '4300mAh', camera: '50MP' } },
                                { id: 'm-8-4', name: 'AirPods Pro 2 USB-C', price: 5890000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/13/airpods-pro-2-type-c-1.png', specs: { chip: 'Apple H2', pin: '30h case', camera: 'ANC' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '8%' }} />
                                </div>
                            ))}

                            {/* More random products */}
                            {[
                                { id: 'm-9', name: 'HONOR Magic V5', price: 39990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/08/21/honor-200-pro-trang.png', specs: { chip: 'Snap 8 Gen 4', pin: '5820mAh', camera: '50MP' } },
                                { id: 'm-10', name: 'Samsung Galaxy S25 Ultra 5G', price: 25990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/01/18/titan-gray-1_638411516361546200.png', specs: { chip: 'Snap 8 Gen 4', pin: '5000mAh', camera: '200MP' } },
                                { id: 'm-11', name: 'iPhone Air 256GB - VN/A', price: 23990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2021/10/11/apple-iphone-13-1.png', specs: { chip: 'A19 Pro', pin: '3500mAh', camera: '48MP' } },
                                { id: 'm-12', name: 'Xiaomi POCO M7 6GB/128GB', price: 3990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/07/04/image-removebg-preview-1.png', specs: { chip: 'Snapdragon 685', pin: '7000mAh', camera: '64MP' } },
                                { id: 'm-13', name: 'HONOR X7d 4G 8GB/256GB', price: 6290000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/08/21/honor-200-pro-trang.png', specs: { chip: 'Snapdragon', pin: '6500mAh', camera: '108MP' } },
                                { id: 'm-14', name: 'Xiaomi Redmi Note 15 Pro 5G', price: 10290000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/17/mi-14-u.png', specs: { chip: 'Dimensity', pin: '6580mAh', camera: '200MP' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '5%' }} />
                                </div>
                            ))}

                            {/* Redmi Note 15 Banner (Horizontal) */}
                            <div className="col-span-1 lg:col-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer border border-gray-200 bg-white flex flex-col h-full">
                                <div className="flex-1 w-full relative overflow-hidden bg-white">
                                    <img src="https://cdn.hoanghamobile.vn/Uploads/2026/04/06/note-15-series-web.png" className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-1000" alt="Redmi Note 15 Series" />
                                </div>
                                <div className="px-4 md:px-5 py-3 border-t border-gray-100 flex items-center justify-between shrink-0 z-10 bg-white">
                                    <div className="text-left pr-4">
                                        <p className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Redmi Note 15 | 15 Pro | 15 Pro+</p>
                                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 line-clamp-1">Hiệu năng bền bỉ, vô địch phân khúc với mức giá siêu ưu đãi.</p>
                                    </div>
                                    <button className="text-blue-600 font-bold uppercase text-[10px] md:text-xs tracking-wider border border-blue-600 px-3 md:px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all shrink-0">
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>

                            {/* Even more products part 1 */}
                            {[
                                { id: 'm-15', name: 'Samsung Galaxy S25 FE 8GB/128GB', price: 12990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/15/samsung-galaxy-a35-5g-vang.png', specs: { chip: 'Exynos 2400', pin: '4500mAh', camera: '50MP' } },
                                { id: 'm-16', name: 'Samsung Galaxy A17 LTE 8GB/128GB', price: 4690000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/15/samsung-galaxy-a35-5g-vang.png', specs: { chip: 'Helio G99', pin: '5000mAh', camera: '50MP' } },
                                { id: 'm-17', name: 'HONOR X5c Plus', price: 3090000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/08/21/honor-200-pro-trang.png', specs: { chip: 'Helio G85', pin: '5200mAh', camera: '50MP' } },
                                { id: 'm-18', name: 'Samsung Galaxy A07', price: 2990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/15/samsung-galaxy-a35-5g-vang.png', specs: { chip: 'Helio G85', pin: '5000mAh', camera: '50MP' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '12%' }} />
                                </div>
                            ))}

                            {/* Bao da Banner (Vertical) */}
                            <div className="col-span-1 row-span-2 rounded-2xl overflow-hidden shadow-sm relative group cursor-pointer">
                                <img src="https://cdn.hoanghamobile.vn/Uploads/2026/04/07/baoda-web.png" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Bao da" />
                            </div>

                            {/* Even more products part 2 */}
                            {[
                                { id: 'm-19', name: 'Huawei P70 Pro', price: 21990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/17/mi-14-u.png', specs: { chip: 'Kirin', pin: '5050mAh', camera: 'OIS' } },
                                { id: 'm-20', name: 'OnePlus 12 5G', price: 18990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/01/18/titan-black-1_638411516247055417.png', specs: { chip: 'Snap 8 Gen 3', pin: '5400mAh', camera: 'Hasselblad' } },
                                { id: 'm-21', name: 'Vivo X100 Pro', price: 23990000, img: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/08/21/honor-200-pro-trang.png', specs: { chip: 'Dimensity 9300', pin: '5400mAh', camera: 'Zeiss' } },
                            ].map((item) => (
                                <div key={item.id} className="col-span-1">
                                    <ProductCard product={{ ...item, priceNum: item.price, image: item.img, discount: '12%' }} />
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

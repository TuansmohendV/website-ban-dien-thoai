import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, MapPin, User, ShoppingCart } from 'lucide-react';
import api from '../lib/api';
import { normalizeProduct } from '../lib/products';

const Navbar = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { cartCount } = useCart();
    const [unreadCount, setUnreadCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [trendingCategories, setTrendingCategories] = useState([]);
    const [logo, setLogo] = useState(localStorage.getItem('adminLogo') || null);
    const navigate = useNavigate();
    const suggestionRef = useRef(null);

    // Sync logo from localStorage
    useEffect(() => {
        const checkLogo = () => {
            const savedLogo = localStorage.getItem('adminLogo');
            if (savedLogo !== logo) setLogo(savedLogo);
        };
        window.addEventListener('storage', checkLogo);
        const interval = setInterval(checkLogo, 2000);
        return () => {
            window.removeEventListener('storage', checkLogo);
            clearInterval(interval);
        };
    }, [logo]);
    useEffect(() => {
        if (searchQuery.trim().length < 1) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const response = await api.get('/api/products/suggest', {
                    params: { q: searchQuery.trim() }
                });

                const matches = (response.data?.data || [])
                    .map(normalizeProduct)
                    .slice(0, 5);

                setSuggestions(matches);
                setShowSuggestions(matches.length > 0);
            } catch (error) {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle click outside suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const loadUnreadCount = async () => {
            if (!user?.id) {
                setUnreadCount(0);
                return;
            }

            try {
                const response = await api.get('/api/notifications/unread-count');
                setUnreadCount(Number(response.data?.data?.count || 0));
            } catch {
                setUnreadCount(0);
            }
        };

        loadUnreadCount();
    }, [user?.id]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.get('/api/categories');
                // Only take first 6 active categories for trending section
                const activeCats = (response.data?.data || []).slice(0, 6);
                setTrendingCategories(activeCats);
            } catch (error) {
                // Fallback to minimal if API fails
                setTrendingCategories([]);
            }
        };
        loadCategories();
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (!query) return;

        // Intelligent Redirection Mapping
        const categoryMap = {
            'điện thoại': 'dien-thoai',
            'iphone': 'iphone',
            'samsung': 'samsung',
            'xiaomi': 'xiaomi',
            'oppo': 'oppo',
            'laptop': 'laptop',
            'màn hình': 'man-hinh',
            'monitor': 'man-hinh',
            'đồng hồ': 'dong-ho',
            'smartwatch': 'dong-ho',
            'tai nghe': 'am-thanh',
            'loa': 'am-thanh',
            'âm thanh': 'am-thanh',
            'máy tính bảng': 'tablet',
            'tablet': 'tablet',
            'ipad': 'tablet',
            'linh kiện': 'linh-kien-may-tinh',
            'vga': 'linh-kien-may-tinh',
            'cpu': 'linh-kien-may-tinh',
            'ram': 'linh-kien-may-tinh',
            'smart home': 'smart-home',
            'robot': 'smart-home',
            'tivi': 'tivi-dien-may',
            'tv': 'tivi-dien-may'
        };

        // Check if query matches a category keyword
        if (categoryMap[query]) {
            navigate(`/category/${categoryMap[query]}`);
            setShowSuggestions(false);
            return;
        }

        // Default search behavior
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <nav className="w-full z-50 flex flex-col font-sans sticky top-10 sm:top-11 bg-[#f0f2f5] py-2.5 md:py-4">
            <div className="max-w-[1200px] mx-auto px-4 w-full">
                
                {/* Main Row */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 lg:gap-x-10 h-auto lg:h-[46px]">
                    
                    {/* 1. Logo (Customizable) */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 group h-full">
                        <div className="flex items-center gap-2">
                            {logo ? (
                                <div className="h-[36px] w-[36px] flex items-center justify-center overflow-hidden rounded-lg">
                                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="text-[#004f44]">
                                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z" /></svg>
                                </div>
                            )}
                            <div className="flex flex-col leading-[0.9]">
                                <span className="text-[22px] font-black text-[#004f44] tracking-tighter uppercase">
                                    {localStorage.getItem('websiteName')?.split(' ')[0] || 'PhoneSin'}
                                </span>
                                <span className="text-[11px] font-black text-[#004f44]/80 tracking-[0.22em] uppercase">MOBILE.COM</span>
                            </div>
                        </div>
                    </Link>

                    {/* 2. Middle & Right Group */}
                    <div className="w-full lg:flex-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 lg:gap-x-6 h-auto lg:h-full min-w-0">
                        
                        {/* Search Bar Wrapper */}
                        <div className="w-full lg:max-w-[680px] lg:flex-1 flex flex-col relative h-[42px] sm:h-[44px] lg:h-full min-w-0" ref={suggestionRef}>
                            <div className="relative group flex items-center h-full">
                                <input 
                                    type="text" 
                                    placeholder="Hôm nay bạn muốn tìm gì?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => searchQuery.trim().length >= 1 && setShowSuggestions(true)}
                                    className="w-full bg-white border border-gray-200 rounded-lg h-full pl-3.5 sm:pl-5 pr-12 sm:pr-28 text-[13px] sm:text-[14px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#008d71] shadow-sm font-medium placeholder-gray-400"
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="absolute right-0 h-full px-3 sm:px-5 text-[#008d71] font-semibold text-[14px] sm:text-[15px] flex items-center gap-1.5 sm:gap-2 hover:bg-gray-50 transition-all border-l border-gray-200"
                                >
                                    <Search size={18} strokeWidth={1.5} />
                                    <span className="hidden sm:inline">Tìm kiếm</span>
                                </button>
                            </div>

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 text-[13px] font-bold text-gray-700 border-b border-gray-100">
                                        Sản phẩm gợi ý
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto">
                                        {suggestions.map((p) => (
                                            <Link 
                                                key={p.id}
                                                to={`/product/${p.id}`}
                                                onClick={() => setShowSuggestions(false)}
                                                className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 flex flex-col gap-1">
                                                    <h4 className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-2">{p.name}</h4>
                                                    <span className="text-[14px] font-black text-red-500">{p.priceDisplay}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {suggestions.length === 5 && (
                                        <button 
                                            onClick={handleSearch}
                                            className="w-full py-2.5 bg-gray-50 text-[12px] font-bold text-[#008d71] hover:bg-gray-100 transition-colors"
                                        >
                                            Xem tất cả kết quả cho "{searchQuery}"
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center justify-end gap-2 sm:gap-4 lg:gap-7 shrink-0 h-9 sm:h-11 lg:h-full min-w-0">
                            {/* Location */}
                            <Link to="/store-locator" className="flex items-center gap-1.5 cursor-pointer group h-full focus-within:ring-2 ring-[#008d71] rounded-md transition-shadow">
                                <MapPin size={20} className="text-[#008d71]" strokeWidth={1.5} />
                                <span className="hidden md:inline text-[15px] font-semibold text-[#008d71] whitespace-nowrap">Tìm siêu thị</span>
                            </Link>

                            {/* User Profile */}
                            <Link to={user ? "/profile" : "/login"} className="flex items-center gap-1.5 cursor-pointer group h-full">
                                <div className="relative">
                                    <User size={20} className="text-[#008d71]" strokeWidth={1.5} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-[#ff424e] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden md:inline text-[15px] font-semibold text-[#008d71] whitespace-nowrap">
                                    {user ? `Chào, ${user.name.split(' ')[0]}` : 'Tài khoản'}
                                </span>
                            </Link>

                            {/* Admin Shortcut (Temporary for testing) */}
                            {(user?.role === 'admin' || user?.isAdmin) && (
                                <Link to="/admin" className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#008d71]/10 rounded-full hover:bg-[#008d71]/20 transition-all">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-[13px] font-bold text-[#008d71]">Admin Panel</span>
                                </Link>
                            )}

                            {/* Simple Cart Bag */}
                            <Link to="/cart" className="flex items-center gap-1.5 p-1 group">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#008d71] transition-colors">
                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                                <div className="bg-[#ff424e] text-white text-[12px] font-semibold w-[20px] h-[20px] rounded-full flex items-center justify-center">
                                    {cartCount}
                                </div>
                            </Link>

                        </div>

                    </div>
                </div>

                {/* Sub Row: Trending Keywords (Align with Search Bar) */}
                <div className="flex items-center gap-2 sm:gap-3 mt-2 lg:ml-[200px] overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[12px] sm:text-[14px] font-black text-[#008d71] uppercase whitespace-nowrap">Từ khóa xu hướng</span>
                    <div className="flex gap-3 sm:gap-4 flex-nowrap">
                        {trendingCategories.length > 0 ? (
                            trendingCategories.map(kw => (
                                <Link 
                                    key={kw.id || kw._id} 
                                    to={`/category/${kw.slug}`} 
                                    className={`text-[13px] sm:text-[14px] font-bold transition-colors whitespace-nowrap ${
                                        kw.isFeatured 
                                        ? 'text-yellow-500 hover:text-yellow-400' 
                                        : 'text-gray-500/80 hover:text-[#008d71]'
                                    }`}
                                >
                                    {kw.name}
                                </Link>
                            ))
                        ) : (
                            // Fallback if no categories yet
                            ['iPhone', 'Xiaomi', 'Laptop', 'Phụ kiện'].map(kw => (
                                <span key={kw} className="text-[13px] sm:text-[14px] font-bold text-gray-500/80 whitespace-nowrap">{kw}</span>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Navbar;

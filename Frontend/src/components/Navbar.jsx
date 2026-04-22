import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { productService } from '../services/shopApi';

const TRENDING_KEYWORDS = [
  'iPhone',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'realme',
  'vivo',
];

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { formatPrice } = useLanguage();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const nextSuggestions = await productService.getSuggestions(searchQuery);
        setSuggestions(nextSuggestions.slice(0, 6));
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = (keyword = searchQuery) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedKeyword)}`);
    setShowSuggestions(false);
  };

  return (
    <nav className="sticky top-11 z-50 bg-[#f0f2f5] py-4 font-sans">
      <div className="mx-auto w-full max-w-[1250px] px-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <div className="rounded-2xl bg-[#004f44] p-2 text-white shadow-lg">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                  <path d="M17 19H7V5h10m0-4H7A2 2 0 0 0 5 3v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Z" />
                </svg>
              </div>
              <div className="leading-none">
                <p className="text-[24px] font-black uppercase tracking-tight text-[#004f44]">
                  PhoneSin
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#004f44]/70">
                  Mobile
                </p>
              </div>
            </Link>

            <div className="relative flex-1" ref={wrapperRef}>
              <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  placeholder="Tim ten san pham, thuong hieu hoac nhu cau cua ban"
                  className="h-full flex-1 px-4 text-[14px] font-medium text-gray-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="flex h-full items-center gap-2 border-l border-gray-200 px-4 text-[14px] font-bold text-[#008d71] transition-colors hover:bg-emerald-50"
                >
                  <Search size={18} />
                  Tim kiem
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-[calc(100%+10px)] z-[100] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
                    Goi y nhanh
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {suggestions.map((item) =>
                      item.type === 'history' ? (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(item.keyword);
                            handleSearch(item.keyword);
                          }}
                          className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50"
                        >
                          <Search size={16} className="text-gray-400" />
                          <span className="text-[14px] font-medium text-gray-700">
                            {item.keyword}
                          </span>
                        </button>
                      ) : (
                        <Link
                          key={item.id}
                          to={`/product/${item.id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50"
                        >
                          <div className="h-14 w-14 overflow-hidden rounded-xl bg-gray-50 p-2">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-[13px] font-bold text-gray-900">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[13px] font-black text-red-500">
                              {formatPrice(item.priceNum)}
                            </p>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <Link
                to="/store-locator"
                className="hidden items-center gap-2 text-[14px] font-bold text-[#008d71] md:flex"
              >
                <MapPin size={18} />
                Tim sieu thi
              </Link>

              <Link
                to={isAuthenticated ? '/profile' : '/login'}
                className="flex items-center gap-2 text-[14px] font-bold text-[#008d71]"
              >
                <User size={18} />
                {isAuthenticated ? `Chao, ${user.name.split(' ')[0]}` : 'Tai khoan'}
              </Link>

              <Link to="/cart" className="relative flex items-center gap-2 text-[#008d71]">
                <ShoppingCart size={20} />
                <span className="hidden text-[14px] font-bold md:inline">Gio hang</span>
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[13px]">
            <span className="font-black uppercase tracking-wider text-[#008d71]">
              Xu huong
            </span>
            {TRENDING_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleSearch(keyword)}
                className="rounded-full bg-white px-3 py-1.5 font-semibold text-gray-600 shadow-sm transition-colors hover:text-[#008d71]"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

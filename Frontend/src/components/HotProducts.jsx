import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import BuyNowModal from './BuyNowModal';
import { useLanguage } from '../context/LanguageContext';
import api from '../lib/api';
import { inflateProducts, normalizeProduct } from '../lib/products';

const HotProducts = ({ category = 'dien-thoai' }) => {
  const { formatPrice } = useLanguage();
  const [products, setProducts] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [buyModalProduct, setBuyModalProduct] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        const response = await api.get('/api/products', {
          params: { limit: 50 },
        });

        if (!ignore) {
          setProducts((response.data?.data || []).map(normalizeProduct));
        }
      } catch (error) {
        if (!ignore) {
          setProducts([]);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const categoryProducts = products.filter((product) => product.category === category);
    const source = categoryProducts.length > 0 ? categoryProducts : products;
    return inflateProducts(source, 8, `hot-${category}`);
  }, [category, products]);

  const visibleCount = 4;
  const maxIndex = Math.max(0, filteredItems.length - visibleCount);

  const prev = () => setCurrent((value) => (value <= 0 ? maxIndex : value - 1));
  const next = () => setCurrent((value) => (value >= maxIndex ? 0 : value + 1));

  useEffect(() => {
    setCurrent(0);
  }, [category, filteredItems.length]);

  useEffect(() => {
    if (isPaused || filteredItems.length <= visibleCount) {
      return undefined;
    }

    const timer = setInterval(() => next(), 4500);
    return () => clearInterval(timer);
  }, [current, filteredItems.length, isPaused]);

  const titles = {
    'dien-thoai': 'CAC SAN PHAM HOT NHAT CUA DIEN THOAI',
    laptop: 'CAC SAN PHAM HOT NHAT CUA LAPTOP',
    tablet: 'CAC SAN PHAM HOT NHAT CUA TABLET',
    'dong-ho': 'CAC SAN PHAM HOT NHAT CUA DONG HO THONG MINH',
    'man-hinh': 'CAC SAN PHAM HOT NHAT CUA MAN HINH',
    'linh-kien-may-tinh': 'CAC SAN PHAM HOT NHAT CUA LINH KIEN MAY TINH',
    'am-thanh': 'CAC SAN PHAM HOT NHAT CUA THIET BI AM THANH',
    'dich-vu': 'CAC SAN PHAM HOT NHAT CUA DICH VU',
  };
  const currentTitle = titles[category] || `CAC SAN PHAM HOT NHAT CUA ${category.toUpperCase()}`;

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 mt-4 overflow-hidden transition-all duration-500 hover:shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-[20px] font-black text-gray-900 uppercase tracking-tighter border-l-4 border-[#008d71] pl-4">
          {currentTitle}
        </h2>
      </div>

      <div className="overflow-hidden px-1">
        <div
          className="flex gap-4"
          style={{
            transform: `translateX(calc(-${current} * (${100 / visibleCount}% + ${
              16 / visibleCount
            }px)))`,
            transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {filteredItems.map((product) => (
            <div
              key={product.uiKey}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex-shrink-0 overflow-hidden group"
              style={{
                width: `calc(${100 / visibleCount}% - ${
                  ((visibleCount - 1) * 16) / visibleCount
                }px)`,
              }}
            >
              <div className="relative h-[200px] flex items-center justify-center bg-gray-50 px-4 pt-4 cursor-pointer group/img">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/95 p-3 rounded-full shadow-2xl transform scale-50 group-hover/img:scale-100 transition-all duration-500">
                    <Eye size={22} className="text-[#008d71]" />
                  </div>
                </div>
                {product.discount && (
                  <div className="absolute top-2 right-2 text-[11px] font-black text-[#ee0000] bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">
                    -{product.discount}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1 px-3 py-2 border-t border-gray-50 bg-[#fafafa]">
                {[
                  { label: product.cpu || product.brand, icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
                  { label: product.screenSize || product.specs?.screen || product.rom || 'Dang cap nhat', icon: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M20 12h-8m0 0 3-3m-3 3 3 3' },
                  { label: product.battery || `${product.countInStock} ton kho`, icon: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7' },
                ].map((spec, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a0aec0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={spec.icon} />
                    </svg>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5 leading-tight uppercase tracking-tighter">
                      {spec.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-3 pb-3 pt-2">
                <h3 className="text-[13px] font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-[#008d71] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  {product.oldPriceNum && (
                    <span className="text-gray-400 line-through text-[11px]">
                      {formatPrice(product.oldPriceNum)}
                    </span>
                  )}
                  {product.discount && (
                    <span className="text-[#ee0000] text-[11px] font-black">
                      -{product.discount}
                    </span>
                  )}
                </div>
                <div className="text-[#ee0000] font-black text-[18px] mb-2">
                  {formatPrice(product.priceNum)}
                </div>

                <div className="bg-[#e6f7f4] text-[#008d71] text-[10px] font-bold px-2 py-1.5 rounded-md mb-2 leading-snug">
                  Hoang Ha Member giam them toi
                  <br />
                  <span className="text-[12px] font-black">
                    {formatPrice(product.memberPrice || product.priceNum)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <span className="bg-[#f59e0b] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    Tich diem
                  </span>
                  <span className="text-[#f59e0b] text-[11px] font-black">
                    +{Number(product.points || 0).toLocaleString('vi-VN')} Diem
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setBuyModalProduct(product)}
                    className="flex-1 bg-[#008d71] text-white text-[12px] font-black text-center py-2.5 rounded-lg hover:bg-[#006e5c] hover:shadow-lg transition-all active:scale-95 uppercase"
                  >
                    MUA NGAY
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="flex items-center gap-1 text-gray-600 text-[11px] font-bold hover:text-[#008d71] transition-colors px-1"
                  >
                    <Eye size={14} /> Chi tiet
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#008d71] hover:scale-110 active:scale-90 transition-all duration-300 group"
        >
          <ChevronLeft size={24} className="text-gray-400 group-hover:text-[#008d71] transition-colors" />
        </button>

        <div className="flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
                current === index ? 'w-10 bg-[#008d71]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#008d71] hover:scale-110 active:scale-90 transition-all duration-300 group"
        >
          <ChevronRight size={24} className="text-gray-400 group-hover:text-[#008d71] transition-colors" />
        </button>
      </div>

      <BuyNowModal
        product={buyModalProduct}
        isOpen={!!buyModalProduct}
        onClose={() => setBuyModalProduct(null)}
      />
    </div>
  );
};

export default HotProducts;

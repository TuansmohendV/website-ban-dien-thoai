import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ExclusiveSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Update visible items based on window width
  React.useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 768) setVisibleCount(2);
      else if (window.innerWidth < 1024) setVisibleCount(3);
      else if (window.innerWidth < 1280) setVisibleCount(4);
      else setVisibleCount(5);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  React.useEffect(() => {
    let ignore = false;
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=10&isHot=true');
        const data = await response.json();
        if (!ignore) {
          // Map to match the expected structure if needed, or use normalizeProduct if imported
          // For now, we'll use the raw data and adapt the card
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching exclusive products:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchProducts();
    return () => { ignore = true; };
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (products.length === 0 && !loading) return null;

  return (
    <div className="w-full mx-auto max-w-[1300px] mb-12">
        <div className="w-full bg-[#f14624] pt-2 pb-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative group">
        
        {/* HEADER BANNER - Compact and Styled */}
        <div className="w-full mb-6 relative">
            <div className="w-full h-20 md:h-28 bg-[#ee3a1b] flex items-center justify-center relative">
                <h2 className="text-white text-lg md:text-2xl lg:text-3.5xl font-black uppercase italic tracking-tighter drop-shadow-lg z-10 flex items-center gap-4 text-center px-4 md:px-0">
                    ĐẶC QUYỀN CHỈ CÓ TẠI PhoneSin SHOP
                </h2>
                <div className="absolute right-0 top-0 bottom-0 opacity-40">
                    <img src="https://fptshop.com.vn/Content/desktop/images/lp-tet-2024/phone-header.png" alt="banner-phones" className="h-full object-contain translate-x-10" />
                </div>
            </div>
            <div className="absolute top-2 right-10 z-20">
                <img src="https://fptshop.com.vn/Content/desktop/images/icon-fpt-shop-exclusive.png" alt="exclusive" className="h-6 md:h-10 drop-shadow-md" />
            </div>
        </div>

        {/* SLIDER CONTAINER */}
        <div className="w-full mx-auto px-6 relative overflow-hidden">
            
            {/* Sliding Wrapper */}
            <div 
                className="flex transition-transform duration-700 ease-in-out -mx-1"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
                {products.map((product) => (
                    <div 
                        key={product._id || product.id} 
                        className="shrink-0 px-1.5 pb-2 transition-all duration-300"
                        style={{ width: `${100 / visibleCount}%` }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
                <button 
                   onClick={prevSlide}
                   className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                   ‹
                </button>
            )}
            
            {currentIndex < maxIndex && (
                <button 
                   onClick={nextSlide}
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                   ›
                </button>
            )}
            
        </div>
      </div>
    </div>
  );
};

export default ExclusiveSection;

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import BuyNowModal from './BuyNowModal';

const RecommendedProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const recommendations = [
    {
      id: 1,
      name: 'Samsung Galaxy S26 - 12GB/256GB',
      image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/01/08/s26-ultra-black.png',
      price: 20990000,
      oldPrice: 25990000,
      discount: '-19%'
    },
    {
      id: 2,
      name: 'Xiaomi Redmi Note 15 Pro 5G 12GB/256GB',
      image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/11/15/xiaomi-15-den.png',
      price: 10290000,
      oldPrice: 11290000,
      discount: '-9%'
    },
    {
      id: 3,
      name: 'Samsung Galaxy S25 FE 8GB/128GB',
      image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/27/s24-fe-blue.png',
      price: 12990000,
      oldPrice: 16890000,
      discount: '-22%'
    },
    {
      id: 4,
      name: 'Xiaomi 17 Ultra 16GB/512GB',
      image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/02/26/xiaomi-14-ultra-den-1.png',
      price: 36990000,
      oldPrice: 39990000,
      discount: '-8%'
    }
  ];

  // Multiple sets for smooth continuous scroll
  const displayItems = [...recommendations, ...recommendations, ...recommendations];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price).replace('₫', 'đ');
  };

  return (
    <div className="mt-8 mb-12 overflow-hidden px-4">
      <h2 className="text-[22px] font-bold text-gray-900 mb-8 px-2">
        Bạn đã tìm được điện thoại phù hợp chưa?
      </h2>

      <div className="relative group overflow-hidden">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-33.33% - 10.66px)); }
            }
            .animate-continuous {
              display: flex;
              width: max-content;
              animation: marquee 25s linear infinite;
            }
            .pause-container:hover .animate-continuous {
              animation-play-state: paused;
            }
          `}
        </style>
        
        <div className="pause-container">
          <div className="animate-continuous gap-4">
            {displayItems.map((item, index) => (
              <div 
                key={`${item.id}-${index}`} 
                className="w-[280px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-4 transition-all hover:shadow-md mx-2 h-[420px]"
              >
                <div className="h-[180px] flex items-center justify-center mb-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>

                <h3 className="text-[14px] font-bold text-gray-800 mb-4 h-[40px] line-clamp-2 leading-tight">
                  {item.name}
                </h3>

                <div className="relative flex items-stretch mb-4 h-[44px] rounded-lg overflow-hidden border border-red-50 mt-auto">
                  <div className="bg-[#d70018] flex-1 flex flex-col justify-center pl-3">
                    <div className="text-white text-[16px] font-black leading-none">
                      {formatPrice(item.price)}
                    </div>
                    {item.oldPrice && (
                      <div className="text-white/60 text-[10px] line-through decoration-white/40">
                        {formatPrice(item.oldPrice)}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-[#ffda00] flex items-center px-4 relative min-w-[60px] justify-center overflow-hidden">
                     <div className="absolute left-0 top-0 h-full w-4 bg-[#ffda00] -translate-x-[60%] skew-x-[-20deg] origin-top"></div>
                     <span className="text-[#d70018] font-bold text-[13px] relative z-10 italic">
                      {item.discount}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedProduct(item)}
                  className="w-full bg-[#008d71] text-white py-2.5 rounded-lg text-[13px] font-bold uppercase hover:bg-[#007b63] transition-colors"
                >
                  MUA NGAY
                </button>
              </div>
            ))}
          </div>
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

export default RecommendedProducts;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 11 Banners provided by user
  const slides = [
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/10/macbook-neo-web.png", 
      title: "Macbook Neo", 
      sub: "Mac tuyệt vời. Giá bất ngờ." 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/02/galaxy-a57-a37-5g-1200x375-0204.png", 
      title: "Galaxy A57 | A37 5G", 
      sub: "Hiệu năng đỉnh - Giá siêu hời" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/09/ipad-air-m4-web.png", 
      title: "iPad Air M4", 
      sub: "Nay siêu mạnh mẽ với M4" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/10/note-15-series-web.png", 
      title: "Xiaomi Redmi Note 15", 
      sub: "Bền Vô Đối - Hiệu năng cao" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/25/iphone-16e-viettel-web.png", 
      title: "iPhone 16e", 
      sub: "Đặc quyền Viettel - Giá cực tốt" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/11/mac-air-m5-web.png", 
      title: "MacBook Air M5", 
      sub: "Tuyệt tác thiết kế & sức mạnh" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/06/redmi-a7-pro-1200x375.jpg", 
      title: "Redmi A7 Pro", 
      sub: "Sự lựa chọn thông minh" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/30/banner-huawei-ultimate-2-1200x375-3003.png", 
      title: "Huawei Ultimate 2", 
      sub: "Đỉnh cao đồng hồ thông minh" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/03/23/wf-1000xm6-1200x375-2303.png", 
      title: "Sony WF-1000XM6", 
      sub: "Chống ồn đỉnh cao" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/06/wf-lc900-htl-1200x375-0604.png", 
      title: "Tai nghe Sony LC900", 
      sub: "Âm thanh chân thực" 
    },
    { 
      image: "https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/01/gt-runner-2-1200x375-0104.png", 
      title: "HUAWEI GT Runner 2", 
      sub: "Chạy bộ thông minh hơn" 
    }
  ];

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [isPaused, slides.length]);

  // Logic to get exactly 4 items for the bottom navigation (sliding window)
  const getNavItems = () => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push(slides[(current + i) % slides.length]);
    }
    return items;
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 py-6 select-none">
      <div 
        className="bg-white rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] group relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Main Banner Area */}
        <div className="relative aspect-[1200/375] overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] h-full"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <Link 
                key={idx} 
                to="/search" 
                className="w-full h-full shrink-0 relative"
              >
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={(e) => {e.preventDefault(); prevSlide();}} 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="text-[#008d71]" />
          </button>
          <button 
            onClick={(e) => {e.preventDefault(); nextSlide();}} 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
          >
            <ChevronRight size={24} strokeWidth={2.5} className="text-[#008d71]" />
          </button>
        </div>

        {/* Feature Navigation Bar (4 Tabs) */}
        <div className="hidden lg:flex border-t border-gray-100">
          {getNavItems().map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent((current + idx) % slides.length)}
              className={`flex-1 py-4 px-2 text-center transition-all duration-300 relative border-r last:border-r-0 border-gray-100 ${
                idx === 0 ? 'bg-white' : 'bg-gray-50/50 hover:bg-white'
              }`}
            >
              <h4 className={`text-[14px] font-bold transition-colors ${idx === 0 ? 'text-[#008d71]' : 'text-gray-700'}`}>
                {item.title}
              </h4>
              <p className={`text-[12px] mt-1 transition-colors ${idx === 0 ? 'text-[#008d71]/80' : 'text-gray-500'}`}>
                {item.sub}
              </p>
            </button>
          ))}
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="flex w-full h-1 bg-gray-100/50">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className="flex-1 h-full px-0.5"
            >
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  i === current ? 'bg-[#008d71]' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { name: 'Phần mềm', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/09/24/office-home-2024.png', link: '/category/software' },
  { name: 'Tai nghe', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/tai-nghe_638678026137334904.png', link: '/category/am-thanh' },
  { name: 'Quạt Mini', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/quat-mini.png', link: '/category/smart-home' },
  { name: 'Camera', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/camera-an-ninh-icon.png', link: '/category/smart-home' },
  { name: 'Apple', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/apple.png', link: '/category/iphone' },
  { name: 'Dán màn hình', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/dan-man-hinh-icon.png', link: '/category/phu-kien' },
  { name: 'Thẻ nhớ, USB', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/the-nho-usb.png', link: '/category/phu-kien' },
  { name: 'Sạc dự phòng', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/sac-du-phong.png', link: '/category/phu-kien' },
  { name: 'Loa', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/loa-icon.png', link: '/category/am-thanh' },
  { name: 'Củ sạc, Dây cáp', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/cu-cap-sac-icon.png', link: '/category/phu-kien' },
  { name: 'Thiết bị mạng', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/bo-phat-wifi.png', link: '/category/smart-home' },
  { name: 'Bao da - ốp lưng', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/bao-da-icon.png', link: '/category/phu-kien' },
  { name: 'Camera hành trình', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/camera-hanh-trinh-gopro.png', link: '/category/camera' },
  { name: 'Cân thông minh', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/can-icon.png', link: '/category/smart-home' },
  { name: 'Gimbal', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/gimbal.png', link: '/category/phu-kien' },
  { name: 'Chuột', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/chuot-icon.png', link: '/category/phu-kien' },
  { name: 'Bàn Phím', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/ban-phim-icon.png', link: '/category/phu-kien' },
  { name: 'Máy tăm nước', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/05/14/tam-nuoc.png', link: '/category/smart-home' },
  { name: 'Bàn chải điện', image: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/05/14/ban-chai.png', link: '/category/smart-home' },
];

const FeaturedCategories = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#fdfdfd] rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 relative group overflow-hidden">
      <h2 className="text-[17px] font-bold text-gray-800 mb-8 px-1">
        Danh mục phụ kiện
      </h2>

      {/* Manual Controls: Arrows */}
      <div className="absolute top-[55%] -translate-y-1/2 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('left')}
            className="w-11 h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-emerald-600"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
      </div>

      <div className="absolute top-[55%] -translate-y-1/2 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('right')}
            className="w-11 h-11 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-emerald-600"
          >
            <ChevronRight size={24} strokeWidth={3} />
          </button>
      </div>

      {/* Scrolling Container: 2 ROWS GRID (Smaller Items) */}
      <div 
        ref={scrollRef}
        className="grid grid-rows-2 grid-flow-col gap-x-3 gap-y-3 overflow-x-auto pb-6 scroll-smooth no-scrollbar snap-x snap-mandatory auto-cols-[125px] md:auto-cols-[155px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat, idx) => (
          <Link
            key={idx}
            to={cat.link}
            className="w-full snap-start flex flex-col items-center text-center p-3 bg-[#ffebd6] rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group/card"
          >
            <div className="w-full aspect-square mb-2 flex items-center justify-center transition-transform group-hover/card:scale-110 duration-500">
              <img 
                src={cat.image} 
                alt={cat.name}
                className="max-w-[65%] max-h-[65%] object-contain drop-shadow-sm"
              />
            </div>
            <span className="text-[11px] md:text-[12px] font-bold text-gray-800 leading-tight h-7 flex items-center justify-center">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Visual Dots Indicator (Static context for premium feel) */}
      <div className="flex justify-center gap-2 mt-6">
          <div className="h-1 bg-[#008d71] w-12 rounded-full"></div>
          <div className="h-1 bg-gray-100 w-12 rounded-full"></div>
      </div>
    </div>
  );
};

export default FeaturedCategories;

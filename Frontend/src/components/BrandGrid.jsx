import React from 'react';

const BrandGrid = () => {
  const brandUrls = [
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/apple1.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/samsung.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/xiaomi.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/huawei.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/garmin.png",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/oppo.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/asus.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/honor.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/techno.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/lenovo.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/lg.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2026/03/09/msi-logo-horiz-cmyk-blk-for-screen.png",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/dell.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/mophie.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/hp.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/vivo.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/realme.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/soundpeats.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/haman-kadon.png",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/tcl.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/viewsonic.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/9fit.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/sony.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/innostyle.gif",
    "https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/nubia.gif"
  ];

  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-6 relative">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center relative group">
        
        {/* Navigation Arrow (Left) */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 bg-white shadow-xl border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#008d71] transition-colors z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        {/* Brand Grid Container */}
        <div 
          ref={scrollRef}
          className="flex gap-3 flex-1 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brandUrls.map((src, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[120px] sm:w-[140px] flex items-center justify-center bg-white border border-gray-100 rounded-xl h-14 shadow-sm hover:shadow-md hover:border-[#008d71] transition-all cursor-pointer px-4 hover:-translate-y-1 snap-start"
            >
               <img src={src} className="max-h-[32px] w-auto object-contain mix-blend-multiply" alt={`Brand ${idx}`} loading="lazy" />
            </div>
          ))}
        </div>

        {/* Navigation Arrow (Right) */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 bg-white shadow-xl border border-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#008d71] transition-colors z-20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>

      </div>
    </div>
  );
};

export default BrandGrid;

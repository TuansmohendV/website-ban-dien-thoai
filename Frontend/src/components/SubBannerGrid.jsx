import React from 'react';
import { Link } from 'react-router-dom';

const SubBannerGrid = () => {
  return (
    <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 mb-12 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Banner: Gaming Accessories */}
        <Link 
          to="/category/gaming"
          className="relative h-[200px] md:h-[240px] rounded-[32px] overflow-hidden group shadow-xl hover:shadow-2xl transition-all"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#800000] via-[#c40000] to-[#000] z-0"></div>
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop" 
            alt="Gaming Accessories"
            className="absolute right-0 top-0 h-full w-[60%] object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Content Layer */}
          <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block w-fit">
              Gaming Gear
            </span>
            <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter leading-none mb-3">
              PHỤ KIỆN<br />GAMING
            </h3>
            <p className="text-sm font-bold opacity-90 max-w-[200px] leading-snug mb-4">
              Lên đủ Combo - Chiến game đủ hiệu năng
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-black px-4 py-1 rounded-lg font-black text-xs shadow-lg">
                Giảm đến 50%
              </span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-600 shadow-xl group-hover:translate-x-2 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Right Banner: Trade-in / Old to New */}
        <Link 
          to="/trade-in"
          className="relative h-[200px] md:h-[240px] rounded-[32px] overflow-hidden group shadow-xl hover:shadow-2xl transition-all"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#005aff] via-[#00a2ff] to-[#00346e] z-0"></div>
          <img 
            src="https://images.unsplash.com/photo-1556656793-062e17730d52?q=80&w=1200&auto=format&fit=crop" 
            alt="Trade-in Service"
            className="absolute right-0 bottom-0 h-full w-[60%] object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Content Layer */}
          <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                Trade-in VIP
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter leading-none mb-3 italic">
              MÁY CŨ ĐỔI LIỀN<br />BÙ TIỀN CỰC ÍT
            </h3>
            <p className="text-sm font-bold opacity-95 max-w-[220px] leading-snug mb-4">
              Thu cũ giá cao nhất - Giảm thêm đến 5 Triệu
            </p>
            <div className="flex items-center gap-3">
              <span className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-4 py-1 rounded-lg font-black text-xs shadow-lg">
                Đổi ngay hôm nay
              </span>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-xl group-hover:translate-x-2 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default SubBannerGrid;

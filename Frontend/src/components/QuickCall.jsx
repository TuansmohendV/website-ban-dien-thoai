import React from 'react';

const QuickCall = () => {
  return (
    <div className="fixed bottom-6 right-4 md:right-8 z-[90] flex flex-col gap-3 items-end animate-in fade-in slide-in-from-right-10 duration-500">
      
      {/* Hotline Button */}
      <a 
        href="tel:18006601" 
        className="group flex items-center gap-2 md:gap-3 bg-red-600 text-white px-3 md:px-5 py-2 md:py-3 rounded-full shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 border-2 border-white/20"
      >
        <div className="flex flex-col items-end">
           <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">Hotline 24/7</span>
           <span className="text-xs md:text-sm font-black tracking-tighter">1800 6601</span>
        </div>
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center relative group-hover:bg-white/30 transition-colors">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
      </a>

      {/* Social Links (Optional / Future-proof) */}
      <div className="flex flex-col gap-3 group-hover:opacity-100 transition-opacity">
          <a href="#" className="w-10 h-10 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
             <span className="font-black text-xs">Za</span>
          </a>
          <a href="#" className="w-10 h-10 bg-[#1877f2] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
      </div>
    </div>
  );
};

export default QuickCall;

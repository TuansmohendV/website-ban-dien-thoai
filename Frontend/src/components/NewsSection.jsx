import React from 'react';

const NewsSection = () => {
  const news = [
    {
      id: 1,
      title: 'Hành trình PhoneSin: Mang tinh hoa công nghệ đỉnh cao đến mọi nhà',
      desc: 'Từ những ngày đầu khởi nghiệp, PhoneSin đã luôn cam kết chỉ cung cấp những siêu phẩm công nghệ chính hãng, mang đến trải nghiệm số vượt trội cho hàng triệu khách hàng Việt.',
      image: '/news/store_hero.png',
      tag: 'CÂU CHUYỆN THƯƠNG HIỆU',
      featured: true
    },
    {
      id: 2,
      title: 'Đại tiệc iPhone 15 tại PhoneSin - Ưu đãi độc quyền giảm ngay 2 triệu đồng',
      date: '02/04/2026',
      image: '/news/promotion.png',
      tag: 'KHUYẾN MÃI'
    },
    {
      id: 3,
      title: 'Yên tâm mua sắm với gói Bảo hành VIP 2 năm duy nhất tại hệ thống PhoneSin',
      date: '01/04/2026',
      image: '/news/guarantee.png',
      tag: 'ĐẶC QUYỀN'
    },
    {
      id: 4,
      title: 'Top 3 xu hướng điện thoại gập năm 2024 bạn không thể bỏ lỡ tại PhoneSin',
      date: '31/03/2026',
      image: '/news/lifestyle.png',
      tag: 'TIN CÔNG NGHỆ'
    }
  ];

  return (
    <section className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-16 bg-white border-t border-gray-50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">BẢNG TIN PHONESIN</h2>
          <div className="h-1.5 w-16 md:w-24 bg-red-600 rounded-full"></div>
        </div>
        <button className="text-xs md:text-sm font-bold text-red-600 hover:underline flex items-center gap-1 uppercase tracking-widest bg-gray-50 md:bg-transparent px-4 py-2 md:p-0 rounded-full w-full sm:w-auto justify-center sm:justify-start">
          Xem tất cả bài viết 
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Featured News */}
        <div className="lg:col-span-7 group cursor-pointer">
          <div className="relative overflow-hidden rounded-3xl aspect-[16/10] shadow-2xl">
            <img 
              src={news[0].image} 
              alt={news[0].title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full max-h-[85%] flex flex-col justify-end">
              <span className="inline-block bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full mb-2 md:mb-4 tracking-widest uppercase shadow-lg w-fit">
                {news[0].tag}
              </span>
              <h3 className="text-lg md:text-3xl font-black text-white leading-tight mb-2 md:mb-4 group-hover:text-red-400 transition-colors">
                {news[0].title}
              </h3>
              <p className="text-gray-300 text-[10px] md:text-sm leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-none opacity-80 md:opacity-100">
                {news[0].desc}
              </p>
            </div>
          </div>
        </div>

        {/* Side News List */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {news.slice(1).map((item) => (
            <div key={item.id} className="flex gap-4 group cursor-pointer bg-gray-50/50 p-3 rounded-2xl border border-transparent hover:border-red-100 hover:bg-white hover:shadow-xl transition-all duration-300">
               <div className="w-32 h-32 shrink-0 rounded-xl overflow-hidden shadow-md">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
               </div>
               <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-red-600 mb-1 tracking-widest uppercase">{item.tag}</span>
                  <h4 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-red-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">{item.date}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Commitment Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-16">
         <div className="text-center space-y-3 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h5 className="text-lg font-black text-slate-800">100% Chính Hãng</h5>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">Bồi thường 200% nếu phát hiện hàng giả, hàng nhái tại PhoneSin.</p>
         </div>
         <div className="text-center space-y-3 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h5 className="text-lg font-black text-slate-800">Giao Hàng Siêu Tốc</h5>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">Nhận hàng trong vòng 2h tại khu vực nội thành. Miễn phí vận chuyển toàn quốc.</p>
         </div>
         <div className="text-center space-y-3 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
            </div>
            <h5 className="text-lg font-black text-slate-800">Hỗ Trợ 24/7</h5>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">Đội ngũ kỹ thuật viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn tại PhoneSin.</p>
         </div>
      </div>
    </section>
  );
};

export default NewsSection;

import React from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';

const PCEPowerPage = () => {
  const pcSpecs = [
    { title: 'PC E-Power Gaming S1', cpu: 'Core i5-13400F', ram: '16GB DDR5', gpu: 'RTX 4060', price: '18.990.000₫' },
    { title: 'PC E-Power Professional P2', cpu: 'Ryzen 7 7700X', ram: '32GB DDR5', gpu: 'RTX 4070 Ti', price: '34.500.000₫' },
    { title: 'PC E-Power Workstation X9', cpu: 'Intel i9-14900K', ram: '64GB DDR5', gpu: 'RTX 4090 24GB', price: '89.900.000₫' }
  ];

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <Breadcrumbs />

      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
        {/* Banner */}
        <div className="relative w-full h-[280px] md:h-[450px] rounded-[30px] md:rounded-[60px] overflow-hidden mb-8 md:mb-16 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="PC Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent flex items-center px-6 md:px-20">
            <div className="max-w-xl space-y-4 md:space-y-6">
              <span className="bg-blue-600 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-[0.2em] shadow-lg w-fit">PC E-POWER SERIES 2026</span>
              <h1 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight md:leading-none">THÁCH THỨC MỌI GIỚI HẠN</h1>
              <p className="text-sm md:text-lg text-slate-300 font-medium leading-relaxed line-clamp-2 md:line-clamp-none">
                Dòng máy tính lắp ráp độc quyền tại PhoneSin. Hiệu năng vượt trội, linh kiện chính hãng, bảo hành tận nơi.
              </p>
              <button className="bg-white text-slate-900 px-6 md:px-10 py-3 md:py-4 rounded-full text-xs md:text-sm font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95">
                Xem cấu hình chi tiết
              </button>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
          {[
            { title: 'LINH KIỆN MỚI 100%', desc: 'Tất cả linh kiện đều là hàng chính hãng từ Gigabyte, MSI, Asus...', icon: '💎' },
            { title: 'LẮP RÁP CHUYÊN NGHIỆP', desc: 'Được lắp ráp và test ổn định 24h bởi đội ngũ kỹ thuật viên giàu kinh nghiệm.', icon: '🛠️' },
            { title: 'HỖ TRỢ TẬN NƠI', desc: 'Giao hàng và lắp đặt miễn phí tại nhà, hỗ trợ phần mềm trọn đời.', icon: '🚚' }
          ].map((f, i) => (
            <div key={i} className="bg-slate-50 p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-100 transition-all hover:bg-white hover:shadow-xl group">
               <div className="text-3xl md:text-4xl mb-4 md:mb-6 group-hover:scale-125 transition-transform">{f.icon}</div>
               <h4 className="text-base md:text-lg font-black text-slate-800 mb-2 uppercase tracking-widest">{f.title}</h4>
               <p className="text-slate-500 font-medium text-[13px] md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Products Highlights */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">CÁC DÒNG MÁY BÁN CHẠY</h2>
            <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           {pcSpecs.map((pc, i) => (
             <div key={i} className="bg-white rounded-3xl md:rounded-[50px] p-6 md:p-10 shadow-lg border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:w-full group-hover:h-full group-hover:rounded-none transition-all duration-500"></div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-4 md:mb-6">{pc.title}</h3>
                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 w-full text-[13px] md:text-sm font-bold text-slate-600">
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span>CPU:</span> <span className="text-slate-900">{pc.cpu}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span>RAM:</span> <span className="text-slate-900">{pc.ram}</span></div>
                   <div className="flex justify-between border-b border-gray-100 pb-2"><span>VGA:</span> <span className="text-slate-900">{pc.gpu}</span></div>
                </div>
                <div className="text-xl md:text-2xl font-black text-blue-600 mb-6 md:mb-8">{pc.price}</div>
                <button className="w-full bg-slate-900 text-white py-3 md:py-4 rounded-2xl md:rounded-3xl text-sm font-black uppercase tracking-widest transition-all hover:bg-blue-600 shadow-xl active:scale-95">MUA NGAY</button>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default PCEPowerPage;

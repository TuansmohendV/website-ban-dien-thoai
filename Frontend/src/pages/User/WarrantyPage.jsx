import React from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';

const WarrantyPage = () => {
  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <Breadcrumbs />

      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4 uppercase">CHÍNH SÁCH BẢO HÀNH</h1>
          <div className="h-2 w-24 bg-green-600 mx-auto rounded-full mb-8"></div>
          <p className="text-xl text-slate-500 font-medium leading-relaxed italic">
            "Yên tâm trải nghiệm - Trọn đời hỗ trợ"
          </p>
        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
           <div className="bg-green-50 p-12 rounded-[60px] border border-green-100 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-bl-full flex items-center justify-center text-4xl">🏅</div>
              <h3 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tighter">BẢO HÀNH TRỌN ĐỜI</h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Khi mua các dòng sản phẩm iPhone mới nhất tại PhoneSin, quý khách sẽ được tặng gói **Bảo hành phần mềm trọn đời** và hỗ trợ kỹ thuật 24/7 hoàn toàn miễn phí.
              </p>
           </div>
           
           <div className="bg-blue-50 p-12 rounded-[60px] border border-blue-100 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-bl-full flex items-center justify-center text-4xl">🔄</div>
              <h3 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tighter">1 ĐỔI 1 TRONG 30 NGÀY</h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed">
                Đổi ngay máy mới 100% nếu sản phẩm phát sinh lỗi từ nhà sản xuất trong vòng 30 ngày đầu tiên kể từ ngày kích hoạt.
              </p>
           </div>
        </div>

        {/* Detailed Policy */}
        <div className="space-y-12 mb-32">
           <div className="border-l-8 border-slate-900 pl-10 space-y-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase">1. ĐIỀU KIỆN BẢO HÀNH</h2>
              <ul className="list-disc text-lg text-slate-600 font-medium space-y-2 pl-5">
                 <li>Sản phẩm còn trong thời hạn bảo hành theo tem và phiếu bảo hành.</li>
                 <li>Mã số IMEI trên sản phẩm phải trùng khớp với mã số trên phiếu bảo hành/hóa đơn điện tử.</li>
                 <li>Sản phẩm không có dấu hiệu va đập, rơi vỡ, vào nước hoặc can thiệp phần cứng trái phép.</li>
              </ul>
           </div>
           
           <div className="border-l-8 border-red-600 pl-10 space-y-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase">2. TỪ CHỐI BẢO HÀNH</h2>
              <ul className="list-disc text-lg text-slate-600 font-medium space-y-2 pl-5">
                 <li>Sản phẩm bị hỏng hóc do thiên tai, hỏa hoạn, sụt điện áp hoặc sử dụng không đúng cách.</li>
                 <li>Sản phẩm bị thay đổi, sửa chữa bởi trung tâm không thuộc hệ thống PhoneSin.</li>
                 <li>Sản phẩm không thể xác định được số IMEI gốc.</li>
              </ul>
           </div>
        </div>

        {/* FAQ Area */}
        <div className="bg-slate-900 rounded-[80px] p-20 text-white text-center">
           <h2 className="text-4xl font-black mb-10 tracking-widest uppercase">TRUNG TÂM BẢO HÀNH PHONESIN</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
              <div className="p-8 border border-white/10 rounded-3xl">
                 <h4 className="text-white text-xl font-bold mb-2">CSKH Miền Bắc:</h4>
                 <p className="text-slate-400 font-medium">99 Cầu Giấy, Hà Nội | Hotline: 1800 6601</p>
              </div>
              <div className="p-8 border border-white/10 rounded-3xl">
                 <h4 className="text-white text-xl font-bold mb-2">CSKH Miền Nam:</h4>
                 <p className="text-slate-400 font-medium">100 Cách Mạng Tháng 8, TP.HCM | Hotline: 1800 6602</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default WarrantyPage;

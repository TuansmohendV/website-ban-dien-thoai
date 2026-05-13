import React from 'react';
import { DollarSign, UserCheck, RefreshCcw, CreditCard, RotateCcw } from 'lucide-react';

const BrandTrustSection = () => {
  const items = [
    { icon: <DollarSign size={28} />, title: 'Tốt hơn về giá', desc: 'Ưu đãi mỗi ngày' },
    { icon: <UserCheck size={28} />, title: 'Thành viên - HSSV', desc: 'Giảm giá cực sâu' },
    { icon: <RefreshCcw size={28} />, title: 'Thu cũ đổi mới', desc: 'Trợ giá lên đời' },
    { icon: <CreditCard size={28} />, title: 'Thanh toán - Trả góp', desc: '0% Lãi suất' },
    { icon: <RotateCcw size={28} />, title: 'Trải máy lỗi', desc: '1 đổi 1 tận nơi' },
  ];

  return (
    <div className="w-full bg-white py-12 border-y border-gray-100">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">
        <h2 className="text-2xl font-black text-[#009981] text-center mb-10 uppercase tracking-tighter italic">
          Trải nghiệm mua sắm 5T tại PhoneSin
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
              <div className="w-16 h-16 bg-[#009981]/5 rounded-full flex items-center justify-center text-[#009981] mb-4 group-hover:bg-[#009981]/10 group-hover:scale-110 transition-all shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-1">{item.title}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandTrustSection;

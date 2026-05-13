import React from 'react';
import { DollarSign, User, RefreshCw, Wallet, PackageOpen } from 'lucide-react';

const benefits = [
  {
    icon: <DollarSign size={24} className="text-white" />,
    title: 'Tốt hơn về giá',
    desc: ''
  },
  {
    icon: <User size={24} className="text-white" />,
    title: 'Thành viên - HSSV',
    desc: 'Ưu đãi riêng tới 5%'
  },
  {
    icon: <PackageOpen size={24} className="text-white" />,
    title: 'Thu cũ đổi mới',
    desc: 'Thu cũ giá cao, trợ giá lên đời'
  },
  {
    icon: <Wallet size={24} className="text-white" />,
    title: 'Thanh toán - Trả góp',
    desc: 'Dễ dàng'
  },
  {
    icon: <RefreshCw size={24} className="text-white" />,
    title: 'Trả máy lỗi',
    desc: 'Đổi máy liền'
  }
];

const ServiceBenefits = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-8 p-6">
      <h2 className="text-[22px] font-bold text-[#008d71] text-center mb-10">
        Trải nghiệm mua sắm 5T tại PhoneSin
      </h2>
      
      <div className="flex flex-wrap lg:flex-nowrap justify-between gap-6 px-4">
        {benefits.map((b, i) => (
          <div key={i} className="flex flex-col items-center text-center group flex-1">
            <div className="w-14 h-14 bg-[#008d71] rounded-full flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-300">
              {b.icon}
            </div>
            <h3 className="text-[15px] font-black text-gray-900 mb-1">{b.title}</h3>
            {b.desc && <p className="text-[12px] text-gray-500 font-medium leading-tight">{b.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceBenefits;

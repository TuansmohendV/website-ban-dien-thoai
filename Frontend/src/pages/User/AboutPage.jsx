import React from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';

const AboutPage = () => {
  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <Breadcrumbs />
      
      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6 uppercase">VỀ PHONESIN</h1>
            <div className="h-2 w-24 bg-red-600 mx-auto rounded-full mb-8"></div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Nơi khởi nguồn đam mê công nghệ. Chúng tôi không chỉ cung cấp điện thoại, 
                chúng tôi mang đến những trải nghiệm số tuyệt vời nhất cho người Việt.
            </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-50 rounded-full -z-10 animate-pulse"></div>
                <div className="bg-gray-100 rounded-[50px] overflow-hidden shadow-2xl relative">
                    <img 
                      src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                      alt="Store Interior" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 text-white">
                        <span className="text-sm font-bold opacity-80">Thành lập từ 2012</span>
                        <h3 className="text-2xl font-black">Hành trình 14 năm rực rỡ</h3>
                    </div>
                </div>
            </div>
            <div className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Câu chuyện của chúng tôi</h2>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        Bắt đầu từ một cửa hàng nhỏ tại TP.HCM, PhoneSin đã vượt qua nhiều thử thách để trở thành một trong những chuỗi cửa hàng bán lẻ điện thoại hàng đầu. Với tôn chỉ "Khách hàng là người thân", chúng tôi luôn nỗ lực mang lại giá trị tốt nhất.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100">
                        <span className="text-4xl font-black text-red-600 block mb-2">50+</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-tight">Cửa hàng toàn quốc</span>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100">
                        <span className="text-4xl font-black text-red-600 block mb-2">1M+</span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-tight">Khách hàng tin dùng</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Values Section */}
        <div className="bg-slate-900 rounded-[60px] p-12 md:p-20 text-white mb-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px]"></div>
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black tracking-tight mb-4 uppercase">GIÁ TRỊ CỐT LÕI</h2>
                <div className="h-1 w-20 bg-red-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { title: 'TÍNH CHÍNH TRỰC', desc: 'Cam kết hàng chính hãng 100%, bảo hành uy tín tuyệt đối.', icon: '🛡️' },
                    { title: 'SỰ TẬN TÂM', desc: 'Luôn lắng nghe và phục vụ khách hàng bằng cả trái tim.', icon: '❤️' },
                    { title: 'SỰ ĐỔI MỚI', desc: 'Luôn cập nhật những xu hướng công nghệ mới nhất thế giới.', icon: '⚡' }
                ].map((val, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-10 rounded-[40px] hover:bg-white/10 transition-all text-center">
                        <div className="text-5xl mb-6">{val.icon}</div>
                        <h4 className="text-xl font-black mb-4 tracking-wider">{val.title}</h4>
                        <p className="text-slate-400 font-medium">{val.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Call to action */}
        <div className="text-center bg-gray-50 py-20 rounded-[60px] border border-gray-100 mb-20">
            <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tight">Hãy ghé thăm chúng tôi ngay</h2>
            <p className="text-slate-500 font-bold mb-10">Tìm kiếm cửa hàng gần nhất và trải nghiệm những siêu phẩm công nghệ.</p>
            <button className="bg-red-600 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all scale-110 active:scale-95">
                Tìm hệ thống cửa hàng
            </button>
        </div>

      </main>
    </div>
  );
};

export default AboutPage;

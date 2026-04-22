import React, { useState, useMemo } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';

const TradeInPage = () => {
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('');
  const [condition, setCondition] = useState('perfect');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const brands = ['Apple', 'Samsung', 'Oppo', 'Xiaomi', 'Google'];
  const models = {
    'Apple': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 14 Pro Max', 'iPhone 13 Pro Max', 'iPhone 12 Pro Max'],
    'Samsung': ['Galaxy S24 Ultra', 'Galaxy S23 Ultra', 'Galaxy Z Fold 5', 'Galaxy S22 Ultra'],
    'Google': ['Pixel 8 Pro', 'Pixel 7 Pro', 'Pixel 6 Pro'],
    'Xiaomi': ['Xiaomi 14 Ultra', 'Xiaomi 13 Ultra'],
    'Oppo': ['Find N3', 'Find X6 Pro']
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!selectedModel) return alert('Vui lòng chọn dòng máy!');
    
    setIsCalculating(true);
    setResult(null);

    // Giả lập tính toán
    setTimeout(() => {
      let baseValue = 15000000;
      if (selectedModel.includes('15')) baseValue = 22000000;
      if (selectedModel.includes('14')) baseValue = 18000000;
      if (selectedModel.includes('S24')) baseValue = 20000000;

      const conditionMultipliers = { perfect: 1, good: 0.8, scratched: 0.6, broken: 0.3 };
      const finalValue = baseValue * conditionMultipliers[condition];

      setResult({
        value: finalValue,
        model: selectedModel,
        bonus: 2000000 // Trợ giá thêm
      });
      setIsCalculating(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 font-sans">
      <Breadcrumbs />

      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-900 rounded-[60px] p-12 md:p-20 text-white mb-20 relative overflow-hidden shadow-2xl">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <span className="bg-red-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/20 shadow-lg">Chương trình thu cũ đổi mới 2026</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">ĐỔI SIÊU PHẨM - TRỢ GIÁ KHỦNG</h1>
                    <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                        Lên đời smartphone mới dễ dàng hơn bao giờ hết. Thu cũ mọi tình trạng, trợ giá lên đến 2.000.000đ tại PhoneSin.
                    </p>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-red-500">1</div>
                            <span className="text-sm font-bold uppercase tracking-widest">Định giá máy</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-red-500">2</div>
                            <span className="text-sm font-bold uppercase tracking-widest">Nhận trợ giá</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-red-500">3</div>
                            <span className="text-sm font-bold uppercase tracking-widest">Lên đời máy mới</span>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 animate-pulse"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Định giá */}
            <div className="lg:col-span-7">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-widest">Định giá máy của bạn</h2>
                    
                    <form onSubmit={handleCalculate} className="space-y-8">
                        {/* Chọn Thương hiệu */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Thương hiệu hiện tại</label>
                            <div className="flex flex-wrap gap-3">
                                {brands.map(b => (
                                    <button 
                                        key={b}
                                        type="button"
                                        onClick={() => { setSelectedBrand(b); setSelectedModel(''); }}
                                        className={`px-6 py-3 rounded-2xl font-bold transition-all border-2 ${selectedBrand === b ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-xl' : 'bg-slate-50 border-transparent text-slate-500 hover:border-gray-200'}`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chọn Model */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Dòng máy đang sử dụng</label>
                            <select 
                                required
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="" disabled>--- Chọn dòng máy ---</option>
                                {models[selectedBrand]?.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tình trạng máy */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 pl-1">Tình trạng thực tế</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { id: 'perfect', label: 'Loại 1: Máy đẹp, 99%', desc: 'Không trầy xước, hiển thị đẹp' },
                                    { id: 'good', label: 'Loại 2: Trầy xước nhẹ', desc: 'Có vết xước li ti, hiển thị tốt' },
                                    { id: 'scratched', label: 'Loại 3: Cấn móp nhẹ', desc: 'Có vết cấn rõ, hiển thị đẹp' },
                                    { id: 'broken', label: 'Loại 4: Lỗi hiển thị/Vỡ', desc: 'Màn hình lỗi, vỡ kính, ám ố' }
                                ].map(item => (
                                    <button 
                                        key={item.id}
                                        type="button"
                                        onClick={() => setCondition(item.id)}
                                        className={`p-5 rounded-3xl text-left transition-all border-2 flex flex-col gap-1 ${condition === item.id ? 'border-red-600 bg-red-50/50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                    >
                                        <span className="font-black text-slate-800 tracking-tight leading-none mb-1">{item.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400 leading-tight italic">{item.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isCalculating}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] transition-all shadow-2xl shadow-red-600/30 active:scale-[0.98] mt-4 flex items-center justify-center gap-4"
                        >
                            {isCalculating ? 'ĐANG ĐỊNH GIÁ...' : 'XEM GIÁ THU MUA DỰ KIẾN'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Kết quả */}
            <div className="lg:col-span-5 sticky top-10">
                {result ? (
                    <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-red-100 relative overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 rounded-full blur-2xl"></div>
                        <h3 className="text-sm font-black text-red-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                             KẾT QUẢ ĐỊNH GIÁ
                        </h3>
                        
                        <div className="space-y-6 mb-10">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Thiết bị thu đổi</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{result.model}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Giá thu mua dự kiến</p>
                                <p className="text-5xl font-black text-red-600 tracking-tighter">
                                   {result.value.toLocaleString('vi-VN')}₫
                                </p>
                            </div>

                            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
                                 <div>
                                     <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none mb-1">Trợ giá lên đời VIP</p>
                                     <p className="text-lg font-black text-slate-900 leading-none">+{result.bonus.toLocaleString('vi-VN')}₫</p>
                                 </div>
                                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-red-600 font-bold">★</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-[0.98]">
                                ĐẶT LỊCH THU ĐỔI TẠI CỬA HÀNG
                            </button>
                            <p className="text-center text-[10px] text-gray-400 italic font-medium px-4">
                                * Lưu ý: Giá trị chính xác sẽ được nhân viên thẩm định trực tiếp tại hệ thống cửa hàng PhoneSin.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100/50 rounded-[40px] p-12 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center h-[500px]">
                        <div className="w-20 h-20 bg-gray-200/50 rounded-full flex items-center justify-center mb-6 text-gray-400">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 11h2"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m20 12-2 0"/><path d="m6 12-2 0"/><path d="M4.6 4.6l1.4 1.4"/><path d="m18 18 1.4 1.4"/><path d="M19.4 4.6 18 6"/><path d="m6 18-1.4 1.4"/></svg>
                        </div>
                        <h4 className="text-lg font-black text-gray-400 uppercase tracking-widest leading-tight">Vui lòng điền form để nhận giá thu mua dự kiến</h4>
                    </div>
                )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default TradeInPage;

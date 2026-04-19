import React from 'react';

const BrandFilterGrid = () => {
  const brands = [
    { name: 'Apple', logo: '🍎' },
    { name: 'Samsung', logo: '📱' },
    { name: 'Xiaomi', logo: '🔋' },
    { name: 'Oppo', logo: '📸' },
    { name: 'Vivo', logo: '🎵' },
    { name: 'Realme', logo: '⚡' },
    { name: 'Asus', logo: '🎮' },
    { name: 'Nokia', logo: '☎️' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
      <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Hãng sản xuất</h3>
      <div className="grid grid-cols-2 gap-3">
        {brands.map((brand, idx) => (
          <button key={idx} className="h-10 border border-gray-100 rounded-xl flex items-center justify-center text-xs font-bold text-gray-500 hover:border-[#009981] hover:text-[#009981] hover:shadow-sm transition-all group">
            {brand.name}
          </button>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-50 pb-4">Mức giá</h3>
        <div className="space-y-3">
           {['Dưới 2 triệu', 'Từ 2 - 5 triệu', 'Từ 5 - 10 triệu', 'Trên 10 triệu'].map(price => (
               <div key={price} className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-gray-100 group-hover:border-[#009981] transition-colors" />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-[#009981] transition-colors">{price}</span>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default BrandFilterGrid;

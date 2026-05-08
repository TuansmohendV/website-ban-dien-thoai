import React, { useState } from 'react';
import ProductCard from './ProductCard';

const ExclusiveSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Update visible items based on window width
  React.useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 768) setVisibleCount(2);
      else if (window.innerWidth < 1024) setVisibleCount(3);
      else if (window.innerWidth < 1280) setVisibleCount(4);
      else setVisibleCount(5);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const exclusiveProducts = [
    {
      id: 1,
      name: 'Nubia A78 4GB 128GB (NFC)',
      price: '2.790.000đ',
      oldPrice: '3.490.000đ',
      discount: '-20%',
      image: 'https://cdn.tgdd.vn/Products/Images/42/322690/nubia-a78-trang-thumb-600x600.jpg',
      badge: 'ĐỘC QUYỀN',
      specs: { camera: '50MP', chip: 'T606', pin: '5000mAh' },
      colors: ['#efefef', '#999', '#000'],
      promo: 'Giảm 800.000đ khi thanh toán qua thẻ Visa SCB.'
    },
    {
        id: 2,
        name: 'Tecno Spark 40C 8GB 256GB',
        price: '3.190.000đ',
        oldPrice: '3.790.000đ',
        discount: '-16%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/313333/tecno-spark-20c-trang-thumb-600x600.jpg',
        badge: 'ĐỘC QUYỀN',
        specs: { camera: '50MP', chip: 'G36', pin: '5000mAh' },
        colors: ['#000', '#eee', '#ddd'],
        promo: 'Giảm 800.000đ khi thanh toán qua thẻ Visa SCB.'
      },
      {
        id: 3,
        name: 'Xiaomi Poco M7 Pro 5G 8GB 256GB',
        price: '5.990.000đ',
        oldPrice: '6.370.000đ',
        discount: '-6%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/xiaomi-redmi-note-13-den-thumb-600x600.jpg',
        badge: 'ĐỘC QUYỀN',
        specs: { camera: '108MP', chip: 'Dimensity 6080', pin: '5000mAh' },
        colors: ['#000', '#ccc', '#666', '#444'],
        promo: 'Chủ thẻ OCB: Giảm 500.000đ cho hóa đơn 10 triệu'
      },
      {
        id: 4,
        name: 'Honor X9d 5G 8GB 256GB',
        price: '9.490.000đ',
        oldPrice: '9.990.000đ',
        discount: '-5%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/320141/honor-x9b-5g-đen-thumb-600x600.jpg',
        badge: 'ĐỘC QUYỀN',
        badge2: '2 NĂM BẢO HÀNH',
        specs: { camera: '108MP', chip: 'SD 6 Gen 1', pin: '5800mAh' },
        colors: ['#000', '#f1c40f', '#ccc'],
        promo: 'Giảm 800.000đ khi thanh toán qua thẻ Visa SCB.'
      },
      {
        id: 5,
        name: 'OPPO Find N3 5G 16GB 512GB',
        price: '26.990.000đ',
        oldPrice: '44.190.000đ',
        discount: '-39%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/313333/oppo-find-n3-vang-thumb-600x600.jpg',
        badge: 'ĐỘC QUYỀN',
        specs: { camera: '48MP', chip: 'SD 8 Gen 2', pin: '4805mAh' },
        colors: ['#000', '#f1c40f'],
        promo: 'Giảm 1.000.000đ khi thanh toán qua thẻ Visa SCB.'
      },
      {
        id: 6,
        name: 'Samsung Galaxy Z Fold 5',
        price: '34.990.000đ',
        oldPrice: '40.000.000đ',
        discount: '-12%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/306274/samsung-galaxy-s24-ultra-xam-thumb-600x600.jpg',
        badge: 'NEW',
        specs: { camera: '50MP', chip: 'SD 8 Gen 2', pin: '4400mAh' },
        colors: ['#000', '#fff'],
        promo: 'Ưu dãi thu cũ 2.000.000đ'
      },
      {
        id: 7,
        name: 'iPhone 15 Pro Max 256GB',
        price: '29.490.000đ',
        oldPrice: '34.990.000đ',
        discount: '-16%',
        image: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-quang-tu-thumb-600x600.jpg',
        badge: 'HOT',
        specs: { camera: '48MP', chip: 'A17 Pro', pin: '4441mAh' },
        colors: ['#000', '#f1f1f1', '#666'],
        promo: 'Giảm 1.000.000đ qua thẻ VPBank'
      }
  ];

  const maxIndex = Math.max(0, exclusiveProducts.length - visibleCount);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="w-full mx-auto max-w-[1300px] mb-12">
        <div className="w-full bg-[#f14624] pt-2 pb-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 relative group">
        
        {/* HEADER BANNER - Compact and Styled */}
        <div className="w-full mb-6 relative">
            <div className="w-full h-20 md:h-28 bg-[#ee3a1b] flex items-center justify-center relative">
                <h2 className="text-white text-lg md:text-2xl lg:text-3.5xl font-black uppercase italic tracking-tighter drop-shadow-lg z-10 flex items-center gap-4 text-center px-4 md:px-0">
                    ĐẶC QUYỀN CHỈ CÓ TẠI PhoneSin SHOP
                </h2>
                <div className="absolute right-0 top-0 bottom-0 opacity-40">
                    <img src="https://fptshop.com.vn/Content/desktop/images/lp-tet-2024/phone-header.png" alt="banner-phones" className="h-full object-contain translate-x-10" />
                </div>
            </div>
            <div className="absolute top-2 right-10 z-20">
                <img src="https://fptshop.com.vn/Content/desktop/images/icon-fpt-shop-exclusive.png" alt="exclusive" className="h-6 md:h-10 drop-shadow-md" />
            </div>
        </div>

        {/* SLIDER CONTAINER */}
        <div className="w-full mx-auto px-6 relative overflow-hidden">
            
            {/* Sliding Wrapper */}
            <div 
                className="flex transition-transform duration-700 ease-in-out -mx-1"
                style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
            >
                {exclusiveProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="shrink-0 px-1.5 pb-2 transition-all duration-300"
                        style={{ width: `${100 / visibleCount}%` }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
                <button 
                   onClick={prevSlide}
                   className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                   ‹
                </button>
            )}
            
            {currentIndex < maxIndex && (
                <button 
                   onClick={nextSlide}
                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md z-30 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                   ›
                </button>
            )}
            
        </div>
      </div>
    </div>
  );
};

export default ExclusiveSection;

import React, { useState, useEffect } from 'react';

const promoImages = [
  { id: 1, src: '/media__1775239998115.png', alt: 'Poco M8 Pro Promo' },
  { id: 2, src: '/media__1775239971768.png', alt: 'Reno15 Series Promo' },
  { id: 3, src: '/media__1775239976025.png', alt: 'Galaxy A57 A37 Promo' },
  { id: 4, src: '/media__1775239993613.png', alt: 'Samsung Home Appliances Promo' },
];

const PromoCarousel = () => {
  const [current, setCurrent] = useState(0);
  const itemsToShow = 3;
  const maxIndex = Math.ceil(promoImages.length - itemsToShow);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <div className="w-full mb-12 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-red-600 rounded-full"></span>
            Ưu đãi từ đối tác
          </h2>
          <div className="flex gap-2">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm active:scale-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
          </div>
      </div>

      <div className="relative overflow-hidden w-full">
        <div 
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)] gap-4"
          style={{ transform: `translateX(-${current * (100 / itemsToShow)}%)` }}
        >
          {promoImages.map((img) => (
            <div 
              key={img.id}
              className="flex-none w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
            >
              <div className="relative h-[200px] overflow-hidden rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group/item cursor-pointer">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-all"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;

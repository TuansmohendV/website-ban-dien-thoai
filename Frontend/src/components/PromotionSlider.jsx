import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const promos = [
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/07/xiaomi.png', link: '/category/xiaomi' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/07/maycugiare-web.png', link: '/trade-in' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2025/10/27/hera-v9-4g.png', link: '/tag/hera-v9' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/09/xakho.png', link: '/tag/xa-kho' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/07/h-care.png', link: '/tag/h-care' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/07/apple.png', link: '/category/iphone' },
  { img: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2026/04/07/samsung.png', link: '/category/samsung' },
];

const PromotionSlider = () => {
    const scrollRef = useRef(null);

    // Auto scroll logic
    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollRef.current) {
                const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
                const maxScroll = scrollWidth - clientWidth;
                
                if (scrollLeft >= maxScroll - 10) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
                }
            }
        }, 5000); // Scroll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full relative group mb-12">
            
            {/* Arrows */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 text-[#008d71]"
            >
                <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <button 
                onClick={() => scroll('right')}
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white rounded-full shadow-xl border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 text-[#008d71]"
            >
                <ChevronRight size={28} strokeWidth={3} />
            </button>

            {/* Slider Container */}
            <div 
                ref={scrollRef}
                className="grid grid-flow-col auto-cols-[100%] md:auto-cols-[calc(33.333%-12px)] gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {promos.map((promo, idx) => (
                    <div key={idx} className="snap-start rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group/banner">
                        <a href={promo.link} className="block aspect-[3/1] relative">
                            <img 
                                src={promo.img} 
                                alt={`promo ${idx}`} 
                                className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/banner:bg-black/5 transition-colors"></div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotionSlider;

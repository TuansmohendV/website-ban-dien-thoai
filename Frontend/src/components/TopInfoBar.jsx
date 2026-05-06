import React, { useState, useEffect } from 'react';
import { CheckCircle, RefreshCcw, Phone, Truck, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

const TopInfoBar = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const slides = [
        {
            type: 'promo',
            bg: 'bg-[#ffedee]', // Light Pink/Salmon
            color: 'text-[#e52d2d]', // Vivid Red
            icon: <Smartphone size={18} />,
            text: 'Thu cũ giá cao toàn bộ sản phẩm',
            link: '/trade-in'
        },
        {
            type: 'benefits',
            bg: 'bg-[#cbf6e6]', // Mint Green
            color: 'text-[#008d71]', // Deep Green
            items: [
                { icon: <CheckCircle size={16} />, text: 'SẢN PHẨM CHÍNH HÃNG' },
                { icon: <RefreshCcw size={16} />, text: 'CAM KẾT LỖI ĐỔI LIỀN (*)' },
                { icon: <Phone size={16} />, text: 'HOTLINE 1900.2091' },
                { icon: <Truck size={16} />, text: 'MIỄN PHÍ VẬN CHUYỂN TOÀN QUỐC' },
            ]
        }
    ];

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div 
            className={`w-full ${slides[currentSlide].bg} sticky top-0 z-[100] shadow-sm transition-colors duration-500 ease-in-out`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
                <div className="flex items-center justify-between h-11 relative">
                    
                    {/* Left Navigation */}
                    <button 
                        onClick={prevSlide}
                        className={`z-10 p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all ${slides[currentSlide].color}`}
                    >
                        <ChevronLeft size={18} strokeWidth={2.5} />
                    </button>
                    
                    {/* Content Area */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full">
                        <div className="flex items-center animate-fadeIn justify-center w-full px-4 text-center">
                            {slides[currentSlide].type === 'promo' ? (
                                <div className={`flex items-center gap-2.5 cursor-pointer group`}>
                                    <span className={`${slides[currentSlide].color} group-hover:rotate-12 transition-transform duration-300`}>
                                        {slides[currentSlide].icon}
                                    </span>
                                    <span className={`text-[13px] md:text-[14px] font-bold ${slides[currentSlide].color} tracking-wide uppercase`}>
                                        {slides[currentSlide].text}
                                    </span>
                                </div>
                            ) : (
                                <div className="hidden lg:flex items-center gap-x-10">
                                    {slides[currentSlide].items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 whitespace-nowrap group cursor-pointer transition-all hover:opacity-80">
                                            <span className={`${slides[currentSlide].color}`}>{item.icon}</span>
                                            <span className={`text-[12.5px] font-bold ${slides[currentSlide].color} tracking-tight`}>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Mobile/Small Screen Benefit Content */}
                            {slides[currentSlide].type === 'benefits' && (
                                <div className="lg:hidden flex items-center gap-2">
                                    <span className={slides[currentSlide].color}>{slides[currentSlide].items[0].icon}</span>
                                    <span className={`text-[12.5px] font-bold ${slides[currentSlide].color} tracking-tight`}>
                                        {slides[currentSlide].items[0].text}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Navigation */}
                    <button 
                        onClick={nextSlide}
                        className={`z-10 p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all ${slides[currentSlide].color}`}
                    >
                        <ChevronRight size={18} strokeWidth={2.5} />
                    </button>
                    
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default TopInfoBar;


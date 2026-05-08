import React from 'react';
import { Link } from 'react-router-dom';

const QuickCategorySlider = () => {
    const items = [
        { name: 'Redmi Note 15', img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format&fit=crop', link: '/category/xiaomi' },
        { name: 'iPhone 16 Pro', img: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=200&auto=format&fit=crop', link: '/category/iphone' },
        { name: 'S24 Ultra', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=200&auto=format&fit=crop', link: '/category/samsung' },
        { name: 'Xiaomi 15 Ultra', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=200&auto=format&fit=crop', link: '/category/xiaomi' },
        { name: 'iPad Pro M4', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=200&auto=format&fit=crop', link: '/category/tablet' },
        { name: 'MacBook Air', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop', link: '/category/laptop' },
        { name: 'ROG Phone 8', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop', link: '/category/gaming' },
    ];

    return (
        <div className="w-full py-8 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max px-4 md:px-0">
                {items.map((item, idx) => (
                    <Link key={idx} to={item.link} className="flex flex-col items-center gap-2 group">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white border border-gray-100 shadow-sm p-2 flex items-center justify-center group-hover:border-[#009981] group-hover:shadow-md transition-all">
                            <img src={item.img} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </div>
                        <span className="text-[10px] md:text-sm font-black text-gray-700 uppercase tracking-tighter text-center group-hover:text-[#009981]">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickCategorySlider;

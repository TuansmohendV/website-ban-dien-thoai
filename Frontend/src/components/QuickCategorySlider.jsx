import React from 'react';
import { Link } from 'react-router-dom';

const QuickCategorySlider = () => {
    const [items, setItems] = React.useState([]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                const data = await response.json();
                // Map top 8 categories that are active
                const activeCats = (data.data || [])
                    .filter(cat => !data.inactiveSlugs?.includes(cat.slug))
                    .slice(0, 8)
                    .map(cat => ({
                        name: cat.name,
                        img: cat.icon || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=200&auto=format&fit=crop',
                        link: `/category/${cat.slug}`
                    }));
                setItems(activeCats);
            } catch (error) {
                console.error('Error fetching categories for slider:', error);
            }
        };
        fetchCategories();
    }, []);

    if (items.length === 0) return null;

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

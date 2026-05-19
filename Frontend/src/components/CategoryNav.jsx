import React from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';

const CategoryNav = () => {
  const { id: activeSlug } = useParams();
  const [categories, setCategories] = React.useState([
    { name: 'Tất cả', slug: 'all', logo: 'https://cdn.hoanghamobile.vn/i/cat/Uploads/2023/11/24/all-products.png' }
  ]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        const dbCategories = response.data?.data || [];
        setCategories([
          { name: 'Tất cả', slug: 'all', logo: 'https://cdn.hoanghamobile.vn/i/cat/Uploads/2023/11/24/all-products.png' },
          ...dbCategories.map(cat => ({
            name: cat.name,
            slug: cat.slug,
            logo: cat.icon || 'https://cdn.hoanghamobile.vn/i/cat/Uploads/2023/06/13/ip.png'
          }))
        ]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full bg-white py-4 border-b border-gray-100 shadow-sm sticky top-[64px] z-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          {categories.map((cat, idx) => {
             const isActive = activeSlug === cat.slug || (!activeSlug && cat.slug === 'all');
             return (
                <Link
                  key={idx}
                  to={cat.slug === 'all' ? '/category' : `/category/${cat.slug}`}
                  className={`group flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-2xl text-[13px] font-bold transition-all duration-500 border ${
                    isActive
                      ? 'bg-[#00917a] text-white border-[#00917a] shadow-lg shadow-[#00917a]/30 -translate-y-0.5'
                      : 'bg-white text-gray-700 border-gray-100 hover:border-[#00917a]/50 hover:bg-[#00917a]/5 hover:text-[#00917a]'
                  }`}
                >
                    <div className={`w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'shadow-inner' : 'border border-gray-50'}`}>
                        <img src={cat.logo} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                    <span>{cat.name}</span>
                </Link>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryNav;

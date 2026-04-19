import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronsUpDown, Search, Filter } from 'lucide-react';
import { allProducts } from '../../data/allProducts';
import ProductCard from '../../components/ProductCard';
import FilterSidebar from '../../components/FilterSidebar';
import Pagination from '../../components/Pagination';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  // Filter & Sorting State
  const [filters, setFilters] = useState({
    brand: null,
    priceRange: 'Tất cả',
    sortBy: 'relate'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Logic
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    let result = allProducts.filter(p => {
      const lowerQuery = query.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(lowerQuery) || p.brand.toLowerCase().includes(lowerQuery);
      if (!matchesSearch) return false;

      // Sidebar Filters
      if (filters.brand && p.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;

      // Price Range Filter
      if (filters.priceRange && filters.priceRange !== 'Tất cả') {
        const price = p.priceNum;
        if (filters.priceRange === 'Dưới 5 triệu' && price >= 5000000) return false;
        if (filters.priceRange === 'Dưới 7 triệu' && price >= 7000000) return false;
        if (filters.priceRange === '1 đến 2 triệu' && (price < 1000000 || price > 2000000)) return false;
        if (filters.priceRange === '1 đến 3 triệu' && (price < 1000000 || price > 3000000)) return false;
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === 'priceAsc') result.sort((a, b) => a.priceNum - b.priceNum);
    else if (filters.sortBy === 'priceDesc') result.sort((a, b) => b.priceNum - a.priceNum);
    else if (filters.sortBy === 'newest') result.sort((a, b) => b.id.localeCompare(a.id));

    return result;
  }, [query, filters]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentProducts = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
  };

  const setSingleFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-[#f0f2f5] min-h-screen pb-20 font-sans">
      
      {/* Search Header / Breadcrumbs Section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 lg:px-20 pt-10">
        <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="px-4 py-1.5 bg-white border border-gray-100 rounded-full shadow-sm text-[13px] font-bold text-gray-600 hover:text-[#008d71] transition-colors">
                Trang chủ
            </Link>
            <span className="text-gray-400">›</span>
            <div className="px-5 py-1.5 bg-[#008d71] text-white rounded-full shadow-lg shadow-[#008d71]/20 text-[13px] font-black uppercase">
                Tìm kiếm
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR: FILTERS */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-[130px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 divide-y divide-gray-100">
                
                {/* Brand Logos Section */}
                <div>
                    <div className="p-5 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[14px] font-black text-gray-800 uppercase italic">Thương hiệu</h3>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2">
                        {[
                            { name: 'Apple', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-apple.png' },
                            { name: 'Samsung', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-samsung.png' },
                            { name: 'Xiaomi', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-xiaomi.png' },
                            { name: 'OPPO', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-oppo.png' },
                            { name: 'Vivo', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-vivo.png' },
                            { name: 'Realme', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-realme.png' },
                            { name: 'Nokia', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-nokia.png' },
                            { name: 'Asus', logo: 'https://hoanghamobile.com/Content/web/img/brand-logo-asus.png' }
                        ].map((b) => (
                            <button 
                                key={b.name}
                                onClick={() => setSingleFilter('brand', b.name)}
                                className={`h-11 border-2 rounded-xl flex items-center justify-center p-2 transition-all group ${filters.brand === b.name ? 'border-[#008d71] bg-[#f0fcf9]' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                            >
                                <span className={`text-[12px] font-bold ${filters.brand === b.name ? 'text-[#008d71]' : 'text-gray-400 group-hover:text-gray-600'}`}>{b.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Section */}
                <div>
                    <div className="p-5 bg-gray-50/50 flex items-center justify-between">
                        <h3 className="text-[14px] font-black text-gray-800 uppercase italic">Mức giá</h3>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="space-y-4">
                            <input type="range" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008d71]" />
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-[12px] font-bold text-gray-400">0</span>
                                <span className="text-[12px] font-black text-[#008d71]">100,000,000đ</span>
                            </div>
                        </div>
                        <button className="w-full bg-[#008d71] text-white py-2.5 rounded-xl text-[13px] font-bold uppercase shadow-lg shadow-[#008d71]/20 active:scale-95 transition-all">Áp dụng</button>
                        <div className="grid grid-cols-1 gap-2 mt-4 pt-2">
                            {['Dưới 5 triệu', 'Dưới 7 triệu', '1 đến 2 triệu', '1 đến 3 triệu'].map(r => (
                                <button 
                                    key={r}
                                    onClick={() => setSingleFilter('priceRange', r)}
                                    className={`py-2 px-4 rounded-lg text-[12px] font-bold transition-all text-left border ${filters.priceRange === r ? 'bg-[#008d71] text-white border-[#008d71]' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
          </aside>

          {/* MAIN COLUMN: SORT & RESULTS */}
          <div className="flex-1 w-full min-w-0">
            
            {/* Sort Bar */}
            <div className="bg-white rounded-2xl p-2.5 flex flex-wrap items-center gap-2 mb-8 shadow-sm border border-gray-100">
                <span className="text-[13px] text-gray-500 font-bold ml-4 mr-2">Sắp xếp theo:</span>
                <div className="flex gap-2 flex-1 items-center">
                    {[
                        { id: 'relate', label: 'Liên quan' },
                        { id: 'newest', label: 'Mới nhất' },
                        { id: 'bestseller', label: 'Bán chạy' },
                        { id: 'price', label: 'Giá tiền', icon: <ChevronsUpDown size={14} className="ml-2" /> }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSingleFilter('sortBy', opt.id)}
                            className={`px-8 h-10 bg-white border rounded-xl text-[13px] font-bold flex items-center justify-center transition-all shadow-sm ${filters.sortBy === opt.id ? 'text-[#008d71] border-[#008d71] bg-[#f0fcf9]' : 'text-gray-700 border-gray-100 hover:border-gray-200'}`}
                        >
                            {opt.label}
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>

            <h2 className="text-[28px] font-black text-gray-900 mb-8 uppercase tracking-tighter italic">Tìm kiếm</h2>

            {filteredResults.length > 0 ? (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                )}
                </>
            ) : (
                <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Search size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-[20px] font-black text-gray-400 uppercase tracking-widest mb-2">Không tìm thấy sản phẩm nào</h3>
                    <p className="text-gray-400 text-[14px] font-medium max-w-sm">Rất tiếc, chúng tôi không tìm thấy kết quả phù hợp cho "{query}". Vui lòng thử lại với từ khóa khác.</p>
                </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchPage;

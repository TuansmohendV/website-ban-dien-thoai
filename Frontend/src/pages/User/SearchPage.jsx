import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronsUpDown, Search, Filter } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import FilterSidebar from '../../components/FilterSidebar';
import Pagination from '../../components/Pagination';
import api from '../../lib/api';
import { normalizeProduct } from '../../lib/products';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);

  // Filter & Sorting State
  const [filters, setFilters] = useState({
    category: null,
    brand: null,
    priceRange: 'Tất cả',
    sortBy: 'relate'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }

      try {
        const response = await api.get('/api/products', {
          params: { search: query.trim(), limit: 50 },
        });

        if (!ignore) {
          setProducts((response.data?.data || []).map(normalizeProduct));
        }
      } catch (error) {
        if (!ignore) {
          setProducts([]);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, query]);

  // Filter Logic
  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    let result = products.filter(p => {
      const lowerQuery = query.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(lowerQuery) ||
        p.brand.toLowerCase().includes(lowerQuery);
      if (!matchesSearch) return false;

      // Sidebar Filters
      if (filters.brand && (p.brandKey || p.brand.toLowerCase()) !== filters.brand.toLowerCase()) return false;

      // Category Filter
      if (filters.category) {
        const pCat = String(p.category || '').toLowerCase();
        const targetCat = String(filters.category).toLowerCase();
        // Handle variations (e.g., 'Điện thoại' vs 'dien-thoai')
        const catMap = {
          'điện thoại': ['dien-thoai', 'điện thoại'],
          'laptop': ['laptop'],
          'tablet': ['tablet', 'máy tính bảng'],
          'đồng hồ': ['dong-ho', 'đồng hồ'],
          'âm thanh': ['am-thanh', 'âm thanh'],
          'smart home': ['smart-home', 'smart home'],
          'phụ kiện': ['phụ kiện', 'phu-kien']
        };
        const validCats = catMap[targetCat] || [targetCat];
        if (!validCats.includes(pCat)) return false;
      }

      // Price Range Filter
      if (filters.priceRange && filters.priceRange !== 'Tất cả') {
        const price = p.priceNum || 0;
        const range = filters.priceRange;

        if (range.includes('Dưới')) {
          const limit = parseInt(range.replace(/[^\d]/g, '') || '0') * (range.includes('triệu') ? 1000000 : 1000);
          if (price >= limit) return false;
        } else if (range.includes('Trên')) {
          const limit = parseInt(range.replace(/[^\d]/g, '') || '0') * (range.includes('triệu') ? 1000000 : 1000);
          if (price < limit) return false;
        } else if (range.includes('đến')) {
          const parts = range.split('đến');
          const min = parseInt(parts[0].replace(/[^\d]/g, '') || '0') * (parts[0].includes('triệu') ? 1000000 : 1000);
          const max = parseInt(parts[1].replace(/[^\d]/g, '') || '0') * (parts[1].includes('triệu') ? 1000000 : 1000);
          if (price < min || price > max) return false;
        } else if (range.includes('Từ')) {
            // Handle 'Từ 200-500k' format
            const parts = range.replace('Từ ', '').replace(/k/g, '000').split('-');
            const min = parseInt(parts[0]) || 0;
            const max = parseInt(parts[1]) || Infinity;
            if (price < min || price > max) return false;
        }
      }

      return true;
    });

    // Sorting
    if (filters.sortBy === 'priceAsc' || filters.sortBy === 'price') {
      result.sort((a, b) => a.priceNum - b.priceNum);
    } else if (filters.sortBy === 'priceDesc') {
      result.sort((a, b) => b.priceNum - a.priceNum);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => String(b.createdAt || b.id).localeCompare(String(a.createdAt || a.id)));
    } else if (filters.sortBy === 'bestseller') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [query, filters, products]);

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
            <FilterSidebar 
              category="search"
              filters={filters}
              setFilters={setFilters}
              onToggleFilter={toggleFilter}
              onSetSingleFilter={setSingleFilter}
            />
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

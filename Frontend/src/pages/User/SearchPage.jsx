import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import { brandService, productService } from '../../services/shopApi';

const PRICE_OPTIONS = [
  { id: '', label: 'Tat ca' },
  { id: '0-10000000', label: 'Duoi 10 trieu' },
  { id: '10000000-20000000', label: '10 - 20 trieu' },
  { id: '20000000-30000000', label: '20 - 30 trieu' },
  { id: '30000000-', label: 'Tren 30 trieu' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Moi nhat' },
  { id: 'popular', label: 'Pho bien' },
  { id: 'priceAsc', label: 'Gia tang dan' },
  { id: 'priceDesc', label: 'Gia giam dan' },
  { id: 'rating', label: 'Danh gia cao' },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const keyword = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const price = searchParams.get('price') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  const priceRange = useMemo(() => {
    if (!price) {
      return {};
    }

    const [min, max] = price.split('-');

    return {
      minPrice: min || undefined,
      maxPrice: max || undefined,
    };
  }, [price]);

  useEffect(() => {
    let mounted = true;

    const loadBrands = async () => {
      try {
        const nextBrands = await brandService.getBrands();

        if (mounted) {
          setBrands(nextBrands);
        }
      } catch {
        if (mounted) {
          setBrands([]);
        }
      }
    };

    loadBrands();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await productService.getProducts({
          keyword,
          brand,
          sort,
          page,
          limit: 12,
          ...priceRange,
        });

        if (!mounted) {
          return;
        }

        setProducts(response.products);
        setPagination(response.pagination);
      } catch {
        if (mounted) {
          setProducts([]);
          setPagination({ page: 1, totalPages: 1, total: 0 });
          setError('Khong the tai ket qua tim kiem.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [brand, keyword, page, priceRange, sort]);

  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });

    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) {
      nextParams.set('page', '1');
    }

    setSearchParams(nextParams);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-8 px-4 pt-10">
        <div className="rounded-[32px] bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Tim kiem tu backend
              </p>
              <h1 className="mt-3 text-[32px] font-black uppercase tracking-tight text-gray-900">
                {keyword ? `Ket qua cho "${keyword}"` : 'Tat ca san pham'}
              </h1>
              <p className="mt-2 text-[14px] text-gray-500">
                {pagination.total} san pham dang duoc tra ve tu backend.
              </p>
            </div>
            <Link
              to="/"
              className="w-fit rounded-full border border-gray-200 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-gray-600"
            >
              Ve trang chu
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 rounded-[28px] bg-white p-5 shadow-sm">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Thuong hieu
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParams({ brand: '' })}
                  className={`rounded-full px-3 py-2 text-[12px] font-black uppercase tracking-wide ${
                    !brand
                      ? 'bg-[#008d71] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Tat ca
                </button>
                {brands.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateParams({ brand: item.displayName })}
                    className={`rounded-full px-3 py-2 text-[12px] font-black uppercase tracking-wide ${
                      brand === item.displayName
                        ? 'bg-[#008d71] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Muc gia
              </p>
              <div className="mt-4 grid gap-2">
                {PRICE_OPTIONS.map((item) => (
                  <button
                    key={item.id || 'all'}
                    type="button"
                    onClick={() => updateParams({ price: item.id })}
                    className={`rounded-2xl px-4 py-3 text-left text-[13px] font-bold ${
                      price === item.id
                        ? 'bg-[#e5f9e0] text-[#008d71]'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#004f44] p-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-200">
                Goi y
              </p>
              <p className="mt-3 text-[14px] leading-6 text-white/75">
                Thu nghiem ket hop tu khoa, thuong hieu va gia de kiem tra luong
                tim kiem va loc du lieu backend.
              </p>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-[28px] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="text-[13px] font-semibold text-gray-500">
                Trang {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateParams({ sort: item.id })}
                    className={`rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-wide ${
                      sort === item.id
                        ? 'bg-[#008d71] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[320px] animate-pulse rounded-[28px] bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="flex justify-center pt-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(nextPage) => updateParams({ page: nextPage })}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                  <Search size={34} className="text-gray-300" />
                </div>
                <h3 className="mt-6 text-[20px] font-black uppercase tracking-wide text-gray-700">
                  Khong tim thay san pham
                </h3>
                <p className="mt-2 text-[14px] text-gray-500">
                  Thu doi tu khoa hoac xoa bot dieu kien loc de xem them ket qua.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

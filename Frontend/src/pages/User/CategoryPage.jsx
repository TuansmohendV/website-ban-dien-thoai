import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import Pagination from '../../components/Pagination';
import { brandService, productService } from '../../services/shopApi';

const CATEGORY_PRESETS = {
  'dien-thoai': {
    title: 'Dien thoai',
    description: 'Danh muc dien thoai dang duoc dong bo truc tiep tu backend.',
    params: {},
  },
  iphone: {
    title: 'Apple / iPhone',
    description: 'Loc thuong hieu Apple tu backend.',
    params: { brand: 'Apple' },
  },
  samsung: {
    title: 'Samsung',
    description: 'Danh sach Samsung dang co hang.',
    params: { brand: 'Samsung' },
  },
  xiaomi: {
    title: 'Xiaomi',
    description: 'Danh sach Xiaomi dang co hang.',
    params: { brand: 'Xiaomi' },
  },
  oppo: {
    title: 'OPPO',
    description: 'Danh sach OPPO dang co hang.',
    params: { brand: 'OPPO' },
  },
  vivo: {
    title: 'vivo',
    description: 'Danh sach vivo dang co hang.',
    params: { brand: 'vivo' },
  },
  realme: {
    title: 'realme',
    description: 'Danh sach realme dang co hang.',
    params: { brand: 'realme' },
  },
  nokia: {
    title: 'Nokia',
    description: 'Danh sach Nokia dang co hang.',
    params: { brand: 'Nokia' },
  },
  asus: {
    title: 'ASUS',
    description: 'Danh sach ASUS dang co hang.',
    params: { brand: 'ASUS' },
  },
  google: {
    title: 'Google',
    description: 'Danh sach Google dang co hang.',
    params: { brand: 'Google' },
  },
};

const SORT_OPTIONS = [
  { id: 'newest', label: 'Moi nhat' },
  { id: 'popular', label: 'Pho bien' },
  { id: 'priceAsc', label: 'Gia tang dan' },
  { id: 'priceDesc', label: 'Gia giam dan' },
];

const CategoryPage = () => {
  const { id: slug = 'dien-thoai' } = useParams();
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

  const preset = useMemo(
    () =>
      CATEGORY_PRESETS[slug] || {
        title: slug.replace(/-/g, ' '),
        description: 'Trang danh muc nay dang duoc truy van theo tu khoa tu backend.',
        params: { keyword: slug.replace(/-/g, ' ') },
      },
    [slug]
  );

  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

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

    const loadCategoryProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await productService.getProducts({
          ...preset.params,
          sort,
          page,
          limit: 12,
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
          setError('Khong the tai du lieu danh muc.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategoryProducts();

    return () => {
      mounted = false;
    };
  }, [page, preset.params, sort]);

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
        <div className="rounded-[34px] bg-gradient-to-br from-[#004f44] to-[#0f766e] px-6 py-10 text-white shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-100">
            Danh muc dong bo
          </p>
          <h1 className="mt-4 text-[36px] font-black uppercase tracking-tight">
            {preset.title}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-white/80">
            {preset.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {brands.slice(0, 8).map((brand) => (
              <Link
                key={brand.id}
                to={`/category/${brand.slug}`}
                className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-white"
              >
                {brand.displayName}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] bg-white p-5 shadow-sm">
          <div className="text-[14px] font-semibold text-gray-500">
            {pagination.total} san pham
          </div>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateParams({ sort: item.id })}
                className={`rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-wide ${
                  sort === item.id ? 'bg-[#008d71] text-white' : 'bg-gray-100 text-gray-600'
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[320px] animate-pulse rounded-[28px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <h3 className="text-[20px] font-black uppercase tracking-wide text-gray-700">
              Chua co san pham phu hop
            </h3>
            <p className="mt-2 text-[14px] text-gray-500">
              Backend hien chua co du lieu cho danh muc nay hoac du lieu dang duoc
              cap nhat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

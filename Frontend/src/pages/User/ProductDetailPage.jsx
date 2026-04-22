import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { getApiMessage } from '../../lib/api';
import { productService } from '../../services/shopApi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useLanguage();
  const { addToCart, busy } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      setRelatedProducts([]);

      try {
        const response = await productService.getProductById(id);

        if (!mounted) {
          return;
        }

        const nextProduct = response.product;

        setProduct(nextProduct);
        setRecentReviews(response.recentReviews || []);
        setSelectedVariantId(nextProduct.variants?.[0]?.id || '');

        if (!nextProduct.brand) {
          return;
        }

        try {
          const related = await productService.getProducts({
            brand: nextProduct.brand,
            limit: 4,
            sort: 'popular',
          });

          if (!mounted) {
            return;
          }

          setRelatedProducts(
            related.products
              .filter((item) => item.id !== nextProduct.id)
              .slice(0, 4)
          );
        } catch {
          if (mounted) {
            setRelatedProducts([]);
          }
        }
      } catch (apiError) {
        if (mounted) {
          setProduct(null);
          setRecentReviews([]);
          setSelectedVariantId('');
          setError(getApiMessage(apiError, 'Khong the tai chi tiet san pham.'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((variant) => variant.id === selectedVariantId) || null,
    [product, selectedVariantId]
  );

  const selectedImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product?.images || [];

  const currentPrice = selectedVariant?.price || product?.priceNum || 0;
  const currentStock = selectedVariant?.stock || product?.totalStock || 0;

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!product) {
      return;
    }

    const colorPayload = selectedVariant?.color
      ? {
          name: selectedVariant.color,
          image: selectedVariant.image || product.image,
        }
      : null;

    try {
      for (let index = 0; index < quantity; index += 1) {
        await addToCart(product, selectedVariant, colorPayload, 1);
      }

      setMessage('Da them san pham vao gio hang.');

      if (redirectToCheckout) {
        navigate('/checkout');
      }
    } catch {
      setMessage('Khong the them san pham vao gio hang.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-10">
        <div className="mx-auto max-w-[1450px] animate-pulse rounded-[36px] bg-white p-10 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="h-[420px] rounded-[28px] bg-gray-100" />
            <div className="space-y-4">
              <div className="h-8 rounded-full bg-gray-100" />
              <div className="h-6 rounded-full bg-gray-100" />
              <div className="h-40 rounded-[28px] bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[900px] rounded-[32px] bg-white p-16 text-center shadow-sm">
          <h2 className="text-[24px] font-black uppercase tracking-wide text-gray-800">
            Khong tim thay san pham
          </h2>
          <p className="mt-3 text-[14px] text-gray-500">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            Ve trang chu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-8 px-4 pt-10">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-500">
          <Link to="/" className="hover:text-[#008d71]">
            Trang chu
          </Link>
          <span>/</span>
          <Link to={`/category/${String(product.brand || '').toLowerCase()}`} className="hover:text-[#008d71]">
            {product.brand}
          </Link>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="rounded-[34px] bg-white p-6 shadow-sm">
            <div className="flex min-h-[420px] items-center justify-center rounded-[28px] bg-gray-50 p-6">
              <img
                src={selectedVariant?.image || product.image}
                alt={product.name}
                className="max-h-[360px] max-w-full object-contain"
              />
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-6">
                {selectedImages.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="flex h-20 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-2"
                  >
                    <img src={image} alt={product.name} className="max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[34px] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                    {product.brand}
                  </p>
                  <h1 className="mt-3 text-[32px] font-black uppercase leading-tight text-gray-900">
                    {product.name}
                  </h1>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-gray-200 p-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  <Heart size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star size={18} fill="currentColor" />
                  <span className="font-black text-gray-800">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-[13px] font-semibold text-gray-500">
                  {product.numReviews} danh gia
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-black uppercase tracking-wide text-emerald-700">
                  {currentStock > 0 ? `Con ${currentStock} san pham` : 'Tam het hang'}
                </span>
              </div>

              <div className="mt-6 rounded-[28px] bg-gray-50 p-5">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Gia ban
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-[34px] font-black text-red-500">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.oldPriceNum > currentPrice && (
                    <span className="text-[16px] font-semibold text-gray-400 line-through">
                      {formatPrice(product.oldPriceNum)}
                    </span>
                  )}
                </div>
              </div>

              {product.variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                    Phien ban / bo nho
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-[22px] border px-4 py-4 text-left ${
                          selectedVariantId === variant.id
                            ? 'border-[#008d71] bg-[#e5f9e0]'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="text-[14px] font-black text-gray-900">
                          {variant.storage || 'Phien ban mac dinh'}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold text-gray-500">
                          {variant.color || 'Mau mac dinh'}
                        </p>
                        <p className="mt-2 text-[15px] font-black text-red-500">
                          {formatPrice(variant.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                  So luong
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="rounded-xl border border-gray-200 p-2 text-gray-600"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-10 text-center text-[18px] font-black text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="rounded-xl border border-gray-200 p-2 text-gray-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {message && (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {message}
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={busy || currentStock === 0}
                  onClick={() => handleAddToCart(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-[#008d71] disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  Them vao gio
                </button>
                <button
                  type="button"
                  disabled={busy || currentStock === 0}
                  onClick={() => handleAddToCart(true)}
                  className="rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white disabled:opacity-50"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            <div className="rounded-[34px] bg-white p-6 shadow-sm">
              <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                Thong tin san pham
              </p>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-gray-600">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[34px] bg-white p-6 shadow-sm">
            <h2 className="text-[24px] font-black uppercase tracking-tight text-gray-900">
              Thong so ky thuat
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {product.specs.length > 0 ? (
                product.specs.map((item) => (
                  <div
                    key={`${item.label}-${item.value}`}
                    className="rounded-2xl bg-gray-50 px-4 py-3"
                  >
                    <p className="text-[12px] font-black uppercase tracking-wide text-gray-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[15px] font-semibold text-gray-700">
                      {item.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[14px] text-gray-500">
                  Backend chua tra ve thong so chi tiet cho san pham nay.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[34px] bg-white p-6 shadow-sm">
            <h2 className="text-[24px] font-black uppercase tracking-tight text-gray-900">
              Danh gia gan day
            </h2>
            <div className="mt-6 space-y-4">
              {recentReviews.length > 0 ? (
                recentReviews.map((review) => (
                  <div key={review._id} className="rounded-2xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-black text-gray-900">
                          {review.user?.fullName || 'Khach hang'}
                        </p>
                        <p className="text-[12px] text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="font-black text-gray-800">
                          {review.rating || 5}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-[14px] leading-6 text-gray-600">
                      {review.comment || review.content || 'Khach hang chua de lai noi dung.'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[14px] text-gray-500">
                  Chua co danh gia gan day cho san pham nay.
                </p>
              )}
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="rounded-[34px] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                  Goi y cung thuong hieu
                </p>
                <h2 className="mt-2 text-[24px] font-black uppercase tracking-tight text-gray-900">
                  San pham lien quan
                </h2>
              </div>
              <Link
                to={`/search?brand=${encodeURIComponent(product.brand)}`}
                className="rounded-full border border-[#008d71]/20 bg-[#e5f9e0] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#008d71]"
              >
                Xem them
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;

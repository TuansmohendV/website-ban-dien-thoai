import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ product }) => {
  const { formatPrice } = useLanguage();
  const routeId = product.slug || product.backendId || product._id || '';
  const productLink = routeId
    ? `/product/${routeId}`
    : `/search?q=${encodeURIComponent(product.name || '')}`;
  const currentPrice = Number(product.priceNum ?? product.price ?? 0);
  const oldPrice = Number(product.oldPriceNum ?? product.oldPrice ?? 0);
  const discountLabel = product.discount
    ? String(product.discount).replace(/^-/, '')
    : '';

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative p-4">
        {discountLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-[10px] font-black text-white shadow-sm">
            -{discountLabel}
          </span>
        )}

        <Link
          to={productLink}
          className="flex h-[190px] items-center justify-center rounded-2xl bg-gray-50 p-3"
        >
          <img
            src={product.image || product.img}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
          {product.brand && <span>{product.brand}</span>}
          {product.totalStock > 0 ? (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              San hang
            </span>
          ) : (
            <span className="rounded-full bg-red-50 px-2 py-1 text-red-600">
              Tam het hang
            </span>
          )}
        </div>

        <Link to={productLink} className="mb-3 min-h-[48px]">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#008d71]">
            {product.name}
          </h3>
        </Link>

        <div className="mb-4">
          <div className="flex items-end gap-2">
            <span className="text-[20px] font-black text-red-500">
              {formatPrice(currentPrice)}
            </span>
            {oldPrice > currentPrice && (
              <span className="text-[13px] font-semibold text-gray-400 line-through">
                {formatPrice(oldPrice)}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] font-medium text-gray-500">
            Gia thanh vien tu {formatPrice(Math.max(currentPrice - 50000, 0))}
          </p>
        </div>

        {product.specs && (
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-3 text-[12px] text-gray-600">
            {product.specs.chip && <span>Chip: {product.specs.chip}</span>}
            {product.specs.ram && <span>RAM: {product.specs.ram}</span>}
            {product.specs.screen && <span>Man hinh: {product.specs.screen}</span>}
            {product.specs.battery && <span>Pin: {product.specs.battery}</span>}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-gray-500">
            {product.availableColors?.length
              ? `${product.availableColors.length} mau`
              : 'Xem tuy chon'}
          </div>
          <Link
            to={productLink}
            className="rounded-xl bg-[#008d71] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-white transition-colors hover:bg-[#00705d]"
          >
            Xem chi tiet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

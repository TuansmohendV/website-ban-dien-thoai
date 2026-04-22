import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

const CartPage = () => {
  const {
    cartItems,
    cartTotal,
    subtotal,
    discountTotal,
    loading,
    busy,
    clearCart,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { formatPrice } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-10 font-sans">
        <div className="mx-auto max-w-[1300px] animate-pulse rounded-[34px] bg-white p-10 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-[140px] rounded-[28px] bg-gray-100" />
              ))}
            </div>
            <div className="h-[320px] rounded-[28px] bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e5f9e0] text-[#008d71]">
            <ShoppingCart size={42} />
          </div>
          <h1 className="mt-6 text-[28px] font-black uppercase tracking-tight text-gray-900">
            Gio hang dang trong
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Hay quay lai trang chu hoac tim kiem de them san pham tu backend vao
            gio hang.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
            >
              Ve trang chu
            </Link>
            <Link
              to="/search"
              className="rounded-full border border-gray-200 px-5 py-3 text-[12px] font-black uppercase tracking-wide text-gray-600"
            >
              Mo tim kiem
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-8 px-4 pt-10">
        <div className="rounded-[34px] bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Gio hang dong bo
              </p>
              <h1 className="mt-3 text-[32px] font-black uppercase tracking-tight text-gray-900">
                Quan ly gio hang
              </h1>
              <p className="mt-2 text-[14px] text-gray-500">
                So luong, gia tri va ma giam gia dang duoc lay truc tiep tu backend.
              </p>
            </div>
            <button
              type="button"
              onClick={() => clearCart()}
              disabled={busy}
              className="w-fit rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-red-600 disabled:opacity-50"
            >
              Xoa toan bo
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.itemId || item.id}
                className="grid gap-4 rounded-[30px] bg-white p-5 shadow-sm md:grid-cols-[120px_minmax(0,1fr)_140px]"
              >
                <Link
                  to={`/product/${item.productSlug || item.productId}`}
                  className="flex h-[120px] items-center justify-center rounded-[24px] bg-gray-50 p-3"
                >
                  <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                </Link>

                <div className="space-y-3">
                  <Link to={`/product/${item.productSlug || item.productId}`}>
                    <h2 className="text-[18px] font-black leading-tight text-gray-900">
                      {item.name}
                    </h2>
                  </Link>
                  <div className="flex flex-wrap gap-2 text-[12px] font-semibold text-gray-500">
                    {item.selectedVariant?.storage && (
                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        {item.selectedVariant.storage}
                      </span>
                    )}
                    {item.selectedColor?.name && (
                      <span className="rounded-full bg-gray-100 px-3 py-1">
                        {item.selectedColor.name}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      Ton kho toi da: {item.maxStock || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.selectedVariant?.id,
                          item.selectedColor?.name,
                          -1
                        )
                      }
                      className="rounded-xl border border-gray-200 p-2 text-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-10 text-center text-[18px] font-black text-gray-900">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.selectedVariant?.id,
                          item.selectedColor?.name,
                          1
                        )
                      }
                      className="rounded-xl border border-gray-200 p-2 text-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between md:items-end">
                  <div className="text-left md:text-right">
                    <p className="text-[12px] font-black uppercase tracking-wide text-gray-400">
                      Don gia
                    </p>
                    <p className="mt-2 text-[22px] font-black text-red-500">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <p className="text-[14px] font-semibold text-gray-500">
                      Thanh tien: {formatPrice(item.lineTotal || item.price * item.qty)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          item.selectedVariant?.id,
                          item.selectedColor?.name
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-black uppercase tracking-wide text-red-600"
                    >
                      <Trash2 size={14} />
                      Xoa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[34px] bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
              Tom tat don hang
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Tam tinh</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Giam gia</span>
                <span>-{formatPrice(discountTotal)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-gray-100 pt-4">
                <span className="text-[16px] font-black uppercase tracking-wide text-gray-900">
                  Tong thanh toan
                </span>
                <span className="text-[28px] font-black text-[#008d71]">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Link
                to="/checkout"
                className="flex items-center justify-center rounded-2xl bg-[#008d71] px-5 py-4 text-[13px] font-black uppercase tracking-wide text-white"
              >
                Tiep tuc thanh toan
              </Link>
              <Link
                to="/search"
                className="flex items-center justify-center rounded-2xl border border-gray-200 px-5 py-4 text-[13px] font-black uppercase tracking-wide text-gray-600"
              >
                Them san pham
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

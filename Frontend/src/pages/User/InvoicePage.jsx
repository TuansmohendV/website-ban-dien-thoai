import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { orderService } from '../../services/shopApi';

const InvoicePage = () => {
  const { orderId } = useParams();
  const { formatPrice } = useLanguage();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      setLoading(true);
      setError('');

      try {
        const nextOrder = await orderService.getOrderById(orderId);

        if (mounted) {
          setOrder(nextOrder);
        }
      } catch {
        if (mounted) {
          setError('Khong the tai hoa don don hang nay.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const invoiceRows = useMemo(
    () =>
      order?.items?.map((item, index) => ({
        ...item,
        index: index + 1,
        total: item.price * item.qty,
      })) || [],
    [order]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-10 font-sans">
        <div className="mx-auto max-w-[1000px] animate-pulse rounded-[34px] bg-white p-10 shadow-sm">
          <div className="h-[700px] rounded-[28px] bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <h1 className="text-[28px] font-black uppercase tracking-tight text-gray-900">
            Khong tai duoc hoa don
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">{error}</p>
          <Link
            to="/orders"
            className="mt-8 inline-flex rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            Ve lich su don hang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] px-4 py-10 font-sans">
      <div className="mx-auto max-w-[1000px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/orders"
              className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400"
            >
              ← Ve lich su don hang
            </Link>
            <h1 className="mt-4 text-[32px] font-black uppercase tracking-tight text-gray-900">
              Hoa don don hang #{order.id}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            In / Luu PDF
          </button>
        </div>

        <div className="rounded-[34px] bg-white p-8 shadow-sm">
          <div className="grid gap-6 border-b border-gray-100 pb-8 md:grid-cols-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Khach hang
              </p>
              <h2 className="mt-3 text-[24px] font-black text-gray-900">
                {order.customer.fullName}
              </h2>
              <p className="mt-2 text-[14px] text-gray-600">{order.customer.phone}</p>
              <p className="mt-1 text-[14px] text-gray-600">{order.customer.email}</p>
              <p className="mt-3 text-[14px] leading-6 text-gray-600">
                {order.customer.address}
              </p>
            </div>

            <div className="md:text-right">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Thong tin don hang
              </p>
              <p className="mt-3 text-[14px] text-gray-600">{order.date}</p>
              <p className="mt-1 text-[14px] font-black uppercase text-[#008d71]">
                {order.status}
              </p>
              <p className="mt-3 text-[14px] text-gray-600">
                Thanh toan: {order.payment.methodLabel}
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                  <th className="px-2 py-3">#</th>
                  <th className="px-2 py-3">San pham</th>
                  <th className="px-2 py-3">So luong</th>
                  <th className="px-2 py-3 text-right">Don gia</th>
                  <th className="px-2 py-3 text-right">Thanh tien</th>
                </tr>
              </thead>
              <tbody>
                {invoiceRows.map((item) => (
                  <tr key={`${order.id}-${item.name}-${item.index}`} className="border-b border-gray-50">
                    <td className="px-2 py-4 text-[14px] font-semibold text-gray-500">
                      {item.index}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 p-2">
                          <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-[14px] font-black text-gray-900">{item.name}</p>
                          <p className="mt-1 text-[12px] text-gray-500">
                            {item.color || item.storage
                              ? [item.color, item.storage].filter(Boolean).join(' • ')
                              : 'Phien ban mac dinh'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-[14px] font-semibold text-gray-600">
                      x{item.qty}
                    </td>
                    <td className="px-2 py-4 text-right text-[14px] font-semibold text-gray-600">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-2 py-4 text-right text-[14px] font-black text-gray-900">
                      {formatPrice(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-[340px] space-y-3 rounded-[28px] bg-gray-50 p-5">
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Tam tinh</span>
                <span>{formatPrice(order.summary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Phi van chuyen</span>
                <span>{formatPrice(order.summary.shipping)}</span>
              </div>
              <div className="flex items-center justify-between text-[14px] font-semibold text-gray-500">
                <span>Giam gia</span>
                <span>-{formatPrice(order.summary.discount)}</span>
              </div>
              <div className="flex items-end justify-between border-t border-gray-200 pt-4">
                <span className="text-[16px] font-black uppercase tracking-wide text-gray-900">
                  Tong cong
                </span>
                <span className="text-[28px] font-black text-[#008d71]">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

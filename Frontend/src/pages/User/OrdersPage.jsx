import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrdersContext';

const TABS = [
  { id: 'all', label: 'Tat ca' },
  { id: 'pending', label: 'Cho xac nhan' },
  { id: 'processing', label: 'Dang xu ly' },
  { id: 'shipping', label: 'Dang giao' },
  { id: 'delivered', label: 'Hoan thanh' },
  { id: 'cancelled', label: 'Da huy' },
];

const STATUS_LABELS = {
  pending: 'Cho xac nhan',
  processing: 'Dang xu ly',
  shipping: 'Dang giao',
  delivered: 'Hoan thanh',
  cancelled: 'Da huy',
};

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useLanguage();
  const { orders, loading, busy, cancelOrder, reloadOrders } = useOrders();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState('');

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === activeTab);
  }, [activeTab, orders]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] px-4 py-20 font-sans">
        <div className="mx-auto max-w-[860px] rounded-[34px] bg-white p-16 text-center shadow-sm">
          <h1 className="text-[28px] font-black uppercase tracking-tight text-gray-900">
            Dang nhap de xem lich su don hang
          </h1>
          <p className="mt-3 text-[15px] text-gray-500">
            Lich su don hang backend hien chi hien thi cho tai khoan da dang nhap.
          </p>
          <Link
            to="/login"
            className="mt-8 inline-flex rounded-full bg-[#008d71] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
          >
            Dang nhap ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20 font-sans">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-8 px-4 pt-10">
        <div className="rounded-[34px] bg-white px-6 py-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-gray-400">
                Don hang dong bo
              </p>
              <h1 className="mt-3 text-[32px] font-black uppercase tracking-tight text-gray-900">
                Lich su don hang
              </h1>
              <p className="mt-2 text-[14px] text-gray-500">
                Theo doi don hang da tao tu backend theo tung trang thai.
              </p>
            </div>
            <button
              type="button"
              onClick={() => reloadOrders()}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-gray-600"
            >
              <RefreshCw size={14} />
              Tai lai
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-[28px] bg-white p-4 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-wide ${
                activeTab === tab.id ? 'bg-[#008d71] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[180px] animate-pulse rounded-[30px] bg-white shadow-sm"
              />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-[30px] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[0.35em] text-gray-400">
                      Don #{order.id}
                    </p>
                    <h2 className="mt-2 text-[20px] font-black text-gray-900">
                      {STATUS_LABELS[order.status] || order.status}
                    </h2>
                    <p className="mt-2 text-[14px] text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[12px] font-black uppercase tracking-[0.35em] text-gray-400">
                      Tong thanh toan
                    </p>
                    <p className="mt-2 text-[26px] font-black text-[#008d71]">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.id}-${item.name}`}
                      className="flex gap-3 rounded-[24px] bg-gray-50 p-3"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2">
                        <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[14px] font-black text-gray-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[12px] text-gray-500">
                          x{item.qty} • {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId((current) => (current === order.id ? '' : order.id))
                    }
                    className="rounded-full border border-gray-200 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-gray-600"
                  >
                    {expandedId === order.id ? 'An chi tiet' : 'Xem chi tiet'}
                  </button>
                  {['pending', 'processing'].includes(order.status) && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => cancelOrder(order.id, 'Khach hang thay doi nhu cau.')}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[12px] font-black uppercase tracking-wide text-red-600 disabled:opacity-50"
                    >
                      Huy don
                    </button>
                  )}
                  <Link
                    to={`/invoice/${order.id}`}
                    className="rounded-full border border-[#008d71]/20 bg-[#e5f9e0] px-4 py-2 text-[12px] font-black uppercase tracking-wide text-[#008d71]"
                  >
                    Hoa don
                  </Link>
                </div>

                {expandedId === order.id && (
                  <div className="mt-6 grid gap-6 rounded-[28px] bg-gray-50 p-5 lg:grid-cols-2">
                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Nguoi nhan
                      </p>
                      <p className="mt-3 text-[16px] font-black text-gray-900">
                        {order.customer.fullName}
                      </p>
                      <p className="mt-1 text-[14px] text-gray-500">
                        {order.customer.phone}
                      </p>
                      <p className="mt-1 text-[14px] text-gray-500">
                        {order.customer.email}
                      </p>
                      <p className="mt-3 text-[14px] text-gray-600">
                        {order.customer.address}
                      </p>
                    </div>

                    <div>
                      <p className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-400">
                        Hanh trinh don hang
                      </p>
                      <div className="mt-3 space-y-3">
                        {order.timeline.length > 0 ? (
                          order.timeline.map((step, index) => (
                            <div key={`${order.id}-timeline-${index}`} className="flex gap-3">
                              <div className="mt-1 h-3 w-3 rounded-full bg-[#008d71]" />
                              <div>
                                <p className="text-[14px] font-black text-gray-900">
                                  {step.text}
                                </p>
                                <p className="mt-1 text-[12px] text-gray-500">{step.time}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[14px] text-gray-500">
                            Backend chua co moc cap nhat chi tiet.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[34px] bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e5f9e0] text-[#008d71]">
              <PackageCheck size={42} />
            </div>
            <h2 className="mt-6 text-[24px] font-black uppercase tracking-tight text-gray-900">
              Chua co don hang phu hop
            </h2>
            <p className="mt-3 text-[15px] text-gray-500">
              Thu chuyen tab trang thai khac hoac tao them don hang moi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

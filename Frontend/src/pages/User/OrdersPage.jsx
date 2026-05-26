import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrdersContext';
import { Link, useNavigate } from 'react-router-dom';

/* ─── Icons ─────────────────────────────────────────────────────────────── */
const Bag     = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const Truck   = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>;
const ClockIco= ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Close   = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
const CardIco = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>;
const UserIco = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const Print   = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>;
const ChevR   = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const Refresh = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>;

/* ─── Brand color: #008d71 ───────────────────────────────────────────────── */
const BRAND  = '#008d71';
const BRANDBG= '#e5f9e0';

/* ─── Status config — dùng màu nhẹ, không dùng slate/navy ─────────────── */
const STATUS_CFG = {
    pending:    { label: 'Chờ xác nhận', pill: 'bg-amber-50 text-amber-600 border border-amber-200',   dot: 'bg-amber-400' },
    processing: { label: 'Đang xử lý',   pill: 'bg-blue-50 text-blue-600 border border-blue-200',      dot: 'bg-blue-500' },
    shipping:   { label: 'Đang giao',    pill: 'bg-violet-50 text-violet-600 border border-violet-200', dot: 'bg-violet-500' },
    delivered:  { label: 'Hoàn thành',   pill: 'bg-[#e5f9e0] text-[#008d71] border border-[#008d71]/20', dot: 'bg-[#008d71]' },
    cancelled:  { label: 'Đã hủy',       pill: 'bg-red-50 text-red-400 border border-red-200',          dot: 'bg-red-400' },
};

const StatusBadge = ({ status }) => {
    const s = STATUS_CFG[status] || { label: status, pill: 'bg-gray-50 text-gray-500 border border-gray-200', dot: 'bg-gray-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};

const isOnlinePaymentMethod = (order = {}) => {
    const method = String(order.paymentMethod || order.payment?.backendMethod || '').toUpperCase();
    return ['VNPAY', 'MOMO', 'BANK_TRANSFER'].includes(method);
};

const canPayOrder = (order = {}) => {
    const status = String(order.status || '').toLowerCase();
    const paymentStatus = String(order.paymentStatus || order.payment?.status || '').toLowerCase();

    return isOnlinePaymentMethod(order) &&
        paymentStatus !== 'paid' &&
        !['cancelled', 'delivered'].includes(status);
};

const getPaymentNotice = (order = {}) => {
    if (!canPayOrder(order)) return null;

    const paymentStatus = String(order.paymentStatus || order.payment?.status || '').toLowerCase();

    if (paymentStatus === 'failed') {
        return {
            title: 'Thanh toán chưa thành công',
            message: 'Giao dịch trước đó chưa hoàn tất. Bạn có thể thanh toán lại để tiếp tục xử lý đơn hàng.',
            className: 'bg-red-50 border-red-100 text-red-700',
        };
    }

    return {
        title: 'Đơn hàng chưa thanh toán',
        message: 'Bạn đã rời khỏi cổng thanh toán hoặc chưa hoàn tất giao dịch. Vui lòng thanh toán lại để giữ đơn hàng.',
        className: 'bg-amber-50 border-amber-100 text-amber-700',
    };
};

/* ─── Stat Card ─────────────────────────────────────────────────────────── */
const StatCard = ({ emoji, value, label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all text-left hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${active ? 'bg-[#008d71] border-[#008d71] shadow-lg shadow-[#008d71]/20' : 'bg-white border-gray-200'}`}
    >
        <span className="text-xl">{emoji}</span>
        <div>
            <p className={`text-lg font-extrabold leading-none ${active ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            <p className={`text-[11px] font-medium mt-0.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>{label}</p>
        </div>
    </button>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const OrdersPage = () => {
    const { formatPrice }         = useLanguage();
    const { orders, cancelOrder, processPayment } = useOrders();
    const navigate                = useNavigate();

    const [activeStatus,     setActiveStatus]     = useState('all');
    const [expandedTimeline, setExpandedTimeline] = useState(null);
    const [drawer,           setDrawer]           = useState(null);
    const [payingOrderId,    setPayingOrderId]    = useState('');
    const [notice,           setNotice]           = useState('');

    const TABS = [
        { id: 'all',        label: 'Tất cả' },
        { id: 'pending',    label: 'Chờ xác nhận' },
        { id: 'processing', label: 'Đang xử lý' },
        { id: 'shipping',   label: 'Đang giao' },
        { id: 'delivered',  label: 'Hoàn thành' },
        { id: 'cancelled',  label: 'Đã hủy' },
    ];

    const count    = id => id === 'all' ? orders.length : orders.filter(o => o.status === id).length;
    const filtered = activeStatus === 'all' ? orders : orders.filter(o => o.status === activeStatus);
    const unpaidCount = orders.filter(canPayOrder).length;

    const handlePayOrder = async (order) => {
        const method = String(order.paymentMethod || order.payment?.backendMethod || '').toUpperCase();
        const orderId = order.backendId || order.id;

        if (!orderId || !method) {
            setNotice('Không tìm thấy thông tin thanh toán của đơn hàng.');
            return;
        }

        try {
            setPayingOrderId(order.id);
            setNotice('');
            const payResponse = await processPayment(orderId, method, {
                returnUrl: `${window.location.origin}/checkout-result`,
                origin: window.location.origin,
            });

            if (payResponse?.paymentUrl) {
                window.location.href = payResponse.paymentUrl;
            }
        } catch (error) {
            setNotice(error.message || 'Không thể tạo lại thanh toán lúc này.');
        } finally {
            setPayingOrderId('');
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>

            {/* ── Page Header ── */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 pt-8 pb-0">

                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: BRANDBG }}>
                                <Bag className="w-5 h-5" style={{ color: BRAND }} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
                                <h1 className="text-xl font-extrabold text-gray-900 leading-tight">Quản lý đơn hàng</h1>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3 flex-wrap">
                            <StatCard
                                emoji="📦"
                                value={orders.length}
                                label="Tổng đơn"
                                active={activeStatus === 'all'}
                                onClick={() => setActiveStatus('all')}
                            />
                            <StatCard
                                emoji="🚚"
                                value={orders.filter(o=>o.status==='shipping').length}
                                label="Đang giao"
                                active={activeStatus === 'shipping'}
                                onClick={() => setActiveStatus('shipping')}
                            />
                            <StatCard
                                emoji="✅"
                                value={orders.filter(o=>o.status==='delivered').length}
                                label="Hoàn thành"
                                active={activeStatus === 'delivered'}
                                onClick={() => setActiveStatus('delivered')}
                            />
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                        {TABS.map(tab => {
                            const n      = count(tab.id);
                            const active = activeStatus === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveStatus(tab.id)}
                                    className="relative whitespace-nowrap flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-150 shrink-0"
                                    style={{
                                        color: active ? BRAND : '#6b7280',
                                        borderBottom: active ? `2.5px solid ${BRAND}` : '2.5px solid transparent',
                                    }}
                                >
                                    {tab.label}
                                    {n > 0 && (
                                        <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{
                                                background: active ? BRANDBG : '#f3f4f6',
                                                color:      active ? BRAND   : '#9ca3af',
                                            }}
                                        >
                                            {n}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Order List ── */}
            <div className="max-w-6xl mx-auto px-6 py-7">
                {unpaidCount > 0 && (
                    <div className="mb-5 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-amber-700 shadow-sm">
                        <p className="text-sm font-extrabold">Bạn có {unpaidCount} đơn hàng chưa thanh toán.</p>
                        <p className="text-xs font-semibold mt-1">Mở đơn hàng và chọn “Thanh toán lại” để hoàn tất giao dịch.</p>
                    </div>
                )}

                {notice && (
                    <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
                        {notice}
                    </div>
                )}

                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 py-20 flex flex-col items-center text-center shadow-sm">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-3xl" style={{ background: BRANDBG }}>🛍️</div>
                        <h3 className="text-lg font-extrabold text-gray-800 mb-2">Không có đơn hàng</h3>
                        <p className="text-gray-400 text-sm mb-7 max-w-xs">
                            {activeStatus === 'all'
                                ? 'Bạn chưa có đơn hàng nào.'
                                : `Không có đơn hàng ở trạng thái "${TABS.find(t=>t.id===activeStatus)?.label}".`}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-7 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                            style={{ background: BRAND }}
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(order => {
                            const paymentNotice = getPaymentNotice(order);

                            return (
                            <div key={order.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 ${paymentNotice ? 'border-amber-200' : 'border-gray-200'}`}>

                                {/* ── Card Header ── */}
                                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {/* Brand mark */}
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black italic shrink-0"
                                             style={{ background: BRAND }}>
                                            Sin
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">#{order.id?.slice(-8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                <ClockIco className="w-3 h-3" /> {order.date}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={order.status} />
                                        {order.timeline && (
                                            <button
                                                onClick={() => setExpandedTimeline(expandedTimeline === order.id ? null : order.id)}
                                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-all"
                                            >
                                                <Truck className="w-3.5 h-3.5" />
                                                Hành trình
                                                <ChevR className={`w-3 h-3 transition-transform ${expandedTimeline === order.id ? 'rotate-90' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {paymentNotice && (
                                    <div className={`mx-6 mt-4 rounded-2xl border px-4 py-3 ${paymentNotice.className}`}>
                                        <div>
                                            <p className="text-sm font-extrabold">{paymentNotice.title}</p>
                                            <p className="text-xs font-semibold mt-1 leading-relaxed">{paymentNotice.message}</p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Products ── */}
                                <div className="px-6 py-4 divide-y divide-gray-50">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 group">
                                            <div className="w-16 h-16 bg-[#f8f9fa] rounded-xl p-1.5 border border-gray-100 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-200">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 flex justify-between items-center min-w-0">
                                                <div className="min-w-0 pr-4">
                                                    <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Số lượng: <span className="font-bold text-gray-600">{item.qty}</span>
                                                    </p>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Timeline collapsible ── */}
                                {expandedTimeline === order.id && order.timeline && (
                                    <div className="mx-6 mb-4 rounded-xl p-5 border" style={{ background: BRANDBG, borderColor: '#008d71' + '30' }}>
                                        <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: BRAND }}>
                                            <Truck className="w-3.5 h-3.5" /> Trạng thái vận chuyển
                                        </p>
                                        <div className="relative pl-5 space-y-4" style={{ borderLeft: `2px solid #008d71` + '40' }}>
                                            {order.timeline.map((step, idx) => (
                                                <div key={idx} className="relative">
                                                    <span className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white shadow-sm`}
                                                          style={{ background: step.active ? BRAND : '#d1d5db' }} />
                                                    <p className={`text-sm font-semibold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.text}</p>
                                                    {step.time && <p className="text-xs text-gray-400 mt-0.5">{step.time}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── Card Footer ── */}
                                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-0.5">Tổng thanh toán</p>
                                        <p className="text-xl font-extrabold" style={{ color: BRAND }}>{formatPrice(order.totalAmount)}</p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => { if(window.confirm('Bạn có chắc muốn hủy đơn này?')) cancelOrder(order.id); }}
                                                className="px-4 py-2 text-xs font-semibold bg-white border border-red-200 text-red-400 rounded-xl hover:bg-red-50 transition-all"
                                            >
                                                Hủy đơn
                                            </button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <Link to={`/return-request/${order.id}`}
                                                className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5">
                                                <Refresh className="w-3.5 h-3.5" /> Đổi trả
                                            </Link>
                                        )}
                                        <Link to={`/invoice/${order.id}`}
                                            className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5">
                                            <Print className="w-3.5 h-3.5" /> Hóa đơn
                                        </Link>
                                        <button
                                            onClick={() => setDrawer(order)}
                                            className="px-5 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                                            style={{ background: BRAND }}
                                        >
                                            Xem chi tiết <ChevR className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ══ Side Drawer ══════════════════════════════════════════════════════ */}
            {drawer && (
                <>
                    <div className="fixed inset-0 bg-black/25 z-[90]" onClick={() => setDrawer(null)} />

                    <div className="fixed top-0 left-0 h-full w-full max-w-[440px] bg-white z-[100] shadow-2xl flex flex-col overflow-hidden rounded-r-2xl"
                         style={{ animation: 'slideInLeft .28s cubic-bezier(.4,0,.2,1)' }}>

                        {/* Drawer Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0 bg-white">
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Chi tiết đơn hàng</p>
                                <h2 className="text-lg font-extrabold text-gray-900">#{drawer.id}</h2>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                    <ClockIco className="w-3 h-3" /> {drawer.date}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={drawer.status} />
                                <button onClick={() => setDrawer(null)}
                                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all">
                                    <Close className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

                            {/* Products */}
                            {drawer?.items && (
                                <div className="p-6 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        Sản phẩm ({drawer.items.length})
                                    </p>
                                    <div className="space-y-3">
                                        {drawer.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="w-14 h-14 bg-white rounded-lg p-1 border border-gray-100 shrink-0">
                                                    <img src={item?.image} alt={item?.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm leading-snug">{item?.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">x{item?.qty}</p>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{formatPrice(item?.price)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🚚 Estimated Delivery & Timeline */}
                            <div className="p-6 border-b border-gray-100 bg-[#f8fbfa]">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#008d71]" /> Trạng thái vận chuyển
                                </p>
                                
                                {drawer?.estimatedDelivery && (
                                    <div className="mb-6 p-4 rounded-2xl bg-white border border-[#e5f9e0] shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#e5f9e0] flex items-center justify-center shrink-0">
                                                <span className="text-xl">📅</span>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-[#008d71] uppercase leading-none mb-1">Dự kiến giao hàng vào</p>
                                                <p className="text-base font-black text-gray-900 leading-tight">{drawer.estimatedDelivery}</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">* Thời gian thực tế có thể sớm hơn tùy đơn vị vận chuyển</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Simple Timeline Stepper */}
                                {drawer?.timeline && Array.isArray(drawer.timeline) && (
                                    <div className="mt-4 px-2">
                                        {drawer.timeline.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 min-h-[50px]">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${step?.active ? 'bg-[#008d71] border-[#008d71]' : 'bg-white border-gray-200'}`}>
                                                        {step?.active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    {idx !== drawer.timeline.length - 1 && (
                                                        <div className={`w-0.5 grow my-1 ${step?.active && drawer.timeline[idx+1]?.active ? 'bg-[#008d71]' : 'bg-gray-100'}`} />
                                                    )}
                                                </div>
                                                <div className="pb-4">
                                                    <p className={`text-sm font-bold leading-none ${step?.active ? 'text-gray-900' : 'text-gray-400'}`}>{step?.text}</p>
                                                    {step?.time && <p className="text-[10px] text-gray-400 mt-1 font-medium">{step.time}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Customer */}
                            {drawer?.customer && (
                                <div className="p-6 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                        <UserIco className="w-3.5 h-3.5" /> Thông tin nhận hàng
                                    </p>
                                    <div className="space-y-2.5">
                                        <p className="font-bold text-gray-900 text-sm">{drawer.customer.fullName}</p>
                                        <p className="text-sm text-gray-500">📞 {drawer.customer.phone}</p>
                                        {drawer.customer.email    && <p className="text-sm text-gray-500">✉️ {drawer.customer.email}</p>}
                                        {drawer.customer.address  && <p className="text-sm text-gray-500 leading-relaxed">📍 {drawer.customer.address}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Payment */}
                            {drawer?.payment && (
                                <div className="p-6 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                        <CardIco className="w-3.5 h-3.5" /> Hình thức thanh toán
                                    </p>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <span className="text-2xl">{drawer.payment.method === 'cod' ? '🚚' : '🏦'}</span>
                                        <span className="font-semibold text-gray-900 text-sm">{drawer.payment.methodLabel}</span>
                                    </div>
                                    {getPaymentNotice(drawer) && (
                                        <div className={`mt-4 rounded-2xl border px-4 py-3 ${getPaymentNotice(drawer).className}`}>
                                            <p className="text-sm font-extrabold">{getPaymentNotice(drawer).title}</p>
                                            <p className="text-xs font-semibold mt-1 leading-relaxed">{getPaymentNotice(drawer).message}</p>
                                            <button
                                                onClick={() => handlePayOrder(drawer)}
                                                disabled={payingOrderId === drawer.id}
                                                className="mt-3 h-10 px-4 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-wider hover:bg-amber-600 transition-all disabled:opacity-60"
                                            >
                                                {payingOrderId === drawer.id ? 'Đang tạo...' : 'Thanh toán lại'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Summary */}
                            {drawer?.summary && (
                                <div className="p-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Tóm tắt thanh toán</p>
                                    <div className="rounded-2xl overflow-hidden border border-gray-100">
                                        <div className="bg-gray-50 divide-y divide-gray-100">
                                            <div className="flex justify-between px-5 py-3 text-sm text-gray-500">
                                                <span>Tạm tính</span><span className="font-semibold text-gray-700">{formatPrice(drawer.summary?.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between px-5 py-3 text-sm text-gray-500">
                                                <span>Phí vận chuyển</span><span className="font-semibold text-gray-700">{formatPrice(drawer.summary?.shipping)}</span>
                                            </div>
                                            {drawer.summary?.discount > 0 && (
                                                <div className="flex justify-between px-5 py-3 text-sm font-semibold" style={{ color: BRAND }}>
                                                    <span>Giảm giá</span><span>-{formatPrice(drawer.summary.discount)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center px-5 py-4" style={{ background: BRANDBG }}>
                                            <span className="font-bold text-gray-800">Tổng cộng</span>
                                            <span className="text-xl font-extrabold" style={{ color: BRAND }}>{formatPrice(drawer.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div className="shrink-0 px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
                            <Link to={`/invoice/${drawer.id}`}
                                className="flex-1 h-11 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all">
                                <Print className="w-4 h-4" /> Hóa đơn PDF
                            </Link>
                            <button onClick={() => setDrawer(null)}
                                className="flex-1 h-11 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                                style={{ background: BRAND }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default OrdersPage;

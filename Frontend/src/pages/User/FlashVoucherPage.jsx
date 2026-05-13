import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Breadcrumbs from '../../components/Breadcrumbs';
import api, { getApiErrorMessage } from '../../lib/api';

// ─── Icons ───────────────────────────────────────────────────
const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const CopyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
const TagIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
);
const BoltIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const FireIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M12.017 0C8.396 4.593 11.5 8 11.018 11.5 10.5 15 7 16.5 7 16.5c.5-2-1-3.5-1-3.5C4 16.5 3 19.5 3 21.5c0 2.76 2.24 5 5 5s5-2.24 5-5c0-.55-.09-1.08-.25-1.58.71.54 1.25 1.29 1.25 2.58 0 2.76 2.24 5 5 5s5-2.24 5-5c0-5.5-8-14.5-10.983-17.5z"/></svg>
);

// ─── Voucher Data (giờ Việt Nam) ─────────────────────────────
const VOUCHERS = [
  {
    id: 1,
    code: 'SANG7H',
    discount: 5,
    maxDiscount: 200000,
    minOrder: 500000,
    startHour: 7, startMin: 0,
    endHour: 9,   endMin: 0,
    label: 'Khuyến mãi buổi sáng',
    emoji: '🌅',
    qty: 50,
    used: 12,
    color: 'from-amber-500 to-orange-500',
    glowColor: 'shadow-amber-500/30',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 2,
    code: 'TRUA12H',
    discount: 7,
    maxDiscount: 350000,
    minOrder: 1000000,
    startHour: 12, startMin: 0,
    endHour: 14,   endMin: 0,
    label: 'Flash Sale buổi trưa',
    emoji: '☀️',
    qty: 30,
    used: 21,
    color: 'from-red-500 to-rose-600',
    glowColor: 'shadow-red-500/30',
    badgeColor: 'bg-red-100 text-red-800',
  },
  {
    id: 3,
    code: 'CHIEU15H',
    discount: 6,
    maxDiscount: 300000,
    minOrder: 800000,
    startHour: 15, startMin: 0,
    endHour: 17,   endMin: 0,
    label: 'Deal cuối chiều',
    emoji: '🌤️',
    qty: 40,
    used: 8,
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'shadow-blue-500/30',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 4,
    code: 'GOLDEN20H',
    discount: 10,
    maxDiscount: 500000,
    minOrder: 2000000,
    startHour: 20, startMin: 0,
    endHour: 22,   endMin: 0,
    label: 'Giờ Vàng buổi tối',
    emoji: '🌙',
    qty: 20,
    used: 3,
    color: 'from-violet-600 to-purple-700',
    glowColor: 'shadow-violet-500/30',
    badgeColor: 'bg-violet-100 text-violet-800',
  },
  {
    id: 5,
    code: 'DONGHO0H',
    discount: 15,
    maxDiscount: 1000000,
    minOrder: 5000000,
    startHour: 0, startMin: 0,
    endHour: 1,   endMin: 0,
    label: 'Săn đêm cực đỉnh',
    emoji: '🔥',
    qty: 10,
    used: 2,
    color: 'from-slate-900 to-slate-700',
    glowColor: 'shadow-slate-500/20',
    badgeColor: 'bg-slate-100 text-slate-800',
  },
];

const VOUCHER_STYLES = [
  {
    color: 'from-red-500 to-rose-600',
    glowColor: 'shadow-red-500/30',
    badgeColor: 'bg-red-100 text-red-800',
  },
  {
    color: 'from-emerald-500 to-teal-600',
    glowColor: 'shadow-emerald-500/30',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'shadow-blue-500/30',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    color: 'from-amber-500 to-orange-500',
    glowColor: 'shadow-amber-500/30',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
];

const mapPublicVoucher = (voucher, index) => {
  const style = VOUCHER_STYLES[index % VOUCHER_STYLES.length];
  const now = new Date();
  const expiresAt = voucher.expiresAt ? new Date(voucher.expiresAt) : null;
  const end = expiresAt && expiresAt > now ? expiresAt : new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const qty = Number(voucher.usageLimit || 0);
  const used = Number(voucher.usedCount || 0);

  return {
    id: voucher.id || voucher._id || voucher.code,
    code: voucher.code,
    description: voucher.description || 'Mã giảm giá từ cửa hàng',
    discountType: voucher.discountType,
    discount: Number(voucher.discountValue || 0),
    maxDiscount: Number(voucher.maxDiscount || 0),
    minOrder: Number(voucher.minOrderValue || 0),
    startHour: now.getHours(),
    startMin: now.getMinutes(),
    endHour: end.getHours(),
    endMin: end.getMinutes(),
    label: voucher.description || 'Voucher đang mở',
    emoji: '🎟️',
    qty,
    used,
    remainingUses: voucher.remainingUses,
    status: 'active',
    expiresAt: voucher.expiresAt,
    ...style,
  };
};

// ─── Helpers ─────────────────────────────────────────────────
const toSeconds = (h, m) => h * 3600 + m * 60;

const getStatus = (v, nowSec) => {
  if (v.status) return v.status;
  const start = toSeconds(v.startHour, v.startMin);
  const end   = toSeconds(v.endHour,   v.endMin);
  if (nowSec >= start && nowSec < end)  return 'active';
  if (nowSec < start)                   return 'upcoming';
  return 'expired';
};

const secondsUntil = (targetSec, nowSec) => {
  const diff = targetSec - nowSec;
  return diff > 0 ? diff : 0;
};

const fmtTime = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
};

const formatPrice = (n) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatDiscount = (voucher) =>
  voucher.discountType === 'fixed'
    ? formatPrice(voucher.discount)
    : `${voucher.discount}%`;

// ─── Countdown Block ─────────────────────────────────────────
const CountdownBlock = ({ value }) => (
  <div className="bg-black/20 rounded-xl px-3 py-2 text-center min-w-[40px]">
    <span className="text-xl font-black tabular-nums leading-none">{String(value).padStart(2, '0')}</span>
  </div>
);

// ─── Voucher Card ─────────────────────────────────────────────
const VoucherCard = ({ voucher, nowSec }) => {
  const [copied, setCopied] = useState(false);
  const status = getStatus(voucher, nowSec);
  const startSec = toSeconds(voucher.startHour, voucher.startMin);
  const endSec   = toSeconds(voucher.endHour,   voucher.endMin);
  const remaining = status === 'active'
    ? secondsUntil(endSec, nowSec)
    : status === 'upcoming'
    ? secondsUntil(startSec, nowSec)
    : 0;

  const hrs  = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const usedPct = voucher.qty > 0 ? Math.round((voucher.used / voucher.qty) * 100) : 0;
  const remaining_qty =
    typeof voucher.remainingUses === 'number'
      ? voucher.remainingUses
      : voucher.qty > 0
      ? voucher.qty - voucher.used
      : null;

  const handleCopy = () => {
    if (status !== 'active') return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`relative bg-white rounded-[32px] overflow-hidden border-2 transition-all duration-300 ${
      status === 'active'
        ? `border-transparent shadow-2xl ${voucher.glowColor} hover:scale-[1.02]`
        : status === 'upcoming'
        ? 'border-gray-100 shadow-md hover:shadow-lg'
        : 'border-gray-100 opacity-50 grayscale'
    }`}>

      {/* Top gradient strip */}
      <div className={`bg-gradient-to-r ${voucher.color} px-7 py-6 text-white relative overflow-hidden`}>
        {/* Background decoration */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-black/10 rounded-full" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{voucher.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">{voucher.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black leading-none italic tracking-tighter">{formatDiscount(voucher)}</span>
              <span className="text-sm font-black text-white/70 mb-2 uppercase tracking-wide">giảm<br/>ngay</span>
            </div>
            <p className="text-xs text-white/60 font-bold mt-2">
              {voucher.maxDiscount > 0 ? `Tối đa ${formatPrice(voucher.maxDiscount)} • ` : ''}
              Từ {formatPrice(voucher.minOrder)}
            </p>
          </div>

          {/* Status badge */}
          {status === 'active' && (
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
            </div>
          )}
          {status === 'upcoming' && (
            <div className="bg-black/20 border border-white/20 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest">Sắp mở</span>
            </div>
          )}
          {status === 'expired' && (
            <div className="bg-black/30 border border-white/10 px-3 py-1.5 rounded-full shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest">Hết giờ</span>
            </div>
          )}
        </div>

        {/* Time window */}
        <div className="relative mt-4 flex items-center gap-2 text-xs font-bold text-white/70">
          <ClockIcon className="w-3.5 h-3.5" />
          {voucher.expiresAt
            ? `Hạn dùng đến ${new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}`
            : `${String(voucher.startHour).padStart(2, '0')}:${String(voucher.startMin).padStart(2, '0')} - ${String(voucher.endHour).padStart(2, '0')}:${String(voucher.endMin).padStart(2, '0')} hàng ngày`}
        </div>
      </div>

      {/* — Divider with scissor style — */}
      <div className="relative flex items-center my-0">
        <div className="absolute left-0 w-6 h-6 bg-gray-50 rounded-full -translate-x-1/2 border-2 border-gray-100" />
        <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-6" />
        <div className="absolute right-0 w-6 h-6 bg-gray-50 rounded-full translate-x-1/2 border-2 border-gray-100" />
      </div>

      {/* Bottom info */}
      <div className="px-7 py-6 space-y-5">
        {/* Code row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-5 py-3 text-center">
            <span className={`text-xl font-black tracking-[0.25em] ${status === 'active' ? 'text-slate-900' : 'text-gray-400'}`}>
              {voucher.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            disabled={status !== 'active'}
            className={`h-[52px] px-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shrink-0 ${
              status !== 'active'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : copied
                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                : 'bg-slate-950 text-white hover:bg-red-600 shadow-lg'
            }`}
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            {copied ? 'Đã sao chép!' : 'Lấy mã'}
          </button>
        </div>

        {/* Countdown timer */}
        {status === 'active' && (
          <div className={`bg-gradient-to-r ${voucher.color} text-white rounded-2xl px-5 py-4`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-3 flex items-center gap-2">
              <BoltIcon className="w-3.5 h-3.5" /> Kết thúc sau
            </p>
            <div className="flex items-center gap-2">
              <CountdownBlock value={hrs} />
              <span className="text-xl font-black text-white/60">:</span>
              <CountdownBlock value={mins} />
              <span className="text-xl font-black text-white/60">:</span>
              <CountdownBlock value={secs} />
            </div>
          </div>
        )}

        {status === 'upcoming' && (
          <div className="bg-amber-50 border-2 border-amber-100 text-amber-800 rounded-2xl px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
              <ClockIcon className="w-3.5 h-3.5" /> Mở cửa sau
            </p>
            <div className="flex items-center gap-2">
              <div className="bg-amber-200/60 rounded-xl px-3 py-2 text-center min-w-[40px]">
                <span className="text-xl font-black tabular-nums leading-none">{String(hrs).padStart(2, '0')}</span>
              </div>
              <span className="text-xl font-black text-amber-400">:</span>
              <div className="bg-amber-200/60 rounded-xl px-3 py-2 text-center min-w-[40px]">
                <span className="text-xl font-black tabular-nums leading-none">{String(mins).padStart(2, '0')}</span>
              </div>
              <span className="text-xl font-black text-amber-400">:</span>
              <div className="bg-amber-200/60 rounded-xl px-3 py-2 text-center min-w-[40px]">
                <span className="text-xl font-black tabular-nums leading-none">{String(secs).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'expired' && (
          <div className="bg-gray-100 rounded-2xl px-5 py-4 text-center">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Khung giờ đã kết thúc. Quay lại vào ngày mai!</p>
          </div>
        )}

        {/* Usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest">
            <span>Đã dùng {voucher.used}/{voucher.qty}</span>
            <span className="text-red-500">{remaining_qty === null ? 'Không giới hạn' : remaining_qty > 0 ? `Còn ${remaining_qty} mã` : 'Hết mã!'}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${voucher.color} rounded-full transition-all duration-700`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────
const FlashVoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [nowSec, setNowSec] = useState(() => {
    const now = new Date();
    return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let isMounted = true;

    const fetchVouchers = async () => {
      try {
        const response = await api.get('/api/voucher/public');
        const mapped = (response.data?.data || []).map(mapPublicVoucher);
        if (isMounted) {
          setVouchers(mapped);
          setErrorMessage('');
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getApiErrorMessage(error, 'Không thể tải danh sách mã giảm giá.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVouchers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setNowSec(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
      setCurrentTime(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeVouchers   = vouchers.filter(v => getStatus(v, nowSec) === 'active');
  const upcomingVouchers = vouchers.filter(v => getStatus(v, nowSec) === 'upcoming');
  const expiredVouchers  = vouchers.filter(v => getStatus(v, nowSec) === 'expired');

  const timeStr = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Breadcrumbs />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.15)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

        <div className="relative w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-600/30 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em]">
                <BoltIcon className="w-3.5 h-3.5" />
                Flash Voucher
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
              Mã giảm giá<br />
              <span className="text-red-500">theo khung giờ</span>
            </h1>
            <p className="text-white/50 font-bold leading-relaxed max-w-lg">
              Mỗi khung giờ trong ngày có một mã giảm giá đặc biệt. Canh đúng giờ, lấy ngay mã tốt nhất!
            </p>
          </div>

          {/* Live clock */}
          <div className="bg-white/5 border border-white/10 rounded-[30px] px-10 py-8 text-center backdrop-blur-sm shrink-0">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.35em] mb-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Giờ hiện tại
            </p>
            <p className="text-5xl font-black text-white tracking-tighter tabular-nums italic">{timeStr}</p>
            <p className="text-xs text-white/30 font-bold mt-3 uppercase tracking-widest">
              {activeVouchers.length > 0
                ? `${activeVouchers.length} mã đang hoạt động`
                : 'Không có mã nào đang hoạt động'}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12 space-y-16">
        {isLoading && (
          <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Đang tải mã giảm giá...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="bg-red-50 rounded-[28px] border border-red-100 p-10 text-center">
            <p className="text-sm font-black text-red-600">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && vouchers.length === 0 && (
          <div className="bg-white rounded-[28px] border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-lg font-black text-slate-900">Hiện chưa có mã giảm giá khả dụng.</p>
            <p className="text-sm font-bold text-gray-400 mt-2">Khi admin tạo mã còn hiệu lực, mã sẽ xuất hiện tại đây.</p>
          </div>
        )}

        {/* ── Active Vouchers ───────────────────────────────────── */}
        {activeVouchers.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-red-500" />
                Đang hoạt động
              </h2>
              <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                {activeVouchers.length} mã
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {activeVouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} nowSec={nowSec} />
              ))}
            </div>
          </section>
        )}

        {/* ── Upcoming ─────────────────────────────────────────── */}
        {upcomingVouchers.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-amber-500" />
                Sắp mở
              </h2>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                {upcomingVouchers.length} mã
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {upcomingVouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} nowSec={nowSec} />
              ))}
            </div>
          </section>
        )}

        {/* ── Expired ──────────────────────────────────────────── */}
        {expiredVouchers.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xl font-black text-gray-400 uppercase tracking-tight italic flex items-center gap-3">
                <TagIcon className="w-5 h-5 text-gray-300" />
                Đã kết thúc hôm nay
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {expiredVouchers.map(v => (
                <VoucherCard key={v.id} voucher={v} nowSec={nowSec} />
              ))}
            </div>
          </section>
        )}

        {/* ── Info banner ───────────────────────────────────────── */}
        <div className="bg-slate-950 rounded-[40px] p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { emoji: '🔒', title: 'Chính sách', desc: 'Mỗi tài khoản chỉ dùng mã 1 lần trong khung giờ áp dụng.' },
              { emoji: '🔄', title: 'Cập nhật hàng ngày', desc: 'Mã mới reset lúc 00:00 mỗi ngày. Nhớ quay lại canh mã nhé!' },
              { emoji: '💰', title: 'Ưu đãi tốt nhất', desc: 'Các mã khung giờ thấp điểm có mức giảm cao hơn so với mã thông thường.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="text-3xl">{item.emoji}</div>
                <h3 className="font-black text-white uppercase tracking-wider italic text-sm">{item.title}</h3>
                <p className="text-sm text-white/40 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FlashVoucherPage;

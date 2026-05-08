import React, { useState, useMemo } from 'react';

// ─── Icons ──────────────────────────────────────────────────────────────
const TruckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
);
const ZapIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
);
const ClockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const MapPinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
);
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

// ─── Data ────────────────────────────────────────────────────────────────
const PROVINCES = {
  'Hà Nội': { zone: 1, hub: 'HN' },
  'TP. Hồ Chí Minh': { zone: 1, hub: 'HCM' },
  'Đà Nẵng': { zone: 2, hub: 'DN' },
  'Hải Phòng': { zone: 2, hub: 'HN' },
  'Cần Thơ': { zone: 2, hub: 'HCM' },
  'Bình Dương': { zone: 2, hub: 'HCM' },
  'Đồng Nai': { zone: 2, hub: 'HCM' },
  'Bắc Ninh': { zone: 2, hub: 'HN' },
  'Thái Nguyên': { zone: 2, hub: 'HN' },
  'Nghệ An': { zone: 3, hub: 'DN' },
  'Thanh Hóa': { zone: 2, hub: 'HN' },
  'Quảng Ngãi': { zone: 3, hub: 'DN' },
  'Khánh Hòa': { zone: 3, hub: 'HCM' },
  'Lâm Đồng': { zone: 3, hub: 'HCM' },
  'An Giang': { zone: 3, hub: 'HCM' },
  'Kiên Giang': { zone: 3, hub: 'HCM' },
  'Quảng Ninh': { zone: 2, hub: 'HN' },
  'Hà Tĩnh': { zone: 3, hub: 'DN' },
  'Bình Định': { zone: 3, hub: 'DN' },
  'Long An': { zone: 2, hub: 'HCM' },
  'Tiền Giang': { zone: 2, hub: 'HCM' },
  'Vũng Tàu': { zone: 2, hub: 'HCM' },
  'Huế': { zone: 3, hub: 'DN' },
  'Đà Lạt': { zone: 3, hub: 'HCM' },
  'Buôn Ma Thuột': { zone: 3, hub: 'HCM' },
  'Sơn La': { zone: 4, hub: 'HN' },
  'Điện Biên': { zone: 4, hub: 'HN' },
  'Hà Giang': { zone: 4, hub: 'HN' },
  'Lai Châu': { zone: 4, hub: 'HN' },
  'Cao Bằng': { zone: 4, hub: 'HN' },
};

// Shipping configs by zone
const SHIPPING_METHODS = (zone) => {
  const configs = {
    1: [
      {
        id: 'express',
        icon: ZapIcon,
        label: 'Hỏa tốc',
        subtitle: 'Giao trong ngày',
        minHours: 2, maxHours: 4,
        unit: 'hours',
        price: 35000,
        cutoff: 16, // must order before 4pm
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        activeBorder: 'border-red-600',
        dot: 'bg-red-600',
      },
      {
        id: 'fast',
        icon: TruckIcon,
        label: 'Nhanh',
        subtitle: 'Giao ngay hôm sau',
        minDays: 1, maxDays: 1,
        unit: 'days',
        price: 20000,
        cutoff: 23,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-600',
        dot: 'bg-blue-600',
      },
      {
        id: 'standard',
        icon: ClockIcon,
        label: 'Tiêu chuẩn',
        subtitle: 'Tiết kiệm',
        minDays: 2, maxDays: 3,
        unit: 'days',
        price: 0,
        cutoff: 23,
        color: 'text-slate-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        activeBorder: 'border-slate-600',
        dot: 'bg-slate-600',
      },
    ],
    2: [
      {
        id: 'fast',
        icon: TruckIcon,
        label: 'Nhanh',
        subtitle: 'Giao 1–2 ngày',
        minDays: 1, maxDays: 2,
        unit: 'days',
        price: 30000,
        cutoff: 23,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-600',
        dot: 'bg-blue-600',
      },
      {
        id: 'standard',
        icon: ClockIcon,
        label: 'Tiêu chuẩn',
        subtitle: 'Tiết kiệm',
        minDays: 3, maxDays: 5,
        unit: 'days',
        price: 0,
        cutoff: 23,
        color: 'text-slate-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        activeBorder: 'border-slate-600',
        dot: 'bg-slate-600',
      },
    ],
    3: [
      {
        id: 'fast',
        icon: TruckIcon,
        label: 'Nhanh',
        subtitle: 'Giao 2–3 ngày',
        minDays: 2, maxDays: 3,
        unit: 'days',
        price: 35000,
        cutoff: 23,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-600',
        dot: 'bg-blue-600',
      },
      {
        id: 'standard',
        icon: ClockIcon,
        label: 'Tiêu chuẩn',
        subtitle: 'Tiết kiệm',
        minDays: 4, maxDays: 7,
        unit: 'days',
        price: 0,
        cutoff: 23,
        color: 'text-slate-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        activeBorder: 'border-slate-600',
        dot: 'bg-slate-600',
      },
    ],
    4: [
      {
        id: 'standard',
        icon: ClockIcon,
        label: 'Tiêu chuẩn',
        subtitle: 'Vùng xa',
        minDays: 5, maxDays: 10,
        unit: 'days',
        price: 45000,
        cutoff: 23,
        color: 'text-slate-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        activeBorder: 'border-slate-600',
        dot: 'bg-slate-600',
      },
    ],
  };
  return configs[zone] || configs[3];
};

// ─── Date helpers ────────────────────────────────────────────────────────
const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_FULL  = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const addBusinessDays = (date, days) => {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++; // skip Sunday
  }
  return d;
};

const formatDate = (date) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return `${DAY_FULL[date.getDay()]}, ${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}`;
};

const estimateDelivery = (method, now = new Date()) => {
  const hour = now.getHours();

  if (method.unit === 'hours') {
    // Hỏa tốc - check cutoff
    if (hour >= method.cutoff) {
      // Past cutoff, deliver next business day
      const next = addBusinessDays(now, 1);
      return { label: `Ngày mai, ${formatDate(next)}`, note: 'Đặt hàng sau ' + method.cutoff + ':00' };
    }
    const arrivalHour = hour + method.maxHours;
    const eta = new Date(now);
    eta.setHours(arrivalHour, 0, 0, 0);
    const etaMin = new Date(now);
    etaMin.setHours(hour + method.minHours, 0, 0, 0);
    const fmtHour = (h) => `${h}:00`;
    return {
      label: `Hôm nay, ${fmtHour(etaMin.getHours())}–${fmtHour(eta.getHours())}`,
      note: `Đặt trước ${method.cutoff}:00 để nhận hôm nay`,
    };
  }

  // Days-based
  const baseDate = now;
  let minDate = addBusinessDays(baseDate, method.minDays);
  let maxDate = addBusinessDays(baseDate, method.maxDays);

  if (method.minDays === method.maxDays) {
    return { label: formatDate(minDate), note: '' };
  }
  return { label: `${formatDate(minDate)} – ${formatDate(maxDate)}`, note: '' };
};

const formatPrice = (n) =>
  n === 0 ? 'Miễn phí' : n.toLocaleString('vi-VN') + 'đ';

// ─── Component ────────────────────────────────────────────────────────────
const DeliveryEstimator = ({ compact = false }) => {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();
  const zone = selectedProvince ? PROVINCES[selectedProvince]?.zone : null;
  const methods = zone ? SHIPPING_METHODS(zone) : [];

  const handleProvince = (prov) => {
    setSelectedProvince(prov);
    setIsOpen(false);
    // Auto-select first method
    const z = PROVINCES[prov]?.zone;
    if (z) {
      const m = SHIPPING_METHODS(z);
      setSelectedMethod(m[0]?.id || '');
    }
  };

  const currentMethod = methods.find(m => m.id === selectedMethod);
  const eta = currentMethod ? estimateDelivery(currentMethod, now) : null;
  const hub = selectedProvince ? PROVINCES[selectedProvince]?.hub : null;

  return (
    <div className={`bg-white rounded-3xl border-2 border-gray-50 overflow-hidden shadow-sm ${compact ? '' : 'shadow-md'}`}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-50 bg-gray-50/50">
        <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center shrink-0">
          <TruckIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Ước tính thời gian giao hàng</p>
          {selectedProvince && (
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Kho: {hub === 'HN' ? 'Hà Nội' : hub === 'HCM' ? 'TP. HCM' : 'Đà Nẵng'} → {selectedProvince}</p>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Province selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tỉnh/Thành phố nhận hàng</label>
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full h-12 px-4 bg-gray-50 border-2 border-gray-50 hover:border-gray-200 focus:border-black rounded-2xl flex items-center justify-between transition-all font-bold text-slate-900 text-sm outline-none"
            >
              <div className="flex items-center gap-2.5">
                <MapPinIcon className="w-4 h-4 text-gray-400" />
                <span className={selectedProvince ? 'text-slate-900' : 'text-gray-400'}>
                  {selectedProvince || 'Chọn tỉnh/thành phố...'}
                </span>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                {Object.keys(PROVINCES).map(prov => (
                  <button
                    key={prov}
                    onClick={() => handleProvince(prov)}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors flex items-center justify-between ${
                      selectedProvince === prov
                        ? 'bg-slate-950 text-white'
                        : 'hover:bg-gray-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-3.5 h-3.5 opacity-50" />
                      {prov}
                    </div>
                    {selectedProvince === prov && <CheckIcon className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shipping methods */}
        {methods.length > 0 && (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phương thức vận chuyển</label>
            <div className="space-y-2.5">
              {methods.map(method => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const delivery = estimateDelivery(method, now);
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all hover:scale-[1.01] ${
                      isSelected
                        ? `${method.bg} ${method.activeBorder} shadow-sm`
                        : `bg-white ${method.border} hover:border-gray-300`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? method.bg : 'bg-gray-100'}`}>
                          <Icon className={`w-4.5 h-4.5 ${isSelected ? method.color : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${isSelected ? method.color : 'text-slate-700'}`}>{method.label}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? method.bg : 'bg-gray-100'} ${isSelected ? method.color : 'text-gray-400'}`}>{method.subtitle}</span>
                          </div>
                          <p className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-slate-600' : 'text-gray-400'}`}>
                            Dự kiến: {delivery.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-sm font-black ${method.price === 0 ? 'text-green-600' : isSelected ? method.color : 'text-slate-600'}`}>
                          {formatPrice(method.price)}
                        </span>
                        {isSelected && (
                          <div className={`w-5 h-5 ${method.dot} rounded-full flex items-center justify-center mt-1 ml-auto`}>
                            <CheckIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result card */}
        {eta && currentMethod && (
          <div className={`${currentMethod.bg} border-2 ${currentMethod.activeBorder} rounded-2xl p-5`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${currentMethod.dot} rounded-xl flex items-center justify-center shrink-0 shadow-md`}>
                {React.createElement(currentMethod.icon, { className: 'w-5 h-5 text-white' })}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest ${currentMethod.color} mb-1`}>
                  Dự kiến giao
                </p>
                <p className="text-lg font-black text-slate-900 leading-tight">{eta.label}</p>
                {eta.note && (
                  <p className="text-[11px] text-gray-500 font-bold mt-1.5 italic">* {eta.note}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Còn hàng, sẵn sàng giao
                  </span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block" />
                    Đóng gói trong 1h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedProvince && (
          <div className="py-4 text-center">
            <MapPinIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-bold">Chọn tỉnh/thành phố để xem lịch giao hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryEstimator;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';

// ─── Icons ────────────────────────────────────────────────────────────────────
const CopyIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
const CheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
const UsersIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const GiftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
);
const ShareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
);
const StarIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const steps = [
  {
    num: '01',
    title: 'Chia sẻ mã của bạn',
    desc: 'Gửi mã giới thiệu cá nhân hoặc đường dẫn đặc biệt đến bạn bè.',
    icon: <ShareIcon className="w-7 h-7" />,
  },
  {
    num: '02',
    title: 'Bạn bè mua hàng',
    desc: 'Bạn bè đăng ký và hoàn thành đơn hàng đầu tiên tại PhoneSin.',
    icon: <UsersIcon className="w-7 h-7" />,
  },
  {
    num: '03',
    title: 'Cả hai nhận quà',
    desc: 'Bạn nhận Voucher 500.000đ, bạn bè được giảm ngay 200.000đ.',
    icon: <GiftIcon className="w-7 h-7" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const ReferralPage = () => {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCode: '',
    totalInvited: 0,
    pendingCount: 0,
    completedCount: 0,
    totalEarned: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get('/api/referral/stats'),
          api.get('/api/referral/history')
        ]);
        setStats(statsRes.data.data);
        setHistory(historyRes.data.data);
      } catch (err) {
        console.error('Failed to load referral data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${stats.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const formatPrice = (n) =>
    (n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

  return (
    <div className="min-h-screen bg-gray-50 pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Breadcrumbs />

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="relative bg-slate-950 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-10 w-72 h-72 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full pointer-events-none" />

        <div className="relative w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-600/30 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-8">
            <StarIcon className="w-3.5 h-3.5" />
            Chương trình thành viên
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            Mời bạn,<br />
            <span className="text-red-500">Nhận quà!</span>
          </h1>
          <p className="text-white/50 font-bold max-w-xl mx-auto leading-relaxed text-lg">
            Giới thiệu bạn bè mua sắm tại PhoneSin và cùng nhau hưởng ưu đãi đặc biệt. Không giới hạn số lần giới thiệu.
          </p>
        </div>
      </div>

      <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pr-16 md:pr-24 pt-12">

        {/* ── Stats ───────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {[
              { label: 'Bạn bè đã mời', value: stats.completedCount, suffix: ' người', color: 'text-blue-600' },
              { label: 'Đang chờ xác nhận', value: stats.pendingCount, suffix: ' người', color: 'text-amber-500' },
              { label: 'Quà đã nhận', value: formatPrice(stats.totalEarned), suffix: '', color: 'text-green-600' },
              { label: 'Hạng mức thưởng', value: stats.completedCount >= 5 ? 'VIP' : 'Standard', suffix: '', color: 'text-red-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl p-7 shadow-xl border border-gray-50 text-center">
                <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}{stat.suffix}</p>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Code widget */}
            <div className="bg-white rounded-[40px] shadow-2xl border border-gray-50 overflow-hidden">
              <div className="bg-slate-950 px-10 py-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none" />
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.35em] mb-3">Mã giới thiệu của bạn</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-xl bg-red-500/30 rounded-2xl" />
                    <div className="relative bg-white/10 border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl">
                      <span className="text-3xl font-black text-white tracking-[0.3em] italic">
                        {stats.referralCode || 'PHONESIN...'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                      codeCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-red-600 hover:bg-white hover:text-black text-white'
                    }`}
                  >
                    {codeCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    {codeCopied ? 'Đã sao chép!' : 'Sao chép mã'}
                  </button>
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-5">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Hoặc chia sẻ đường dẫn đặc biệt</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 h-14 bg-gray-50 border-2 border-gray-50 rounded-2xl flex items-center px-5 overflow-hidden">
                    <span className="text-sm font-bold text-gray-400 truncate">{referralLink}</span>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap ${
                      linkCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-950 hover:bg-red-600 text-white'
                    }`}
                  >
                    {linkCopied ? 'Đã sao chép!' : 'Sao chép link'}
                  </button>
                </div>

                {/* Social share */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Chia sẻ qua:</span>
                  <button
                    title="Chia sẻ Facebook"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </button>
                  <button
                    title="Chia sẻ Zalo"
                    onClick={() => window.open(`https://zalo.me/share?url=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="w-11 h-11 bg-sky-500 text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg font-black text-xs"
                  >
                    Za
                  </button>
                  <button
                    title="Chia sẻ X (Twitter)"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=Mua%20điện%20thoại%20tại%20PhoneSin%20siêu%20rẻ!%20Dùng%20mã%20của%20mình%20nhé&url=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="w-11 h-11 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.464 -2.464l6.768 -6.768"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-[40px] shadow-xl border border-gray-50 p-10">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic mb-8 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                Cách thức hoạt động
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {steps.map((step, i) => (
                  <div key={i} className="relative flex flex-col">
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full w-full z-10 -translate-x-1/2">
                        <ArrowRightIcon className="w-5 h-5 text-gray-200 mx-auto" />
                      </div>
                    )}
                    <div className="w-16 h-16 bg-slate-950 text-white rounded-[25px] flex items-center justify-center mb-5 shadow-xl">
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2">Bước {step.num}</span>
                    <h3 className="text-base font-black text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral history */}
            <div className="bg-white rounded-[40px] shadow-xl border border-gray-50 overflow-hidden">
              <div className="px-10 py-7 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                  Lịch sử giới thiệu
                </h2>
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{history.length} người</span>
              </div>

              {history.length === 0 ? (
                <div className="py-20 text-center">
                  <UsersIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase italic text-sm">Bạn chưa giới thiệu ai cả. Hãy bắt đầu ngay!</p>
                </div>
              ) : (
                <div>
                  {history.map((item, i) => (
                    <div
                      key={item._id}
                      className={`flex items-center justify-between gap-4 px-10 py-6 transition-colors hover:bg-gray-50/60 ${i < history.length - 1 ? 'border-b border-gray-50' : ''}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-500 text-lg">
                          {(item.referee?.fullName || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.referee?.fullName || 'Người dùng ẩn'}</p>
                          <p className="text-xs font-bold text-gray-400 italic">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        {item.status === 'completed' ? (
                          <span className="text-green-600 font-black text-sm">+{formatPrice(item.rewardAmount)}</span>
                        ) : (
                          <span className="text-amber-500 font-bold text-sm italic">Đang chờ...</span>
                        )}
                        <span
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.status === 'completed' ? 'Thành công' : 'Chờ xác nhận'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────────── */}
          <div className="space-y-8">

            {/* Reward tiers */}
            <div className="bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden text-white">
              <div className="px-8 py-7 border-b border-white/10">
                <h2 className="text-base font-black uppercase tracking-widest italic flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-red-500" />
                  Mức thưởng
                </h2>
              </div>
              <div className="p-8 space-y-5">
                {[
                  { min: 1, max: 4, label: 'Standard', bonus: '500.000đ / người', color: 'bg-gray-600' },
                  { min: 5, max: 9, label: 'Silver', bonus: '700.000đ / người', color: 'bg-gray-400' },
                  { min: 10, max: 19, label: 'Gold', bonus: '1.000.000đ / người', color: 'bg-amber-400' },
                  { min: 20, max: null, label: 'Diamond', bonus: '1.500.000đ / người', color: 'bg-blue-400' },
                ].map((tier, i) => {
                  const isActive = stats.completedCount >= tier.min && (tier.max === null || stats.completedCount <= tier.max);
                  return (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive ? 'bg-white/10 border border-white/20' : 'opacity-50'}`}>
                      <div className={`w-3 h-3 rounded-full ${tier.color} ${isActive ? 'shadow-lg' : ''}`} />
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase tracking-wider">{tier.label}</p>
                        <p className="text-xs text-white/50 font-bold">
                          {tier.max ? `${tier.min}–${tier.max} người` : `${tier.min}+ người`}
                        </p>
                      </div>
                      <span className="text-xs font-black text-red-400">{tier.bonus}</span>
                    </div>
                  );
                })}
              </div>
              <div className="px-8 pb-8">
                <div className="bg-red-600/20 border border-red-600/30 rounded-2xl p-5">
                  <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-1">Hạng hiện tại của bạn</p>
                  <p className="text-2xl font-black text-white uppercase italic">
                    {stats.completedCount >= 20 ? 'Diamond' : stats.completedCount >= 10 ? 'Gold' : stats.completedCount >= 5 ? 'Silver' : 'Standard'}
                  </p>
                  <p className="text-xs text-white/40 font-bold mt-2">
                    {stats.completedCount >= 20 ? 'Bạn đã đạt hạng cao nhất! 🎉' : `Còn ${stats.completedCount >= 10 ? 20 - stats.completedCount : stats.completedCount >= 5 ? 10 - stats.completedCount : 5 - stats.completedCount} người để lên hạng tiếp theo`}
                  </p>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-[40px] shadow-xl border border-gray-50 p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5 italic">📋 Điều kiện áp dụng</h3>
              <ul className="space-y-3">
                {[
                  'Bạn bè phải đăng ký tài khoản mới (chưa từng mua).',
                  'Hoàn thành đơn hàng đầu tiên trị giá từ 500.000đ trở lên.',
                  'Phần thưởng được cộng vào ví điện tử trong vòng 3 ngày làm việc.',
                  'Không áp dụng đồng thời với các khuyến mãi đặc biệt khác.',
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-500 font-medium leading-relaxed">
                    <span className="text-red-500 font-black mt-0.5 shrink-0">•</span>
                    {term}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="mt-6 flex items-center gap-2 text-xs font-black text-blue-600 hover:text-black transition-colors uppercase tracking-widest">
                Hỏi thêm về chương trình <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;

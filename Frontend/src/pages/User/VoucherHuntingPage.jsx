import React, { useState, useEffect, useRef } from 'react';
import { Zap, Ticket, Check, Camera, Loader2, ChevronRight, ChevronLeft, Clock, X } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const VoucherHuntingPage = () => {
    const { user } = useAuth();
    const { formatPrice } = useLanguage();
    const [huntedList, setHuntedList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMission, setActiveMission] = useState(null);
    const [missionStep, setMissionStep] = useState('idle');
    const [missionProgress, setMissionProgress] = useState(0);
    const [proofImage, setProofImage] = useState('');
    const [isUploadingProof, setIsUploadingProof] = useState(false);

    // Banner state
    const [banners, setBanners] = useState([]);
    const [activeBanner, setActiveBanner] = useState(0);
    const bannerTimer = useRef(null);

    const loadBanners = async () => {
        try {
            const res = await api.get('/api/banners?targetPage=Trang Săn Voucher');
            setBanners(res.data?.data || []);
        } catch (err) {
            console.error('Failed to load banners:', err);
        }
    };

    const loadHuntedVouchers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/voucher/hunted-list');
            setHuntedList(response.data?.data || []);
        } catch (err) {
            console.error('Failed to load hunted vouchers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadHuntedVouchers();
        loadBanners();
    }, []);

    // Auto-rotate banners
    useEffect(() => {
        if (banners.length <= 1) return;
        bannerTimer.current = setInterval(() => {
            setActiveBanner(prev => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(bannerTimer.current);
    }, [banners.length]);

    const handleStartHunt = (voucher) => {
        if (!user) {
            alert('Vui lòng đăng nhập để săn voucher!');
            return;
        }
        setActiveMission(voucher);
        setMissionStep('idle');
        setMissionProgress(0);
        setProofImage('');
    };

    const startMissionProgress = () => {
        setMissionStep('progress');
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setMissionProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setMissionStep('success');
            }
        }, 150);
    };

    const handleUploadProof = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingProof(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/api/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProofImage(response.data.url);
        } catch (err) {
            alert('Lỗi tải ảnh lên: ' + getApiErrorMessage(err));
        } finally {
            setIsUploadingProof(false);
        }
    };

    const handleClaimVoucher = async () => {
        if (!proofImage) {
            alert('Vui lòng tải lên minh chứng hoàn thành nhiệm vụ!');
            return;
        }
        try {
            const response = await api.post('/api/voucher/hunt', { 
                voucherId: activeMission._id,
                proofImage: proofImage
            });
            alert(response.data.message);
            setActiveMission(null);
            setProofImage('');
            loadHuntedVouchers();
        } catch (err) {
            alert(getApiErrorMessage(err));
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20">
            <div className="max-w-[1450px] mx-auto px-4">
                {/* Banner Carousel */}
                {banners.length > 0 && (
                    <div className="mb-10 relative w-full overflow-hidden rounded-[40px] shadow-2xl" style={{ height: '500px' }}>
                        {banners.map((banner, idx) => (
                            <div
                                key={banner._id}
                                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                    idx === activeBanner ? 'opacity-100 translate-x-0' : idx < activeBanner ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                                }`}
                                style={{ backgroundColor: banner.bgColor || '#1e293b' }}
                            >
                                {banner.imageUrl ? (
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="absolute inset-0 w-full h-full object-fill"
                                    />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                                        <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-16">
                                            {banner.badgeText && (
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full w-fit mb-4">
                                                    <Zap size={12} className="text-amber-400" fill="currentColor" />
                                                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">{banner.badgeText}</span>
                                                </div>
                                            )}
                                            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-3" style={{ color: banner.textColor || '#fff' }}>
                                                {banner.title}
                                            </h2>
                                            {banner.subtitle && (
                                                <p className="text-sm font-medium opacity-80 max-w-lg" style={{ color: banner.textColor || '#fff' }}>
                                                    {banner.subtitle}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {/* Prev / Next buttons */}
                        {banners.length > 1 && (
                            <>
                                <button
                                    onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(p => (p - 1 + banners.length) % banners.length); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(p => (p + 1) % banners.length); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all text-white"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}

                        {/* Dots */}
                        {banners.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                {banners.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(i); }}
                                        className={`h-1.5 rounded-full transition-all ${
                                            i === activeBanner ? 'w-8 bg-amber-400' : 'w-3 bg-white/40'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Compact Header Below Banner */}
                <div className="flex justify-between items-center mb-10 px-4">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Săn Voucher</h1>
                    <Link to="/my-vouchers" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl hover:-translate-y-1">
                        <Ticket size={22} />
                        Ví Voucher của tôi
                    </Link>
                </div>

                {/* Voucher Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Đang tải danh sách thử thách...</p>
                    </div>
                ) : huntedList.length > 0 ? (
                    <div className="w-full bg-white rounded-[32px] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                        <div className="max-h-[520px] overflow-y-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b-2 border-slate-200">
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs">#</th>
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs">Mức Giảm</th>
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs">Nhiệm Vụ</th>
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs">Đơn Tối Thiểu</th>
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs">Thời Hạn</th>
                                    <th className="py-5 px-6 font-black text-slate-500 uppercase tracking-widest text-xs text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const sorted = [...huntedList].sort((a, b) => {
                                        const valA = a.discountType === 'percentage' ? a.discountValue * 1000000 : a.discountValue;
                                        const valB = b.discountType === 'percentage' ? b.discountValue * 1000000 : b.discountValue;
                                        return valB - valA;
                                    });
                                    const maxId = sorted[0]?._id;

                                    return sorted.map((v, idx) => {
                                        const isMax = v._id === maxId;
                                        return (
                                            <tr key={v._id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${isMax ? 'bg-red-50/40' : ''}`}>
                                                <td className="py-4 px-6 text-slate-400 font-bold text-sm">{idx + 1}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        {isMax && <div className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce uppercase shrink-0">Hot</div>}
                                                        <span className={`text-2xl font-black italic tracking-tighter ${isMax ? 'text-red-600' : 'text-slate-900'}`}>
                                                            {v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="font-bold text-slate-700 text-sm max-w-sm">{v.missionTask || 'Nhiệm vụ bí ẩn từ Phonesin'}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-slate-900">{formatPrice(v.minOrderValue)}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-slate-500">{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Sắp tới'}</span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button 
                                                        onClick={() => handleStartHunt(v)}
                                                        className={`px-6 py-2.5 font-black rounded-xl text-[12px] uppercase tracking-wider transition-all shadow-lg active:scale-95 inline-flex items-center justify-center gap-2 hover:-translate-y-0.5 ${isMax ? 'bg-red-600 text-white hover:bg-black shadow-red-500/20' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-900/10'}`}
                                                    >
                                                        Săn ngay
                                                        <ChevronRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                        </div>{/* end max-h scroll */}
                        </div>{/* end overflow-x-auto */}
                        {/* Footer: tổng số voucher */}
                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-[32px] flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tổng cộng: {huntedList.length} ưu đãi</span>
                            <span className="text-xs text-slate-400">Sắp xếp theo mức giảm cao nhất</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-gray-100 shadow-xl">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic">Hiện không có sự kiện nào</h2>
                        <p className="text-gray-500 font-medium italic">Vui lòng quay lại sau nhé!</p>
                    </div>
                )}
            </div>

            {/* Mission Modal */}
            {activeMission && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-fadeIn">
                    <div className="bg-white rounded-[48px] p-10 w-full max-w-lg relative overflow-hidden shadow-2xl animate-modalSlideIn">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-4 border-emerald-500/20 rotate-12 shadow-2xl">
                                <Zap size={48} className="text-emerald-400 animate-pulse -rotate-12" />
                            </div>
                            
                            <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Thử thách thợ săn</h3>
                            <div className="h-1.5 w-24 bg-emerald-500 mx-auto mb-8 rounded-full"></div>
                            
                            <p className="text-slate-600 text-xl font-bold mb-10 leading-relaxed px-4">
                                {activeMission.missionTask}
                            </p>

                            {missionStep === 'idle' && (
                                <button 
                                    onClick={() => startMissionProgress()}
                                    className="w-full py-6 bg-slate-900 text-white font-black rounded-[28px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[16px] flex items-center justify-center gap-3"
                                >
                                    Chấp nhận thử thách
                                    <ChevronRight size={24} />
                                </button>
                            )}

                            {missionStep === 'progress' && (
                                <div className="space-y-6">
                                    <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden p-1">
                                        <div 
                                            className="h-full bg-emerald-500 transition-all duration-100 ease-linear rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${missionProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Đang xác thực hệ thống...</p>
                                        <p className="text-slate-900 font-black text-base">{missionProgress}%</p>
                                    </div>
                                </div>
                            )}

                            {missionStep === 'success' && (
                                <div className="animate-scaleIn space-y-8">
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/50">
                                        <Check size={32} className="text-white" strokeWidth={4} />
                                    </div>
                                    <p className="text-slate-900 text-2xl font-black uppercase tracking-tight">Nhiệm vụ hoàn tất!</p>
                                    
                                    <div className="bg-slate-50 border border-gray-100 rounded-[32px] p-8">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 text-center italic">Gửi minh chứng hoàn thành</p>
                                        
                                        {!proofImage ? (
                                            <label className="flex flex-col items-center justify-center gap-4 py-12 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-50 transition-all group">
                                                {isUploadingProof ? (
                                                    <Loader2 size={48} className="text-emerald-500 animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                            <Camera size={32} className="text-slate-400 group-hover:text-emerald-500" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-slate-900 font-black text-[15px]">Tải ảnh minh chứng</p>
                                                            <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase">Screenshot, ảnh chụp thực tế...</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={isUploadingProof} />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-3xl overflow-hidden border-4 border-emerald-500 shadow-2xl">
                                                <img src={proofImage} alt="Minh chứng" className="w-full h-56 object-cover" />
                                                <button 
                                                    onClick={() => setProofImage('')}
                                                    className="absolute top-4 right-4 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-700 transition-all"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <div className="absolute inset-x-0 bottom-0 bg-emerald-500 py-2 text-center">
                                                    <p className="text-[11px] font-black text-white uppercase tracking-widest">Sẵn sàng gửi duyệt</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => handleClaimVoucher()}
                                        disabled={!proofImage || isUploadingProof}
                                        className="w-full py-6 bg-slate-900 text-white font-black rounded-[28px] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[16px] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                    >
                                        Gửi minh chứng & Nhận mã
                                        <Ticket size={24} />
                                    </button>
                                </div>
                            )}

                            <button 
                                onClick={() => setActiveMission(null)}
                                className="mt-10 text-slate-400 text-[12px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Hủy bỏ thử thách
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherHuntingPage;

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Ticket, Check, Loader2, ChevronRight, ChevronLeft, Clock, ShieldCheck, Users, AlertTriangle, Gift, Camera, X } from 'lucide-react';
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
    const [missionStep, setMissionStep] = useState('idle'); // 'idle' | 'upload' | 'success'
    const [isClaiming, setIsClaiming] = useState(false);
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
        setProofImage('');
    };

    const handleUploadProof = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingProof(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/api/upload/image', formData, {
                headers: { 'Content-Type': undefined }
            });
            setProofImage(response.data.url);
        } catch (err) {
            alert('Lỗi tải ảnh: ' + getApiErrorMessage(err));
        } finally {
            setIsUploadingProof(false);
        }
    };

    const handleClaimVoucher = async () => {
        if (!proofImage) {
            alert('Vui lòng tải lên ảnh minh chứng hoàn thành nhiệm vụ!');
            return;
        }
        setIsClaiming(true);
        try {
            await api.post('/api/voucher/hunt', {
                voucherId: activeMission._id,
                proofImage,
            });
            setMissionStep('success');
            setTimeout(() => loadHuntedVouchers(), 500);
        } catch (err) {
            alert(getApiErrorMessage(err));
            setActiveMission(null);
        } finally {
            setIsClaiming(false);
        }
    };

    const getRemainingSlots = (v) => {
        if (!v.huntLimit || v.huntLimit === 0) return null;
        return Math.max(0, v.huntLimit - (v.huntedCount || 0));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-12 pb-20 selection:bg-emerald-500 selection:text-white">
            <div className="max-w-[1450px] mx-auto px-4">
                {/* Banner Carousel */}
                {banners.length > 0 && (
                    <div className="mb-14 relative w-full overflow-hidden rounded-[48px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] group" style={{ height: '540px' }}>
                        {banners.map((banner, idx) => (
                            <div
                                key={banner._id}
                                className={`absolute inset-0 transition-all duration-1000 ${
                                    idx === activeBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                                }`}
                                style={{ backgroundColor: banner.bgColor || '#1e293b' }}
                            >
                                {banner.imageUrl ? (
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent flex flex-col justify-center px-12 md:px-24"
                                     style={{ 
                                        alignItems: banner.titleAlign === 'center' ? 'center' : banner.titleAlign === 'right' ? 'flex-end' : 'flex-start',
                                        textAlign: banner.titleAlign || 'left'
                                     }}>
                                    <div className={`transition-all duration-700 delay-300 ${idx === activeBanner ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                         style={{ display: 'flex', flexDirection: 'column', alignItems: banner.titleAlign === 'center' ? 'center' : banner.titleAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                                        {banner.badgeText && (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full w-fit mb-6">
                                                <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                                                <span className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em]">{banner.badgeText}</span>
                                            </div>
                                        )}
                                        {banner.title && (
                                            <h2 className="text-4xl md:text-6xl uppercase tracking-tighter leading-none mb-4 max-w-2xl drop-shadow-2xl" 
                                                style={{ 
                                                    color: banner.textColor || '#1e293b',
                                                    fontWeight: banner.titleIsBold ? '900' : '500',
                                                    fontStyle: banner.titleIsItalic ? 'italic' : 'normal'
                                                }}>
                                                {banner.title}
                                            </h2>
                                        )}
                                        {banner.subtitle && (
                                            <p className="text-lg font-medium opacity-90 max-w-xl leading-relaxed drop-shadow-lg" 
                                               style={{ color: banner.textColor || '#1e293b' }}>
                                                {banner.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {banners.length > 1 && (
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                                {banners.map((_, dotIdx) => (
                                    <button
                                        key={dotIdx}
                                        onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(dotIdx); }}
                                        className={`transition-all duration-500 rounded-full ${
                                            dotIdx === activeBanner 
                                            ? 'w-12 h-2 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]' 
                                            : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {banners.length > 1 && (
                            <>
                                <button 
                                    onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(prev => (prev - 1 + banners.length) % banners.length); }}
                                    className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 z-30 shadow-xl"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={() => { clearInterval(bannerTimer.current); setActiveBanner(prev => (prev + 1) % banners.length); }}
                                    className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-blue-600 z-30 shadow-xl"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-1 bg-emerald-500 rounded-full" />
                            <span className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">Đặc quyền thợ săn</span>
                        </div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900">
                            Săn Voucher <span className="text-emerald-500">Mỗi Ngày</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Hoàn thành nhiệm vụ để nhận những ưu đãi cực khủng từ PhoneSin.</p>
                    </div>
                    
                    <Link to="/my-vouchers" className="group px-8 py-4 bg-blue-600 text-white font-bold rounded-[20px] hover:bg-amber-500 transition-all flex items-center gap-4 shadow-2xl hover:shadow-amber-500/20 active:scale-95">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                            <Ticket size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] opacity-80 uppercase font-black tracking-widest">Trung tâm phần thưởng</p>
                            <p className="text-lg">Ví Voucher của tôi</p>
                        </div>
                        <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Voucher Table */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[48px] shadow-xl border border-slate-100">
                        <Loader2 size={64} className="text-emerald-500 animate-spin mb-6" />
                        <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm animate-pulse">Đang tìm kiếm mục tiêu...</p>
                    </div>
                ) : huntedList.length > 0 ? (
                    <div className="w-full bg-white rounded-[40px] shadow-[0_32px_64px_-24px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Ưu Đãi</th>
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Nhiệm Vụ</th>
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Yêu Cầu</th>
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Số Lượng</th>
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Thời Hạn</th>
                                        <th className="py-8 px-8 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {huntedList.sort((a, b) => {
                                        const valA = a.discountType === 'percentage' ? a.discountValue * 1000 : a.discountValue;
                                        const valB = b.discountType === 'percentage' ? b.discountValue * 1000 : b.discountValue;
                                        return valB - valA;
                                    }).filter(v => v.userStatus !== 'approved').map((v, idx) => {
                                        const remaining = getRemainingSlots(v);
                                        const isSoldOut = remaining !== null && remaining <= 0;
                                        return (
                                            <tr key={v._id} className={`group transition-all duration-300 ${isSoldOut ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50/80'}`}>
                                                <td className="py-8 px-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSoldOut ? 'bg-slate-300 text-white' : idx === 0 ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-blue-500 text-white'}`}>
                                                            <Ticket size={24} />
                                                        </div>
                                                        <div>
                                                            <p className={`text-3xl font-black tracking-tighter ${isSoldOut ? 'text-slate-400' : idx === 0 ? 'text-red-600' : 'text-slate-900'}`}>
                                                                {v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GIẢM TỐI ĐA {formatPrice(v.maxDiscountValue || 0)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-8">
                                                    <div className="max-w-xs">
                                                        <p className="font-bold text-slate-800 text-base leading-tight group-hover:text-emerald-600 transition-colors">{v.missionTask || 'Thử thách bí ẩn'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-8">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-lg">{formatPrice(v.minOrderValue)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ĐƠN TỐI THIỂU</p>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-8">
                                                    {v.huntLimit > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} className={remaining <= 5 ? 'text-red-500' : 'text-emerald-500'} />
                                                            <div>
                                                                <p className={`font-black text-sm ${isSoldOut ? 'text-red-500' : remaining <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                                                                    {isSoldOut ? 'Hết lượt' : `Còn ${remaining} suất`}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 font-bold">/ {v.huntLimit} tổng</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-emerald-500">
                                                            <Gift size={14} />
                                                            <span className="font-bold text-sm">Không giới hạn</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-8 px-8">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Clock size={16} />
                                                        <span className="text-sm font-bold">{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Sắp tới'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-8 px-8 text-right">
                                                    {isSoldOut ? (
                                                        <button disabled className="px-8 py-3.5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[11px] uppercase tracking-widest inline-flex items-center justify-center gap-3 cursor-not-allowed">
                                                            Hết lượt
                                                            <AlertTriangle size={16} />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleStartHunt(v)}
                                                            className={`px-8 py-3.5 font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all active:scale-95 inline-flex items-center justify-center gap-3 shadow-lg ${
                                                                idx === 0 
                                                                ? 'bg-red-600 text-white hover:bg-blue-700 shadow-red-500/10' 
                                                                : 'bg-blue-600 text-white hover:bg-amber-500 shadow-blue-500/10'
                                                            }`}
                                                        >
                                                            Săn Ngay
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white rounded-[48px] border border-slate-100 shadow-xl">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                            <Ticket size={48} className="text-slate-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Kho thử thách đang trống</h2>
                        <p className="text-slate-400 font-medium">Hãy quay lại sau để nhận những ưu đãi mới nhất.</p>
                    </div>
                )}
            </div>

            {/* Mission Modal */}
            {activeMission && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <div className="bg-amber-400 rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/40">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full -z-0 pointer-events-none" />
                        
                        <div className="relative z-10 px-6 pt-8 pb-8 flex flex-col items-center">
                            {missionStep === 'idle' ? (
                                <>
                                    {/* Icon */}
                                    <div className="relative mb-5">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <div className="relative w-16 h-16 bg-white rounded-[24px] flex items-center justify-center border-2 border-blue-500/30 rotate-12 shadow-xl">
                                            <Zap size={32} className="text-blue-600 fill-blue-600/20 -rotate-12" />
                                        </div>
                                    </div>
                                    <div className="text-center mb-5">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">Nhiệm vụ săn voucher</h3>
                                        <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full" />
                                    </div>
                                    <div className="mb-4 flex items-center gap-3 bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/40">
                                        <Ticket size={20} className="text-blue-700" />
                                        <p className="text-xl font-black text-slate-900">
                                            {activeMission.discountType === 'percentage'
                                                ? `Giảm ${activeMission.discountValue}%`
                                                : `Giảm ${formatPrice(activeMission.discountValue)}`}
                                        </p>
                                    </div>
                                    <div className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-[24px] p-5 mb-4 text-center shadow-inner">
                                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-[0.2em] mb-2">Nhiệm vụ cần hoàn thành</p>
                                        <p className="text-slate-900 text-base font-black leading-relaxed">"{activeMission.missionTask}"</p>
                                    </div>
                                    {activeMission.huntLimit > 0 && (
                                        <div className={`w-full mb-4 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-black ${
                                            getRemainingSlots(activeMission) <= 5 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white/30 text-blue-800 border border-white/40'
                                        }`}>
                                            <Users size={14} />
                                            Còn <strong>{getRemainingSlots(activeMission)}</strong> / {activeMission.huntLimit} suất
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setMissionStep('upload')}
                                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-3 group"
                                    >
                                        Chấp nhận thử thách
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button onClick={() => setActiveMission(null)} className="mt-4 text-blue-800 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-600 transition-all py-2 px-6 rounded-full hover:bg-white/20">
                                        Hủy bỏ
                                    </button>
                                </>
                            ) : missionStep === 'upload' ? (
                                <>
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
                                        <div className="relative w-14 h-14 bg-white rounded-[20px] flex items-center justify-center border-2 border-blue-500/30 rotate-12 shadow-xl">
                                            <Camera size={28} className="text-blue-600 -rotate-12" />
                                        </div>
                                    </div>
                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1">Gửi minh chứng</h3>
                                        <p className="text-blue-800 text-xs font-bold">Chụp màn hình hoặc ảnh bằng chứng hoàn thành nhiệm vụ</p>
                                        <div className="h-1.5 w-16 bg-blue-600 mx-auto rounded-full mt-2" />
                                    </div>
                                    {/* Upload area */}
                                    <div className="w-full mb-4">
                                        {!proofImage ? (
                                            <label className={`flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed rounded-[20px] cursor-pointer transition-all ${
                                                isUploadingProof ? 'border-blue-400 bg-white/20' : 'border-white/50 hover:border-blue-600 hover:bg-white/40'
                                            }`}>
                                                {isUploadingProof ? (
                                                    <Loader2 size={40} className="text-blue-600 animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                                            <Camera size={28} className="text-blue-600" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-slate-900 font-black text-sm">Nhấn để tải ảnh lên</p>
                                                            <p className="text-blue-700 text-[10px] font-bold uppercase tracking-widest mt-1">Screenshot, ảnh chụp...</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={isUploadingProof} />
                                            </label>
                                        ) : (
                                            <div className="relative rounded-[20px] overflow-hidden border-2 border-blue-600 shadow-xl">
                                                <img src={proofImage} alt="Minh chứng" className="w-full h-52 object-cover" />
                                                <button
                                                    onClick={() => setProofImage('')}
                                                    className="absolute top-3 right-3 w-9 h-9 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <X size={18} />
                                                </button>
                                                <div className="absolute inset-x-0 bottom-0 bg-blue-600/90 py-2 text-center">
                                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Ảnh đã sẵn sàng ✓</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleClaimVoucher}
                                        disabled={!proofImage || isClaiming}
                                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {isClaiming ? (
                                            <><Loader2 size={20} className="animate-spin" />Đang xác nhận...</>
                                        ) : (
                                            <><Ticket size={20} className="group-hover:rotate-12 transition-transform" />Nhận Voucher Ngay</>
                                        )}
                                    </button>
                                    <button onClick={() => { setMissionStep('idle'); setProofImage(''); }} className="mt-4 text-blue-800 text-[10px] font-black uppercase tracking-[0.2em] hover:text-red-600 transition-all py-2 px-6 rounded-full hover:bg-white/20">
                                        ← Quay lại
                                    </button>
                                </>
                            ) : (
                                /* Success State */
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-bounce">
                                        <Check size={48} className="text-white" strokeWidth={3} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">🎉 Nhận Voucher Thành Công!</h3>
                                        <p className="text-slate-800 font-medium">Voucher đã được thêm vào ví của bạn ngay lập tức.</p>
                                    </div>
                                    <div className="w-full bg-white/30 rounded-2xl p-4 text-center border border-white/40">
                                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-1">Mã voucher</p>
                                        <p className="text-2xl font-black text-slate-900 tracking-widest">{activeMission.code}</p>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full">
                                        <Link
                                            to="/my-vouchers"
                                            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-[0.1em] text-sm"
                                        >
                                            <ShieldCheck size={20} />
                                            Xem Ví Voucher
                                        </Link>
                                        <button
                                            onClick={() => setActiveMission(null)}
                                            className="w-full py-3 bg-white/30 text-slate-900 font-black rounded-2xl text-sm hover:bg-white/50 transition-all border border-white/40"
                                        >
                                            Tiếp tục săn
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoucherHuntingPage;

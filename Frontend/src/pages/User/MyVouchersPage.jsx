import React, { useState, useEffect } from 'react';
import { Ticket, Clock, Zap, ChevronRight, ShoppingBag, Loader2, Calendar, ShieldCheck, Tag } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';

const MyVouchersPage = () => {
    const { user } = useAuth();
    const { formatPrice } = useLanguage();
    const [vouchers, setVouchers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyVouchers = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const response = await api.get('/api/voucher/my-vouchers');
                setVouchers(response.data?.data || []);
            } catch (err) {
                console.error('Failed to load my vouchers:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyVouchers();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
                <div className="text-center max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">Yêu cầu đăng nhập</h2>
                    <p className="text-gray-500 font-medium mb-8">Vui lòng đăng nhập để xem danh sách voucher bạn đã săn được.</p>
                    <Link to="/login" className="inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-sm">Đăng nhập ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20">
            <div className="max-w-[1200px] mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Link to="/" className="text-gray-400 hover:text-slate-900 transition-colors">Trang chủ</Link>
                            <ChevronRight size={14} className="text-gray-300" />
                            <Link to="/hunt-vouchers" className="text-gray-400 hover:text-slate-900 transition-colors">Săn Voucher</Link>
                            <ChevronRight size={14} className="text-gray-300" />
                            <span className="text-slate-900 font-black">Ví Voucher</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Ví Voucher của tôi</h1>
                        <p className="text-slate-400 text-lg font-medium mt-4 uppercase tracking-[0.2em]">Kho ưu đãi đặc quyền đã thu thập</p>
                    </div>
                    <Link to="/hunt-vouchers" className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-3 active:scale-95">
                        <Zap size={20} fill="currentColor" />
                        Săn thêm mã mới
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] shadow-xl border border-gray-50">
                        <Loader2 size={48} className="text-slate-900 animate-spin mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Đang kiểm tra kho ưu đãi...</p>
                    </div>
                ) : vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {(() => {
                            const sorted = [...vouchers].sort((a, b) => {
                                const valA = a.discountType === 'percentage' ? a.discountValue * 1000000 : a.discountValue;
                                const valB = b.discountType === 'percentage' ? b.discountValue * 1000000 : b.discountValue;
                                return valB - valA;
                            });
                            const maxCode = sorted[0]?.code;

                            return vouchers.map((v, idx) => {
                                const isMax = v.code === maxCode;
                                return (
                                    <div key={idx} className={`bg-white rounded-[32px] overflow-hidden flex shadow-xl shadow-slate-200/50 border group hover:scale-[1.02] transition-all duration-300 ${
                                        isMax ? 'border-red-500/30' : 'border-blue-500/30'
                                    }`}>
                                        {/* Left Side - Decor */}
                                        <div className={`w-6 relative ${isMax ? 'bg-red-600' : 'bg-blue-600'}`}>
                                            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#f8fafc] rounded-full -translate-y-1/2"></div>
                                            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full -translate-y-1/2 border border-transparent shadow-inner"></div>
                                            
                                            {/* Ticket Holes */}
                                            <div className="absolute inset-y-0 right-0 flex flex-col justify-around py-4">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="w-2 h-2 bg-white rounded-full -mr-1"></div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="flex-1 p-8 flex flex-col xl:flex-row items-center gap-8 relative overflow-hidden">
                                            {isMax && (
                                                <div className="absolute top-0 right-0 bg-red-600 text-white px-6 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg animate-pulse">
                                                    Ưu đãi lớn nhất
                                                </div>
                                            )}
                                            
                                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border-2 group-hover:rotate-12 transition-all duration-500 shrink-0 ${
                                                isMax ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                                            }`}>
                                                <Tag size={40} className={isMax ? 'text-red-500' : 'text-blue-500'} />
                                            </div>
                                            
                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                                    <span className={`text-2xl font-black uppercase italic tracking-tighter ${isMax ? 'text-red-600' : 'text-blue-600'}`}>
                                                        Mã: {v.code}
                                                    </span>
                                                    <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase w-fit mx-auto md:mx-0 ${
                                                        isMax ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {isMax ? 'Hot Offer' : 'Đã thu thập'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-bold mb-4 line-clamp-2">{v.description || 'Voucher đặc quyền dành cho thợ săn ưu tú'}</p>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar size={14} />
                                                        <span className="text-[11px] font-bold uppercase">Săn: {new Date(v.earnedAt).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-red-500 font-black">
                                                        <Clock size={14} />
                                                        <span className="text-[11px] uppercase">Hết hạn: {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Vô hạn'}</span>
                                                    </div>
                                                </div>
                                            </div>
    
                                            <div className="border-t xl:border-t-0 xl:border-l border-gray-100 pt-6 xl:pt-0 xl:pl-8 flex flex-col items-center justify-center min-w-[150px]">
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Giá trị giảm</p>
                                                <p className={`text-4xl font-black tracking-tighter mb-5 italic ${isMax ? 'text-red-600' : 'text-slate-900'}`}>
                                                    -{v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                                                </p>
                                                <Link to="/search" className={`w-full py-3 text-white text-[11px] font-black rounded-xl text-center uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                                                    isMax ? 'bg-red-600 hover:bg-black' : 'bg-slate-900 hover:bg-blue-600'
                                                }`}>
                                                    Sử dụng ngay
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                ) : (
                    <div className="text-center py-40 bg-white rounded-[40px] border border-gray-100 shadow-xl">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingBag size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">Ví voucher đang trống</h2>
                        <p className="text-slate-400 text-lg font-medium mb-12">Bạn chưa sở hữu mã giảm giá đặc quyền nào.</p>
                        <Link to="/hunt-vouchers" className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center gap-3 mx-auto w-fit">
                            <Zap size={20} fill="currentColor" />
                            Đến trang săn Voucher ngay
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVouchersPage;

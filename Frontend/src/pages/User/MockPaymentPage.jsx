import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const MockPaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { formatPrice } = useLanguage();
    const [params, setParams] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const data = Object.fromEntries(query.entries());
        setParams(data);

        if (!data.orderId) {
            navigate('/');
        }
    }, [location, navigate]);

    const redirectPayment = (success) => {
        setLoading(true);
        setTimeout(() => {
            const returnUrl = params.returnUrl || '/checkout-result';
            const separator = returnUrl.includes('?') ? '&' : '?';
            
            let finalUrl = `${returnUrl}${separator}orderId=${params.orderId}&method=${params.method}`;
            
            const m = String(params.method || '').toLowerCase();
            if (m === 'momo' || m === 'momo_sub' || m === 'zalopay') {
                finalUrl += `&resultCode=${success ? '0' : '1006'}&requestId=${params.requestId || Date.now()}`;
            } else if (m === 'vnpay') {
                finalUrl += `&vnp_ResponseCode=${success ? '00' : '99'}&vnp_TxnRef=${params.orderId}`;
            } else {
                finalUrl += `&success=${success ? 'true' : 'false'}`;
            }

            window.location.href = finalUrl;
        }, 1500);
    };

    const getMethodName = () => {
        const m = params.method || '';
        if (m.includes('momo')) return 'Ví MoMo';
        if (m === 'zalopay') return 'Ví ZaloPay';
        if (m === 'BANK_TRANSFER') return 'Chuyển khoản Ngân hàng';
        return 'Cổng thanh toán';
    };

    const getMethodIcon = () => {
        const m = params.method || '';
        if (m.includes('momo')) return 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png';
        if (m === 'zalopay') return 'https://img.mservice.io/momo-payment/210811/momo-payment_1628675662700.png';
        if (m === 'BANK_TRANSFER') return '🏦';
        return '💳';
    };

    const getConfirmButtonLabel = () => {
        if (params.method === 'BANK_TRANSFER') return 'TÔI ĐÃ CHUYỂN KHOẢN';
        return 'THANH TOÁN NGAY';
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4" style={{ fontFamily: "Calibri, 'Segoe UI', sans-serif" }}>
            <div className="bg-white max-w-md w-full rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#ffd700] p-8 text-slate-900 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-white to-red-500"></div>
                    <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center p-2 shadow-lg">
                        {getMethodIcon().startsWith('http') ? (
                            <img src={getMethodIcon()} alt="icon" className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-3xl">{getMethodIcon()}</span>
                        )}
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-widest">{getMethodName()}</h1>
                    <p className="text-slate-600 text-xs mt-1 font-bold">MOCK PAYMENT GATEWAY</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Amount Section */}
                    <div className="text-center bg-gray-50 rounded-2xl py-6 border border-dashed border-gray-200">
                        <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Số tiền thanh toán</p>
                        <p className="text-3xl font-black text-red-600 tracking-tighter">
                            {formatPrice(params.amount || 0)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase italic">Đang thanh toán cho đơn hàng: #{params.orderId?.slice(-8)}</p>
                    </div>

                    {/* QR Mock (for Wallet) */}
                    {(params.method?.includes('momo') || params.method === 'zalopay') && (
                        <div className="flex flex-col items-center">
                            <div className="w-48 h-48 bg-white border-8 border-gray-50 rounded-3xl p-4 shadow-inner relative group">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAYMENT_FOR_${params.orderId}`} 
                                    alt="QR Code" 
                                    className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-md p-1">
                                        <img src={getMethodIcon()} alt="logo" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest animate-pulse">Quét mã để thanh toán</p>
                        </div>
                    )}

                    {/* Bank Info Mock */}
                    {params.method === 'BANK_TRANSFER' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                                <h3 className="text-xs font-black text-blue-600 uppercase mb-3">Thông tin tài khoản PhoneSin</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-bold">Ngân hàng:</span>
                                        <span className="font-black text-slate-800">VIETCOMBANK</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-bold">Số TK:</span>
                                        <span className="font-black text-slate-800">1023456789</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-bold">Chủ TK:</span>
                                        <span className="font-black text-slate-800 uppercase">PHONESIN MOBILE</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-blue-200">
                                        <span className="text-gray-500 font-bold">Nội dung:</span>
                                        <span className="font-black text-red-600">PS {params.orderId?.slice(-6)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                <span className="text-lg">💡</span>
                                <p className="text-[10px] text-amber-700 font-bold leading-tight">Vui lòng ghi đúng nội dung chuyển khoản để hệ thống tự động xác nhận nhanh nhất.</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        <button 
                            onClick={() => redirectPayment(true)}
                            disabled={loading}
                            className="w-full h-14 bg-[#007bff] text-white font-black rounded-2xl hover:bg-[#0056b3] active:bg-[#ffd700] active:text-slate-900 transition-all shadow-xl active:scale-95 uppercase tracking-widest flex items-center justify-center border-none outline-none"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : getConfirmButtonLabel()}
                        </button>
                        <button 
                            onClick={() => redirectPayment(false)}
                            disabled={loading}
                            className="w-full h-12 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                        >
                            HỦY GIAO DỊCH
                        </button>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">PhoneSin Secure Checkout — 256-bit Encryption</p>
                </div>
            </div>
        </div>
    );
};

export default MockPaymentPage;

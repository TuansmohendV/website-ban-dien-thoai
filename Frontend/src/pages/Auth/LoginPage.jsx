import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    GraduationCap,
    RefreshCcw,
    UserCheck,
    Gem,
    BatteryCharging,
    Truck,
    Gift,
    Chrome,
    Facebook,
    Eye,
    EyeOff,
    Minus,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/';

    const [phone, setPhone] = useState('');
    const [loginMode, setLoginMode] = useState('phone'); // phone, password, otp
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        let interval;
        if (loginMode === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [loginMode, timer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current.focus();
        }
    };

    const handleSendOTP = async () => {
        setIsSubmitting(true);
        // Simulate API call to send OTP via Zalo
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTimer(60);
        setCanResend(false);
        setIsSubmitting(false);
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (loginMode === 'phone') {
            const phoneRegex = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
            if (!phone.trim() || !phoneRegex.test(phone.trim())) {
                setErrorMessage('Vui long nhap so dien thoai hop le de tiep tuc.');
                return;
            }

            await handleSendOTP();
            setLoginMode('otp');
            return;
        }

        if (loginMode === 'otp') {
            const otpCode = otp.join('');
            if (otpCode.length < 6) {
                setErrorMessage('Vui long nhap day du ma OTP.');
                return;
            }

            setIsSubmitting(true);
            try {
                // Simulate OTP verification
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // If verification success, we can either login directly if backend supports it
                // or move to password step if it's a dual verification.
                // For this request, we'll simulate direct login or account creation.
                
                // Simulated login
                await login({
                    identifier: phone.trim(),
                    password: 'simulated_otp_login', // Backend would handle this
                });
                navigate(redirectTo, { replace: true });
            } catch (error) {
                setErrorMessage('Ma xac thuc khong dung hoac da het han.');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        try {
            setIsSubmitting(true);
            await login({
                identifier: formData.email.trim(),
                password: formData.password,
            });
            navigate(redirectTo, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || 'Dang nhap that bai.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const benefits = [
        { icon: <GraduationCap size={20} />, text: 'Đặc quyền hạng EDU lên đến 5% giá trị sản phẩm' },
        { icon: <RefreshCcw size={20} />, text: 'Trợ giá thu cũ lên đời đến 3 triệu' },
        { icon: <UserCheck size={20} />, text: 'Hạng thành viên càng cao chiết khấu sản phẩm càng nhiều' },
        { icon: <Gem size={20} />, text: 'Tích điểm thành viên siêu dễ - mua sắm thả ga' },
        { icon: <BatteryCharging size={20} />, text: 'Thay Pin điện thoại ưu đãi đến 20%' },
        { icon: <Truck size={20} />, text: 'Miễn phí giao hàng toàn quốc cho đơn hàng từ 300.000đ' },
        { icon: <Gift size={20} />, text: 'Và vô vàn các ưu đãi thành viên hấp dẫn khác đang chờ bạn' },
    ];

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden relative">

            <Link
                to="/"
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#008d71] rounded-full flex items-center justify-center hover:bg-[#007a62] transition-all shadow-md group"
            >
                <Minus size={24} className="text-white" strokeWidth={4} />
            </Link>

            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-start py-10 px-10 bg-gradient-to-r from-[#b3eccc] via-[#e5f9e0] to-[#fbe29d] border-r border-gray-100 overflow-hidden">

                <div className="w-full max-w-[600px] flex flex-col items-center relative z-20">
                    <div className="bg-white rounded-xl px-12 py-3.5 border-2 border-[#008d71] shadow-sm flex items-center justify-center gap-3 mb-8">
                        <div className="bg-[#008d71] rounded-lg p-1">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M17,19H7V5H17M17,1H7C5.89,1 5,1.89 5,3V21C5,22.11 5.89,23 7,23H17C18.11,23 19,22.11 19,21V3C19,1.89 18.11,1 17,1Z" /></svg>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[22px] font-black text-[#008d71] tracking-tighter uppercase">PhoneSin</span>
                            <span className="text-[18px] font-black text-[#008d71]/80 tracking-tight uppercase">MOBILE</span>
                        </div>
                    </div>

                    <div className="relative mb-8 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <div className="px-3 py-1.5 border-2 border-[#008d71] bg-white rounded-lg shadow-sm">
                                <span className="text-[#008d71] text-[18px] font-black tracking-tight">NHAP HOI</span>
                            </div>
                            <h1
                                className="text-[62px] font-black text-[#008d71] tracking-tight italic leading-none"
                                style={{
                                    textShadow: '5px 0 0 #fff, -5px 0 0 #fff, 0 5px 0 #fff, 0 -5px 0 #fff, 4px 4px 0 #fff, -4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff, 0px 8px 10px rgba(0,0,0,0.15)'
                                }}
                            >
                                PhoneSin Member
                            </h1>
                        </div>
                    </div>

                    <div className="w-full bg-[#006e58] rounded-[24px] p-10 shadow-2xl relative overflow-hidden mb-8">
                        <div className="space-y-4 relative z-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-5 text-white">
                                    <img
                                        src="https://hoanghamobile.com/Content/web/img/member-login-gift.png"
                                        alt="gift"
                                        className="w-5 h-5 object-contain shrink-0"
                                    />
                                    <span className="text-[15px] font-bold leading-tight tracking-tight">
                                        {benefit.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="bg-white border-2 border-gray-100 px-12 py-3.5 rounded-xl text-[#008d71] font-black text-[14px] uppercase tracking-wider hover:shadow-lg transition-all shadow-md active:scale-95">
                        XEM CHI TIET UU DAI
                    </button>
                </div>

                <div className="absolute bottom-[-50px] left-0 w-full pointer-events-none flex flex-col items-center z-10">
                    <img
                        src="https://cdn.hoanghamobile.vn/Uploads/2025/06/16/2025-06-16-141858.png"
                        alt="PhoneSin Mascot"
                        className="w-full max-w-[650px] h-auto object-contain drop-shadow-2xl opacity-100"
                    />
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-[650px]">

                    <div className="mb-10">
                        <h3 className="text-[22px] font-black text-[#111] mb-2">Chao mung ban toi PhoneSin</h3>
                        <p className="text-[#333] text-[14px] font-medium leading-relaxed">
                            {loginMode === 'phone'
                                ? 'Ban da tung mua sam tai PhoneSin? Dang nhap xem hang the ngay'
                                : loginMode === 'otp'
                                ? `Ma xac thuc da duoc gui toi Zalo cua so dien thoai ${phone}`
                                : 'Chao mung ban tro lai! Vui long dang nhap tai khoan khach hang'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {loginMode === 'phone' ? (
                            <div className="space-y-1">
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="So dien thoai cua ban"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-5 py-4 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                                />
                                <p className="text-[12px] text-gray-400 font-medium pl-1 mt-2">
                                    He thong se gui ma xac thuc OTP qua Zalo de xac minh tai khoan
                                </p>
                            </div>
                        ) : loginMode === 'otp' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between gap-2 sm:gap-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={otpRefs[index]}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-full h-[58px] sm:h-[64px] text-center text-[24px] font-black border-2 border-gray-200 rounded-xl focus:border-[#008d71] focus:ring-0 outline-none transition-all"
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <button 
                                        type="button"
                                        onClick={() => setLoginMode('phone')}
                                        className="text-[13px] font-bold text-gray-500 hover:text-[#008d71] flex items-center gap-1 transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Thay doi so dien thoai
                                    </button>
                                    <div className="text-[13px] font-bold">
                                        {canResend ? (
                                            <button 
                                                type="button"
                                                onClick={handleSendOTP}
                                                className="text-[#008d71] hover:underline"
                                            >
                                                Gui lai ma
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">Gui lai sau {timer}s</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Nhap email, tai khoan hoac so dien thoai</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Nhap mat khau cua ban</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008d71] transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#008d71] text-white rounded-lg h-[54px] font-black uppercase tracking-wider shadow-md hover:bg-[#007a62] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting 
                                ? (loginMode === 'otp' ? 'DANG XAC MINH...' : 'DANG GUI MA...') 
                                : (loginMode === 'otp' ? 'XAC NHAN MA OTP' : 'TIEP TUC')}
                        </button>

                        <div className="text-center pt-2">
                            {loginMode !== 'otp' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErrorMessage('');
                                        setLoginMode(loginMode === 'phone' ? 'password' : 'phone');
                                    }}
                                    className="text-[#008d71] text-[15px] font-bold hover:underline underline-offset-4"
                                >
                                    {loginMode === 'phone' ? 'Dang nhap bang mat khau' : 'Dang nhap bang So dien thoai'}
                                </button>
                            )}
                        </div>
                    </form>

                    {loginMode !== 'password' && (
                        <div className="mt-10">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-4 text-gray-500 font-bold tracking-widest leading-none">Hoac dang nhap nhanh</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center h-[52px] bg-[#0068ff] text-white rounded-lg font-bold gap-3 hover:opacity-90 transition-all shadow-sm">
                                    <MessageCircle size={22} fill="white" />
                                    Dang nhap voi Zalo
                                </button>

                                <button className="w-full flex items-center justify-center h-[52px] bg-white border border-gray-300 text-[#555] rounded-lg font-bold gap-3 hover:bg-gray-50 transition-all shadow-sm">
                                    <Chrome size={20} className="text-[#ea4335]" fill="#ea4335" />
                                    Dang nhap voi Google
                                </button>

                                <button className="w-full flex items-center justify-center h-[52px] bg-[#3b5998] text-white rounded-lg font-bold gap-3 hover:opacity-90 transition-all shadow-sm">
                                    <Facebook size={20} fill="white" />
                                    Dang nhap voi Facebook
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-[12px] text-gray-500 leading-relaxed text-center lg:text-left">
                        Bang viec tiep tuc, ban da doc va dong y voi <Link to="/policy" className="text-[#008d71] font-bold hover:underline">Chinh sach bao mat thong tin ca nhan</Link> cua PhoneSin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

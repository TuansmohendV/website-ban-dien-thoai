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
    Eye,
    EyeOff,
    Minus,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import api from '../../lib/api';

const LoginPage = () => {
    const { login, loginWithEmailOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [loginMode, setLoginMode] = useState('password'); // password, email (otp)
    const [formData, setFormData] = useState({ password: '' });
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
        setErrorMessage('');
        try {
            const response = await api.post('/api/auth/send-otp', { email: email.trim() });
            
            setTimer(60);
            setCanResend(false);
            setLoginMode('otp');
        } catch (error) {
            console.error('Send OTP Error:', error);
            setErrorMessage(error.response?.data?.message || 'Lỗi khi gửi mã OTP qua Email. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (loginMode === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.trim() || !emailRegex.test(email.trim())) {
                setErrorMessage('Vui lòng nhập email hợp lệ để tiếp tục.');
                return;
            }

            await handleSendOTP();
            return;
        }

        if (loginMode === 'otp') {
            const otpCode = otp.join('');
            if (otpCode.length < 6) {
                setErrorMessage('Vui lòng nhập đầy đủ mã OTP.');
                return;
            }

            setIsSubmitting(true);
            try {
                // Xác thực mã OTP ở backend
                await api.post('/api/auth/verify-otp', {
                    email: email.trim(),
                    otp: otpCode 
                });

                // Nếu xác thực thành công, thực hiện đăng nhập qua Email OTP
                await loginWithEmailOTP({
                    email: email.trim()
                });
                navigate(redirectTo, { replace: true });
            } catch (error) {
                console.error('Verify Error:', error);
                setErrorMessage(error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        try {
            setIsSubmitting(true);
            await login({
                identifier: email.trim(),
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
                            {loginMode === 'email'
                                ? 'Bạn đã từng mua sắm tại PhoneSin? Đăng nhập nhận ưu đãi ngay'
                                : loginMode === 'otp'
                                ? `Mã xác thực đã được gửi tới Email: ${email}`
                                : 'Chào mừng bạn trở lại! Vui lòng đăng nhập tài khoản khách hàng'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {loginMode === 'email' ? (
                            <div className="space-y-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Địa chỉ Email của bạn"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-5 py-4 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                                />
                                <p className="text-[12px] text-gray-400 font-medium pl-1 mt-2">
                                    Hệ thống sẽ gửi mã xác thực OTP qua Gmail để xác minh tài khoản
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
                                        onClick={() => setLoginMode('email')}
                                        className="text-[13px] font-bold text-gray-500 hover:text-[#008d71] flex items-center gap-1 transition-colors"
                                    >
                                        <ArrowLeft size={14} /> Thay đổi Email
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                        <div className="text-center pt-2 space-y-3">
                            {loginMode !== 'otp' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setErrorMessage('');
                                        setLoginMode(loginMode === 'email' ? 'password' : 'email');
                                    }}
                                    className="text-[#008d71] text-[15px] font-bold hover:underline underline-offset-4 block w-full"
                                >
                                    {loginMode === 'email' ? 'Đăng nhập bằng mật khẩu' : 'Đăng nhập bằng Email OTP'}
                                </button>
                            )}
                            
                            <div className="text-[14px] text-gray-500 font-medium">
                                Bạn chưa có tài khoản?{' '}
                                <Link to="/register" className="text-[#008d71] font-black hover:underline">
                                    Đăng ký ngay
                                </Link>
                            </div>
                        </div>
                    </form>

                    {/* Social login buttons removed */}

                    <div className="mt-12 text-[12px] text-gray-500 leading-relaxed text-center lg:text-left">
                        Bang viec tiep tuc, ban da doc va dong y voi <Link to="/policy" className="text-[#008d71] font-bold hover:underline">Chinh sach bao mat thong tin ca nhan</Link> cua PhoneSin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState, useEffect, useRef } from 'react';
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
    ArrowLeft
} from 'lucide-react';
import api from '../../lib/api';

const LoginPage = () => {
    const { login, loginWithEmailOTP, socialLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/';

    const [loginMode, setLoginMode] = useState('password'); // password, email, otp
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState({ identifier: '', password: '' });
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
        if (value && index < 5) otpRefs[index + 1].current.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs[index - 1].current.focus();
    };

    const handleSendOTP = async () => {
        setIsSubmitting(true);
        setErrorMessage('');
        try {
            await api.post('/api/auth/send-otp', { email: email.trim() });
            setTimer(60);
            setCanResend(false);
            setLoginMode('otp');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Lỗi khi gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        try {
            setIsSubmitting(true);
            setErrorMessage('');
            await socialLogin(provider);
            navigate(redirectTo, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || 'Đăng nhập mạng xã hội thất bại.');
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
                setErrorMessage('Vui lòng nhập email hợp lệ.');
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
                await api.post('/api/auth/verify-otp', { email: email.trim(), otp: otpCode });
                await loginWithEmailOTP({ email: email.trim() });
                navigate(redirectTo, { replace: true });
            } catch (error) {
                if (error.response?.status === 500) {
                    setErrorMessage('Lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau.');
                } else {
                    setErrorMessage(error.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
                }
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        try {
            setIsSubmitting(true);
            await login({
                identifier: formData.identifier.trim(),
                password: formData.password,
            });
            navigate(redirectTo, { replace: true });
        } catch (error) {
            setErrorMessage(error.message || 'Tài khoản hoặc mật khẩu không chính xác.');
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
            <Link to="/" className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#008d71] rounded-full flex items-center justify-center hover:bg-[#007a62] transition-all shadow-md group">
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
                    <h1 className="text-[62px] font-black text-[#008d71] tracking-tight italic leading-none mb-8 text-center" style={{ textShadow: '5px 0 0 #fff, -5px 0 0 #fff, 0 5px 0 #fff, 0 -5px 0 #fff, 4px 4px 0 #fff, -4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff, 0px 8px 10px rgba(0,0,0,0.15)' }}>
                        PhoneSin Member
                    </h1>
                    <div className="w-full bg-[#006e58] rounded-[24px] p-10 shadow-2xl relative overflow-hidden mb-8">
                        <div className="space-y-4 relative z-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-5 text-white">
                                    <div className="shrink-0 text-white/90">
                                        {benefit.icon}
                                    </div>
                                    <span className="text-[15px] font-bold leading-tight tracking-tight">{benefit.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="bg-white border-2 border-gray-100 px-12 py-3.5 rounded-xl text-[#008d71] font-black text-[14px] uppercase tracking-wider hover:shadow-lg transition-all shadow-md active:scale-95">
                        XEM CHI TIET UU DAI
                    </button>
                </div>
                <div className="absolute bottom-[-50px] left-0 w-full pointer-events-none flex flex-col items-center z-10">
                    <img src="https://cdn.hoanghamobile.vn/Uploads/2025/06/16/2025-06-16-141858.png" alt="PhoneSin Mascot" className="w-full max-w-[650px] h-auto object-contain drop-shadow-2xl opacity-100" />
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-[650px]">
                    <div className="mb-10 text-center lg:text-left">
                        <h3 className="text-[22px] font-black text-[#111] mb-2">Chào mừng bạn tới PhoneSin</h3>
                        <p className="text-[#333] text-[14px] font-medium leading-relaxed">
                            {loginMode === 'otp' ? `Mã xác thực đã được gửi tới Email: ${email}` : 'Vui lòng đăng nhập để tiếp tục mua sắm và nhận ưu đãi.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {loginMode === 'email' ? (
                            <div className="space-y-2">
                                <label className="text-[14px] font-medium text-[#444] pl-1">Địa chỉ Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                />
                            </div>
                        ) : loginMode === 'otp' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={otpRefs[index]}
                                            type="text"
                                            inputMode="numeric"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-full h-[60px] text-center text-[24px] font-black border-2 border-gray-200 rounded-xl focus:border-[#008d71] outline-none transition-all"
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between text-[13px] font-bold">
                                    <button type="button" onClick={() => setLoginMode('email')} className="text-gray-500 hover:text-[#008d71]">Thay đổi Email</button>
                                    {canResend ? <button type="button" onClick={handleSendOTP} className="text-[#008d71]">Gửi lại mã</button> : <span className="text-gray-400">Gửi lại sau {timer}s</span>}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Email hoặc tài khoản</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.identifier}
                                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all pr-12"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008d71]">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[13px] font-bold">
                                    <Link to="/forgot-password" size={20} className="text-[#008d71] hover:underline">Quên mật khẩu?</Link>
                                    <Link to="/register" className="text-gray-500 hover:underline">Đăng ký tài khoản</Link>
                                </div>
                            </div>
                        )}

                        {errorMessage && <div className="rounded-lg bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600 border border-red-100">{errorMessage}</div>}

                        <button type="submit" disabled={isSubmitting} className="w-full bg-[#008d71] text-white rounded-lg h-[54px] font-black uppercase tracking-wider shadow-md hover:bg-[#007a62] transition-all disabled:opacity-70">
                            {isSubmitting ? 'ĐANG XỬ LÝ...' : (loginMode === 'otp' ? 'XÁC NHẬN MÃ OTP' : 'TIẾP TỤC')}
                        </button>

                        {loginMode !== 'otp' && (
                            <button type="button" onClick={() => setLoginMode(loginMode === 'email' ? 'password' : 'email')} className="w-full text-[#008d71] text-[15px] font-bold hover:underline">
                                {loginMode === 'email' ? 'Đăng nhập bằng mật khẩu' : 'Đăng nhập bằng Email OTP'}
                            </button>
                        )}
                    </form>

                    <div className="mt-10">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-500 font-bold tracking-widest">Hoặc đăng nhập bằng</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => handleSocialLogin('google')} className="flex items-center justify-center h-[52px] border border-gray-300 rounded-lg font-bold gap-3 hover:bg-gray-50 transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg> Google
                            </button>
                            <button type="button" onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center h-[52px] bg-[#3b5998] text-white rounded-lg font-bold gap-3 hover:opacity-90 transition-all">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> Facebook
                            </button>
                        </div>
                    </div>

                    <div className="mt-12 text-[12px] text-gray-500 text-center lg:text-left leading-relaxed">
                        Bằng việc tiếp tục, bạn đã đọc và đồng ý với <Link to="/policy" className="text-[#008d71] font-bold hover:underline">Chính sách bảo mật</Link> của PhoneSin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [step, setStep] = useState(1); // 1: input info, 2: verify otp
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

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
            await api.post('/api/auth/send-otp', { 
                email: formData.email.trim(),
                purpose: 'register' // Báo backend kiểm tra email trùng trước khi gửi OTP
            });
            setStep(2);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Lỗi khi gửi mã OTP. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (step === 1) {
            if (formData.password !== formData.confirmPassword) {
                setErrorMessage('Mật khẩu nhập lại không khớp.');
                return;
            }
            await handleSendOTP();
            return;
        }

        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            setErrorMessage('Vui lòng nhập đầy đủ mã OTP.');
            return;
        }

        try {
            setIsSubmitting(true);
            // 1. Xác thực OTP
            await api.post('/api/auth/verify-otp', {
                email: formData.email.trim(),
                otp: otpCode
            });

            // 2. Nếu OTP đúng, mới tiến hành đăng ký
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });
            navigate('/');
        } catch (error) {
            // Hiện thông báo lỗi chính xác từ server
            const msg = error.response?.data?.message || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            setErrorMessage(msg);
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
                            <h1 className="text-[62px] font-black text-[#008d71] tracking-tight italic leading-none" style={{ textShadow: '5px 0 0 #fff, -5px 0 0 #fff, 0 5px 0 #fff, 0 -5px 0 #fff, 4px 4px 0 #fff, -4px -4px 0 #fff, 4px -4px 0 #fff, -4px 4px 0 #fff, 0px 8px 10px rgba(0,0,0,0.15)' }}>
                                PhoneSin Member
                            </h1>
                        </div>
                    </div>

                    <div className="w-full bg-[#006e58] rounded-[24px] p-10 shadow-2xl relative overflow-hidden mb-8">
                        <div className="space-y-4 relative z-10">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-5 text-white">
                                    <img src="https://hoanghamobile.com/Content/web/img/member-login-gift.png" alt="gift" className="w-5 h-5 object-contain shrink-0" />
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
                    <div className="mb-10">
                        <h3 className="text-[22px] font-black text-[#111] mb-2">
                            {step === 1 ? 'Tao tai khoan PhoneSin' : 'Xac thuc Email'}
                        </h3>
                        <p className="text-[#333] text-[14px] font-medium leading-relaxed">
                            {step === 1 
                                ? 'Tham gia cùng cộng đồng PhoneSin để nhận nhiều ưu đãi hấp dẫn'
                                : `Mã xác thực đã được gửi tới Email: ${formData.email}`}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 1 ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#444] pl-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Nhập họ và tên của bạn"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#444] pl-1">Địa chỉ Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Nhập địa chỉ email"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#444] pl-1">Mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Tối thiểu 6 ký tự"
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

                                <div className="space-y-2">
                                    <label className="text-[14px] font-bold text-[#444] pl-1">Nhập lại mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="Xác nhận lại mật khẩu"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008d71] transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
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
                                            className="w-full h-[58px] sm:h-[64px] text-center text-[24px] font-black border-2 border-gray-200 rounded-xl focus:border-[#008d71] outline-none transition-all"
                                        />
                                    ))}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-[13px] font-bold text-[#008d71] hover:underline flex items-center gap-1"
                                >
                                    <ArrowLeft size={14} /> Thay đổi thông tin
                                </button>
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
                            className="w-full bg-[#008d71] text-white rounded-lg h-[54px] font-black uppercase tracking-wider shadow-md hover:bg-[#007a62] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                        >
                            {isSubmitting 
                                ? (step === 1 ? 'DANG GUI MA...' : 'DANG TAO TAI KHOAN...') 
                                : (step === 1 ? 'TIEP TUC' : 'XAC NHAN DANG KY')}
                        </button>

                        <div className="text-center pt-2">
                            <div className="text-[14px] text-gray-500 font-medium">
                                Bạn đã có tài khoản?{' '}
                                <Link to="/login" className="text-[#008d71] font-black hover:underline">
                                    Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </form>

                    <div className="mt-12 text-[12px] text-gray-500 leading-relaxed text-center lg:text-left">
                        Bang viec tiep tuc, ban da doc va dong y voi <Link to="/policy" className="text-[#008d71] font-bold hover:underline">Chinh sach bao mat thong tin ca nhan</Link> cua PhoneSin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

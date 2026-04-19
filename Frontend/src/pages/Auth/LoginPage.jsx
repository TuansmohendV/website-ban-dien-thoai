import React, { useState } from 'react';
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
    ChevronRight,
    User,
    Chrome,
    Facebook,
    Eye,
    EyeOff,
    Minus
} from 'lucide-react';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [phone, setPhone] = useState('');
    const [loginMode, setLoginMode] = useState('phone'); // 'phone' or 'password'
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login logic
        login({ phone: phone || formData.email });
        navigate('/');
    };

    const benefits = [
        { icon: <GraduationCap size={20} />, text: "Đặc quyền hạng EDU lên đến 5% giá trị sản phẩm" },
        { icon: <RefreshCcw size={20} />, text: "Trợ giá thu cũ lên đời đến 3 triệu" },
        { icon: <UserCheck size={20} />, text: "Hạng thành viên càng cao chiết khấu sản phẩm càng nhiều" },
        { icon: <Gem size={20} />, text: "Tích điểm thành viên siêu dễ - mua sắm thả ga" },
        { icon: <BatteryCharging size={20} />, text: "Thay Pin điện thoại ưu đãi đến 20%" },
        { icon: <Truck size={20} />, text: "Miễn phí giao hàng toàn quốc cho đơn hàng từ 300.000đ" },
        { icon: <Gift size={20} />, text: "Và vô vàn các ưu đãi thành viên hấp dẫn khác đang chờ bạn" },
    ];

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden relative">

            {/* Back to Home Button */}
            <Link
                to="/"
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#008d71] rounded-full flex items-center justify-center hover:bg-[#007a62] transition-all shadow-md group"
            >
                <Minus size={24} className="text-white" strokeWidth={4} />
            </Link>

            {/* Left Side: Membership Benefits (50%) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-start py-10 px-10 bg-gradient-to-r from-[#b3eccc] via-[#e5f9e0] to-[#fbe29d] border-r border-gray-100 overflow-hidden">

                <div className="w-full max-w-[600px] flex flex-col items-center relative z-20">
                    {/* Logo Brand Member Style */}
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
                                <span className="text-[#008d71] text-[18px] font-black tracking-tight">NHẬP HỘI</span>
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

                    {/* Benefits Grid */}
                    <div className="w-full bg-[#006e58] rounded-[24px] p-10 shadow-2xl relative overflow-hidden mb-8">
                        <div className="space-y-4 relative z-10">
                            {benefits.map((b, idx) => (
                                <div key={idx} className="flex items-center gap-5 text-white">
                                    <img
                                        src="https://hoanghamobile.com/Content/web/img/member-login-gift.png"
                                        alt="gift"
                                        className="w-5 h-5 object-contain shrink-0"
                                    />
                                    <span className="text-[15px] font-bold leading-tight tracking-tight">
                                        {b.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="bg-white border-2 border-gray-100 px-12 py-3.5 rounded-xl text-[#008d71] font-black text-[14px] uppercase tracking-wider hover:shadow-lg transition-all shadow-md active:scale-95">
                        XEM CHI TIẾT ƯU ĐÃI
                    </button>
                </div>

                {/* Mascot & Floating Decorations - Lowered for space */}
                <div className="absolute bottom-[-50px] left-0 w-full pointer-events-none flex flex-col items-center z-10">
                    <img
                        src="https://cdn.hoanghamobile.vn/Uploads/2025/06/16/2025-06-16-141858.png"
                        alt="PhoneSin Mascot"
                        className="w-full max-w-[650px] h-auto object-contain drop-shadow-2xl opacity-100"
                    />
                </div>
            </div>

            {/* Right Side: Login Form (50%) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-[650px]">

                    {/* Dynamic Header */}
                    <div className="mb-10">
                        <h3 className="text-[22px] font-black text-[#111] mb-2">Chào mừng bạn tới PhoneSin</h3>
                        <p className="text-[#333] text-[14px] font-medium leading-relaxed">
                            {loginMode === 'phone'
                                ? "Bạn đã từng mua sắm tại PhoneSin? Đăng nhập xem hạng thẻ ngay"
                                : "Chào mừng bạn trở lại! Vui lòng đăng nhập tài khoản khách hàng"}
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
                                    placeholder="Số điện thoại của bạn"
                                    className="w-full bg-white border border-gray-300 rounded-lg px-5 py-4 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                                />
                                <p className="text-[12px] text-gray-400 font-medium pl-1 mt-2">
                                    Hệ thống sẽ kiểm tra và tạo tài khoản nếu bạn chưa có
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Nhập email hoặc tài khoản của bạn</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-5 py-3.5 text-slate-900 text-[15px] font-semibold focus:border-[#008d71] outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[14px] font-medium text-[#444] pl-1">Nhập mật khẩu của bạn</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
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

                        <button
                            type="submit"
                            className="w-full bg-[#008d71] text-white rounded-lg h-[54px] font-black uppercase tracking-wider shadow-md hover:bg-[#007a62] transition-all flex items-center justify-center gap-2"
                        >
                            TIẾP TỤC
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => setLoginMode(loginMode === 'phone' ? 'password' : 'phone')}
                                className="text-[#008d71] text-[15px] font-bold hover:underline underline-offset-4"
                            >
                                {loginMode === 'phone' ? "Đăng nhập bằng mật khẩu" : "Đăng nhập bằng Số điện thoại"}
                            </button>
                        </div>
                    </form>

                    {loginMode === 'phone' && (
                        <div className="mt-10">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-200"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-4 text-gray-500 font-bold tracking-widest leading-none">Hoặc đăng nhập bằng</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center h-[52px] bg-[#0078ff] text-white rounded-lg font-bold gap-3 hover:opacity-90 transition-all shadow-sm">
                                    <div className="bg-white rounded-full p-1">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="#0078ff"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 9h-2.1l.6-3h-1.5l-.6 3H11l.6-3H10.1l-.6 3h-1.5l.6-3H7.1l.6-3h-2l-.6 3h-1.5z" /></svg>
                                    </div>
                                    Đăng nhập với Zalo
                                </button>

                                <button className="w-full flex items-center justify-center h-[52px] bg-white border border-gray-300 text-[#555] rounded-lg font-bold gap-3 hover:bg-gray-50 transition-all shadow-sm">
                                    <Chrome size={20} className="text-[#ea4335]" fill="#ea4335" />
                                    Đăng nhập với Google
                                </button>

                                <button className="w-full flex items-center justify-center h-[52px] bg-[#3b5998] text-white rounded-lg font-bold gap-3 hover:opacity-90 transition-all shadow-sm">
                                    <Facebook size={20} fill="white" />
                                    Đăng nhập với Facebook
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 text-[12px] text-gray-500 leading-relaxed text-center lg:text-left">
                        Bằng việc tiếp tục, bạn đã đọc và đồng ý với <Link to="/policy" className="text-[#008d71] font-bold hover:underline">Chính sách bảo mật thông tin cá nhân</Link> của PhoneSin
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Đăng ký tài khoản thành công! Chào mừng bạn đến với PhoneSin. (Demo)');
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Side: Brand Image/Story (45% for Register to give more space for form) */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-end p-20 overflow-hidden bg-slate-950">
         {/* Background Image with Overlay */}
         <img 
            src="https://images.unsplash.com/photo-1556656793-062ff987b50d?q=80&w=2070&auto=format&fit=crop" 
            alt="Premium Tech Store"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
         
         {/* Animated Ornaments */}
         <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
         
         <div className="relative z-10 space-y-6 max-w-lg">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40 transform rotate-6">
                  <span className="text-white font-black text-3xl tracking-tighter">PS</span>
               </div>
               <h1 className="text-4xl font-black text-white tracking-tight uppercase">PhoneSin</h1>
            </div>
            
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">
                  Gia nhập <span className="text-red-500">cộng đồng</span> công nghệ hàng đầu.
               </h2>
               <div className="w-20 h-1.5 bg-red-600 rounded-full"></div>
            </div>
            
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
               Đăng ký thành viên để nhận bản tin khuyến mãi sớm nhất và dịch vụ hậu mãi tiêu chuẩn 5 sao từ PhoneSin.
            </p>
         </div>
      </div>

      {/* Right Side: Register Form (55%) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white relative overflow-y-auto">
         
         {/* Decorative Element for Mobile */}
         <div className="absolute top-0 left-0 w-48 h-48 bg-red-50 rounded-br-full -z-0 opacity-50 block lg:hidden"></div>

         <div className="w-full max-w-[500px] relative z-10 py-10">
            
            {/* Mobile Logo */}
            <div className="mb-12 flex lg:hidden items-center gap-3">
               <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">PS</span>
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">PhoneSin</h1>
            </div>

            <header className="mb-10 text-center lg:text-left">
               <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Tạo tài khoản</h3>
               <p className="text-slate-500 font-medium text-lg">Cùng kiến tạo tương lai số cùng PhoneSin</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    placeholder="09xx xxx xxx"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-full space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Địa chỉ Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="example@phonesin.vn"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Mật khẩu</label>
                  <div className="relative group">
                     <input 
                       type={showPassword ? 'text' : 'password'} 
                       required
                       placeholder="••••••••"
                       className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-red-600 transition-colors"
                     >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                     </button>
                  </div>
               </div>

               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Xác nhận lại</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-full py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" required className="w-5 h-5 accent-red-600 rounded-lg" />
                     <span className="text-[13px] text-slate-500 font-medium">
                        Tôi đồng ý với <span className="text-red-600 font-bold hover:underline">Điều khoản dịch vụ</span> và <span className="text-red-600 font-bold hover:underline">Chính sách bảo mật</span> của PhoneSin.
                     </span>
                  </label>
               </div>

               <button 
                 type="submit"
                 className="col-span-full bg-slate-950 text-white rounded-2xl py-4.5 font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-95 shadow-slate-200"
               >
                  HOÀN TẤT ĐĂNG KÝ
               </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 italic transition-all">
               <p className="text-center text-sm font-medium text-slate-500">
                  Đã có tài khoản tại PhoneSin? <Link to="/login" className="text-red-600 font-black hover:underline underline-offset-4 transition-all">Đăng nhập ngay</Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;

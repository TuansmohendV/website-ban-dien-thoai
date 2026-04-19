import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
    // Simulating API call
    setTimeout(() => {
        alert(`Link khôi phục đã được gửi tới: ${email}`);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* Left Side: Brand Image/Story (50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-end p-20 overflow-hidden bg-slate-950">
         {/* Background Image with Overlay */}
         <img 
            src="https://images.unsplash.com/photo-1491472253230-a044054ac35f?q=80&w=2070&auto=format&fit=crop" 
            alt="Recovery"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
         
         <div className="relative z-10 space-y-6 max-w-lg">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-600/40">
                  <span className="text-white font-black text-3xl tracking-tighter">PS</span>
               </div>
               <h1 className="text-4xl font-black text-white tracking-tight uppercase">PhoneSin</h1>
            </div>
            
            <div className="space-y-4">
               <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">
                  Bảo mật <span className="text-red-500">tuyệt đối</span> thông tin của bạn.
               </h2>
               <div className="w-20 h-1.5 bg-red-600 rounded-full"></div>
            </div>
            
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
               Đừng lo lắng! Chỉ cần vài bước đơn giản, chúng tôi sẽ giúp bạn khôi phục quyền truy cập vào giới công nghệ đỉnh cao.
            </p>
         </div>
      </div>

      {/* Right Side: Forgot Password Form (50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 bg-white relative">
         
         <div className="w-full max-w-[440px] relative z-10 transition-all">
            
            {/* Mobile Logo */}
            <div className="mb-12 flex lg:hidden items-center gap-3">
               <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">PS</span>
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">PhoneSin</h1>
            </div>

            <header className="mb-10 text-center lg:text-left">
               <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Quên mật khẩu</h3>
               <p className="text-slate-500 font-medium text-lg">
                  {isSent 
                    ? "Kiểm tra email của bạn để tiếp tục." 
                    : "Nhập email đã đăng ký để khôi phục mật khẩu."}
               </p>
            </header>

            {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Địa chỉ Email</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@phonesin.vn"
                                className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                            />
                            <div className="absolute inset-y-0 right-5 flex items-center text-slate-400 group-focus-within:text-red-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-slate-950 text-white rounded-2xl py-4.5 font-black uppercase tracking-[0.25em] shadow-2xl hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-95 shadow-slate-200"
                    >
                        GỬI YÊU CẦU 
                    </button>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-center">
                        <Link to="/login" className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="space-y-8 bg-green-50/50 p-8 rounded-3xl border border-green-100 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <div className="text-center space-y-4">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Thành công!</h4>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu vào email <span className="text-slate-900 font-bold">{email}</span>. Vui lòng kiểm tra hộp thư đến.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsSent(false)}
                        className="w-full bg-white border border-green-200 text-green-700 rounded-2xl py-4 font-black uppercase tracking-widest hover:bg-green-50 transition-all"
                    >
                        GỬI LẠI EMAIL
                    </button>
                    <Link to="/login" className="block text-center text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                        Quay lại đăng nhập
                    </Link>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

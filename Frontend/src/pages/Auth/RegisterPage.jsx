import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Mat khau phai co it nhat 6 ky tu.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Mat khau xac nhan khong khop.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        fullName: formData.fullName,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/');
    } catch (error) {
      setErrorMessage(error.message || 'Dang ky tai khoan that bai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-end p-20 overflow-hidden bg-slate-950">
         <img
            src="https://images.unsplash.com/photo-1556656793-062ff987b50d?q=80&w=2070&auto=format&fit=crop"
            alt="Premium Tech Store"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

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
                  Gia nhap <span className="text-red-500">cong dong</span> cong nghe hang dau.
               </h2>
               <div className="w-20 h-1.5 bg-red-600 rounded-full"></div>
            </div>

            <p className="text-slate-400 font-medium text-lg leading-relaxed">
               Dang ky thanh vien de nhan ban tin khuyen mai som nhat va dich vu hau mai tieu chuan 5 sao tu PhoneSin.
            </p>
         </div>
      </div>

      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white relative overflow-y-auto">

         <div className="absolute top-0 left-0 w-48 h-48 bg-red-50 rounded-br-full -z-0 opacity-50 block lg:hidden"></div>

         <div className="w-full max-w-[500px] relative z-10 py-10">

            <div className="mb-12 flex lg:hidden items-center gap-3">
               <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">PS</span>
               </div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">PhoneSin</h1>
            </div>

            <header className="mb-10 text-center lg:text-left">
               <h3 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Tao tai khoan</h3>
               <p className="text-slate-500 font-medium text-lg">Cung kien tao tuong lai so cung PhoneSin</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Ho va Ten</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nguyen Van A"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">So dien thoai</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-full space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Dia chi Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@phonesin.vn"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               <div className="col-span-1 space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Mat khau</label>
                  <div className="relative group">
                     <input
                       type={showPassword ? 'text' : 'password'}
                       required
                       value={formData.password}
                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Xac nhan lai</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 text-sm font-semibold focus:border-red-600 focus:ring-4 focus:ring-red-600/5 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  />
               </div>

               {errorMessage && (
                  <div className="col-span-full rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                    {errorMessage}
                  </div>
               )}

               <div className="col-span-full py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                     <input type="checkbox" required className="w-5 h-5 accent-red-600 rounded-lg" />
                     <span className="text-[13px] text-slate-500 font-medium">
                        Toi dong y voi <span className="text-red-600 font-bold hover:underline">Dieu khoan dich vu</span> va <span className="text-red-600 font-bold hover:underline">Chinh sach bao mat</span> cua PhoneSin.
                     </span>
                  </label>
               </div>

               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="col-span-full w-full bg-slate-950 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all hover:scale-[1.01] active:scale-95 shadow-slate-200 disabled:opacity-70 flex items-center justify-center leading-none whitespace-nowrap"
               >
                  {isSubmitting ? 'DANG XU LY...' : 'DANG KY'}
               </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 italic transition-all">
               <p className="text-center text-sm font-medium text-slate-500">
                  Da co tai khoan tai PhoneSin? <Link to="/login" className="text-red-600 font-black hover:underline underline-offset-4 transition-all">Dang nhap ngay</Link>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RegisterPage;

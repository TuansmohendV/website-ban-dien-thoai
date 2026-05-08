import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // request | verify | done
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/api/auth/forgot-password', {
        email: email.trim(),
      });
      setSuccessMessage('Ma OTP da duoc gui den email cua ban. Vui lòng kiểm tra hộp thư đến.');
      setStep('verify');
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Khong the gui yeu cau khoi phuc mat khau.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim()) {
      setErrorMessage('Vui long nhap ma OTP.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Mat khau moi phai tu 6 ky tu tro len.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mat khau moi va xac nhan mat khau chua khop.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/reset-password', {
        token: otpCode.trim(),
        newPassword,
      });
      setStep('done');
      setSuccessMessage('Dat lai mat khau thanh cong. Ban co the dang nhap lai.');
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'Khong the dat lai mat khau.')
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  {step === 'request'
                    ? "Nhập email đã đăng ký để khôi phục mật khẩu."
                    : step === 'verify'
                      ? "Nhap ma OTP da nhan duoc va mat khau moi."
                      : "Mat khau da duoc cap nhat."}
               </p>
            </header>

            {step === 'request' && (
                <form onSubmit={handleRequestOtp} className="space-y-8">
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
                        disabled={isSubmitting}
                        className="w-full bg-slate-950 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all shadow-slate-200 disabled:opacity-60 flex items-center justify-center leading-none whitespace-nowrap"
                    >
                        {isSubmitting ? 'DANG GUI...' : 'GUI YEU CAU'}
                    </button>
                    {errorMessage && (
                      <p className="text-sm font-semibold text-red-500">{errorMessage}</p>
                    )}
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-center">
                        <Link to="/login" className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            Quay lại đăng nhập
                        </Link>
                    </div>
                </form>
            )}

            {step === 'verify' && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Ma OTP</label>
                        <input
                            type="text"
                            required
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Nhap ma 6 so"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Mat khau moi</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-semibold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Nhap lai mat khau moi</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 text-sm font-semibold"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-slate-950 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-2xl hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center leading-none whitespace-nowrap"
                    >
                        {isSubmitting ? 'DANG XU LY...' : 'XAC NHAN DOI MAT KHAU'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                          setStep('request');
                          setOtpCode('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        disabled={isSubmitting}
                        className="w-full border border-slate-200 rounded-2xl py-3 font-black text-slate-500 uppercase tracking-widest transition-all hover:bg-slate-50 flex items-center justify-center whitespace-nowrap leading-none"
                    >
                        Gui lai OTP
                    </button>
                    {successMessage && (
                      <p className="text-sm font-semibold text-green-600">{successMessage}</p>
                    )}
                    {errorMessage && (
                      <p className="text-sm font-semibold text-red-500">{errorMessage}</p>
                    )}
                </form>
            )}

            {step === 'done' && (
                <div className="space-y-8 bg-green-50/50 p-8 rounded-3xl border border-green-100 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                    <div className="text-center space-y-4">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Thành công!</h4>
                        <p className="text-slate-600 font-medium leading-relaxed">{successMessage}</p>
                    </div>
                    <Link to="/login" className="block text-center text-sm font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest">
                        Quay lại đăng nhập
                    </Link>
                </div>
            )}

            {step === 'request' && successMessage && (
              <p className="text-sm font-semibold text-green-600 mt-4">{successMessage}</p>
            )}
            {step === 'request' && errorMessage && (
              <p className="text-sm font-semibold text-red-500 mt-4">{errorMessage}</p>
            )}
         </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

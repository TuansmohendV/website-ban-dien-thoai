import React, { useState } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Giả lập gửi form
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

      <Breadcrumbs />

      <main className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">LIÊN HỆ VỚI PHONESIN</h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto">Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn bất cứ lúc nào. Hãy kết nối với chúng tôi ngay!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Thông tin liên lạc */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-8">
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Văn phòng chính</h4>
                     <p className="text-lg font-black text-slate-800 tracking-tight leading-tight">123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Hotline hỗ trợ</h4>
                     <p className="text-2xl font-black text-slate-800 tracking-tighter">1800 6601</p>
                     <p className="text-xs text-slate-400 font-bold tracking-widest">(Miễn phí, 24/7)</p>
                  </div>
               </div>

               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Email liên hệ</h4>
                     <p className="text-lg font-black text-slate-800 tracking-tight leading-tight italic">support@phonesin.vn</p>
                  </div>
               </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-[40px] h-[300px] overflow-hidden relative shadow-inner border border-gray-100 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" alt="Map View" className="w-full h-full object-cover transition-all duration-700 hover:scale-105" />



                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50 text-center">
                    <p className="text-xs font-black uppercase tracking-widest mb-1 text-slate-900">PhoneSin Flagship</p>
                    <p className="text-[10px] font-bold text-slate-500">123 Q1, TP.HCM</p>
                </div>
            </div>
          </div>

          {/* Form Liên hệ */}
          <div className="lg:col-span-7">
             <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl border border-gray-100 relative overflow-hidden">
                <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-widest">GỬI LỜI NHẮN</h3>
                
                {showSuccess && (
                    <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-3xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 text-green-700">
                           <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                           </div>
                           <div>
                               <p className="text-lg font-black leading-none mb-1">Thành công!</p>
                               <p className="text-sm font-bold opacity-80 leading-none">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                           </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Họ và tên</label>
                           <input 
                             required 
                             type="text" 
                             placeholder="VD: Nguyễn Văn A" 
                             value={formData.name}
                             onChange={(e) => setFormData({...formData, name: e.target.value})}
                             className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Email của bạn</label>
                           <input 
                             required 
                             type="email" 
                             placeholder="VD: username@gmail.com" 
                             value={formData.email}
                             onChange={(e) => setFormData({...formData, email: e.target.value})}
                             className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner"
                           />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Số điện thoại</label>
                           <input 
                             required 
                             type="tel" 
                             placeholder="VD: 0912 xxx xxx" 
                             value={formData.phone}
                             onChange={(e) => setFormData({...formData, phone: e.target.value})}
                             className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Chủ đề</label>
                           <input 
                             required 
                             type="text" 
                             placeholder="VD: Hỗ trợ kỹ thuật" 
                             value={formData.subject}
                             onChange={(e) => setFormData({...formData, subject: e.target.value})}
                             className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner"
                           />
                        </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Nội dung chi tiết</label>
                       <textarea 
                         required 
                         rows="6" 
                         placeholder="Nhập yêu cầu hoặc góp ý của bạn tại đây..." 
                         value={formData.message}
                         onChange={(e) => setFormData({...formData, message: e.target.value})}
                         className="w-full bg-slate-50 border border-transparent rounded-[32px] px-6 py-4 font-bold focus:border-red-500 focus:bg-white outline-none transition-all shadow-inner resize-none"
                       ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-[0.98] mt-4 flex items-center justify-center gap-4 group"
                    >
                        {isSubmitting ? 'ĐANG GỬI...' : (
                            <>
                                GỬI NGAY
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 transition-transform"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            </>
                        )}
                    </button>
                </form>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ContactPage;

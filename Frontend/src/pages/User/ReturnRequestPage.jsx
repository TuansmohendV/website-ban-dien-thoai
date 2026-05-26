import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Breadcrumbs from '../../components/Breadcrumbs';
import api from '../../lib/api';

const ArrowLeftIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>);
const UploadIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>);
const CheckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>);
const InfoIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>);

const ReturnRequestPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    const [formData, setFormData] = useState({
        orderCode: orderId || '',
        reason: '',
        note: '',
        contactPhone: '',
        requestType: 'exchange' // exchange | return
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const reasons = [
        'Sản phẩm bị lỗi kỹ thuật',
        'Sản phẩm bị vỡ/hỏng khi vận chuyển',
        'Giao sai sản phẩm / thiếu phụ kiện',
        'Sản phẩm không đúng mô tả',
        'Thay đổi ý định / không còn nhu cầu'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await api.post('/api/support-tickets', {
                title: `Yêu cầu ${formData.requestType === 'exchange' ? 'Đổi hàng' : 'Trả hàng'} - Đơn #${formData.orderCode}`,
                description: `Lý do: ${formData.reason}\n\nChi tiết: ${formData.note}\n\nSĐT liên hệ: ${formData.contactPhone}`,
                category: 'return',
                orderId: formData.orderCode, // Might be order ID or Code
                priority: 'high'
            });
            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error('Failed to submit return request:', err);
            alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-8">
                <div className="max-w-md w-full text-center space-y-8 animate-fadeIn">
                    <div className="w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl scale-in-center">
                        <CheckIcon className="w-12 h-12" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Gửi yêu cầu thành công!</h2>
                        <p className="text-gray-500 font-bold leading-relaxed px-4">Yêu cầu đổi/trả của bạn (Mã đơn: <span className="text-red-600">{formData.orderCode}</span>) đã được tiếp nhận. Đội ngũ CSKH Sin Phone sẽ liên hệ với bạn trong vòng 24h tới.</p>
                    </div>
                    <div className="pt-6">
                        <button 
                            onClick={() => navigate('/orders')}
                            className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95"
                        >
                            Quay lại đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
            <Breadcrumbs />
            
            <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">
                <div className="max-w-4xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div className="space-y-2">
                             <button 
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors mb-4"
                             >
                                <ArrowLeftIcon className="w-4 h-4" /> Quay lại
                             </button>
                             <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Yêu cầu Đổi/Trả hàng</h1>
                             <p className="text-sm text-gray-400 font-bold tracking-widest uppercase pl-1">Đảm bảo quyền lợi khách hàng tại PhoneSin</p>
                        </div>
                        <div className="bg-red-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <InfoIcon className="w-5 h-5 text-white" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Chính sách</span>
                                <span className="text-sm font-black uppercase italic tracking-tighter">Đổi trả 30 ngày</span>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                            
                            {/* Order Info Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-950">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Thông tin đơn hàng</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Mã đơn hàng</label>
                                        <input 
                                            type="text" required
                                            placeholder="Ví dụ: ORD-12345"
                                            value={formData.orderCode}
                                            onChange={(e) => setFormData({...formData, orderCode: e.target.value})}
                                            className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-50 focus:border-black focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Hình thức yêu cầu</label>
                                        <div className="flex gap-4">
                                            {[
                                                { id: 'exchange', label: 'Đổi hàng mới' },
                                                { id: 'return', label: 'Trả hàng hoàn tiền' }
                                            ].map(type => (
                                                <label key={type.id} className="flex-1 cursor-pointer group">
                                                    <input 
                                                        type="radio" name="requestType" className="hidden" 
                                                        checked={formData.requestType === type.id}
                                                        onChange={() => setFormData({...formData, requestType: type.id})}
                                                    />
                                                    <div className={`h-14 flex items-center justify-center rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                                                        formData.requestType === type.id ? 'bg-slate-950 text-white border-slate-950 shadow-lg' : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'
                                                    }`}>
                                                        {type.label}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-950">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Nội dung yêu cầu</h3>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Lý do đổi/trả</label>
                                        <select 
                                            required
                                            value={formData.reason}
                                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                            className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-50 focus:border-black focus:bg-white rounded-2xl outline-none font-bold text-slate-900 appearance-none cursor-pointer transition-all shadow-sm"
                                        >
                                            <option value="" disabled>-- Vui lòng chọn lý do --</option>
                                            {reasons.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Mô tả chi tiết tình trạng</label>
                                        <textarea 
                                            rows="4" required
                                            placeholder="Vui lòng mô tả chi tiết lỗi hoặc mong muốn của bạn..."
                                            value={formData.note}
                                            onChange={(e) => setFormData({...formData, note: e.target.value})}
                                            className="w-full p-6 bg-gray-50 border-2 border-gray-50 focus:border-black focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition-all shadow-sm resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Evidence Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-slate-950">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Hình ảnh minh chứng</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="border-2 border-dashed border-gray-200 rounded-[30px] p-8 text-center bg-gray-50/30 hover:border-red-600 transition-colors group cursor-pointer">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <UploadIcon className="w-6 h-6 text-red-600" />
                                        </div>
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Tải lên ảnh sản phẩm</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Định dạng JPG, PNG (Tối đa 5MB)</p>
                                    </div>
                                    <div className="flex flex-col justify-center space-y-4">
                                        <div className="flex gap-4 items-start bg-amber-50 p-6 rounded-3xl border border-amber-100">
                                            <div className="bg-amber-100 p-2 rounded-lg">
                                                <InfoIcon className="w-5 h-5 text-amber-700" />
                                            </div>
                                            <p className="text-xs font-bold text-amber-800 leading-relaxed italic">
                                                * Hình ảnh chụp rõ nét tem bảo hành, mặt trước, mặt sau và vị trí đang gặp sự cố sẽ giúp yêu cầu của bạn được xử lý nhanh hơn 200%.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                     <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest pl-1">Số điện thoại liên hệ</label>
                                     <input 
                                        type="tel" required
                                        placeholder="Nhập SĐT để chúng tôi gọi lại"
                                        value={formData.contactPhone}
                                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                                        className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-50 focus:border-black focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition-all shadow-sm"
                                     />
                                 </div>
                                 <div className="flex items-end">
                                     <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full h-14 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl shadow-red-200 disabled:bg-gray-200 active:scale-95 flex items-center justify-center gap-3"
                                     >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Đang gửi...
                                            </>
                                        ) : 'Gửi yêu cầu đổi/trả'}
                                     </button>
                                 </div>
                            </div>
                        </form>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-10 bg-slate-900 rounded-[30px] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 translate-x-12 -translate-y-12 rounded-full blur-3xl"></div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-red-500 mb-2">Lưu ý quan trọng</h4>
                        <p className="text-xs text-white/70 font-medium leading-relaxed italic pr-12">
                            Mọi yêu cầu đổi trả cần tuân thủ theo Chính sách bảo hành của PhoneSin. Sản phẩm cần đầy đủ hộp, phụ kiện và không có dấu hiệu va đập, ngấm nước ngoài mô tả lỗi. Chúng tôi sẽ phản hồi sớm nhất qua số điện thoại bạn cung cấp.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnRequestPage;

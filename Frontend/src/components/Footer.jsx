import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Youtube, Instagram, Send } from 'lucide-react';

const Footer = () => {
    return (
        <>
            <div className="bg-white border-t border-gray-100 py-6 font-sans">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">
                    <h2 className="text-[22px] font-bold text-[#00917a] text-center mb-6">
                        Trải nghiệm mua sắm 5T tại PhoneSin
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="12" r="10" /><path d="M12 6v2m0 8v2M9 10h.01M15 10h.01M9.5 14.5s.5 1.5 2.5 1.5 2.5-1.5 2.5-1.5" />
                                    </svg>
                                ),
                                label: 'Tốt hơn về giá', sub: ''
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                    </svg>
                                ),
                                label: 'Thành viên - HSSV', sub: 'Ưu đãi riêng tới 5%'
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M4 4h6l2 4-3 2a11 11 0 006 6l2-3 4 2v6a1 1 0 01-1 1C10 21 3 14 3 5a1 1 0 011-1z" /><path d="M15 3l2 2-5 5M17 3h4v4" />
                                    </svg>
                                ),
                                label: 'Thu cũ đổi mới', sub: 'Thu cũ giá cao, trợ giá lên đời'
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                                    </svg>
                                ),
                                label: 'Thanh toán - Trả góp', sub: 'Dễ dàng'
                            },
                            {
                                icon: (
                                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 8v4l3 3" />
                                    </svg>
                                ),
                                label: 'Trả máy lỗi', sub: 'Đổi máy liền'
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 text-center group cursor-pointer">
                                <div className="w-[60px] h-[60px] bg-[#00917a] rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[#00917a]/40 group-hover:shadow-lg">
                                    {item.icon}
                                </div>
                                <p className="text-[14px] font-black text-[#333] leading-snug">{item.label}</p>
                                {item.sub && <p className="text-[12px] text-gray-500 leading-tight">{item.sub}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="bg-[#004f44] text-white pt-10 pb-6 font-sans">
                <div className="w-full mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">

                    {/* 4-Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

                        {/* Column 1: Hỗ trợ - Dịch vụ */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[14px] font-black uppercase tracking-wider mb-2">Hỗ trợ - dịch vụ</h3>
                            <ul className="flex flex-col gap-2 text-[12px] font-medium text-white/80">
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách và hướng dẫn mua hàng trả góp</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng và chính sách vận chuyển</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi mới và bảo hành</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Dịch vụ bảo hành mở rộng H-Care</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chính Sách Bảo Mật Và Xử Lý Dữ Liệu Cá Nhân</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách giải quyết khiếu nại</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Quy chế hoạt động</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chương trình Hoàng Hà Edu</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Quy định về hoá đơn GTGT</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách về hạng thành viên</a></li>
                            </ul>
                        </div>

                        {/* Column 2: Thông tin liên hệ */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-[14px] font-black uppercase tracking-wider mb-2">Thông tin liên hệ</h3>
                            <ul className="flex flex-col gap-2 text-[12px] font-medium text-white/80">
                                <li><a href="#" className="hover:text-white transition-colors">Giới thiệu về PhoneSin Mobile</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Thông tin các trang TMĐT</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Chăm sóc khách hàng</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Dịch vụ sửa chữa PhoneSin Care</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Khách hàng doanh nghiệp (B2B)</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tuyển dụng</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tra cứu đơn hàng</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tra cứu bảo hành</a></li>
                                <li><Link to="/store-locator" className="hover:text-white transition-colors">Tìm siêu thị (123 cửa hàng)</Link></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tra cứu lịch sử mua hàng</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Tra cứu hóa đơn điện tử</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Thanh toán & Vận chuyển */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-3">Thanh toán miễn phí</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        'https://hoanghamobile.com/Content/web/img/visa.png',
                                        'https://hoanghamobile.com/Content/web/img/mastercard.png',
                                        'https://hoanghamobile.com/Content/web/img/jcb.png',
                                        'https://hoanghamobile.com/Content/web/img/samsungpay.png',
                                        'https://hoanghamobile.com/Content/web/img/vnpay.png',
                                        'https://hoanghamobile.com/Content/web/img/zalopay.png',
                                        'https://hoanghamobile.com/Content/web/img/applepay.png',
                                        'https://hoanghamobile.com/Uploads/2023/08/01/logo-kredivo-1.png',
                                    ].map((src, i) => (
                                        <div key={i} className="bg-white rounded-lg p-1 h-9 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                                            <img src={src} alt="payment" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-3">Hình thức vận chuyển</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        'https://hoanghamobile.com/Content/web/img/nhattin.png',
                                        'https://hoanghamobile.com/Content/web/img/vnpost.png',
                                    ].map((src, i) => (
                                        <div key={i} className="bg-white rounded-lg p-1.5 h-10 w-[80px] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                                            <img src={src} alt="shipping" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 4: Liên hệ & Kết nối */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-2">Tư vấn mua hàng</h3>
                                <p className="text-[15px] font-black">1900.2091 (Nhánh 1)</p>
                                <p className="text-[11px] opacity-70">(Từ 8h30 - 21h30)</p>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-2">Bảo hành - Hỗ trợ kỹ thuật</h3>
                                <p className="text-[15px] font-black">1900.2091 (Nhánh 2)</p>
                                <p className="text-[11px] opacity-70">(Từ 8h30 - 21h30)</p>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-black uppercase tracking-wider mb-3">Kết nối với chúng tôi</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { src: 'https://hoanghamobile.com/Content/web/img/Social_fb_active.png', alt: 'Facebook' },
                                        { src: 'https://hoanghamobile.com/Content/web/img/Social_tiktok_active.png', alt: 'TikTok' },
                                        { src: 'https://hoanghamobile.com/Content/web/img/Social_youtube_active.png', alt: 'YouTube' },
                                        { src: 'https://hoanghamobile.com/Content/web/img/Social_instagram_active.png', alt: 'Instagram' },
                                        { src: 'https://hoanghamobile.com/Content/web/img/Social_thread_active.png', alt: 'Threads' },
                                    ].map((s, i) => (
                                        <a key={i} href="#" className="w-9 h-9 rounded-full overflow-hidden hover:scale-110 transition-transform shadow-lg">
                                            <img src={s.src} alt={s.alt} className="w-full h-full object-cover" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <a href="#" className="inline-block hover:opacity-80 transition-opacity">
                                    <img
                                        src="https://hoanghamobile.com/Content/web/img/logo-bct.png"
                                        alt="Đã thông báo Bộ Công Thương"
                                        className="h-12 object-contain"
                                    />
                                </a>
                            </div>
                        </div>

                    </div>

                    {/* Bottom Legal Text */}
                    <div className="border-t border-white/10 pt-6 text-center text-[10px] font-medium text-white/60 leading-relaxed flex flex-col gap-1">
                        <p>© 2020. CÔNG TY CỔ PHẦN XÂY DỰNG VÀ ĐẦU TƯ THƯƠNG MẠI PHONESIN. MST: 0106713191. (Đăng ký lần đầu: Ngày 15 tháng 12 năm 2014, Đăng ký thay đổi ngày 10/07/2025)</p>
                        <p>GP số 426/GP-TTĐT do sở TTTT Hà Nội cấp ngày 22/01/2021</p>
                        <p>Địa chỉ: Số 89 Đường Tam Trinh, Phường Vĩnh Tuy, Thành Phố Hà Nội, Việt Nam. Điện thoại: 1900.2091. Chịu trách nhiệm nội dung: Mai Thanh.</p>
                    </div>

                </div>
            </footer>
        </>
    );
};

export default Footer;
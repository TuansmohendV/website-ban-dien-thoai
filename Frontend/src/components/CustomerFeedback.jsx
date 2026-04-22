import React from 'react';

const feedbacks = [
  {
    name: 'Tăng Vũ Minh Phúc',
    title: 'Ca sĩ',
    image: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2022/04/18/tang-phuc.jpg',
    content: 'Là một Samfan chân chính, Tăng Phúc không thể bỏ qua chương trình trả hàng sản phẩm S22 series tại PhoneSin được! Đặt hàng thuận lợi, ra nhận hàng thì nhanh chóng, nhân viên lại nhiệt tình. Từ nay về sau Tăng Phúc chỉ tin tưởng PhoneSin thôi!'
  },
  {
    name: 'Quách Thị Lan',
    title: 'VĐV điền kinh đội tuyển quốc gia Việt Nam',
    image: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2022/06/15/quach-thi-lan-1.jpg',
    content: 'Là một vận động viên, Lan luôn muốn mình đạt hiệu quả tập luyện tối đa bằng những phương pháp hiện đại. Chính vì thế, Lan đã quyết định trang bị cho mình vòng đeo tay Huawei Fit 2 chính hãng tại PhoneSin. Với sự trợ giúp của chiếc vòng tay thông minh này, Lan tự tin hướng đến việc chinh phục những cột mốc mới.'
  },
  {
    name: 'Anh Phan Công Khanh',
    title: 'Doanh nhân - CEO K-Super',
    image: 'https://cdn.hoanghamobile.vn/i/home/Uploads/2022/04/18/anh-phan-cong-khanh.jpg',
    content: 'PhoneSin luôn là địa chỉ tin cậy mỗi khi Khanh cần nâng cấp các thiết bị công nghệ cho bản thân và gia đình. Dịch vụ tận tâm, sản phẩm luôn đảm bảo chất lượng và giá cả cạnh tranh nhất thị trường.'
  },
  {
    name: 'Chị Nguyễn Thu Hà',
    title: 'Content Creator',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    content: 'Công việc sáng tạo nội dung của mình đòi hỏi thiết bị phải luôn hoạt động tốt. PhoneSin không chỉ bán máy mà còn hỗ trợ kĩ thuật rất nhanh chóng, giúp mình luôn yên tâm hoàn thành công việc đúng tiến độ.'
  }
];

const CustomerFeedback = () => {
    // Double for infinite loop
    const displayFeedbacks = [...feedbacks, ...feedbacks];

    return (
        <div className="w-full bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 overflow-hidden relative group">
            <style>
                {`
                @keyframes slideFeedback {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-feedback {
                    animation: slideFeedback 40s linear infinite;
                }
                .animate-feedback:hover {
                    animation-play-state: paused;
                }
                `}
            </style>

            <h2 className="text-[20px] font-bold text-gray-800 mb-8 px-1">
                Khách hàng của PhoneSin
            </h2>

            <div className="relative w-full">
                <div className="flex animate-feedback gap-8 w-max py-4">
                    {displayFeedbacks.map((item, idx) => (
                        <div 
                            key={idx} 
                            className="w-[500px] md:w-[600px] flex gap-6 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 shrink-0 select-none hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                        >
                            <div className="w-[140px] md:w-[180px] h-[140px] md:h-[180px] shrink-0 rounded-2xl overflow-hidden shadow-md">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col justify-center gap-2">
                                <h3 className="text-[18px] md:text-[22px] font-black text-gray-900 leading-tight">
                                    {item.name}
                                </h3>
                                <p className="text-[#008d71] text-[13px] md:text-[14px] font-bold uppercase italic">
                                    {item.title}
                                </p>
                                <p className="text-gray-600 text-[13px] md:text-[15px] leading-relaxed line-clamp-4">
                                    {item.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Style Indicators */}
            <div className="flex justify-center gap-3 mt-10">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-1000 ${i === 6 ? 'bg-[#008d71] w-16' : 'bg-emerald-100 w-8'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default CustomerFeedback;

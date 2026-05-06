import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs';

const StoreLocatorPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');

    const stores = [
        {
            id: 1,
            name: 'PhoneSin Store - 348 Hồ Tùng Mậu',
            address: '348 Đ. Hồ Tùng Mậu, Phường Phú Diễn, Hà Nội',
            hours: '08h20 - 21h30',
            phone: '0965868348',
            lat: 21.0401,
            lng: 105.7667
        },
        {
            id: 2,
            name: 'PhoneSin Store - 122 Thái Hà',
            address: '122 Thái Hà, Phường Trung Liệt, Đống Đa, Hà Nội',
            hours: '08h20 - 21h30',
            phone: '0973790122',
            lat: 21.0117,
            lng: 105.8200
        },
        {
            id: 3,
            name: 'PhoneSin Store - 126 Phố Huế',
            address: '126 Phố Huế, Phường Ngô Thì Nhậm, Hai Bà Trưng, Hà Nội',
            hours: '08h20 - 21h30',
            phone: '0968668995',
            lat: 21.0167,
            lng: 105.8500
        },
        {
            id: 4,
            name: 'PhoneSin Store - 182 Cao Lỗ',
            address: '182 Cao Lỗ, Xã Đông Anh, Hà Nội',
            hours: '08h30 - 21h30',
            phone: '0902289339',
            lat: 21.1400,
            lng: 105.8500
        },
        {
            id: 5,
            name: 'PhoneSin Store - 330 Nguyễn Trãi',
            address: '330 Nguyễn Trãi, Phường Thanh Xuân Trung, Thanh Xuân, Hà Nội',
            hours: '08h20 - 21h30',
            phone: '0782468368',
            lat: 20.9980,
            lng: 105.8000
        },
        {
            id: 6,
            name: 'PhoneSin Store - 77 Ngô Xuân Quảng',
            address: '77 Ngô Xuân Quảng, Trâu Quỳ, Gia Lâm, Hà Nội',
            hours: '08h30 - 21h30',
            phone: '0979246877',
            lat: 21.0067,
            lng: 105.9333
        }
    ];

    const [selectedStore, setSelectedStore] = useState(stores[0]);

    return (
        <div className="bg-[#f0f2f5] min-h-screen pb-20 font-sans">
            {/* Breadcrumbs with custom style */}
            <div className="max-w-[1240px] mx-auto px-4 pt-10">
                <div className="flex items-center gap-2 text-[13px] mb-6">
                    <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center gap-2">
                        <Link to="/" className="text-gray-600 font-bold hover:text-[#008d71] cursor-pointer">Trang chủ</Link>
                        <span className="text-gray-400">›</span>
                        <span className="bg-[#008d71] text-white px-3 py-0.5 rounded-full">Hệ thống siêu thị</span>
                    </div>
                </div>

                <h1 className="text-[28px] font-black text-[#333] mb-8 tracking-tight">
                    Hệ thống {stores.length} siêu thị PhoneSin trên toàn quốc
                </h1>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* LEFT PANEL: SEARCH & LIST */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                            <h2 className="text-[16px] font-bold text-gray-800 mb-5 uppercase">Tìm kiếm cửa hàng</h2>
                            
                            {/* Input Search */}
                            <div className="relative mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Nhập vị trí để tìm cửa hàng gần nhất"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#008d71] focus:bg-white transition-all font-medium"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </div>
                            </div>

                            <p className="text-[13px] font-bold text-gray-800 mb-4 px-1">Hoặc</p>

                            {/* Dropdowns */}
                            <div className="space-y-3 mb-6">
                                <select 
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 outline-none hover:border-gray-300 transition-all cursor-pointer uppercase"
                                >
                                    <option value="">Lựa chọn Tỉnh/Thành phố</option>
                                    <option value="HN">Hà Nội</option>
                                    <option value="HCM">TP. Hồ Chí Minh</option>
                                    <option value="DN">Đà Nẵng</option>
                                </select>
                                <select 
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full h-11 px-4 bg-white border border-gray-200 rounded-lg text-[12px] font-bold text-gray-700 outline-none hover:border-gray-300 transition-all cursor-pointer uppercase"
                                >
                                    <option value="">Lựa chọn Quận/Huyện</option>
                                    <option value="TX">Thanh Xuân</option>
                                    <option value="CG">Cầu Giấy</option>
                                    <option value="BD">Ba Đình</option>
                                    <option value="GL">Gia Lâm</option>
                                </select>
                            </div>

                            {/* Store List */}
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[600px] custom-scrollbar">
                                {stores.map((store) => (
                                    <div 
                                        key={store.id}
                                        onClick={() => setSelectedStore(store)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                            selectedStore.id === store.id 
                                            ? 'border-[#008d71] bg-[#f0fcf9]' 
                                            : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                                        }`}
                                    >
                                        <h4 className={`text-[13px] font-bold mb-1 leading-tight ${selectedStore.id === store.id ? 'text-[#008d71]' : 'text-gray-800'}`}>
                                            {store.address}
                                        </h4>
                                        <p className="text-[12px] font-bold text-[#008d71] italic mb-3">({store.hours})</p>
                                        
                                        <div className="flex gap-2">
                                            <a 
                                                href={`tel:${store.phone}`}
                                                className="flex-1 bg-[#008d71] text-white py-1.5 rounded-lg text-[12px] font-bold flex items-center justify-center gap-2 hover:bg-[#007b63] transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                                </svg>
                                                {store.phone}
                                            </a>
                                            <button 
                                                className="flex-1 bg-[#5fb282] text-white py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#4ea071] transition-all"
                                                onClick={(e) => { e.stopPropagation(); /* detail logic */ }}
                                            >
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: MAP */}
                    <div className="flex-1 min-h-[500px] lg:h-auto">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
                            <h2 className="text-[16px] font-bold text-gray-800 mb-5 uppercase">Bản đồ cửa hàng</h2>
                            
                            <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100 relative shadow-inner group">
                                <iframe 
                                    src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9!2d${selectedStore.lng}!3d${selectedStore.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3a38dfc0a3%3A0xe7f9%20!2s${encodeURIComponent(selectedStore.name)}!5e0!3m2!1svi!2s!4v1712150000000!5m2!1svi!2s`} 
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen="" 
                                    loading="lazy"
                                    title="Store Map"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #eee;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #ccc;
                }
            `}</style>
        </div>
    );
};

export default StoreLocatorPage;

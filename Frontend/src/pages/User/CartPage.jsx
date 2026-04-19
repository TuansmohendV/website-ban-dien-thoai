import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Trash2, 
  Plus, 
  Minus, 
  Gift, 
  Truck, 
  Store, 
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Phone,
  Zap
} from 'lucide-react';

const VIETNAM_PROVINCES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", 
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", 
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", 
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", 
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", 
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", 
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình", 
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", 
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", 
  "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", 
  "Vĩnh Phúc", "Yên Bái", "Phú Yên"
];

const HCM_BRANCHES = [
  "188Ter Trần Quang Khải, Phường Tân Định, Quận 1, Hồ Chí Minh",
  "621D Cách Mạng Tháng 8, Phường Hòa Hưng, Quận 10, Hồ Chí Minh",
  "1060 Đường 3/2, Phường Phú Thọ, Quận 11, Hồ Chí Minh",
  "436 Quang Trung, Phường Gò Vấp, Quận Gò Vấp, Hồ Chí Minh",
  "505 Lê Hồng Phong, Phường Vườn Lài, Quận 10, Hồ Chí Minh",
  "Số 418 Nguyễn Thị Thập, Phường Tân Hưng, Quận 7, Hồ Chí Minh",
  "Số 215 Lê Văn Việt, Phường Tăng Nhơn Phú, Quận 9, Hồ Chí Minh",
  "867 Lũy Bán Bích, Phường Tân Phú, Quận Tân Phú, Hồ Chí Minh",
  "347 Hoàng Văn Thụ, Phường Tân Sơn Hòa, Quận Tân Bình, Hồ Chí Minh",
  "Số 454 Nguyễn Oanh, Phường An Nhơn, Quận Gò Vấp, Hồ Chí Minh",
  "Số 127 Tô Ngọc Vân, Phường Thủ Đức, Hồ Chí Minh"
];

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  // 2. Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryMode: 'store', // 'home' or 'store'
    city: 'Hồ Chí Minh',
    store: 'Cửa hàng *',
    note: '',
    isVAT: false,
    promoCode: '',
    companyName: '',
    taxId: '',
    companyAddress: ''
  });

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  const formatPrice = (num) => new Intl.NumberFormat('vi-VN').format(num || 0) + ' ₫';

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    // Simple Validation
    if (!customerInfo.name || !customerInfo.phone) {
        alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
        return;
    }

    if (customerInfo.deliveryMode === 'store' && (!customerInfo.city || customerInfo.store === 'Cửa hàng *')) {
        alert("Vui lòng chọn Tỉnh/Thành phố và Cửa hàng nhận hàng!");
        return;
    }

    // Simulate API Call
    const mockOrderId = 'PS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Create actual order object to save
    const newOrder = {
        id: mockOrderId,
        date: new Date().toLocaleString(),
        status: 'pending',
        items: cartItems.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price,
            image: item.image
        })),
        totalAmount: cartTotal,
        customer: {
            fullName: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: customerInfo.deliveryMode === 'store' ? customerInfo.store : 'Giao hàng tận nhà'
        },
        payment: {
            method: 'cod',
            methodLabel: 'Thanh toán khi nhận hàng'
        },
        summary: {
            subtotal: cartTotal,
            shipping: 0,
            discount: 0
        },
        timeline: [
            { time: new Date().toLocaleString(), text: 'Đặt hàng thành công', active: true },
            { time: '', text: 'Chờ xác nhận', active: false }
        ]
    };

    addOrder(newOrder);
    setOrderId(mockOrderId);
    setIsOrdered(true);
    
    // Clear cart after a short delay
    setTimeout(() => {
        clearCart();
    }, 500);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-emerald-100 flex flex-col items-center max-w-2xl w-full text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-[#008d71] rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-emerald-200">
                <Check size={56} strokeWidth={4} />
            </div>
            <h2 className="text-[32px] font-black text-gray-900 mb-4 uppercase tracking-tight">Đặt hàng thành công!</h2>
            <p className="text-[18px] text-gray-600 font-medium mb-2">Cảm ơn bạn <span className="text-[#008d71] font-bold">{customerInfo.name}</span> đã tin tưởng PhoneSin.</p>
            <p className="text-[15px] text-gray-400 mb-8 font-medium">Mã đơn hàng của bạn là: <span className="text-[#333] font-black uppercase tracking-widest">{orderId}</span></p>
            
            <div className="w-full bg-gray-50 rounded-2xl p-6 mb-10 text-left border border-gray-100 italic">
                <p className="text-[14px] text-gray-500 leading-relaxed">
                    Nhân viên PhoneSin sẽ liên hệ với bạn qua số điện thoại <span className="font-bold text-[#333]">{customerInfo.phone}</span> để xác nhận đơn hàng trong vòng 15-30 phút. 
                    <br/><br/>
                    Vui lòng giữ điện thoại để không bỏ lỡ cuộc gọi xác nhận.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Link to="/" className="flex-1 bg-[#008d71] text-white py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg active:scale-95">Quay lại trang chủ</Link>
                <Link to="/orders" className="flex-1 bg-white border-2 border-[#008d71] text-[#008d71] py-4 rounded-xl font-black text-[15px] uppercase tracking-wider hover:bg-emerald-50 transition-all active:scale-95">Tra cứu đơn hàng</Link>
            </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center p-10 font-sans">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="bg-[#008d71] text-white px-8 py-3 rounded-lg font-bold">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] font-sans pb-20">
      
      {/* Top Promotion Header */}
      <div className="bg-[#ef3d4e] py-1 text-center">
         <div className="container mx-auto flex items-center justify-center gap-4">
            <span className="text-white text-[14px] font-bold">[Khuyến mại] Thu cũ giá cao toàn bộ sản phẩm - Trợ giá tốt nhất</span>
            <button className="bg-white text-[#ef3d4e] px-2.5 py-0.5 rounded text-[12px] font-bold">Xem chi tiết</button>
         </div>
      </div>

      {/* Utility Bar */}
      <div className="bg-[#00483d] text-white py-2 text-[13px]">
         <div className="container mx-auto flex justify-center items-center gap-8 px-4 lg:px-20 max-w-[1400px]">
            <div className="flex gap-8 font-medium opacity-90">
                <span>Bản mobile</span>
                <span>Giới thiệu</span>
                <span>Sản phẩm đã xem</span>
            </div>
            <div className="flex gap-8 font-medium opacity-90">
                <span>Trung tâm bảo hành</span>
                <span>Hệ thống 123 siêu thị</span>
                <span>Tuyển dụng</span>
                <span>Tra cứu đơn hàng</span>
                <span className="flex items-center gap-1"><Phone size={13} fill="white" /> 0336133880</span>
            </div>
         </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-[1400px]">
         
         {/* Breadcrumb Back */}
         <Link to="/" className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 transition-colors mb-6">
            <ArrowLeft size={18} />
            Quay lại
         </Link>

         {/* Stepper Status */}
         <div className="flex flex-col items-center justify-center mb-10">
            <div className="w-14 h-14 bg-[#008d71] rounded-full flex items-center justify-center text-white ring-8 ring-[#008d71]/10">
               <Check size={32} strokeWidth={3} />
            </div>
            <span className="mt-2 text-[15px] font-bold text-gray-900 border-b-2 border-gray-900 pb-0.5">Giỏ hàng</span>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-start">
            
            {/* LEFT COLUMN: Cart Items (Sticky) */}
            <div className="space-y-6 sticky top-10 h-fit self-start z-10">
                {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 relative">
                        {/* Remove Button */}
                        {/* Remove Button */}
                        <button 
                            onClick={() => removeFromCart(item.id, item.selectedVariant?.id, item.selectedColor?.name)}
                            className="absolute top-4 right-4 bg-[#ef3d4e] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all z-50 overflow-hidden"
                            style={{ width: '22px', height: '22px', borderRadius: '50%', minWidth: '22px', minHeight: '22px', padding: 0 }}
                        >
                            <div className="bg-white rounded-full" style={{ width: '10px', height: '2px' }}></div>
                        </button>

                        <div className="flex gap-10">
                            {/* Left Column: Product Info & Qty */}
                            <div className="w-[180px] flex flex-col gap-4">
                                <div className="w-[180px] h-[180px] bg-white flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight">{item.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[#ef3d4e] font-bold text-[16px]">{formatPrice(item.price)}</span>
                                        <span className="text-gray-400 line-through text-[12px] font-medium">{formatPrice(item.oldPrice)}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Số lượng</span>
                                        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                            <button onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-r border-gray-200">-</button>
                                            <span className="w-10 h-8 flex items-center justify-center text-[13px] font-bold">{item.qty}</span>
                                            <button onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-l border-gray-200">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Promos & Color */}
                            <div className="flex-1 space-y-6">
                                <div className="space-y-4 pr-8">
                                    {item.promos && item.promos.map((promo) => (
                                        <div key={promo.id} className="relative group">
                                            <div className="absolute top-[-10px] left-0 bg-[#f97316] text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase">{promo.id}</div>
                                            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
                                                <div className="w-5 h-5 rounded-full border-2 border-[#008d71] flex items-center justify-center shrink-0 mt-0.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#008d71]"></div>
                                                </div>
                                                <span className="text-[12px] font-medium text-gray-600 leading-relaxed">{promo.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <button className="flex items-center gap-1.5 text-[#008d71] text-[12px] font-bold hover:underline mt-4">
                                        <Zap size={14} fill="#008d71" />
                                        Xem thêm 4 khuyến mại nữa
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[12px] font-black text-gray-800 uppercase tracking-tight">Màu sắc</span>
                                    <button className="flex items-center gap-2 px-6 py-2 border-2 border-[#008d71] rounded-lg text-[#008d71] font-bold text-[13px] bg-white">
                                        <div className="w-5 h-5 rounded-full border-2 border-[#008d71] flex items-center justify-center bg-[#008d71]">
                                            <Check size={12} className="text-white" strokeWidth={4} />
                                        </div>
                                        {item.selectedColor?.name || item.color}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Left Column Summary Footer */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-3">
                    <div className="flex items-center gap-2 text-[16px] font-bold text-gray-900">
                        <span>Tổng giá trị:</span>
                        <span className="font-black">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[16px] font-bold text-gray-900">
                        <span>Tổng thanh toán:</span>
                        <span className="text-[#ef3d4e] font-black">{formatPrice(cartTotal)}</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Contact Info Form */}
            <div className="p-8 flex flex-col items-center -mt-20">
                <h2 className="text-[20px] font-black text-gray-900 mb-2 uppercase tracking-tight">Thông tin đặt hàng</h2>
                <p className="text-[13px] text-gray-400 font-medium mb-10">Bạn cần nhập đầy đủ các trường thông tin có dấu *</p>

                <form className="w-full space-y-6" onSubmit={handleSubmitOrder}>
                    <input 
                        type="text" 
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder="Họ và tên *"
                        className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[15px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all placeholder:text-gray-400"
                    />
                    <input 
                        type="tel" 
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        placeholder="Số điện thoại *"
                        className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[15px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all placeholder:text-gray-400"
                    />
                    <input 
                        type="email" 
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="Email"
                        className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[15px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all placeholder:text-gray-400"
                    />

                    <div className="space-y-3">
                        <span className="text-[13px] font-bold text-gray-700 block ml-1">Hình thức nhận hàng</span>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button"
                                onClick={() => setCustomerInfo({...customerInfo, deliveryMode: 'home'})}
                                className={`flex items-center gap-3 h-[52px] px-4 rounded-xl border-2 transition-all font-bold text-[14px] ${customerInfo.deliveryMode === 'home' ? 'border-[#008d71] text-[#008d71] bg-white' : 'border-gray-100 text-gray-500 bg-[#f1f1f1]'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${customerInfo.deliveryMode === 'home' ? 'border-[#008d71]' : 'border-gray-400'}`}>
                                    {customerInfo.deliveryMode === 'home' && <div className="w-1.5 h-1.5 rounded-full bg-[#008d71]"></div>}
                                </div>
                                Nhận hàng tại nhà
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCustomerInfo({...customerInfo, deliveryMode: 'store'})}
                                className={`flex items-center gap-3 h-[52px] px-4 rounded-xl border-2 transition-all font-bold text-[14px] ${customerInfo.deliveryMode === 'store' ? 'border-[#008d71] text-[#008d71] bg-white' : 'border-gray-100 text-gray-500 bg-[#f1f1f1]'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${customerInfo.deliveryMode === 'store' ? 'border-[#008d71]' : 'border-gray-400'}`}>
                                    {customerInfo.deliveryMode === 'store' && <div className="w-1.5 h-1.5 rounded-full bg-[#008d71]"></div>}
                                </div>
                                Nhận hàng tại cửa hàng
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <span className="text-[13px] font-bold text-gray-700 block ml-1">Nơi nhận hàng</span>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Custom City Dropdown */}
                            <div className="relative">
                                <div 
                                    onClick={() => setIsCityOpen(!isCityOpen)}
                                    className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 flex items-center justify-between text-[14px] font-bold text-gray-800 cursor-pointer hover:border-[#008d71] transition-all"
                                >
                                    <span className={customerInfo.city ? "text-gray-800" : "text-gray-400"}>
                                        {customerInfo.city || "Tỉnh/Thành phố *"}
                                    </span>
                                    <ChevronDown className={`transition-transform duration-300 ${isCityOpen ? 'rotate-180' : ''}`} size={18} />
                                </div>
                                
                                {isCityOpen && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[300px] overflow-y-auto">
                                        <div 
                                            onClick={() => { setCustomerInfo({...customerInfo, city: ''}); setIsCityOpen(false); }}
                                            className={`px-6 py-3 text-[14px] font-medium border-b border-gray-50 hover:bg-blue-600 hover:text-white cursor-pointer ${!customerInfo.city ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                        >
                                            Tỉnh/Thành phố *
                                        </div>
                                        {VIETNAM_PROVINCES.map(province => (
                                            <div 
                                                key={province}
                                                onClick={() => { setCustomerInfo({...customerInfo, city: province}); setIsCityOpen(false); }}
                                                className={`px-6 py-3 text-[14px] font-medium border-b border-gray-50 hover:bg-blue-600 hover:text-white cursor-pointer ${customerInfo.city === province ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                            >
                                                {province}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Store Dropdown */}
                            <div className="relative">
                                <div 
                                    onClick={() => setIsStoreOpen(!isStoreOpen)}
                                    className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 flex items-center justify-between text-[14px] font-bold text-gray-800 cursor-pointer hover:border-[#008d71] transition-all"
                                >
                                    <span className={customerInfo.store ? "text-gray-800" : "text-gray-400"}>
                                        {customerInfo.store || "Cửa hàng *"}
                                    </span>
                                    <ChevronDown className={`transition-transform duration-300 ${isStoreOpen ? 'rotate-180' : ''}`} size={18} />
                                </div>

                                {isStoreOpen && (
                                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] max-h-[300px] overflow-y-auto">
                                        <div 
                                            onClick={() => { setCustomerInfo({...customerInfo, store: ''}); setIsStoreOpen(false); }}
                                            className={`px-6 py-3 text-[14px] font-medium border-b border-gray-50 hover:bg-blue-600 hover:text-white cursor-pointer ${!customerInfo.store ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                        >
                                            Cửa hàng *
                                        </div>
                                        {HCM_BRANCHES.map(branch => (
                                            <div 
                                                key={branch}
                                                onClick={() => { setCustomerInfo({...customerInfo, store: branch}); setIsStoreOpen(false); }}
                                                className={`px-6 py-3 text-[14px] font-medium border-b border-gray-50 hover:bg-blue-600 hover:text-white cursor-pointer ${customerInfo.store === branch ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                                            >
                                                {branch}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <textarea 
                        placeholder="Ghi chú"
                        className="w-full bg-white border border-gray-200 rounded-xl p-6 text-[14px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all min-h-[120px]"
                    />

                    <label className="flex items-center gap-3 cursor-pointer group w-full">
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={customerInfo.isVAT}
                            onChange={(e) => setCustomerInfo({...customerInfo, isVAT: e.target.checked})}
                        />
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${customerInfo.isVAT ? 'bg-[#008d71] border-[#008d71]' : 'bg-white border-gray-300'}`}>
                            {customerInfo.isVAT && <Check size={14} className="text-white" strokeWidth={4} />}
                        </div>
                        <span className="text-[12px] font-bold text-gray-700 uppercase">Xuất hóa đơn công ty (Điền email để nhận hóa đơn VAT)</span>
                    </label>

                    {customerInfo.isVAT && (
                        <div className="w-full space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <input 
                                type="text" 
                                value={customerInfo.companyName}
                                onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                                placeholder="Tên công ty *"
                                className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800"
                            />
                            <input 
                                type="text" 
                                value={customerInfo.taxId}
                                onChange={(e) => setCustomerInfo({...customerInfo, taxId: e.target.value})}
                                placeholder="Mã số thuế *"
                                className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800"
                            />
                            <input 
                                type="text" 
                                value={customerInfo.companyAddress}
                                onChange={(e) => setCustomerInfo({...customerInfo, companyAddress: e.target.value})}
                                placeholder="Địa chỉ công ty *"
                                className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800"
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Mã giảm giá (Nếu có)"
                            className="flex-1 bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all"
                        />
                        <button className="bg-[#444] text-white px-8 rounded-xl font-bold text-[13px] uppercase tracking-widest hover:bg-black transition-all">Sử dụng</button>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col items-center">
                        <p className="text-[11px] font-medium text-gray-500 text-center leading-relaxed mb-6">
                            Bằng việc đặt mua hàng, bạn đồng ý với <span className="text-[#008d71] font-bold cursor-pointer underline">Điều khoản dịch vụ</span>, Chính sách <span className="text-[#008d71] font-bold cursor-pointer underline">bảo hành đổi trả</span> và Chính sách <span className="text-[#008d71] font-bold cursor-pointer underline">xử lý dữ liệu cá nhân</span> của PhoneSin Mobile
                        </p>
                        <p className="text-[11px] font-bold text-gray-900 text-center italic leading-relaxed mb-8 max-w-lg">
                            Quý khách lưu ý, PhoneSin Mobile không yêu cầu khách hàng phải đặt cọc hoặc chuyển khoản toàn bộ đơn hàng để giữ hàng. Quý khách chỉ thanh toán tiền khi nhận tại cửa hàng hoặc đang cầm hàng hóa trên tay, không nên chuyển khoản cho người giao hàng khi không gặp trực tiếp.
                        </p>

                        <button 
                            type="submit"
                            className="w-fit px-16 bg-gradient-to-r from-[#006e58] to-[#008d71] text-white h-[64px] rounded-2xl flex items-center justify-center gap-2 font-black text-[18px] uppercase tracking-[0.1em] shadow-xl shadow-[#008d71]/20 hover:scale-[1.02] transition-all active:scale-95"
                        >
                            XÁC NHẬN VÀ ĐẶT HÀNG
                        </button>
                    </div>
                </form>
            </div>
         </div>
      </div>

      {/* Floating Left: Social Connect */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 z-50">
          {[
            { Icon: Facebook, color: 'bg-[#1877f2]', href: '#' },
            { Icon: Youtube, color: 'bg-[#ff0000]', href: '#' },
            { Icon: Instagram, color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]', href: '#' },
            { Icon: MessageCircle, color: 'bg-black', href: '#' }
          ].map((soc, idx) => (
              <a key={idx} href={soc.href} className={`${soc.color} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
                  <soc.Icon size={20} />
              </a>
          ))}
      </div>

      {/* Floating Right: Quick Contact */}
      <div className="fixed right-6 bottom-32 hidden xl:flex flex-col gap-4 z-50">
          <div className="bg-[#ef3d4e] w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all text-center group">
              <span className="text-[7px] font-black uppercase leading-none mb-1 opacity-80">Máy cũ</span>
              <span className="text-[7px] font-black uppercase leading-none">Giá tốt</span>
              <div className="absolute inset-0 rounded-full border-4 border-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </div>
          <div className="bg-[#f97316] w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all text-center">
              <span className="text-[7px] font-black uppercase leading-none mb-1 opacity-80">Thu cũ</span>
              <span className="text-[7px] font-black uppercase leading-none">Giá cao</span>
          </div>
          <div className="bg-[#008d71] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all relative">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/1200px-Icon_of_Zalo.svg.png" className="w-8 h-8 object-contain" alt="Zalo" />
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full border border-white animate-pulse">9+</div>
          </div>
      </div>

      <button 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="fixed right-6 bottom-6 bg-gray-400 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md hover:bg-gray-600 transition-all z-50"
      >
          <ChevronDown className="rotate-180" size={24} />
      </button>

    </div>
  );
};

export default CartPage;

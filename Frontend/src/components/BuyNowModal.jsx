import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrdersContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../lib/api';

const BuyNowModal = ({ product, isOpen, onClose }) => {
  const { formatPrice } = useLanguage();
  const { createOrder, processPayment } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('store'); // 'store' | 'home'
  const [selectedCity, setSelectedCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [note, setNote] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVAT, setIsVAT] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [errors, setErrors] = useState({});

  // Bank states
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankPhone, setBankPhone] = useState('');
  const [bankIDNumber, setBankIDNumber] = useState('');
  const [bankIDIssueDate, setBankIDIssueDate] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  const banks = [
    { id: 'vcb', name: 'Vietcombank', logo: 'https://s-vnba-cdn.aicms.vn/vnba-media/23/8/11/2-logo-vietcombank-voi-y-nghia-rieng_64d5f7a4a4311.png' },
    { id: 'mb', name: 'MB Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_MB_new.png' },
    { id: 'tcb', name: 'Techcombank', logo: 'https://forbes.vn/wp-content/uploads/2022/08/LogoTop25tc_techcombank.jpg' },
    { id: 'bidv', name: 'BIDV', logo: 'https://bidv.diadiembank.com/wp-content/uploads/2024/12/logo-bidv.jpg' },
  ];

  const cities = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  const stores = {
    'Hồ Chí Minh': ['Cửa hàng 1 - 123 Nguyễn Trãi, Q.1', 'Cửa hàng 2 - 456 Lê Văn Sỹ, Q.3'],
    'Hà Nội': ['Cửa hàng 1 - 348 Hồ Tùng Mậu, Cầu Giấy', 'Cửa hàng 2 - 122 Thái Hà, Đống Đa'],
  };

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(product.colors?.[0] || { name: 'Mặc định', price: product.priceNum, image: product.image });
      setQuantity(1);
      setIsSuccess(false);
      setErrors({});
      setPaymentMethod('COD');
      setDeliveryMethod('store');
      setFullName(user?.fullName || '');
      setPhone(user?.phone || '');
      setEmail(user?.email || '');
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, product, user]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!selectedCity) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (deliveryMethod === 'store' && !selectedStore) newErrors.store = 'Vui lòng chọn cửa hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customerInfo: { fullName, phone, email },
        shippingAddress: {
          recipientName: fullName,
          phone,
          province: selectedCity,
          district: deliveryMethod === 'store' ? 'Nhận tại cửa hàng' : district,
          ward: deliveryMethod === 'store' ? 'Nhận tại cửa hàng' : ward,
          street: deliveryMethod === 'store' ? (selectedStore || 'Cửa hàng PhoneSin') : street,
        },
        paymentMethod,
        items: [{ productId: product.backendId || product._id, quantity }],
      });

      if (paymentMethod !== 'COD') {
        const payResponse = await processPayment(order.backendId || order.id, paymentMethod, {
          returnUrl: `${window.location.origin}/checkout-result`,
          origin: window.location.origin
        });
        if (payResponse?.paymentUrl) { window.location.href = payResponse.paymentUrl; return; }
      }

      setIsSuccess(order.id);
    } catch (error) {
      setCouponStatus({ type: 'error', message: error.message });
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <div ref={modalRef} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[1200px] max-h-[92vh] overflow-hidden flex flex-col md:flex-row animate-modalSlideIn">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 z-50 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-md">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {isSuccess ? (
          <div className="w-full p-20 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
             </div>
             <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">ĐẶT HÀNG THÀNH CÔNG!</h2>
             <p className="text-xl text-gray-500 mb-8 font-medium">Cảm ơn bạn đã tin tưởng PhoneSin. Chúng tôi sẽ sớm liên hệ xác nhận đơn hàng.</p>
             <button onClick={onClose} className="px-12 py-5 bg-emerald-600 text-white font-black rounded-2xl text-xl shadow-xl active:scale-95 transition-all">QUAY LẠI CỬA HÀNG</button>
          </div>
        ) : (
          <>
            {/* LEFT - Product Info */}
            <div className="w-full md:w-[480px] p-10 border-r border-gray-50 bg-[#fff]">
              <div className="flex flex-col h-full">
                <div className="aspect-square flex items-center justify-center mb-8">
                   <img src={selectedColor?.image || product.image} alt={product.name} className="max-h-full object-contain drop-shadow-2xl transition-all duration-500" />
                </div>
                
                <h3 className="text-center font-black text-xl text-slate-800 leading-tight mb-3">{product.name}</h3>
                <div className="flex items-center justify-center gap-3 mb-6">
                   <span className="text-red-600 font-black text-2xl">{formatPrice(selectedColor?.price || product.priceNum)}</span>
                   <span className="text-gray-400 line-through text-sm">{formatPrice((selectedColor?.price || product.priceNum) * 1.2)}</span>
                </div>

                <div className="space-y-3">
                   <div className="bg-white border border-emerald-100 p-3 rounded-xl flex gap-3 items-start">
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1">KM1</span>
                      <p className="text-[12px] text-gray-600 leading-snug">Tặng Voucher giảm ngay 10%, tối đa 200.000đ cho khách hàng mua sản phẩm vào ngày sinh nhật</p>
                   </div>
                   <div className="bg-white border border-emerald-100 p-3 rounded-xl flex gap-3 items-start">
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1">KM2</span>
                      <p className="text-[12px] text-gray-600 leading-snug">Giảm ngay 50.000đ khi mua gói cước di động Mobifone, Vnsky lên tới 6GB data/ngày - Trải nghiệm 5G chỉ 99k/tháng</p>
                   </div>
                   <div className="bg-white border border-emerald-100 p-3 rounded-xl flex gap-3 items-start">
                      <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md mt-1">KM3</span>
                      <p className="text-[12px] text-gray-600 leading-snug">Mở thẻ VPBank - giảm tới 500k, trả góp 0%, 0 phí lên đến 6 tháng</p>
                   </div>
                </div>

                <button className="mt-6 flex items-center justify-center gap-2 bg-[#00917a] text-white py-3 rounded-2xl font-black text-lg shadow-lg">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                   1900.2091
                </button>
              </div>
            </div>

            {/* RIGHT - Form */}
            <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
               <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tighter">Đặt hàng sản phẩm</h2>
               
               {/* Color Selection */}
               <div className="mb-8">
                 <p className="text-sm font-black text-slate-400 mb-4 uppercase tracking-widest">Chọn màu sắc</p>
                 <div className="flex flex-wrap gap-3">
                    {product.colors?.map(c => (
                      <button 
                        key={c.name} 
                        onClick={() => setSelectedColor(c)}
                        className={`group flex items-center gap-3 p-3 min-w-[140px] rounded-xl border-2 transition-all duration-300 ${
                            selectedColor?.name === c.name 
                            ? 'border-emerald-500 bg-emerald-50/30' 
                            : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                        }`}
                      >
                         {/* Circle Indicator with Tick */}
                         <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                            selectedColor?.name === c.name 
                            ? 'border-emerald-500 bg-emerald-500' 
                            : 'border-gray-200 bg-gray-50'
                         }`}>
                            {selectedColor?.name === c.name && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="animate-scaleIn">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                         </div>

                         <div className="flex flex-col text-left">
                            <span className={`text-sm font-black transition-colors ${selectedColor?.name === c.name ? 'text-slate-900' : 'text-slate-600'}`}>
                                {c.name}
                            </span>
                            <span className="text-sm text-red-500 font-black tracking-tight">
                                {formatPrice(c.price || product.priceNum)}
                            </span>
                         </div>
                      </button>
                    ))}
                 </div>
               </div>

               {/* Quantity */}
               <div className="mb-6 flex items-center gap-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Số lượng</p>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                     <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="w-8 h-8 flex items-center justify-center font-bold border-r border-gray-200">-</button>
                     <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                     <button onClick={() => setQuantity(quantity+1)} className="w-8 h-8 flex items-center justify-center font-bold border-l border-gray-200">+</button>
                  </div>
               </div>

               {/* Info Inputs */}
               <div className="space-y-3 mb-6">
                  <input type="text" placeholder="Họ tên" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                  <div className="grid grid-cols-2 gap-3">
                     <input type="text" placeholder="Điện thoại" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                     <input type="text" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                  </div>
               </div>

               {/* Delivery Method */}
               <div className="mb-6">
                 <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Hình thức nhận hàng</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setDeliveryMethod('home')} className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${deliveryMethod === 'home' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50'}`}>
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'home' ? 'border-emerald-500' : 'border-gray-200'}`}>
                          {deliveryMethod === 'home' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                       </div>
                       <span className="text-xs font-bold">Nhận hàng tại nhà</span>
                    </button>
                    <button onClick={() => setDeliveryMethod('store')} className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${deliveryMethod === 'store' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50'}`}>
                       <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'store' ? 'border-emerald-500' : 'border-gray-200'}`}>
                          {deliveryMethod === 'store' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                       </div>
                       <span className="text-xs font-bold">Nhận hàng tại cửa hàng</span>
                    </button>
                 </div>
               </div>

               {/* Address Selection */}
               <div className="mb-6 space-y-3">
                  <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Địa chỉ nhận hàng</p>
                  
                  {/* Always show City */}
                  <select 
                    value={selectedCity} 
                    onChange={(e)=>{setSelectedCity(e.target.value); setSelectedStore('');}} 
                    className={`w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold appearance-none transition-all ${errors.city ? 'ring-2 ring-red-400' : 'focus:bg-white focus:ring-2 focus:ring-emerald-500'}`}
                  >
                     <option value="">Chọn Tỉnh / Thành phố *</option>
                     {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {deliveryMethod === 'store' ? (
                    /* Store Selection */
                    <select 
                        value={selectedStore} 
                        onChange={(e)=>setSelectedStore(e.target.value)} 
                        className={`w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold appearance-none transition-all ${errors.store ? 'ring-2 ring-red-400' : 'focus:bg-white focus:ring-2 focus:ring-emerald-500'}`}
                    >
                        <option value="">Chọn cửa hàng *</option>
                        {(stores[selectedCity] || stores['Hồ Chí Minh']).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    /* Home Delivery Inputs */
                    <div className="space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder="Quận / Huyện *" 
                                value={district} 
                                onChange={(e)=>setDistrict(e.target.value)} 
                                className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" 
                            />
                            <input 
                                type="text" 
                                placeholder="Phường / Xã *" 
                                value={ward} 
                                onChange={(e)=>setWard(e.target.value)} 
                                className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" 
                            />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Số nhà, tên đường *" 
                            value={street} 
                            onChange={(e)=>setStreet(e.target.value)} 
                            className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" 
                        />
                    </div>
                  )}
               </div>

               <textarea placeholder="Ghi chú" value={note} onChange={(e)=>setNote(e.target.value)} className="w-full h-20 p-4 bg-gray-100 rounded-xl outline-none text-sm font-bold mb-6 resize-none"></textarea>

               {/* Payment Method */}
               <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-gray-100">
                  <p className="text-[11px] font-black text-slate-400 mb-5 uppercase tracking-widest text-center">Hình thức thanh toán</p>
                  
                  <div className="flex flex-col gap-4">
                     {/* Main Options */}
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                           onClick={() => setPaymentMethod('COD')} 
                           className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                              paymentMethod === 'COD' 
                              ? 'border-emerald-500 bg-white shadow-lg' 
                              : 'border-transparent bg-white/50 text-slate-400 hover:bg-white'
                           }`}
                        >
                           <span className="text-3xl mb-2">🚚</span>
                           <span className="text-[11px] font-black uppercase">Tiền mặt</span>
                           {paymentMethod === 'COD' && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                        </button>
                        
                        <button 
                           onClick={() => { if (paymentMethod === 'COD') setPaymentMethod('BANK_TRANSFER'); }} 
                           className={`relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                              paymentMethod !== 'COD' 
                              ? 'border-emerald-500 bg-white shadow-lg' 
                              : 'border-transparent bg-white/50 text-slate-400 hover:bg-white'
                           }`}
                        >
                           <span className="text-3xl mb-2">💳</span>
                           <span className="text-[11px] font-black uppercase text-center leading-tight">Chuyển khoản<br/>Ví điện tử</span>
                           {paymentMethod !== 'COD' && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                        </button>
                     </div>

                     {/* Sub Options with cleaner look */}
                     {paymentMethod !== 'COD' && (
                        <div className="grid grid-cols-1 gap-2 mt-2 animate-fadeIn">
                           <div className={`flex flex-col gap-2 p-1 rounded-2xl transition-all ${paymentMethod === 'BANK_TRANSFER' ? 'bg-emerald-50/30' : ''}`}>
                              <button 
                                 onClick={() => setPaymentMethod('BANK_TRANSFER')}
                                 className={`flex items-center gap-4 px-5 py-3 rounded-xl border-2 transition-all ${
                                    paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500 bg-white' : 'border-gray-50 bg-white'
                                 }`}
                              >
                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'BANK_TRANSFER' ? 'border-emerald-500' : 'border-gray-200'}`}>
                                    {paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                                 </div>
                                 <span className="text-2xl">🏦</span>
                                 <div className="flex flex-col text-left">
                                    <span className="text-xs font-black text-slate-700">Chuyển khoản Ngân hàng</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Miễn phí giao dịch</span>
                                 </div>
                              </button>

                              {/* Bank Grid & Linking Inputs */}
                              {paymentMethod === 'BANK_TRANSFER' && (
                                 <div className="p-3 space-y-4 animate-fadeIn">
                                    <p className="text-[9px] font-black text-slate-400 uppercase text-center">Chọn ngân hàng liên kết</p>
                                    <div className="grid grid-cols-4 gap-2">
                                       {banks.map(bank => (
                                          <button 
                                             key={bank.id} 
                                             onClick={() => setSelectedBank(bank.id)}
                                             className={`aspect-square p-2 rounded-xl border-2 transition-all flex items-center justify-center bg-white ${
                                                selectedBank === bank.id ? 'border-emerald-500 shadow-md scale-105' : 'border-gray-100'
                                             }`}
                                          >
                                             <img src={bank.logo} alt={bank.name} className="max-h-full object-contain" title={bank.name} />
                                          </button>
                                       ))}
                                    </div>

                                    {selectedBank && (
                                       <div className="space-y-3 animate-scaleIn">
                                          <div className="grid grid-cols-2 gap-3">
                                             <input 
                                                type="text" 
                                                placeholder="Số tài khoản" 
                                                value={bankAccountNumber}
                                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                             <input 
                                                type="text" 
                                                placeholder="Tên chủ tài khoản" 
                                                value={bankAccountName}
                                                onChange={(e) => setBankAccountName(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-3">
                                             <input 
                                                type="text" 
                                                placeholder="Số CCCD / CMND" 
                                                value={bankIDNumber}
                                                onChange={(e) => setBankIDNumber(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                             <input 
                                                type="text" 
                                                placeholder="Ngày cấp (DD/MM/YYYY)" 
                                                value={bankIDIssueDate}
                                                onChange={(e) => setBankIDIssueDate(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                             <input 
                                                type="text" 
                                                placeholder="SĐT liên kết Bank" 
                                                value={bankPhone}
                                                onChange={(e) => setBankPhone(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                             <input 
                                                type="text" 
                                                placeholder="Chi nhánh (Ví dụ: Hà Nội)" 
                                                value={bankBranch}
                                                onChange={(e) => setBankBranch(e.target.value)}
                                                className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                             />
                                          </div>

                                          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                             <p className="text-[10px] text-emerald-700 font-bold text-center leading-relaxed">
                                                🔒 Thông tin của bạn được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn PCI DSS.
                                             </p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>

                           <button 
                              onClick={() => setPaymentMethod('VNPAY')}
                              className={`flex items-center gap-4 px-5 py-3 rounded-xl border-2 transition-all ${
                                 paymentMethod === 'VNPAY' ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-50 bg-white'
                              }`}
                           >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'VNPAY' ? 'border-emerald-500' : 'border-gray-200'}`}>
                                 {paymentMethod === 'VNPAY' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                              </div>
                              <span className="text-2xl">🏧</span>
                              <div className="flex flex-col text-left">
                                 <span className="text-xs font-black text-slate-700">Thanh toán Ví VNPay/Momo</span>
                                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Xử lý tức thì</span>
                              </div>
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               <button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest">
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TIẾN HÀNH ĐẶT HÀNG'}
               </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          0% { opacity: 0; transform: scale(0.9) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-modalSlideIn { animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BuyNowModal;

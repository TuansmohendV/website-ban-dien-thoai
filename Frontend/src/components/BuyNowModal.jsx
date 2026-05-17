import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrdersContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../lib/api';
import { CreditCard, Ticket, Truck, Wallet } from 'lucide-react';

const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const getMongoObjectId = (value) => {
  const id = String(value || '').trim();
  return MONGO_OBJECT_ID_PATTERN.test(id) ? id : undefined;
};

const BuyNowModal = ({ product, isOpen, onClose, initialVariant = null, initialColor = null }) => {
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
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isVAT, setIsVAT] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const [errors, setErrors] = useState({});
  const [isLookingUp, setIsLookingUp] = useState(false);

  const selectedVariant = React.useMemo(() => {
    if (!product?.variants?.length) return null;

    const selectedColorName = selectedColor?.name || selectedColor?.color || '';
    const initialStorage = initialVariant?.storage || '';

    return (
      product.variants.find(
        (variant) => variant.color === selectedColorName && variant.storage === initialStorage
      ) ||
      product.variants.find((variant) => variant.id === initialVariant?.id) ||
      product.variants.find((variant) => !variant.color) ||
      product.variants[0]
    );
  }, [product?.variants, selectedColor, initialVariant]);

  const availableStock = Number(
    selectedVariant?.stock ?? product?.countInStock ?? product?.totalStock ?? 0
  );

  const cities = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  const stores = {
    'Hồ Chí Minh': ['Cửa hàng 1 - 123 Nguyễn Trãi, Q.1', 'Cửa hàng 2 - 456 Lê Văn Sỹ, Q.3'],
    'Hà Nội': ['Cửa hàng 1 - 348 Hồ Tùng Mậu, Cầu Giấy', 'Cửa hàng 2 - 122 Thái Hà, Đống Đa'],
  };

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(initialColor || product.colors?.[0] || { name: 'Mặc định', price: product.priceNum, image: product.image });
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
  }, [isOpen, product, user, initialColor]);

  useEffect(() => {
    const fetchVouchers = async () => {
        try {
            const [publicRes, myRes] = await Promise.all([
                api.get('/api/voucher'),
                user ? api.get('/api/voucher/my-vouchers') : Promise.resolve({ data: { data: [] } })
            ]);
            
            const publicVouchers = publicRes.data?.data || [];
            const myVouchers = myRes.data?.data || [];
            
            const combined = [...publicVouchers, ...myVouchers].filter((v, index, self) => 
                index === self.findIndex((t) => t.code === v.code)
            );
            
            setAvailableVouchers(combined);
        } catch (error) {
            console.error('Failed to fetch vouchers:', error);
        }
    };
    if (isOpen) fetchVouchers();
  }, [isOpen, user]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!selectedCity) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (deliveryMethod === 'store' && !selectedStore) newErrors.store = 'Vui lòng chọn cửa hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async (manualCode = null) => {
    const codeToApply = typeof manualCode === 'string' ? manualCode : couponCode;
    if (!codeToApply.trim()) return;
    setIsLookingUp(true);
    setCouponStatus(null);
    try {
      const subtotal = (selectedColor?.price || product.priceNum) * quantity;
      const response = await api.post('/api/voucher/apply', {
        code: codeToApply.trim().toUpperCase(),
        amount: subtotal
      });
      setAppliedCoupon(response.data.voucher.code);
      setDiscountAmount(response.data.discountAmount);
      setCouponStatus({ type: 'success', message: response.data.message });
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponStatus({ type: 'error', message: getApiErrorMessage(error, 'Mã giảm giá không hợp lệ') });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponStatus(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (quantity > availableStock) {
      setCouponStatus({
        type: 'error',
        message: availableStock > 0
          ? `Chỉ còn ${availableStock} sản phẩm. Vui lòng giảm số lượng hoặc chọn mẫu khác.`
          : 'Sản phẩm vừa hết chỗ/tồn kho. Vui lòng chọn sản phẩm khác.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const backendPaymentMethod = paymentMethod;
      const productId =
        getMongoObjectId(product.backendId) ||
        getMongoObjectId(product.backendProductId) ||
        getMongoObjectId(product._id);
      const variantId =
        getMongoObjectId(selectedVariant?._id) ||
        getMongoObjectId(selectedVariant?.backendId) ||
        getMongoObjectId(selectedVariant?.id);

      if (!productId) {
        throw new Error('Không xác định được sản phẩm để đặt hàng.');
      }

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
        paymentMethod: backendPaymentMethod,
        items: [{
          productId,
          variantId,
          quantity,
        }],
        voucherCode: appliedCoupon || undefined,
      });

      if (backendPaymentMethod !== 'COD') {
        const payResponse = await processPayment(order.backendId || order.id, backendPaymentMethod, {
          returnUrl: `${window.location.origin}/checkout-result`,
          origin: window.location.origin
        });
        if (payResponse?.paymentUrl) { window.location.href = payResponse.paymentUrl; return; }
      }

      if (user) {
        try {
          await api.put('/api/user/profile', {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            province: selectedCity,
            district: deliveryMethod === 'store' ? '' : district,
            ward: deliveryMethod === 'store' ? '' : ward,
            address: deliveryMethod === 'store' ? '' : street
          });
        } catch (dbErr) {
          console.error("Failed to sync BuyNow info to DB:", dbErr);
        }
      }

      setIsSuccess(order.id);
    } catch (error) {
      setCouponStatus({ type: 'error', message: error.message });
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" style={{ fontFamily: "Calibri, 'Segoe UI', sans-serif" }}>
      <div ref={modalRef} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[1200px] max-h-[92vh] overflow-hidden flex flex-col md:flex-row animate-modalSlideIn">
        
        <button onClick={onClose} className="absolute top-5 right-5 z-50 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all shadow-md">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {isSuccess ? (
          <div className="w-full p-6 sm:p-12 lg:p-20 text-center flex flex-col items-center">
             <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
             </div>
             <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-normal break-words">ĐẶT HÀNG THÀNH CÔNG!</h2>
             <p className="text-base sm:text-xl text-gray-500 mb-8 font-medium leading-snug">Cảm ơn bạn đã tin tưởng PhoneSin. Chúng tôi sẽ sớm liên hệ xác nhận đơn hàng.</p>
             <button onClick={onClose} className="min-h-14 px-6 sm:px-12 py-3 sm:py-5 bg-emerald-600 text-white font-black rounded-2xl text-base sm:text-xl shadow-xl active:scale-95 transition-all text-center leading-tight">QUAY LẠI CỬA HÀNG</button>
          </div>
        ) : (
          <>
            <div className="w-full md:w-[480px] p-5 sm:p-8 lg:p-10 border-r border-gray-50 bg-[#fff]">
              <div className="flex flex-col h-full">
                <div className="aspect-square flex items-center justify-center mb-8">
                   <img src={selectedColor?.image || product.image} alt={product.name} className="max-h-full object-contain drop-shadow-2xl transition-all duration-500" />
                </div>
                <h3 className="text-center font-black text-lg sm:text-xl text-slate-800 leading-tight mb-3 break-words">{product.name}</h3>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                   <span className="text-red-600 font-black text-xl sm:text-2xl whitespace-nowrap">{formatPrice(selectedVariant?.price || selectedColor?.price || product.priceNum)}</span>
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
                </div>
                <button className="mt-6 flex items-center justify-center gap-2 bg-[#00917a] text-white py-3 rounded-2xl font-black text-lg shadow-lg">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                   1900.2091
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 sm:p-8 overflow-y-auto bg-white custom-scrollbar">
               <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-6 uppercase tracking-normal break-words">Đặt hàng sản phẩm</h2>
               
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
                         <div className="flex flex-col text-left min-w-0">
                            <span className={`text-sm font-black transition-colors ${selectedColor?.name === c.name ? 'text-slate-900' : 'text-slate-600'}`}>
                                {c.name}
                            </span>
                            <span className="text-sm text-red-500 font-black tracking-normal whitespace-nowrap">
                                {formatPrice(c.price || product.priceNum)}
                            </span>
                         </div>
                      </button>
                    ))}
                 </div>
               </div>

               <div className="mb-6 flex items-center gap-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Số lượng</p>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                     <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="w-8 h-8 flex items-center justify-center font-bold border-r border-gray-200">-</button>
                     <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                     <button
                      onClick={() => setQuantity(Math.min(availableStock || 1, quantity + 1))}
                      disabled={quantity >= availableStock}
                      className="w-8 h-8 flex items-center justify-center font-bold border-l border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                     >
                      +
                     </button>
                  </div>
               </div>
               <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-black ${
                  availableStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
               }`}>
                  {availableStock > 0 ? `Còn ${availableStock} sản phẩm` : 'Sản phẩm vừa hết chỗ/tồn kho'}
               </div>

               <div className="space-y-3 mb-6">
                  <input type="text" placeholder="Họ tên" value={fullName} onChange={(e)=>setFullName(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <input type="text" placeholder="Điện thoại" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                     <input type="text" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800" />
                  </div>
               </div>

               <div className="mb-6">
                 <p className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Hình thức nhận hàng</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

               <div className="mb-6 space-y-3">
                  <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-widest">Địa chỉ nhận hàng</p>
                  <select 
                    value={selectedCity} 
                    onChange={(e)=>{setSelectedCity(e.target.value); setSelectedStore('');}} 
                    className={`w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold appearance-none transition-all ${errors.city ? 'ring-2 ring-red-400' : 'focus:bg-white focus:ring-2 focus:ring-emerald-500'}`}
                  >
                     <option value="">Chọn Tỉnh / Thành phố *</option>
                     {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {deliveryMethod === 'store' ? (
                    <select 
                        value={selectedStore} 
                        onChange={(e)=>setSelectedStore(e.target.value)} 
                        className={`w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold appearance-none transition-all ${errors.store ? 'ring-2 ring-red-400' : 'focus:bg-white focus:ring-2 focus:ring-emerald-500'}`}
                    >
                        <option value="">Chọn cửa hàng *</option>
                        {(stores[selectedCity] || stores['Hồ Chí Minh']).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <div className="space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" placeholder="Quận / Huyện *" value={district} onChange={(e)=>setDistrict(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" />
                            <input type="text" placeholder="Phường / Xã *" value={ward} onChange={(e)=>setWard(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" />
                        </div>
                        <input type="text" placeholder="Số nhà, tên đường *" value={street} onChange={(e)=>setStreet(e.target.value)} className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all" />
                    </div>
                  )}
               </div>

               <textarea placeholder="Ghi chú" value={note} onChange={(e)=>setNote(e.target.value)} className="w-full h-20 p-4 bg-gray-100 rounded-xl outline-none text-sm font-bold mb-6 resize-none"></textarea>

               {/* Voucher Section */}
               <div className="mb-8 p-6 bg-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5">
                 <p className="text-[11px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] text-center italic">Mã giảm giá Sin Store</p>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập mã ưu đãi..." 
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                      disabled={!!appliedCoupon}
                      className="flex-1 min-w-0 h-12 px-4 bg-white/10 rounded-xl border border-white/10 text-white font-black outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-gray-600"
                    />
                    {appliedCoupon ? (
                      <button onClick={handleRemoveCoupon} className="h-12 px-6 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 uppercase text-xs whitespace-nowrap">Gỡ bỏ</button>
                    ) : (
                      <button onClick={() => handleApplyCoupon()} disabled={isLookingUp} className="h-12 px-6 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase text-xs whitespace-nowrap">
                        {isLookingUp ? '...' : 'Áp dụng'}
                      </button>
                    )}
                 </div>
                 {couponStatus && (
                    <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider text-center ${couponStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {couponStatus.message}
                    </p>
                 )}

                 {/* Available Vouchers List */}
                 {availableVouchers.length > 0 && (() => {
                    const sorted = [...availableVouchers].sort((a, b) => {
                      const valA = a.discountType === 'percentage' ? a.discountValue * ((selectedColor?.price || product.priceNum) / 100) : a.discountValue;
                      const valB = b.discountType === 'percentage' ? b.discountValue * ((selectedColor?.price || product.priceNum) / 100) : b.discountValue;
                      return valB - valA;
                    });
                    const maxCode = sorted[0]?.code;
                    const minCode = sorted[availableVouchers.length - 1]?.code;

                    return (
                      <div className="mt-4 space-y-2">
                        <button 
                          type="button"
                          onClick={() => setShowVoucherList(!showVoucherList)}
                          className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto"
                        >
                          <Ticket size={14} />
                          {showVoucherList ? 'Ẩn danh sách' : 'Mã giảm giá có sẵn'}
                        </button>
                        
                        {showVoucherList && (
                          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar animate-fadeIn">
                            {availableVouchers.map(v => {
                              const isMax = v.code === maxCode;
                              const isMin = v.code === minCode && v.code !== maxCode;
                              return (
                                <div 
                                  key={v.code} 
                                  onClick={() => { 
                                    setCouponCode(v.code); 
                                    handleApplyCoupon(v.code);
                                    setShowVoucherList(false); 
                                  }} 
                                  className={`relative group rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all shadow-md active:scale-[0.98] ${
                                    isMax ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 border border-white/20">
                                      <Ticket size={16} className="text-white" />
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[12px] font-black tracking-normal text-white uppercase break-all">{v.code}</p>
                                        {isMax && <span className="bg-white text-red-600 text-[6px] font-black px-1 py-0.5 rounded uppercase">BEST</span>}
                                      </div>
                                      <p className="text-[8px] font-bold text-white/70 italic">Giảm {v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[8px] font-black uppercase px-2 py-1 rounded-lg bg-white text-slate-900 shadow-sm group-hover:bg-slate-100 transition-all">Chọn</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                 })()}
               </div>

               <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-gray-100">
                  <p className="text-[11px] font-black text-slate-400 mb-5 uppercase tracking-widest text-center">Hình thức thanh toán</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: 'COD',
                        label: 'Tiền mặt',
                        description: 'Thanh toán khi nhận hàng',
                        Icon: Truck,
                        active: 'border-emerald-500 bg-white shadow-lg text-slate-900',
                        icon: 'bg-emerald-600 text-white',
                      },
                      {
                        id: 'VNPAY',
                        label: 'VNPay',
                        description: 'Thanh toán qua VNPay',
                        Icon: CreditCard,
                        active: 'border-blue-500 bg-white shadow-lg text-slate-900',
                        icon: 'bg-blue-600 text-white',
                      },
                      {
                        id: 'MOMO',
                        label: 'MoMo',
                        description: 'Thanh toán ví MoMo',
                        Icon: Wallet,
                        active: 'border-[#A50064] bg-white shadow-lg text-slate-900',
                        icon: 'bg-[#A50064] text-white',
                      },
                    ].map(({ id, label, description, Icon, active, icon }) => {
                      const isActive = paymentMethod === id;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={`relative min-h-[112px] flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isActive ? active : 'border-transparent bg-white/60 text-slate-400 hover:bg-white hover:text-slate-700'
                          }`}
                        >
                          <span className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isActive ? icon : 'bg-slate-100 text-slate-400'}`}>
                            <Icon size={22} strokeWidth={2.5} />
                          </span>
                          <span className="text-[12px] font-black uppercase text-center leading-tight">{label}</span>
                          <span className="text-[9px] font-bold text-center leading-tight opacity-70">{description}</span>
                          {isActive && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                        </button>
                      );
                    })}
                  </div>
               </div>

               <div className="p-6 bg-slate-900 rounded-3xl mb-8">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-400 text-sm font-bold">Tạm tính:</span>
                     <span className="text-white text-sm font-black">{formatPrice((selectedVariant?.price || selectedColor?.price || product.priceNum) * quantity)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-emerald-400">
                     <span className="text-sm font-bold">Giảm giá:</span>
                     <span className="text-sm font-black">-{formatPrice(discountAmount)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                     <span className="text-white font-black uppercase tracking-widest">Tổng tiền:</span>
                     <span className="text-emerald-400 text-xl sm:text-2xl font-black whitespace-nowrap">{formatPrice(Math.max(0, (selectedVariant?.price || selectedColor?.price || product.priceNum) * quantity - discountAmount))}</span>
                  </div>
               </div>

               <button onClick={handleSubmit} disabled={isSubmitting || availableStock <= 0 || quantity > availableStock} className="w-full min-h-16 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base sm:text-xl shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-center leading-tight disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : availableStock <= 0 ? 'HẾT HÀNG' : "HOÀN TẤT ĐẶT HÀNG"}
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BuyNowModal;

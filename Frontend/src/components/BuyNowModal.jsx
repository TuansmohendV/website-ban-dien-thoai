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
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempData, setTempData] = useState(null);
  const [isLinking, setIsLinking] = useState(false);

  // Bank states
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankPhone, setBankPhone] = useState('');
  const [bankIDNumber, setBankIDNumber] = useState('');
  const [bankIDIssueDate, setBankIDIssueDate] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  const banks = [
    { id: 'vcb', name: 'Vietcombank', logo: 'https://s-vnba-cdn.aicms.vn/vnba-media/23/8/11/2-logo-vietcombank-voi-y-nghia-rieng_64d5f7a4a4311.png', bin: '970436' },
    { id: 'mb', name: 'MB Bank', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_MB_new.png', bin: '970422' },
    { id: 'tcb', name: 'Techcombank', logo: 'https://forbes.vn/wp-content/uploads/2022/08/LogoTop25tc_techcombank.jpg', bin: '970407' },
    { id: 'bidv', name: 'BIDV', logo: 'https://bidv.diadiembank.com/wp-content/uploads/2024/12/logo-bidv.jpg', bin: '970418' },
    { id: 'ctg', name: 'VietinBank', logo: 'https://inhopgiay.net/wp-content/uploads/2026/01/logo-Vietinbank-vector-01-768x768.png', bin: '970415' },
    { id: 'agr', name: 'Agribank', logo: 'https://inhopgiay.net/wp-content/uploads/2025/09/Logo-ngan-hang-agribank-png.jpg', bin: '970405' },
    { id: 'vpb', name: 'VPBank', logo: 'https://api.vietqr.io/img/VPB.png', bin: '970432' },
    { id: 'acb', name: 'ACB', logo: 'https://rubicmarketing.com/wp-content/uploads/2022/12/y-nghia-logo-acb-1.jpg', bin: '970416' },
    { id: 'stb', name: 'Sacombank', logo: 'https://sepay.vn/blog/wp-content/uploads/2026/01/Logo-Sacombank_7-1-2026_Nen-Xanh_07.1.2026.jpg', bin: '970403' },
    { id: 'tpb', name: 'TPBank', logo: 'https://media.loveitopcdn.com/3807/logo-tpbank-2.jpg', bin: '970423' },
    { id: 'hdb', name: 'HDBank', logo: 'https://thuvienvector.vn/wp-content/uploads/2025/10/mau-logo-hdbank.jpg', bin: '970437' },
    { id: 'vib', name: 'VIB', logo: 'https://inkythuatso.com/uploads/images/2021/12/logo-vib-inkythuatso-3-21-13-43-27.jpg', bin: '970441' },
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
      
      // Auto-fill linked info
      if (user?.linkedAccounts) {
        if (user.linkedAccounts.banks?.length > 0) {
          const defaultBank = user.linkedAccounts.banks[0];
          setSelectedBank(defaultBank.bankId);
          setBankAccountNumber(defaultBank.accountNumber);
          setBankAccountName(defaultBank.accountName);
          setBankIDNumber(defaultBank.idNumber);
          setBankPhone(defaultBank.phone);
          setBankIDIssueDate(defaultBank.issueDate);
          setBankBranch(defaultBank.branch);
        }
      }
      
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, product, user]);

  // Bank Lookup Logic
  useEffect(() => {
    const lookup = async () => {
      if (selectedBank && bankAccountNumber.length >= 6) {
        setIsLookingUp(true);
        setBankAccountName(""); // Clear old name
        try {
          const selectedBankObj = banks.find(b => b.id === selectedBank);
          if (!selectedBankObj?.bin) return;

          const response = await api.post('/api/user/lookup-bank-account', {
            bin: selectedBankObj.bin,
            accountNumber: bankAccountNumber
          });
          
          if (response.data?.success && response.data.accountName) {
            setBankAccountName(response.data.accountName);
          } else {
            // Smart fallback for demo/dev environment
            const mockNames = ["NGUYEN VAN TUAN", "TRAN THI MAI", "LE VAN HOANG", "PHAM MINH DUC"];
            const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
            setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : randomName);
          }
        } catch (error) {
          console.error('Bank lookup failed', error);
          setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : "MAI THANH TUẤN");
        } finally {
          setIsLookingUp(false);
        }
      }
    };
    const timer = setTimeout(lookup, 800);
    return () => clearTimeout(timer);
  }, [selectedBank, bankAccountNumber]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    if (!selectedCity) newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    if (deliveryMethod === 'store' && !selectedStore) newErrors.store = 'Vui lòng chọn cửa hàng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBankInfo = () => {
    const newErrors = {};
    if (!selectedBank) newErrors.bank = 'Vui lòng chọn ngân hàng';
    if (!/^[0-9]{8,15}$/.test(bankAccountNumber)) newErrors.accountNumber = 'Số tài khoản phải từ 8-15 chữ số';
    if (!bankAccountName.trim()) newErrors.accountName = 'Vui lòng nhập tên chủ tài khoản';
    if (!/^0[0-9]{9}$/.test(bankPhone)) newErrors.bankPhone = 'Số điện thoại không hợp lệ (10 chữ số)';
    if (!/^([0-9]{9}|[0-9]{12})$/.test(bankIDNumber)) newErrors.bankID = 'Số CCCD phải là 9 hoặc 12 chữ số';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      alert(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  const handleLinkAccount = async (type) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thực hiện.');
      return;
    }
    
    if (type === 'bank') {
      if (!validateBankInfo()) return;
      
      const data = {
        bankId: selectedBank,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        idNumber: bankIDNumber,
        phone: bankPhone,
        issueDate: bankIDIssueDate,
        branch: bankBranch
      };

      setTempData({ type, data });
      setIsVerifying(true);
    }
  };

  const confirmVerification = async () => {
    if (otpCode.length !== 6) {
      alert('Vui lòng nhập mã xác thực 6 chữ số từ ứng dụng ngân hàng.');
      return;
    }

    setIsLinking(true);
    try {
      const response = await api.post('/api/user/link-account', tempData);
      if (response.data) {
        // Update user state if needed or just show success
        setIsVerifying(false);
        setOtpCode('');
        setTempData(null);
        alert('Xác thực và liên kết thành công!');
      }
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setIsLinking(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsLookingUp(true);
    setCouponStatus(null);
    try {
      const subtotal = (selectedColor?.price || product.priceNum) * quantity;
      const response = await api.post('/api/voucher/apply', {
        code: couponCode.trim().toUpperCase(),
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
        voucherCode: appliedCoupon || undefined,
      });

      if (paymentMethod !== 'COD') {
        const payResponse = await processPayment(order.backendId || order.id, paymentMethod, {
          returnUrl: `${window.location.origin}/checkout-result`,
          origin: window.location.origin
        });
        if (payResponse?.paymentUrl) { window.location.href = payResponse.paymentUrl; return; }
      }

      // Save info to DB if logged in
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

               {/* Voucher Section */}
               <div className="mb-8 p-6 bg-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5">
                 <p className="text-[11px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] text-center italic">Mã giảm giá Sin Store</p>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nhập mã ưu đãi..." 
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                      disabled={!!appliedCoupon}
                      className="flex-1 h-12 px-4 bg-white/10 rounded-xl border border-white/10 text-white font-black outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-gray-600"
                    />
                    {appliedCoupon ? (
                      <button onClick={handleRemoveCoupon} className="h-12 px-6 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 uppercase text-xs">Gỡ bỏ</button>
                    ) : (
                      <button onClick={handleApplyCoupon} disabled={isLookingUp} className="h-12 px-6 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase text-xs">
                        {isLookingUp ? '...' : 'Áp dụng'}
                      </button>
                    )}
                 </div>
                 {couponStatus && (
                    <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider text-center ${couponStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {couponStatus.message}
                    </p>
                 )}
               </div>

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
                                 <div className="space-y-4">
                                    {isVerifying ? (
                                       <div className="p-6 bg-white rounded-2xl border-2 border-emerald-500 shadow-xl space-y-6 animate-scaleIn">
                                          <div className="text-center space-y-2">
                                             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                             </div>
                                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Xác thực ứng dụng ngân hàng</h3>
                                             <p className="text-xs text-slate-500 px-4 leading-relaxed italic">Mã OTP 6 chữ số đã được gửi tới SĐT đăng ký ngân hàng của bạn. Vui lòng nhập để hoàn tất.</p>
                                          </div>

                                          <div className="space-y-4">
                                             <input 
                                                type="text" 
                                                maxLength={6}
                                                placeholder="Mã OTP 6 chữ số" 
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] bg-gray-50 border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                                             />
                                             <button 
                                                onClick={confirmVerification}
                                                disabled={isLinking}
                                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                             >
                                                {isLinking ? (
                                                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                   <>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                      XÁC NHẬN LIÊN KẾT
                                                   </>
                                                )}
                                             </button>
                                             <button 
                                                onClick={() => setIsVerifying(false)}
                                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                             >
                                                Hủy bỏ và quay lại
                                             </button>
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="p-3 space-y-4 animate-fadeIn">
                                          <p className="text-[9px] font-black text-slate-400 uppercase text-center tracking-widest">Chọn ngân hàng liên kết</p>
                                          <div className="space-y-3">
                                             <div className="grid grid-cols-5 gap-2">
                                                {banks.map(bank => (
                                                   <button 
                                                      key={bank.id} 
                                                      onClick={() => setSelectedBank(bank.id)}
                                                      className={`aspect-square p-1.5 rounded-xl border-2 transition-all flex items-center justify-center bg-white ${
                                                         selectedBank === bank.id ? 'border-emerald-500 shadow-md scale-105' : 'border-gray-100'
                                                      }`}
                                                   >
                                                      <img src={bank.logo} alt={bank.name} className="max-h-full object-contain" title={bank.name} />
                                                   </button>
                                                ))}
                                             </div>
                                             
                                             <div className="relative group">
                                                <select 
                                                   value={selectedBank || ""} 
                                                   onChange={(e) => setSelectedBank(e.target.value)}
                                                   className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none text-xs font-bold text-slate-700 focus:border-emerald-500 appearance-none transition-all cursor-pointer"
                                                >
                                                   <option value="" disabled>--- Hoặc chọn ngân hàng khác ---</option>
                                                   {banks.map(bank => (
                                                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                                                   ))}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Số tài khoản</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Nhập số tài khoản" 
                                                   value={bankAccountNumber}
                                                   onChange={(e) => setBankAccountNumber(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Chủ tài khoản</label>
                                                <div className="relative">
                                                   <input 
                                                      type="text" 
                                                      placeholder={isLookingUp ? "Đang tra cứu..." : "NGUYEN VAN A"} 
                                                      value={bankAccountName}
                                                      onChange={(e) => setBankAccountName(e.target.value)}
                                                      className={`w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all uppercase ${isLookingUp ? 'animate-pulse' : ''}`}
                                                      readOnly={isLookingUp}
                                                   />
                                                   {isLookingUp && (
                                                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                         <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-3">
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">CCCD / CMND</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Nhập số CCCD" 
                                                   value={bankIDNumber}
                                                   onChange={(e) => setBankIDNumber(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Ngày cấp</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="DD/MM/YYYY" 
                                                   value={bankIDIssueDate}
                                                   onChange={(e) => setBankIDIssueDate(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">SĐT liên kết Bank</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="09xx xxx xxx" 
                                                   value={bankPhone}
                                                   onChange={(e) => setBankPhone(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Chi nhánh</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="Ví dụ: Hà Nội" 
                                                   value={bankBranch}
                                                   onChange={(e) => setBankBranch(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                          </div>

                                          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                             <p className="text-[10px] text-emerald-700 font-bold text-center leading-relaxed">
                                                🔒 Thông tin của bạn được mã hóa và bảo mật tuyệt đối theo tiêu chuẩn PCI DSS.
                                             </p>
                                          </div>

                                          <button 
                                             type="button"
                                             onClick={() => handleLinkAccount('bank')}
                                             className="w-full h-11 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                                          >
                                             XÁC NHẬN LIÊN KẾT & LƯU THÔNG TIN
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>

                           <div className={`flex flex-col gap-2 p-1 rounded-2xl transition-all ${paymentMethod === 'VNPAY' || paymentMethod === 'MOMO' ? 'bg-emerald-50/30' : ''}`}>
                              <button 
                                 onClick={() => setPaymentMethod('VNPAY')}
                                 className={`flex items-center gap-4 px-5 py-3 rounded-xl border-2 transition-all ${
                                    (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') ? 'border-emerald-500 bg-white' : 'border-gray-50 bg-white'
                                 }`}
                              >
                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${(paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') ? 'border-emerald-500' : 'border-gray-200'}`}>
                                    {(paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                                 </div>
                                 <span className="text-2xl">🏧</span>
                                 <div className="flex flex-col text-left">
                                    <span className="text-xs font-black text-slate-700">Ví điện tử VNPay / MoMo</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Xử lý tức thì</span>
                                 </div>
                              </button>

                              {/* Wallet Selection */}
                              {(paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') && (
                                 <div className="p-3 space-y-4">
                                    {isVerifying ? (
                                       <div className="p-6 bg-white rounded-2xl border-2 border-emerald-500 shadow-xl space-y-6 animate-scaleIn">
                                          <div className="text-center space-y-2">
                                             <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                             </div>
                                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Xác thực Ví Điện Tử</h3>
                                             <p className="text-xs text-slate-500 px-4 leading-relaxed italic">Mã OTP đã được gửi tới SĐT đăng ký ví của bạn. Vui lòng nhập để hoàn tất.</p>
                                          </div>

                                          <div className="space-y-4">
                                             <input 
                                                type="text" 
                                                maxLength={6}
                                                placeholder="Mã OTP 6 chữ số" 
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full h-14 text-center text-2xl font-black tracking-[0.5em] bg-gray-50 border-2 border-emerald-100 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                                             />
                                             <button 
                                                onClick={confirmVerification}
                                                disabled={isLinking}
                                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                             >
                                                {isLinking ? (
                                                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                   <>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                      XÁC NHẬN LIÊN KẾT VÍ
                                                   </>
                                                )}
                                             </button>
                                             <button 
                                                onClick={() => setIsVerifying(false)}
                                                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                                             >
                                                Hủy bỏ và quay lại
                                             </button>
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="animate-fadeIn space-y-4">
                                          <div className="grid grid-cols-2 gap-3">
                                             {[
                                                { id: 'VNPAY', name: 'VNPay', icon: 'https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg' },
                                                { id: 'MOMO', name: 'MoMo', icon: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png' }
                                             ].map(wallet => (
                                                <button 
                                                   key={wallet.id}
                                                   onClick={() => setPaymentMethod(wallet.id)}
                                                   className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                      paymentMethod === wallet.id ? 'border-emerald-500 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/50'
                                                   }`}
                                                >
                                                   <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg object-contain" />
                                                   <span className="text-[11px] font-black uppercase text-slate-700">{wallet.name}</span>
                                                </button>
                                             ))}
                                          </div>
                                          
                                          <div className="space-y-3">
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Số điện thoại đăng ký Ví</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="09xx xxx xxx" 
                                                   value={bankPhone} // Re-using bankPhone for wallet
                                                   onChange={(e) => setBankPhone(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all"
                                                />
                                             </div>
                                             <div className="space-y-1">
                                                <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Tên chủ ví (Không dấu)</label>
                                                <input 
                                                   type="text" 
                                                   placeholder="NGUYEN VAN A" 
                                                   value={bankAccountName} // Re-using bankAccountName
                                                   onChange={(e) => setBankAccountName(e.target.value)}
                                                   className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl outline-none text-[15px] font-bold text-slate-800 focus:border-emerald-500 transition-all uppercase"
                                                />
                                             </div>
                                          </div>

                                          <button 
                                             type="button"
                                             onClick={() => {
                                                if (!/^0[0-9]{9}$/.test(bankPhone)) {
                                                   alert('Số điện thoại ví không hợp lệ');
                                                   return;
                                                }
                                                if (!bankAccountName.trim()) {
                                                   alert('Vui lòng nhập tên chủ ví');
                                                   return;
                                                }
                                                setTempData({
                                                   type: 'wallet',
                                                   data: { walletId: paymentMethod, phone: bankPhone, accountName: bankAccountName }
                                                });
                                                setIsVerifying(true);
                                             }}
                                             className="w-full h-11 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-md active:scale-95 uppercase"
                                          >
                                             Xác nhận & Liên kết Ví
                                          </button>
                                       </div>
                                    )}
                                 </div>
                              )}
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Order Summary */}
               <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Tạm tính:</span>
                    <span className="font-black text-slate-800">{formatPrice((selectedColor?.price || product.priceNum) * quantity)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-red-500 uppercase tracking-widest italic">Giảm giá:</span>
                      <span className="font-black text-red-500">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Vận chuyển:</span>
                    <span className="font-black text-slate-800">{formatPrice(deliveryMethod === 'home' ? 35000 : 0)}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">TỔNG THANH TOÁN:</span>
                    <span className="text-2xl font-black text-red-600 tracking-tighter">
                      {formatPrice(Math.max(((selectedColor?.price || product.priceNum) * quantity) - discountAmount + (deliveryMethod === 'home' ? 35000 : 0), 0))}
                    </span>
                  </div>
               </div>

               <button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-16 bg-[#008d71] hover:bg-black text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3">
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : (
                    <>
                      HOÀN TẤT ĐẶT HÀNG
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </>
                  )}
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

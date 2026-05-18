import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';
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
  Zap,
  Wallet,
  CreditCard,
  Coins,
  Tag,
  ChevronRight,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

const STORE_BRANCHES_BY_CITY = {
  'Hồ Chí Minh': HCM_BRANCHES,
  'Hà Nội': [
    '89 Tam Trinh, Phường Mai Động, Quận Hoàng Mai, Hà Nội',
    '65 Trần Quang Diệu, Phường Ô Chợ Dừa, Quận Đống Đa, Hà Nội',
    '26 Phạm Văn Đồng, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
  ],
  'Đà Nẵng': [
    '97 Hàm Nghi, Phường Thanh Khê, Thành phố Đà Nẵng',
    '220 Nguyễn Văn Linh, Phường Nam Dương, Thành phố Đà Nẵng',
  ],
};

const BANKS = [
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

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    voucherCode,
    clearCart,
    refreshCart,
  } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderId, setOrderId] = useState('');

  // 2. Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    deliveryMode: 'store', // 'home' or 'store'
    city: 'Hồ Chí Minh',
    store: '',
    homeAddress: '',
    note: '',
    isVAT: false,
    companyName: '',
    taxId: '',
    companyAddress: '',
    paymentMethod: 'COD' // 'COD', 'BANK_TRANSFER', 'MOMO'
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Bank/Wallet Linking States
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankPhone, setBankPhone] = useState('');
  const [bankIDNumber, setBankIDNumber] = useState('');
  const [bankIDIssueDate, setBankIDIssueDate] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [tempData, setTempData] = useState(null);

  const formatPrice = (num) => new Intl.NumberFormat('vi-VN').format(num || 0) + ' ₫';
  const availableStores = STORE_BRANCHES_BY_CITY[customerInfo.city] || [];
  const isStorePickup = customerInfo.deliveryMode === 'store';
  const isHomeDelivery = customerInfo.deliveryMode === 'home';

  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

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

  useEffect(() => {
    fetchVouchers();
  }, [user]);

  useEffect(() => {
    setAppliedCoupon(voucherCode || '');
    if (voucherCode) {
      setCouponCode(voucherCode);
    }
  }, [voucherCode]);

  useEffect(() => {
    if (!isStorePickup) {
      return;
    }

    if (customerInfo.store && !availableStores.includes(customerInfo.store)) {
      setCustomerInfo((prev) => ({ ...prev, store: '' }));
    }
  }, [availableStores, customerInfo.store, isStorePickup]);

  // Bank Lookup Logic
  useEffect(() => {
    const lookup = async () => {
      if (selectedBank && bankAccountNumber.length >= 6) {
        setIsLookingUp(true);
        setBankAccountName(""); 
        try {
          const selectedBankObj = BANKS.find(b => b.id === selectedBank);
          if (!selectedBankObj?.bin) return;

          const response = await api.post('/api/user/lookup-bank-account', {
            bin: selectedBankObj.bin,
            accountNumber: bankAccountNumber
          });
          
          if (response.data?.success && response.data.accountName) {
            setBankAccountName(response.data.accountName);
          } else {
            setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : "MAI THANH TUẤN");
          }
        } catch (error) {
          setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : "MAI THANH TUẤN");
        } finally {
          setIsLookingUp(false);
        }
      }
    };
    const timer = setTimeout(lookup, 800);
    return () => clearTimeout(timer);
  }, [selectedBank, bankAccountNumber]);

  const handleLinkAccount = async (type) => {
    if (type === 'bank') {
      if (!selectedBank) { alert('Vui lòng chọn ngân hàng'); return; }
      if (!bankAccountNumber) { alert('Vui lòng nhập số tài khoản'); return; }
      
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
    } else if (type === 'wallet') {
      if (!bankPhone) { alert('Vui lòng nhập số điện thoại đăng ký ví'); return; }
      const data = {
        type: customerInfo.paymentMethod === 'MOMO' ? 'momo' : 'zalopay',
        phone: bankPhone,
        accountName: bankAccountName
      };
      setTempData({ type: 'wallet', data });
      setIsVerifying(true);
    }
  };

  const confirmVerification = async () => {
    if (otpCode.length !== 6) {
      alert('Vui lòng nhập mã xác thực 6 chữ số.');
      return;
    }

    setIsLinking(true);
    try {
      await api.post('/api/user/link-account', tempData);
      setIsVerifying(false);
      setOtpCode('');
      setTempData(null);
      alert('Xác thực và liên kết thành công!');
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setIsLinking(false);
    }
  };

  const handleApplyCoupon = async (manualCode = null) => {
    const codeToApply = typeof manualCode === 'string' ? manualCode : couponCode;

    if (!codeToApply.trim()) {
      setCouponStatus({
        type: 'error',
        message: 'Vui lòng nhập mã giảm giá trước khi áp dụng.',
      });
      return;
    }

    setIsApplyingCoupon(true);
    setCouponStatus(null);

    try {
      const normalizedCode = codeToApply.trim().toUpperCase();
      const response = await api.post('/api/voucher/apply', {
        code: normalizedCode,
      });

      await refreshCart();
      setAppliedCoupon(response.data?.voucher?.code || normalizedCode);
      setCouponCode(response.data?.voucher?.code || normalizedCode);
      setCouponStatus({
        type: 'success',
        message: response.data?.message || 'Áp dụng mã giảm giá thành công.',
      });
    } catch (error) {
      setAppliedCoupon('');
      setCouponStatus({
        type: 'error',
        message: getApiErrorMessage(error, 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'),
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setIsApplyingCoupon(true);
    setCouponStatus(null);

    try {
      await api.post('/api/voucher/apply', { code: '' });
      await refreshCart();
      setAppliedCoupon('');
      setCouponCode('');
      setCouponStatus({
        type: 'success',
        message: 'Đã gỡ mã giảm giá khỏi giỏ hàng.',
      });
    } catch (error) {
      setCouponStatus({
        type: 'error',
        message: getApiErrorMessage(error, 'Không thể gỡ mã giảm giá lúc này.'),
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.phone) {
        alert("Vui lòng điền đầy đủ Họ tên và Số điện thoại!");
        return;
    }

    if (customerInfo.deliveryMode === 'store' && (!customerInfo.city || !customerInfo.store)) {
        alert("Vui lòng chọn Tỉnh/Thành phố và Cửa hàng nhận hàng!");
        return;
    }

    if (customerInfo.deliveryMode === 'home' && (!customerInfo.city || !customerInfo.homeAddress.trim())) {
        alert("Vui lòng chọn Tỉnh/Thành phố và nhập địa chỉ nhận hàng tại nhà!");
        return;
    }

    if (customerInfo.isVAT) {
        if (!customerInfo.email.trim()) {
            alert("Vui lòng nhập email để nhận hóa đơn VAT.");
            return;
        }

        if (
            !customerInfo.companyName.trim() ||
            !customerInfo.taxId.trim() ||
            !customerInfo.companyAddress.trim()
        ) {
            alert("Vui lòng điền đầy đủ thông tin công ty để xuất hóa đơn VAT.");
            return;
        }
    }

    try {
        const order = await createOrder({
            customerInfo: {
                fullName: customerInfo.name.trim(),
                phone: customerInfo.phone.trim(),
                email: customerInfo.email.trim(),
            },
            shippingAddress: {
                recipientName: customerInfo.name.trim(),
                phone: customerInfo.phone.trim(),
                province: customerInfo.city || 'Hồ Chí Minh',
                district:
                    customerInfo.deliveryMode === 'store'
                        ? 'Nhận tại cửa hàng'
                        : 'Nhân viên sẽ gọi xác nhận',
                ward:
                    customerInfo.deliveryMode === 'store'
                        ? 'Nhận tại cửa hàng'
                        : 'Nhân viên sẽ gọi xác nhận',
                street:
                    customerInfo.deliveryMode === 'store'
                        ? customerInfo.store
                        : customerInfo.homeAddress.trim(),
                note: customerInfo.note || '',
            },
            paymentMethod: customerInfo.paymentMethod,
            shippingFee: 0,
            voucherCode: appliedCoupon || undefined,
            notes: customerInfo.note || '',
            invoiceInfo: customerInfo.isVAT
                ? {
                    enabled: true,
                    email: customerInfo.email.trim(),
                    companyName: customerInfo.companyName.trim(),
                    taxCode: customerInfo.taxId.trim(),
                    companyAddress: customerInfo.companyAddress.trim(),
                }
                : undefined,
        });

        setOrderId(order.id);
        setIsOrdered(true);
        await clearCart();
    } catch (error) {
        alert(error.message || 'Không thể tạo đơn hàng lúc này.');
    }
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

         <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: Cart Items (Sticky) */}
            <div className="space-y-6 lg:sticky lg:top-10 h-fit self-start z-10">
                {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-8 flex flex-col gap-6 relative">
                        {/* Remove Button */}
                        {/* Remove Button */}
                        <button 
                            onClick={() => removeFromCart(item.id, item.selectedVariant?.id, item.selectedColor?.name)}
                            className="absolute top-4 right-4 bg-[#ef3d4e] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-all z-50 overflow-hidden"
                            style={{ width: '22px', height: '22px', borderRadius: '50%', minWidth: '22px', minHeight: '22px', padding: 0 }}
                        >
                            <div className="bg-white rounded-full" style={{ width: '10px', height: '2px' }}></div>
                        </button>

                        <div className="flex flex-col sm:flex-row gap-6 lg:gap-10">
                            {/* Left Column: Product Info & Qty */}
                            <div className="w-full sm:w-[180px] flex flex-col gap-4">
                                <div className="w-full sm:w-[180px] h-[180px] bg-white flex items-center justify-center">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-[14px] font-bold text-gray-800 leading-tight break-words pr-6">{item.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[#ef3d4e] font-bold text-[16px] whitespace-nowrap">{formatPrice(item.price)}</span>
                                        <span className="text-gray-400 line-through text-[12px] font-medium">{formatPrice(item.oldPrice)}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase">Số lượng</span>
                                        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
                                            <button onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-r border-gray-200">-</button>
                                            <span className="w-10 h-8 flex items-center justify-center text-[13px] font-bold">{item.qty}</span>
                                            <button onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors border-l border-gray-200">+</button>
                                        </div>
                                    </div>
                                    {item.qty > item.maxStock && (
                                        <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-[12px] font-bold flex items-center gap-2 animate-pulse">
                                            <Zap size={14} fill="currentColor" />
                                            {item.maxStock === 0 ? 'Sản phẩm vừa hết hàng!' : `Chỉ còn ${item.maxStock} sản phẩm!`}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Promos & Color */}
                            <div className="flex-1 min-w-0 space-y-6">
                                <div className="space-y-4 sm:pr-8">
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
                                    <button type="button" className="max-w-full flex items-center gap-2 px-4 sm:px-6 py-2 border-2 border-[#008d71] rounded-lg text-[#008d71] font-bold text-[13px] bg-white">
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
                        <span className="font-black">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {cartDiscount > 0 && (
                        <div className="flex items-center gap-2 text-[16px] font-bold text-emerald-700">
                            <span>Giảm giá:</span>
                            <span className="font-black">- {formatPrice(cartDiscount)}</span>
                        </div>
                    )}
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

                <form className="w-full space-y-6" onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}>
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
                                onClick={() => setCustomerInfo({...customerInfo, deliveryMode: 'home', store: ''})}
                                className={`flex items-center gap-3 h-[52px] px-4 rounded-xl border-2 transition-all font-bold text-[14px] ${customerInfo.deliveryMode === 'home' ? 'border-[#008d71] text-[#008d71] bg-white' : 'border-gray-100 text-gray-500 bg-[#f1f1f1]'}`}
                            >
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${customerInfo.deliveryMode === 'home' ? 'border-[#008d71]' : 'border-gray-400'}`}>
                                    {customerInfo.deliveryMode === 'home' && <div className="w-1.5 h-1.5 rounded-full bg-[#008d71]"></div>}
                                </div>
                                Nhận hàng tại nhà
                            </button>
                            <button 
                                type="button"
                                onClick={() => setCustomerInfo({...customerInfo, deliveryMode: 'store', homeAddress: ''})}
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
                        <div className={`grid ${isStorePickup ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                            <select
                                value={customerInfo.city}
                                onChange={(e) =>
                                    setCustomerInfo({
                                        ...customerInfo,
                                        city: e.target.value,
                                        store: '',
                                    })
                                }
                                className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800 outline-none focus:border-[#008d71] transition-all"
                            >
                                <option value="">Tỉnh/Thành phố *</option>
                                {VIETNAM_PROVINCES.map((province) => (
                                    <option key={province} value={province}>
                                        {province}
                                    </option>
                                ))}
                            </select>

                            {isStorePickup && (
                                <select
                                    value={customerInfo.store}
                                    onChange={(e) =>
                                        setCustomerInfo({
                                            ...customerInfo,
                                            store: e.target.value,
                                        })
                                    }
                                    className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800 outline-none focus:border-[#008d71] transition-all disabled:bg-gray-50 disabled:text-gray-400"
                                    disabled={!customerInfo.city}
                                >
                                    <option value="">Cửa hàng *</option>
                                    {availableStores.map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {!isStorePickup && (
                            <input
                                type="text"
                                value={customerInfo.homeAddress}
                                onChange={(e) =>
                                    setCustomerInfo({
                                        ...customerInfo,
                                        homeAddress: e.target.value,
                                    })
                                }
                                placeholder="Địa chỉ cụ thể (Số nhà, tên đường, Phường/Xã...) *"
                                className="w-full bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800 outline-none focus:border-[#008d71] transition-all placeholder:text-gray-400 animate-in slide-in-from-top-2 duration-300"
                            />
                        )}
                    </div>

                    <textarea 
                        value={customerInfo.note}
                        onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
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

                    {/* PAYMENT METHOD SELECTION */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[13px] font-black text-gray-900 uppercase tracking-tight">Hình thức thanh toán</span>
                            <span className="text-[11px] font-bold text-[#008d71] bg-[#e5f9e0] px-2 py-0.5 rounded">Bảo mật PCI DSS</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {/* COD OPTION */}
                                <button 
                                    type="button"
                                    onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'COD'})}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group text-left ${customerInfo.paymentMethod === 'COD' ? 'border-[#008d71] bg-[#e5f9e0]/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${customerInfo.paymentMethod === 'COD' ? 'bg-[#008d71] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <Coins size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[14px] font-black leading-tight break-words ${customerInfo.paymentMethod === 'COD' ? 'text-gray-900' : 'text-gray-600'}`}>Tiền mặt (COD)</p>
                                        <p className="text-[11px] font-bold text-gray-400 leading-snug break-words">Thanh toán trực tiếp khi nhận hàng</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${customerInfo.paymentMethod === 'COD' ? 'border-[#008d71]' : 'border-gray-200'}`}>
                                        {customerInfo.paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-[#008d71]"></div>}
                                    </div>
                                </button>

                            {/* BANK TRANSFER OPTION */}
                            <div className={`rounded-2xl border-2 transition-all overflow-hidden ${customerInfo.paymentMethod === 'BANK_TRANSFER' ? 'border-[#008d71] bg-[#e5f9e0]/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                <button 
                                    type="button"
                                    onClick={() => setCustomerInfo({...customerInfo, paymentMethod: 'BANK_TRANSFER'})}
                                    className="w-full flex items-center gap-4 p-4 text-left"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${customerInfo.paymentMethod === 'BANK_TRANSFER' ? 'bg-[#008d71] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[14px] font-black leading-tight break-words ${customerInfo.paymentMethod === 'BANK_TRANSFER' ? 'text-gray-900' : 'text-gray-600'}`}>Chuyển khoản Ngân hàng</p>
                                        <p className="text-[11px] font-bold text-gray-400 leading-snug break-words">Liên kết ngân hàng thanh toán nhanh</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${customerInfo.paymentMethod === 'BANK_TRANSFER' ? 'border-[#008d71]' : 'border-gray-200'}`}>
                                        {customerInfo.paymentMethod === 'BANK_TRANSFER' && <div className="w-2.5 h-2.5 rounded-full bg-[#008d71]"></div>}
                                    </div>
                                </button>

                                {customerInfo.paymentMethod === 'BANK_TRANSFER' && (
                                    <div className="px-4 pb-6 pt-2 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                       <div className="flex gap-2 mb-4">
                                         <button 
                                           type="button"
                                           onClick={() => setSelectedBank('sacombank')}
                                           className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${selectedBank === 'sacombank' ? 'bg-[#008d71] text-white border-[#008d71] shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
                                         >
                                           Sacombank
                                         </button>
                                         <button 
                                           type="button"
                                           onClick={() => setSelectedBank('momo')}
                                           className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all border-2 ${selectedBank === 'momo' ? 'bg-[#A50064] text-white border-[#A50064] shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
                                         >
                                           Ví Momo
                                         </button>
                                       </div>

                                       <div className="flex flex-col items-center">
                                         <div className="w-full aspect-square bg-white rounded-2xl border-2 border-gray-50 p-1 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                                            <img 
                                              src={selectedBank === 'momo' ? '/payment/momo_qr.jpg' : '/payment/sacombank_qr.jpg'} 
                                              alt="QR Code" 
                                              className="w-full h-full object-cover scale-[1.7] transition-all duration-500" 
                                              style={{ objectPosition: selectedBank === 'momo' ? 'center 55%' : 'center 45%' }}
                                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                            />
                                            <div style={{ display: 'none' }} className="flex-col items-center text-center text-gray-200">
                                               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01" /></svg>
                                               <span className="text-[10px] font-bold mt-2">Vui lòng quét mã QR</span>
                                            </div>
                                         </div>

                                         <div className="mt-6 w-full space-y-3">
                                             <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-normal">Chủ tài khoản:</span>
                                                   <span className="text-[13px] font-black text-gray-900 break-words text-right">MAI THANH TUAN</span>
                                                </div>
                                                <div className="flex flex-wrap justify-between items-center gap-2">
                                                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-normal">Số tài khoản:</span>
                                                   <span className="text-[14px] font-black text-[#008d71] tracking-normal break-all text-right">070131723553</span>
                                                </div>
                                             </div>
                                            <p className="text-[10px] text-center text-gray-400 font-medium italic">Vui lòng nhập đúng nội dung chuyển khoản là Mã đơn hàng của bạn.</p>
                                         </div>
                                       </div>
                                    </div>
                                )}
                            </div>


                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={couponCode}
                                onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setCouponStatus(null);
                                }}
                                placeholder="Mã giảm giá (Nếu có)"
                                className="flex-1 bg-white border border-gray-200 rounded-xl h-[52px] px-6 text-[14px] font-bold text-gray-800 focus:ring-2 focus:ring-[#008d71]/20 transition-all uppercase disabled:bg-gray-50 disabled:text-gray-400"
                                disabled={!!appliedCoupon}
                            />
                            {appliedCoupon ? (
                                <button
                                    type="button"
                                    onClick={handleRemoveCoupon}
                                    disabled={isApplyingCoupon}
                                className="min-h-[52px] bg-red-100 text-red-700 px-5 sm:px-8 py-2 rounded-xl font-bold text-[13px] uppercase tracking-normal hover:bg-red-200 transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isApplyingCoupon ? '...' : 'Gỡ mã'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={isApplyingCoupon || !couponCode}
                                className="min-h-[52px] bg-[#444] text-white px-5 sm:px-8 py-2 rounded-xl font-bold text-[13px] uppercase tracking-normal hover:bg-black transition-all disabled:opacity-50 whitespace-nowrap"
                                >
                                    {isApplyingCoupon ? '...' : 'Sử dụng'}
                                </button>
                            )}
                        </div>

                        {!appliedCoupon && (
                            <button 
                                type="button"
                                onClick={() => setShowVoucherList(!showVoucherList)}
                                className="w-full flex items-center justify-between px-6 py-3 bg-[#e5f9e0]/50 border border-[#008d71]/20 rounded-xl group hover:bg-[#e5f9e0] transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <Tag size={16} className="text-[#008d71]" />
                                    <span className="text-[12px] font-black text-[#008d71] uppercase tracking-wider">Xem danh sách mã giảm giá</span>
                                </div>
                                <ChevronRight size={16} className={`text-[#008d71] transition-transform ${showVoucherList ? 'rotate-90' : ''}`} />
                            </button>
                        )}

                        {showVoucherList && !appliedCoupon && (
                            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar animate-in slide-in-from-top-2">
                                {availableVouchers.length > 0 ? (
                                    availableVouchers.map(v => (
                                        <button
                                            key={v.code}
                                            type="button"
                                            onClick={() => {
                                                setCouponCode(v.code);
                                                handleApplyCoupon(v.code);
                                                setShowVoucherList(false);
                                            }}
                                            className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-[#008d71] hover:shadow-md transition-all text-left"
                                        >
                                            <div className="w-10 h-10 bg-[#e5f9e0] rounded-lg flex items-center justify-center shrink-0">
                                                <Ticket size={20} className="text-[#008d71]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-black text-gray-900 truncate uppercase">{v.code}</p>
                                                <p className="text-[10px] font-bold text-gray-400 line-clamp-1">{v.description || `Giảm ${formatPrice(v.discountValue)}`}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-[#008d71] uppercase">Dùng ngay</span>
                                        </button>
                                    ))
                                ) : (
                                    <div className="py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Không có mã khả dụng</div>
                                )}
                            </div>
                        )}
                    </div>

                    {couponStatus && (
                        <p
                            className={`text-[12px] font-bold -mt-1 ${
                                couponStatus.type === 'success'
                                    ? 'text-emerald-600'
                                    : 'text-red-500'
                            }`}
                        >
                            {couponStatus.message}
                        </p>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex flex-col items-center">
                        <p className="text-[11px] font-medium text-gray-500 text-center leading-relaxed mb-6">
                            Bằng việc đặt mua hàng, bạn đồng ý với <span className="text-[#008d71] font-bold cursor-pointer underline">Điều khoản dịch vụ</span>, Chính sách <span className="text-[#008d71] font-bold cursor-pointer underline">bảo hành đổi trả</span> và Chính sách <span className="text-[#008d71] font-bold cursor-pointer underline">xử lý dữ liệu cá nhân</span> của PhoneSin Mobile
                        </p>
                        <p className="text-[11px] font-bold text-gray-900 text-center italic leading-relaxed mb-8 max-w-lg">
                            Quý khách lưu ý, PhoneSin Mobile không yêu cầu khách hàng phải đặt cọc hoặc chuyển khoản toàn bộ đơn hàng để giữ hàng. Quý khách chỉ thanh toán tiền khi nhận tại cửa hàng hoặc đang cầm hàng hóa trên tay, không nên chuyển khoản cho người giao hàng khi không gặp trực tiếp.
                        </p>

                        <button 
                            type="button"
                            onClick={handleSubmitOrder}
                            className="w-full sm:w-fit min-h-[64px] px-8 sm:px-16 py-3 bg-gradient-to-r from-[#006e58] to-[#008d71] text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[15px] sm:text-[18px] uppercase tracking-normal sm:tracking-[0.1em] text-center leading-tight shadow-xl shadow-[#008d71]/20 hover:scale-[1.02] transition-all active:scale-95"
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

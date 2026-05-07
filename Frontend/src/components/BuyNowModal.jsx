import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrdersContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getApiErrorMessage } from '../lib/api';

const BuyNowModal = ({ product, isOpen, onClose }) => {
  const { formatPrice } = useLanguage();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef(null);

  // Form states
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('store'); // 'store' | 'home'
  const [selectedCity, setSelectedCity] = useState('');
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

  // Generate color options from product
  const colors = product?.colors || [
    { id: 'c1', name: 'Trắng', price: product?.priceNum || 0, image: product?.image },
    { id: 'c2', name: 'Đen', price: product?.priceNum || 0, image: product?.image },
  ];

  const cities = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Thừa Thiên Huế'
  ];

  const stores = {
    'Hồ Chí Minh': [
      'Cửa hàng 1 - 123 Nguyễn Trãi, Q.1',
      'Cửa hàng 2 - 456 Lê Văn Sỹ, Q.3',
      'Cửa hàng 3 - 789 Cách Mạng Tháng 8, Q.10',
    ],
    'Hà Nội': [
      'Cửa hàng 1 - 348 Hồ Tùng Mậu, Cầu Giấy',
      'Cửa hàng 2 - 122 Thái Hà, Đống Đa',
      'Cửa hàng 3 - 126 Phố Huế, Hai Bà Trưng',
    ],
    'Đà Nẵng': [
      'Cửa hàng 1 - 56 Nguyễn Văn Linh, Q. Hải Châu',
      'Cửa hàng 2 - 234 Điện Biên Phủ, Q. Thanh Khê',
    ],
  };

  useEffect(() => {
    if (isOpen && product) {
      setSelectedColor(colors[0]);
      setQuantity(1);
      setIsSuccess(false);
      setErrors({});
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponStatus(null);
      setDiscountAmount(0);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
    else if (!/^0\d{9}$/.test(phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (deliveryMethod === 'store' && !selectedCity) newErrors.city = 'Vui lòng chọn thành phố';
    if (isVAT) {
      if (!companyName.trim()) newErrors.companyName = 'Vui lòng nhập tên công ty';
      if (!taxCode.trim()) newErrors.taxCode = 'Vui lòng nhập mã số thuế';
      if (!companyAddress.trim()) newErrors.companyAddress = 'Vui lòng nhập địa chỉ công ty';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) {
      onClose();
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const nowDate = new Date();
      let daysToAdd = 3;
      if (['Hà Nội', 'Hồ Chí Minh'].includes(selectedCity)) daysToAdd = 1;
      else if (['Đà Nẵng'].includes(selectedCity)) daysToAdd = 2;

      const deliveryDate = new Date(nowDate);
      deliveryDate.setDate(nowDate.getDate() + daysToAdd);
      const estimateStr = deliveryDate.toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      const rawVariantId = selectedColor?.id || '';
      const variantId =
        rawVariantId &&
        !String(rawVariantId).startsWith('color-') &&
        !String(rawVariantId).startsWith('variant-')
          ? rawVariantId
          : rawVariantId && String(rawVariantId).length === 24
            ? rawVariantId
            : undefined;

      const order = await createOrder({
        customerInfo: { fullName, phone, email },
        shippingAddress: {
          recipientName: fullName,
          phone,
          province: selectedCity || 'Hồ Chí Minh',
          district: deliveryMethod === 'store' ? 'Nhận tại cửa hàng' : 'Nhân viên sẽ gọi xác nhận',
          ward: deliveryMethod === 'store' ? 'Nhận tại cửa hàng' : 'Nhân viên sẽ gọi xác nhận',
          street: deliveryMethod === 'store' ? (selectedStore || selectedCity || 'Cửa hàng PhoneSin') : 'Khách hàng nhận tại nhà',
          note,
        },
        paymentMethod: 'COD',
        voucherCode: appliedCoupon || undefined,
        notes: note,
        items: [{
          productId: product.backendId || product.backendProductId || product._id,
          variantId,
          quantity,
        }],
      });

      setDeliveryEstimate(estimateStr);
      setIsSuccess(order.id);
    } catch (error) {
      setCouponStatus({
        type: 'error',
        message: error.message || 'Không thể tạo đơn hàng lúc này.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  const currentPrice = selectedColor?.price || product.priceNum || 0;
  const rawTotal = currentPrice * quantity;
  const discount = discountAmount;
  const finalTotal = Math.max(0, rawTotal - discount);

  const handleApplyCoupon = async () => {
    try {
      const response = await api.post('/api/voucher/apply', {
        code: couponCode.trim().toUpperCase(),
        amount: rawTotal,
      });

      setAppliedCoupon(response.data?.voucher?.code || couponCode.trim().toUpperCase());
      setDiscountAmount(Number(response.data?.discountAmount || 0));
      setCouponStatus({
        type: 'success',
        message: response.data?.message || 'Áp dụng mã giảm giá thành công.',
      });
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponStatus({
        type: 'error',
        message: getApiErrorMessage(error, 'Mã không hợp lệ hoặc đã hết hạn.'),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[980px] max-h-[92vh] overflow-hidden flex flex-col md:flex-row"
        style={{ animation: 'modalSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 bg-[#ee0000] hover:bg-[#cc0000] text-white rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="w-full flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase">Đặt hàng thành công!</h2>
            
            <div className="bg-[#f0fdf4] rounded-2xl p-6 my-6 border border-emerald-100 max-w-sm w-full">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Thời gian giao hàng dự kiến</p>
              <p className="text-lg font-black text-slate-900 italic">{deliveryEstimate || 'Đang cập nhật...'}</p>
              <p className="text-[11px] font-bold text-gray-400 mt-2">* Nhân viên sẽ gọi xác nhận trong 15 phút</p>
            </div>

            <p className="text-gray-500 text-sm font-medium mb-8 max-w-md">
              Cảm ơn bạn đã đặt hàng tại PhoneSin. Nhà vận chuyển sẽ sớm liên hệ với bạn để bàn giao sản phẩm.
            </p>
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <Link
                to="/orders"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-[#ee0000] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Xem trạng thái đơn hàng
              </Link>
              <div className="flex gap-2 w-full">
                <Link
                  to={`/invoice/${isSuccess}`}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-400 transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs uppercase"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                  Xuất hóa đơn
                </Link>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 text-xs uppercase"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT - Product Info */}
            <div className="w-full md:w-[380px] bg-[#fafafa] border-r border-gray-100 p-6 flex flex-col">
              {/* Product Image */}
              <div className="flex-1 flex items-center justify-center py-4">
                <img
                  src={selectedColor?.image || product.image}
                  alt={product.name}
                  className="max-h-[220px] max-w-full object-contain drop-shadow-lg transition-all duration-500"
                />
              </div>

              {/* Product Name & SKU */}
              <div className="mt-4 mb-2">
                <h3 className="text-[14px] font-bold text-gray-800 leading-snug line-clamp-2">{product.name}</h3>
                {product.specs?.chip && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    {selectedColor?.name && `${selectedColor.name}`}
                    {product.specs?.chip && ` • ${product.specs.chip}`}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#ee0000] font-black text-[22px]">{formatPrice(currentPrice)}</span>
                {product.oldPriceNum && (
                  <span className="text-gray-400 line-through text-[13px]">{formatPrice(product.oldPriceNum)}</span>
                )}
              </div>

              {/* Promotions */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-100">
                  <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black">KM</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">Ưu đãi Chào Hè, mua phụ kiện giảm đến 20%</p>
                </div>
                <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-100">
                  <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black">KM</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">Tặng Voucher giảm ngay 10%, tối đa 200.000đ cho đơn tiếp theo</p>
                </div>
                <div className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 border border-yellow-100">
                  <div className="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-black">KM</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">Giảm ngay 50.000đ khi mua gói cước di động, 5G chỉ 90k/tháng</p>
                </div>

                <button className="w-full text-center text-[12px] font-bold text-[#009981] hover:underline mt-1">
                  ✦ Xem thêm các khuyến mại khác
                </button>

                {/* Hotline */}
                <div className="flex items-center justify-center gap-2 mt-3 bg-[#009981] text-white rounded-lg py-2 px-4">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="font-black text-[14px]">1900.2091</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center italic">Phím 1 - Hotline bán hàng online</p>
              </div>
            </div>

            {/* RIGHT - Order Form */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: '92vh' }}>
              <h2 className="text-[18px] font-black text-gray-900 mb-5 uppercase tracking-tight">Đặt hàng sản phẩm</h2>

              {/* Color Selection */}
              <div className="mb-5">
                <label className="text-[12px] font-bold text-gray-500 mb-2 block uppercase">Chọn màu sắc</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <button
                      key={c.id || i}
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-left ${
                        selectedColor?.name === c.name
                          ? 'border-[#009981] bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {selectedColor?.name === c.name && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#009981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                      <div>
                        <p className="text-[12px] font-bold text-gray-800">{c.name}</p>
                        <p className="text-[11px] font-bold text-[#ee0000]">{formatPrice(c.price || currentPrice)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-5">
                <label className="text-[12px] font-bold text-gray-500 mb-2 block uppercase">Số lượng</label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-8 border border-gray-300 rounded-md text-center text-[13px] font-bold outline-none focus:border-[#009981]"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[12px] font-bold text-gray-500 mb-1 block uppercase">Họ tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if(errors.fullName) setErrors({...errors, fullName: null}); }}
                    placeholder="Nhập họ tên"
                    className={`w-full h-10 px-3 rounded-lg border text-[13px] font-medium outline-none transition-all ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#009981]'}`}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block uppercase">Điện thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: null}); }}
                      placeholder="0901 234 567"
                      className={`w-full h-10 px-3 rounded-lg border text-[13px] font-medium outline-none transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#009981]'}`}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block uppercase">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: null}); }}
                      placeholder="email@gmail.com"
                      className={`w-full h-10 px-3 rounded-lg border text-[13px] font-medium outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#009981]'}`}
                    />
                    {errors.email && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="mb-5">
                <label className="text-[12px] font-bold text-gray-500 mb-2 block uppercase">Hình thức nhận hàng</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryMethod('store')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-[12px] font-bold transition-all ${
                      deliveryMethod === 'store'
                        ? 'border-[#009981] bg-emerald-50 text-[#009981]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'store' ? 'border-[#009981]' : 'border-gray-300'}`}>
                      {deliveryMethod === 'store' && <div className="w-2 h-2 rounded-full bg-[#009981]" />}
                    </div>
                    Nhận hàng tại cửa hàng
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('home')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-[12px] font-bold transition-all ${
                      deliveryMethod === 'home'
                        ? 'border-[#009981] bg-emerald-50 text-[#009981]'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deliveryMethod === 'home' ? 'border-[#009981]' : 'border-gray-300'}`}>
                      {deliveryMethod === 'home' && <div className="w-2 h-2 rounded-full bg-[#009981]" />}
                    </div>
                    Giao hàng tận nơi
                  </button>
                </div>
              </div>

              {/* City & Store Selection */}
              <div className="mb-5">
                <label className="text-[12px] font-bold text-gray-500 mb-2 block uppercase">Nơi nhận hàng</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selectedCity}
                    onChange={(e) => { setSelectedCity(e.target.value); setSelectedStore(''); if(errors.city) setErrors({...errors, city: null}); }}
                    className={`h-10 px-3 rounded-lg border text-[13px] font-medium outline-none appearance-none cursor-pointer transition-all ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#009981]'}`}
                  >
                    <option value="">Chọn thành phố</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-medium outline-none appearance-none cursor-pointer focus:border-[#009981] transition-all"
                  >
                    <option value="">Cửa hàng *</option>
                    {(stores[selectedCity] || []).map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.city && <p className="text-[10px] text-red-500 font-bold mt-0.5">{errors.city}</p>}
              </div>

              {/* Note */}
              <div className="mb-5">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú"
                  rows="2"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-[13px] font-medium outline-none resize-none focus:border-[#009981] transition-all"
                />
              </div>

              <div className="mb-5">
                <div className="flex items-start gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="vatCheckbox"
                    checked={isVAT}
                    onChange={(e) => {
                      setIsVAT(e.target.checked);
                      if (!e.target.checked) {
                        setCompanyName('');
                        setTaxCode('');
                        setCompanyAddress('');
                        setErrors(prev => ({ ...prev, companyName: null, taxCode: null, companyAddress: null }));
                      }
                    }}
                    className="mt-1 w-4 h-4 accent-[#009981]"
                  />
                  <label htmlFor="vatCheckbox" className="text-[12px] text-gray-700 font-bold leading-snug cursor-pointer select-none">
                    <span className="text-[#009981]">Yêu cầu xuất hoá đơn công ty</span> (Vui lòng điền email để nhận hoá đơn VAT)
                  </label>
                </div>

                {isVAT && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 mb-1 block">Tên Công ty</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => { setCompanyName(e.target.value); if(errors.companyName) setErrors({...errors, companyName: null}); }}
                          placeholder="Tên công ty *"
                          className={`w-full h-10 px-3 rounded-xl bg-gray-200/50 border-0 text-[13px] font-medium outline-none transition-all ${errors.companyName ? 'ring-1 ring-red-400' : 'focus:bg-white focus:ring-1 focus:ring-[#009981]'}`}
                        />
                        {errors.companyName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.companyName}</p>}
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-500 mb-1 block">Mã số thuế</label>
                        <input
                          type="text"
                          value={taxCode}
                          onChange={(e) => { setTaxCode(e.target.value); if(errors.taxCode) setErrors({...errors, taxCode: null}); }}
                          placeholder="Mã số thuế *"
                          className={`w-full h-10 px-3 rounded-xl bg-gray-200/50 border-0 text-[13px] font-medium outline-none transition-all ${errors.taxCode ? 'ring-1 ring-red-400' : 'focus:bg-white focus:ring-1 focus:ring-[#009981]'}`}
                        />
                        {errors.taxCode && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.taxCode}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 mb-1 block">Địa chỉ công ty</label>
                      <input
                        type="text"
                        value={companyAddress}
                        onChange={(e) => { setCompanyAddress(e.target.value); if(errors.companyAddress) setErrors({...errors, companyAddress: null}); }}
                        placeholder="Địa chỉ công ty *"
                        className={`w-full h-10 px-3 rounded-xl bg-gray-200/50 border-0 text-[13px] font-medium outline-none transition-all ${errors.companyAddress ? 'ring-1 ring-red-400' : 'focus:bg-white focus:ring-1 focus:ring-[#009981]'}`}
                      />
                      {errors.companyAddress && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.companyAddress}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                    placeholder="Mã voucher hoặc giới thiệu..."
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-medium outline-none focus:border-[#ee0000] transition-all uppercase"
                    disabled={!!appliedCoupon}
                  />
                    {appliedCoupon ? (
                    <button
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponStatus(null); setDiscountAmount(0); }}
                      className="px-4 h-10 bg-red-100 border border-red-300 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-200 transition-all"
                    >
                      Xóa mã
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 h-10 bg-gray-900 border border-gray-900 rounded-lg text-[12px] font-bold text-white hover:bg-[#ee0000] transition-all"
                    >
                      Áp dụng
                    </button>
                  )}
                </div>
                {couponStatus && (
                  <p className={`text-[11px] mt-1.5 font-bold ${ couponStatus.type === 'success' ? 'text-emerald-600' : 'text-red-500' }`}>
                    {couponStatus.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="text-[11px] text-gray-400 leading-relaxed mb-5">
                Bằng việc đặt mua hàng, bạn đồng ý với{' '}
                <span className="text-[#009981] font-bold cursor-pointer hover:underline">Điều khoản dịch vụ</span>, Chính sách{' '}
                <span className="text-[#009981] font-bold cursor-pointer hover:underline">bảo hành đổi trả</span> và Chính sách{' '}
                <span className="text-[#009981] font-bold cursor-pointer hover:underline">xử lý dữ liệu cá nhân</span> của PhoneSin.
                <br /><br />
                Quý khách lưu ý, PhoneSin không yêu cầu khách hàng phải đặt cọc hoặc chuyển khoản toàn bộ đơn hàng để giữ hàng. Quý khách chỉ thanh toán tiền khi nhận tại cửa hàng hoặc đẳng cấp hoa trên tay, không nên chuyển khoản cho người giao hàng khi không gặp trực tiếp.
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 border border-gray-100">
                <div className="flex justify-between text-[13px] text-gray-500 font-medium">
                  <span>Tạm tính:</span>
                  <span>{rawTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[13px] font-bold text-emerald-600">
                    <span>Giảm giá ({appliedCoupon}):</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-[14px] font-black text-gray-800 uppercase">Tổng cộng:</span>
                  <span className="text-[18px] font-black text-[#ee0000]">{finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* Submit Button */}
              {!user && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-700">
                  Vui lòng đăng nhập trước khi đặt hàng.
                </div>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-black text-[16px] uppercase tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-wait'
                    : 'bg-[#ee0000] hover:bg-[#cc0000] text-white shadow-red-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'TIẾN HÀNH ĐẶT HÀNG'
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes modalSlideIn {
          0% { opacity: 0; transform: scale(0.93) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BuyNowModal;

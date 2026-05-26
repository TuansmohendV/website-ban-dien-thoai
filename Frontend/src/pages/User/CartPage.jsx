import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';
import { 
  Check, 
  Trash2, 
  Plus, 
  Minus, 
  Truck, 
  Store, 
  ChevronDown,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Zap,
  Wallet,
  CreditCard,
  Ticket,
  ShieldCheck,
  RefreshCw,
  Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumbs from '../../components/Breadcrumbs';

const PROFILE_ADDRESS_ID = 'profile-address';

const buildAddressLine = (address = {}) =>
  [address.street, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(', ');

const buildProfileAddress = (profile) => {
  if (
    !profile?.address ||
    !profile?.province ||
    !profile?.district ||
    !profile?.ward ||
    !(profile.fullName || profile.name) ||
    !profile.phone
  ) {
    return null;
  }

  return {
    _id: PROFILE_ADDRESS_ID,
    label: 'Địa chỉ hồ sơ',
    recipientName: profile.fullName || profile.name,
    phone: profile.phone,
    province: profile.province,
    district: profile.district,
    ward: profile.ward,
    street: profile.address,
    note: '',
    isDefault: false,
    isProfileAddress: true,
  };
};

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
  const { createOrder, processPayment } = useOrders();
  const { user } = useAuth();
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    note: '',
    isVAT: false,
    companyName: '',
    taxId: '',
    companyAddress: '',
    paymentMethod: 'COD'
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('home');
  const [storePickupAddress, setStorePickupAddress] = useState('');

  const formatPrice = (num) => new Intl.NumberFormat('vi-VN').format(num || 0) + ' ₫';
  const selectedAddress =
    savedAddresses.find((address) => address._id === selectedAddressId) || null;
  const isStorePickup = deliveryMode === 'store';

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
    if (!user) {
      setSavedAddresses([]);
      setSelectedAddressId('');
      return;
    }

    let isMounted = true;

    const fetchSavedAddresses = async () => {
      setIsLoadingAddresses(true);
      setAddressError('');

      try {
        const response = await api.get('/api/address');
        const profileAddress = buildProfileAddress(user);
        const nextAddresses = [
          ...(response.data?.data || []),
          ...(profileAddress ? [profileAddress] : []),
        ];

        if (!isMounted) return;

        setSavedAddresses(nextAddresses);
        setSelectedAddressId((currentId) => {
          if (currentId && nextAddresses.some((address) => address._id === currentId)) {
            return currentId;
          }

          const defaultAddress = nextAddresses.find((address) => address.isDefault);
          return (defaultAddress || nextAddresses[0])?._id || '';
        });
      } catch (error) {
        if (!isMounted) return;

        const profileAddress = buildProfileAddress(user);
        setSavedAddresses(profileAddress ? [profileAddress] : []);
        setSelectedAddressId(profileAddress?._id || '');
        setAddressError(getApiErrorMessage(error, 'Không tải được sổ địa chỉ đã lưu.'));
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      }
    };

    fetchSavedAddresses();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    setCustomerInfo((prev) => ({
      ...prev,
      name: selectedAddress?.recipientName || prev.name || user?.fullName || user?.name || '',
      phone: selectedAddress?.phone || prev.phone || user?.phone || '',
      email: prev.email || user?.email || '',
    }));
  }, [selectedAddressId, user]);

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
    if (e) e.preventDefault();

    if (!cartItems.length) {
        alert("Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
        return;
    }
    
    if (!isStorePickup && !selectedAddress) {
        alert("Vui lòng chọn địa chỉ đã lưu trước khi đặt hàng.");
        return;
    }

    if (isStorePickup && !storePickupAddress.trim()) {
        alert("Vui lòng nhập địa chỉ cửa hàng nhận hàng.");
        return;
    }

    const orderEmail = (customerInfo.email || user?.email || '').trim();

    if (customerInfo.isVAT) {
        if (!orderEmail) {
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

    setIsSubmitting(true);

    try {
        const pickupName = customerInfo.name || user?.fullName || user?.name || 'Khách hàng';
        const pickupPhone = customerInfo.phone || user?.phone || '';
        const shippingAddress = isStorePickup
            ? {
                label: 'Nhận tại cửa hàng',
                recipientName: pickupName,
                phone: pickupPhone,
                province: 'Nhận tại cửa hàng',
                district: 'Nhận tại cửa hàng',
                ward: 'Nhận tại cửa hàng',
                street: storePickupAddress.trim(),
                note: customerInfo.note || '',
            }
            : selectedAddress.isProfileAddress
            ? {
                label: selectedAddress.label,
                recipientName: selectedAddress.recipientName,
                phone: selectedAddress.phone,
                province: selectedAddress.province,
                district: selectedAddress.district,
                ward: selectedAddress.ward,
                street: selectedAddress.street,
                note: customerInfo.note || selectedAddress.note || '',
            }
            : undefined;

        const orderPayload = {
            customerInfo: {
                fullName: isStorePickup ? pickupName : selectedAddress.recipientName,
                phone: isStorePickup ? pickupPhone : selectedAddress.phone,
                email: orderEmail,
            },
            addressId: isStorePickup || selectedAddress.isProfileAddress ? undefined : selectedAddress._id,
            shippingAddress,
            paymentMethod: customerInfo.paymentMethod,
            shippingFee: 0,
            voucherCode: appliedCoupon || undefined,
            notes: customerInfo.note || '',
            invoiceInfo: customerInfo.isVAT
                ? {
                    enabled: true,
                    email: orderEmail,
                    companyName: customerInfo.companyName.trim(),
                    taxCode: customerInfo.taxId.trim(),
                    companyAddress: customerInfo.companyAddress.trim(),
                }
                : undefined,
        };

        const order = await createOrder(orderPayload);

        // Handle payment based on method
        if (customerInfo.paymentMethod !== 'COD' && customerInfo.paymentMethod) {
            const payResponse = await processPayment(order.backendId || order.id || order._id, customerInfo.paymentMethod, {
                returnUrl: `${window.location.origin}/checkout-result`,
                origin: window.location.origin
            });

            if (payResponse?.paymentUrl) {
                window.location.href = payResponse.paymentUrl;
                return;
            }
        }

        // COD - Show success directly
        setOrderId(order.id || order._id);
        setIsOrdered(true);
        await clearCart();
        
    } catch (error) {
        alert(error.message || 'Không thể tạo đơn hàng lúc này.');
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 max-w-lg w-full text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <h2 className="text-3xl font-black uppercase text-slate-900 mb-4 tracking-tighter">Xác nhận thành công!</h2>
            <p className="text-[15px] text-gray-500 font-medium mb-2">Cảm ơn bạn <span className="text-[#008d71] font-bold">{customerInfo.name}</span> đã tin tưởng PhoneSin.</p>
            <p className="text-[13px] text-gray-400 mb-8 font-medium">Mã đơn hàng: <span className="text-[#008d71] font-black uppercase tracking-widest">{orderId}</span></p>
            
            <div className="w-full bg-gray-50 rounded-3xl p-6 mb-8 text-left border border-gray-100">
                <p className="text-[13px] text-gray-500 leading-relaxed">
                    Nhân viên PhoneSin sẽ liên hệ với bạn qua số <span className="font-bold text-slate-900">{customerInfo.phone}</span> để xác nhận đơn hàng trong 15-30 phút.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link to="/" className="flex-1 bg-[#008d71] text-white py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-black transition-all shadow-lg active:scale-95 text-center">Trang chủ</Link>
                <Link to="/orders" className="flex-1 bg-white text-slate-900 border-2 border-gray-200 py-3.5 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-gray-50 transition-all active:scale-95 text-center">Đơn hàng</Link>
            </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10 font-sans">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="bg-[#008d71] hover:bg-black text-white px-8 py-3 rounded-xl font-black">Quay lại mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 pt-6">
        <Breadcrumbs />
      </div>

      {/* Page Title */}
      <div className="max-w-[1600px] mx-auto px-4 pt-4">
        <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Giỏ hàng của bạn</h1>
        <p className="text-[14px] text-gray-500 mt-1">Bạn có {cartItems.length} sản phẩm trong giỏ hàng</p>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN: Cart Items - Light Theme */}
          <div className="flex-1 min-w-0 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                  
                  {/* Product Image */}
                  <div className="w-full sm:w-[160px] h-[160px] bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Header with Remove Button */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-[15px] font-black text-slate-900 leading-snug">{item.name}</h3>
                        {/* Color & Storage Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="bg-gray-100 text-[11px] font-bold px-3 py-1 rounded-full text-gray-600">{item.selectedColor?.name || item.color}</span>
                          {item.selectedVariant?.storage && (
                            <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-200">{item.selectedVariant.storage}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedVariant?.id, item.selectedColor?.name)}
                        className="bg-red-50 text-red-500 hover:bg-red-100 p-2 rounded-lg transition-all flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3">
                      <span className="text-red-600 text-xl font-black">{formatPrice(item.price)}</span>
                      {item.oldPrice > item.price && (
                        <span className="text-gray-400 line-through text-[13px] mb-1">{formatPrice(item.oldPrice)}</span>
                      )}
                    </div>

                    {/* Stock Warning */}
                    {item.qty > item.maxStock && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <Zap size={16} className="text-red-500" fill="currentColor" />
                        <span className="text-[12px] font-bold text-red-600">
                          {item.maxStock === 0 ? 'Sản phẩm đã hết hàng' : `Chỉ còn ${item.maxStock} sản phẩm!`}
                        </span>
                      </div>
                    )}

                    {/* Quantity Control */}
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">Số lượng</span>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, -1)} 
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 h-9 flex items-center justify-center text-[14px] font-black text-slate-900 border-x border-gray-200">{item.qty}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedVariant?.id, item.selectedColor?.name, 1)} 
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotions Section */}
                {item.promos && item.promos.length > 0 && (
                  <div className="px-4 sm:px-5 pb-4">
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Star size={13} className="text-red-500 fill-red-500" />
                        <span className="text-[11px] font-black text-red-500 uppercase">Khuyến mại</span>
                      </div>
                      {item.promos.slice(0, 2).map((promo) => (
                        <div key={promo.id} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                          <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className="text-[12px] font-medium text-gray-700 leading-snug">{promo.title}</span>
                        </div>
                      ))}
                      {item.promos.length > 2 && (
                        <button className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold hover:text-emerald-700 transition-colors mt-1">
                          <Zap size={13} fill="currentColor" />
                          Xem thêm {item.promos.length - 2} khuyến mại
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* COMMITMENT SECTION - Light Theme */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border-t-2 border-emerald-500">
              <h3 className="text-center font-black text-[13px] text-slate-900 uppercase mb-4 tracking-wider">Cam kết PhoneSin</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Truck className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-[12px] leading-snug text-gray-700">Miễn phí vận chuyển toàn quốc</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-[12px] leading-snug text-gray-700">Bảo hành chính hãng 12 tháng</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <RefreshCw className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-[12px] leading-snug text-gray-700">Lỗi Đổi Liền trong 12 tháng</p>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Check className="text-emerald-600 shrink-0" size={18} />
                  <p className="text-[12px] leading-snug text-gray-700">Giá đã bao gồm VAT</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Form - Buy Now Theme */}
          <div className="lg:w-[540px] xl:w-[580px]">
            <div className="lg:sticky lg:top-24 bg-white text-slate-900 rounded-3xl p-5 sm:p-8 shadow-2xl border border-gray-100">
            
            {/* Cột phải: Tóm tắt đơn hàng */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-8 italic flex items-center gap-3 border-b border-gray-100 pb-5 uppercase tracking-normal leading-tight">
                <Truck size={24} className="w-6 h-6 shrink-0 text-emerald-600" />
                <span className="min-w-0 break-words">Đơn hàng của bạn</span>
              </h2>

              {/* Thông tin giao hàng */}
              <div className="mb-8 space-y-4">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Thông tin giao hàng</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Họ tên"
                    value={isStorePickup ? customerInfo.name : selectedAddress?.recipientName || customerInfo.name || ''}
                    readOnly
                    className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Điện thoại"
                      value={isStorePickup ? customerInfo.phone : selectedAddress?.phone || customerInfo.phone || ''}
                      readOnly
                      className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình thức nhận hàng</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('home')}
                      className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        !isStorePickup ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 hover:border-emerald-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        !isStorePickup ? 'border-emerald-500' : 'border-gray-200'
                      }`}>
                        {!isStorePickup && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                      </div>
                      <span className="text-xs font-bold">Nhận hàng tại nhà</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('store')}
                      className={`h-11 px-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        isStorePickup ? 'border-emerald-500 bg-emerald-50' : 'border-gray-50 hover:border-emerald-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isStorePickup ? 'border-emerald-500' : 'border-gray-200'
                      }`}>
                        {isStorePickup && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                      </div>
                      <span className="text-xs font-bold">Nhận hàng tại cửa hàng</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ nhận hàng</p>
                  {isStorePickup ? (
                    <input
                      type="text"
                      value={storePickupAddress}
                      onChange={(e) => setStorePickupAddress(e.target.value)}
                      placeholder="Nhập địa chỉ cửa hàng nhận hàng"
                      className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  ) : (
                    <>
                      {addressError && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                          {addressError}
                        </div>
                      )}
                      {isLoadingAddresses ? (
                        <div className="h-11 px-4 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black uppercase text-slate-600">
                          Đang tải địa chỉ...
                        </div>
                      ) : savedAddresses.length > 0 ? (
                        <>
                          <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800 appearance-none transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            {savedAddresses.map((address) => (
                              <option key={address._id} value={address._id}>
                                {address.label || 'Địa chỉ'} - {address.recipientName} - {address.phone}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={selectedAddress ? buildAddressLine(selectedAddress) : ''}
                            readOnly
                            placeholder="Chọn địa chỉ nhận hàng"
                            className="w-full h-11 px-4 bg-gray-100 rounded-xl outline-none text-sm font-bold text-slate-800"
                          />
                          <Link
                            to="/profile?tab=addresses"
                            className="inline-flex h-10 items-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 text-xs font-black uppercase text-emerald-700 transition-all hover:border-emerald-500 hover:bg-emerald-100"
                          >
                            <Plus size={16} strokeWidth={3} />
                            Thêm địa chỉ
                          </Link>
                        </>
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                          <p className="text-xs font-black uppercase text-slate-800">Chưa có địa chỉ đã lưu</p>
                          <Link
                            to="/profile?tab=addresses"
                            className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black uppercase text-white transition-all hover:bg-emerald-700"
                          >
                            <Plus size={16} strokeWidth={3} />
                            Thêm địa chỉ
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <textarea
                  placeholder="Ghi chú"
                  rows="3"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                  className="w-full h-20 p-4 bg-gray-100 rounded-xl outline-none text-sm font-bold resize-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                ></textarea>
              </div>

              {/* Mã giảm giá */}
              <div className="mb-8 p-6 bg-slate-900 rounded-3xl border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5">
                <p className="text-[11px] font-black text-emerald-400 mb-4 uppercase tracking-[0.2em] text-center italic">Mã giảm giá Sin Store</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã ưu đãi..."
                    className="flex-1 min-w-0 h-12 px-4 bg-white/10 rounded-xl border border-white/10 text-white font-black outline-none focus:border-emerald-500 transition-all uppercase placeholder:text-gray-600"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={handleRemoveCoupon}
                      className="h-12 px-6 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg active:scale-95 uppercase text-xs whitespace-nowrap"
                    >
                      Gỡ bỏ
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="h-12 px-6 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95 uppercase text-xs whitespace-nowrap disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Áp dụng'}
                    </button>
                  )}
                </div>
                {couponStatus && (
                  <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider text-center leading-snug break-words ${couponStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {couponStatus.message}
                  </p>
                )}

                {availableVouchers.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowVoucherList(!showVoucherList)}
                      className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Ticket size={14} />
                      {showVoucherList ? 'Ẩn danh sách' : 'Mã giảm giá có sẵn'}
                    </button>

                    {showVoucherList && (
                      <div className="mt-4 grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar animate-fadeIn">
                        {availableVouchers.map(v => (
                          <div
                            key={v.code}
                            onClick={() => {
                              setCouponCode(v.code);
                              handleApplyCoupon(v.code);
                              setShowVoucherList(false);
                            }}
                            className="relative group rounded-xl p-3 flex justify-between items-center gap-3 cursor-pointer transition-all shadow-md active:scale-[0.98] bg-blue-600 text-white"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 border border-white/20 shrink-0">
                                <Ticket size={16} className="text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] font-black tracking-normal text-white uppercase break-all">{v.code}</p>
                                <p className="text-[8px] font-bold text-white/70 italic">
                                  Giảm {v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[8px] font-black uppercase px-2 py-1 rounded-lg bg-white text-slate-900 shadow-sm transition-all group-hover:bg-slate-100">Chọn</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hình thức thanh toán */}
              <div className="mb-8 p-5 sm:p-6 bg-slate-50 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
                  <CreditCard size={20} className="text-emerald-600 w-5 h-5 shrink-0" />
                  <h3 className="text-[13px] font-black uppercase tracking-widest leading-tight break-words text-slate-400">Hình thức thanh toán</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'COD',
                      label: 'Tiền mặt',
                      description: 'Thanh toán khi nhận hàng',
                      iconElement: <Truck size={22} strokeWidth={2.5} />,
                      active: 'border-emerald-500 bg-white shadow-lg text-slate-900',
                      icon: 'bg-emerald-600 text-white',
                    },
                    {
                      id: 'VNPAY',
                      label: 'VNPay',
                      description: 'Thanh toán qua VNPay',
                      iconElement: <CreditCard size={22} strokeWidth={2.5} />,
                      active: 'border-blue-500 bg-white shadow-lg text-slate-900',
                      icon: 'bg-blue-600 text-white',
                    },
                    {
                      id: 'MOMO',
                      label: 'MoMo',
                      description: 'Thanh toán ví MoMo',
                      iconElement: <Wallet size={22} strokeWidth={2.5} />,
                      active: 'border-[#A50064] bg-white shadow-lg text-slate-900',
                      icon: 'bg-[#A50064] text-white',
                    },
                  ].map(({ id, label, description, iconElement, active, icon }) => {
                    const isActive = customerInfo.paymentMethod === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        className={`relative min-h-[104px] flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${
                          isActive ? active : 'border-transparent bg-white/60 text-slate-400 hover:bg-white hover:text-slate-700'
                        }`}
                        onClick={() => setCustomerInfo({...customerInfo, paymentMethod: id})}
                      >
                        <span className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${isActive ? icon : 'bg-slate-100 text-slate-400'}`}>
                          {iconElement}
                        </span>
                        <span className="text-[12px] font-black uppercase text-center leading-tight">{label}</span>
                        <span className="text-[9px] font-bold text-center leading-tight opacity-70">{description}</span>
                        {isActive && <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tổng cộng */}
              <div className="p-6 bg-slate-900 rounded-3xl mb-8">
                <div className="flex justify-between items-center gap-3 mb-2">
                  <span className="text-gray-400 text-sm font-bold">Tạm tính:</span>
                  <span className="text-white text-sm font-black whitespace-nowrap">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center gap-3 mb-2">
                  <span className="text-gray-400 text-sm font-bold">Phí vận chuyển:</span>
                  <span className="text-white text-sm font-black whitespace-nowrap">{formatPrice(0)}</span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between items-center gap-3 mb-4 text-emerald-400">
                    <span className="text-sm font-bold">Giảm giá:</span>
                    <span className="text-sm font-black whitespace-nowrap">-{formatPrice(cartDiscount)}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4 flex justify-between items-center gap-3">
                  <span className="text-white font-black uppercase tracking-widest">Tổng tiền:</span>
                  <span className="text-emerald-400 text-xl sm:text-2xl font-black whitespace-nowrap">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cartItems.length === 0}
                className="w-full min-h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-xl rounded-2xl px-4 py-3 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 uppercase tracking-normal sm:tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 text-center leading-tight"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="min-w-0 break-words">{cartItems.length === 0 ? 'GIỎ HÀNG ĐANG TRỐNG' : 'HOÀN TẤT ĐẶT HÀNG'}</span>
                    <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center mt-5 text-gray-500 font-bold uppercase tracking-tighter italic">
                Bằng cách đặt hàng, bạn đồng ý với các điều khoản của Sin Store
              </p>
            </div>

            {/* VAT */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${customerInfo.isVAT ? 'bg-red-600 border-red-600' : 'border-gray-200 group-hover:border-black'}`}>
                  {customerInfo.isVAT && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={customerInfo.isVAT}
                  onChange={(e) => setCustomerInfo({...customerInfo, isVAT: e.target.checked})}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Xuất hóa đơn công ty (VAT)</h3>
                  <p className="text-xs font-bold text-gray-400 italic mt-0.5">PhoneSin sẽ gửi hóa đơn điện tử qua email cho bạn</p>
                </div>
              </label>

              {customerInfo.isVAT && (
                <div className="mt-8 space-y-5 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên công ty</label>
                    <input
                      type="text"
                      placeholder="Công ty TNHH Giải pháp PhoneSin"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mã số thuế</label>
                    <input
                      type="text"
                      placeholder="0123456789"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                      value={customerInfo.taxId}
                      onChange={(e) => setCustomerInfo({...customerInfo, taxId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Địa chỉ công ty</label>
                    <input
                      type="text"
                      placeholder="99 Cầu Giấy, Dịch Vọng, Hà Nội"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                      value={customerInfo.companyAddress}
                      onChange={(e) => setCustomerInfo({...customerInfo, companyAddress: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
            </div>
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
        <div className="bg-[#cc0000] w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all text-center">
          <span className="text-[8px] font-black uppercase leading-none">Máy cũ</span>
          <span className="text-[8px] font-black uppercase leading-none">Giá tốt</span>
        </div>
        <div className="bg-[#f97316] w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all text-center">
          <span className="text-[8px] font-black uppercase leading-none">Thu cũ</span>
          <span className="text-[8px] font-black uppercase leading-none">Giá cao</span>
        </div>
        <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="bg-[#0068ff] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-105 transition-all relative">
          <svg viewBox="0 0 100 100" className="w-8 h-8 fill-white">
            <path d="M50 10c-22.1 0-40 17.9-40 40 0 9.4 3.3 18.1 8.9 25L20 95l20-8.3c6.2 3.5 13.3 5.6 21 5.6 22.1 0 40-17.9 40-40S72.1 10 50 10z"/>
          </svg>
        </a>
      </div>

      {/* Back to Top */}
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

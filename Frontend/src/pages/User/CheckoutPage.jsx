import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import DeliveryEstimator from '../../components/DeliveryEstimator';
import api, { getApiErrorMessage } from '../../lib/api';
import { mapPaymentMethodToBackend } from '../../lib/orders';

const MapPinIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>);
const CreditCardIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>);
const TruckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7a1 1 0 0 0 1 1h2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);

const CheckoutPage = () => {
    const { formatPrice } = useLanguage();
    const { user } = useAuth();
    const {
        cartItems,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        voucherCode,
        refreshCart,
    } = useCart();
    const { createOrder, processPayment } = useOrders();
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [subMethod, setSubMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null); // { type: 'success'|'error', message, discountAmount }
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [successfulOrderId, setSuccessfulOrderId] = useState('');

    // Form validation state
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        province: '',
        district: '',
        ward: '',
        address: ''
    });
    const [errors, setErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [isInfoVerified, setIsInfoVerified] = useState(false);
    const [deliveryEstimate, setDeliveryEstimate] = useState('');

    useEffect(() => {
        if (!user) {
            return;
        }

        setFormData((prevData) => ({
            ...prevData,
            fullName: prevData.fullName || user.fullName || user.name || '',
            phoneNumber: prevData.phoneNumber || user.phone || '',
            email: prevData.email || user.email || '',
        }));
    }, [user]);

    useEffect(() => {
        setAppliedCoupon(voucherCode || null);
        if (voucherCode) {
            setCouponCode(voucherCode);
        }
    }, [voucherCode]);

    const calculateDelivery = (province) => {
        const now = new Date();
        let daysToAdd = 3;
        if (['HN', 'HCM'].includes(province)) daysToAdd = 1;
        else if (['DN'].includes(province)) daysToAdd = 2;

        const deliveryDate = new Date(now);
        deliveryDate.setDate(now.getDate() + daysToAdd);

        return deliveryDate.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    // Regex for special characters (allow basic letters, numbers, spaces, dots, and commas)
    const specialCharRegex = /[!@#$%^&*()_+={}\[\]|\\:;"'<>/~`]/;
    const phoneRegex = /^0\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const subtotal = cartSubtotal || cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingFee = 35000;
    const discount = cartDiscount;
    const total = (cartTotal || Math.max(subtotal - discount, 0)) + shippingFee;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplying(true);
        setCouponStatus(null);

        try {
            const response = await api.post('/api/voucher/apply', {
                code: couponCode.trim().toUpperCase(),
            });
            await refreshCart();
            setAppliedCoupon(response.data?.voucher?.code || couponCode.trim().toUpperCase());
            setCouponStatus({
                type: 'success',
                message: response.data?.message || 'Ap dung ma giam gia thanh cong.',
            });
        } catch (error) {
            setAppliedCoupon(null);
            setCouponStatus({
                type: 'error',
                message: getApiErrorMessage(error, 'Ma giam gia khong hop le hoac da het han.'),
            });
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveCoupon = async () => {
        setIsApplying(true);
        setCouponStatus(null);

        try {
            await api.post('/api/voucher/apply', { code: '' });
            await refreshCart();
            setAppliedCoupon(null);
            setCouponCode('');
            setCouponStatus({
                type: 'success',
                message: 'Da go ma giam gia khoi gio hang.',
            });
        } catch (error) {
            setCouponStatus({
                type: 'error',
                message: getApiErrorMessage(error, 'Khong the go ma giam gia luc nay.'),
            });
        } finally {
            setIsApplying(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Check empty
        if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên';
        else if (specialCharRegex.test(formData.fullName)) newErrors.fullName = 'Họ tên không được chứa ký tự đặc biệt';

        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)';

        if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Email không hợp lệ';

        if (!formData.province) newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
        if (!formData.district) newErrors.district = 'Vui lòng chọn Quận/Huyện';
        if (!formData.ward) newErrors.ward = 'Vui lòng chọn Phường/Xã';

        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
        else if (specialCharRegex.test(formData.address.replace(/[.,]/g, ''))) newErrors.address = 'Địa chỉ chứa ký tự không hợp lệ';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // VAT Invoice State
    const [requestVat, setRequestVat] = useState(false);
    const [vatInfo, setVatInfo] = useState({
        companyName: '',
        taxCode: '',
        companyAddress: ''
    });

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            setCouponStatus({
                type: 'error',
                message: 'Gio hang dang trong, chua the dat hang.',
            });
            return;
        }

        if (validateForm()) {
            // Validate VAT info if requested
            if (requestVat) {
                if (!vatInfo.companyName.trim() || !vatInfo.taxCode.trim() || !vatInfo.companyAddress.trim()) {
                    setErrors({ ...errors, vat: 'Vui lòng nhập đầy đủ thông tin hóa đơn công ty' });
                    return;
                }
            }

            const estimate = calculateDelivery(formData.province);
            const backendPaymentMethod = mapPaymentMethodToBackend(paymentMethod, subMethod);

            try {
                setIsPlacingOrder(true);
                setCouponStatus(null);

                const order = await createOrder({
                    customerInfo: {
                        fullName: formData.fullName.trim(),
                        phone: formData.phoneNumber.trim(),
                        email: formData.email.trim(),
                    },
                    shippingAddress: {
                        recipientName: formData.fullName.trim(),
                        phone: formData.phoneNumber.trim(),
                        province: formData.province,
                        district: formData.district,
                        ward: formData.ward,
                        street: formData.address.trim(),
                    },
                    shippingFee,
                    paymentMethod: backendPaymentMethod,
                    voucherCode: appliedCoupon || undefined,
                    vatInfo: requestVat ? vatInfo : null, // Add VAT info if backend supports it
                });

                if (backendPaymentMethod !== 'COD') {
                    const payResponse = await processPayment(order.backendId || order.id, backendPaymentMethod, {
                        returnUrl: `${window.location.origin}/checkout-result`,
                        origin: window.location.origin
                    });

                    if (payResponse && payResponse.paymentUrl) {
                        window.location.href = payResponse.paymentUrl;
                        return; // Prevent showing success immediately
                    }
                }

                setSuccessfulOrderId(order.id);
                setDeliveryEstimate(estimate);
                setIsSuccess(true);
            } catch (error) {
                setCouponStatus({
                    type: 'error',
                    message: error.message || 'Khong the tao don hang luc nay.',
                });
            } finally {
                setIsPlacingOrder(false);
            }
        } else {
            const nextErrors = Object.keys(errors);
            const firstError = nextErrors[0];
            const errorElement = document.getElementsByName(firstError)[0];
            if (errorElement) errorElement.focus();
        }
    };


    const handleVerifyInfo = () => {
        if (validateForm()) {
            setIsInfoVerified(true);
            // Optional: toast or feedback could be added here
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8 lg:px-16 xl:px-24" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-black mb-10 text-slate-900 flex items-center gap-4 uppercase tracking-wider">
                    <span className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-2xl italic">Sin</span>
                    Thanh toán đơn hàng
                </h1>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* CỘT TRÁI: THÔNG TIN NHẬN HÀNG */}
                    <div className="flex-1 space-y-8">

                        {/* 1. Thông tin giao hàng */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <MapPinIcon className="text-red-600 w-6 h-6" />
                                <h2 className="text-2xl font-black uppercase text-slate-800">Thông tin nhận hàng</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-gray-400">Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Nguyễn Văn A"
                                        value={formData.fullName}
                                        onChange={(e) => {
                                            setFormData({ ...formData, fullName: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.fullName) setErrors({ ...errors, fullName: null });
                                        }}
                                        className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black'}`}
                                    />
                                    {errors.fullName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.fullName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase text-gray-400">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        placeholder="0901 234 567"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phoneNumber: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: null });
                                        }}
                                        className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black'}`}
                                    />
                                    {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.phoneNumber}</p>}
                                </div>
                            </div>

                            <div className="mt-5 space-y-2">
                                <label className="text-sm font-black uppercase text-gray-400">Email (để nhận hóa đơn)</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value });
                                        setIsInfoVerified(false);
                                        if (errors.email) setErrors({ ...errors, email: null });
                                    }}
                                    className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black'}`}
                                />
                                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.email}</p>}
                            </div>


                            <div className="mt-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={(e) => {
                                            setFormData({ ...formData, province: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.province) setErrors({ ...errors, province: null });
                                        }}
                                        className={`h-12 border-2 rounded-xl px-4 font-black text-slate-900 appearance-none transition-all cursor-pointer ${errors.province ? 'border-red-500 bg-red-50' : 'border-gray-50 hover:border-black bg-gray-50/50'}`}
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {[
                                            "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
                                        ].map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={(e) => {
                                            setFormData({ ...formData, district: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.district) setErrors({ ...errors, district: null });
                                        }}
                                        className={`h-12 border-2 rounded-xl px-4 font-black text-slate-900 appearance-none transition-all cursor-pointer ${errors.district ? 'border-red-500 bg-red-50' : 'border-gray-50 hover:border-black bg-gray-50/50'}`}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        <option value="Q1">Quận 1</option>
                                        <option value="CG">Cầu Giấy</option>
                                    </select>
                                    <select
                                        name="ward"
                                        value={formData.ward}
                                        onChange={(e) => {
                                            setFormData({ ...formData, ward: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.ward) setErrors({ ...errors, ward: null });
                                        }}
                                        className={`h-12 border-2 rounded-xl px-4 font-black text-slate-900 appearance-none transition-all cursor-pointer ${errors.ward ? 'border-red-500 bg-red-50' : 'border-gray-50 hover:border-black bg-gray-50/50'}`}
                                    >
                                        <option value="">Chọn Phường/Xã</option>
                                        <option value="P1">Phường 1</option>
                                        <option value="D">Dịch Vọng</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <textarea
                                        name="address"
                                        placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)"
                                        rows="3"
                                        value={formData.address}
                                        onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.address) setErrors({ ...errors, address: null });
                                        }}
                                        className={`w-full p-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all resize-none ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black'}`}
                                    ></textarea>
                                    {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.address}</p>}
                                </div>

                                <button
                                    onClick={handleVerifyInfo}
                                    className={`w-full h-12 rounded-xl font-black uppercase transition-all flex items-center justify-center gap-2 group ${isInfoVerified
                                            ? 'bg-green-500 text-white cursor-default'
                                            : 'bg-black text-white hover:bg-red-600 active:scale-95 shadow-lg'
                                        }`}
                                >
                                    {isInfoVerified ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                            ĐÃ XÁC NHẬN THÔNG TIN
                                        </>
                                    ) : (
                                        <>
                                            XÁC NHẬN THÔNG TIN
                                            <svg className="transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                        {/* 2. Bản đồ chọn vị trí */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 overflow-hidden">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <MapPinIcon className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-black uppercase text-slate-800">Định vị địa chỉ</h2>
                            </div>
                            <div className="w-full h-[300px] rounded-2xl overflow-hidden border-4 border-gray-50 shadow-inner relative group">

                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.195708298!2d105.79374!3d20.9847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135accdd847d7d7%3A0x29837945e9974268!2zSOG7jWMgdmnhu4duIEPDtG5n nghu4cgQuBuIGNow61uaCBWaeG7hW4gdGjDtG5n!5e0!3m2!1svi!2s!4v1712150000000!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                                <div className="absolute inset-0 pointer-events-none border-[20px] border-white/10 group-hover:border-white/5 transition-all"></div>
                            </div>
                        </div>

                        {/* 3. Xuất hóa đơn công ty (VAT) */}
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${requestVat ? 'bg-red-600 border-red-600' : 'border-gray-200 group-hover:border-black'}`}>
                                    {requestVat && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={requestVat} 
                                    onChange={(e) => setRequestVat(e.target.checked)} 
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800">Xuất hóa đơn công ty (VAT)</h3>
                                    <p className="text-xs font-bold text-gray-400 italic mt-0.5">PhoneSin sẽ gửi hóa đơn điện tử qua email cho bạn</p>
                                </div>
                            </label>

                            {requestVat && (
                                <div className="mt-8 space-y-5 animate-in slide-in-from-top-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tên công ty</label>
                                        <input 
                                            type="text"
                                            placeholder="Công ty TNHH Giải pháp PhoneSin"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                                            value={vatInfo.companyName}
                                            onChange={(e) => setVatInfo({...vatInfo, companyName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mã số thuế</label>
                                        <input 
                                            type="text"
                                            placeholder="0123456789"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                                            value={vatInfo.taxCode}
                                            onChange={(e) => setVatInfo({...vatInfo, taxCode: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Địa chỉ công ty</label>
                                        <input 
                                            type="text"
                                            placeholder="99 Cầu Giấy, Dịch Vọng, Hà Nội"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                                            value={vatInfo.companyAddress}
                                            onChange={(e) => setVatInfo({...vatInfo, companyAddress: e.target.value})}
                                        />
                                    </div>
                                    {errors.vat && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.vat}</p>}
                                </div>
                            )}
                        </div>

                        {/* 4. Ước tính thời gian giao hàng */}
                        <DeliveryEstimator />

                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:w-[450px] space-y-8">
                        <div className="bg-black text-white rounded-3xl p-8 shadow-2xl sticky top-24">
                            <h2 className="text-2xl font-black mb-8 italic flex items-center gap-3 border-b border-white/20 pb-5 uppercase tracking-tighter">
                                <TruckIcon className="w-6 h-6" />
                                Đơn hàng của bạn
                            </h2>

                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-white rounded-2xl p-1 overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black leading-tight uppercase mb-1 line-clamp-2">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs font-bold text-gray-400 italic">Số lượng: {item.qty}</span>
                                                <span className="text-sm font-black">{formatPrice(item.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Phương thức thanh toán nằm chung với đơn hàng */}
                            <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                                    <CreditCardIcon className="text-amber-500 w-5 h-5" />
                                    <h3 className="text-lg font-black uppercase tracking-tighter">Hình thức thanh toán</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { id: 'cod', name: 'Tiền mặt (COD)', icon: '🚚' },
                                        { id: 'bank', name: 'Chuyển khoản', icon: '🏦' },
                                        { id: 'momo', name: 'Ví MoMo/VNPay', icon: '💳' }
                                    ].map((method) => (
                                        <div key={method.id} className="space-y-3">
                                            <label
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${paymentMethod === method.id ? 'border-amber-500 bg-white/10 shadow-lg' : 'border-white/5 hover:border-white/20'
                                                    }`}
                                                onClick={() => {
                                                    setPaymentMethod(method.id);
                                                    setSubMethod('');
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-amber-500 bg-amber-500' : 'border-white/20'
                                                    }`}>
                                                    {paymentMethod === method.id && <div className="w-1.5 h-1.5 bg-black rounded-full"></div>}
                                                </div>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <span className="text-sm">{method.icon}</span>
                                                    <span className="text-sm font-black uppercase">{method.name}</span>
                                                </div>
                                            </label>

                                            {/* Sub-options for Bank Transfer */}
                                            {paymentMethod === 'bank' && method.id === 'bank' && (
                                                <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/10 animate-fadeIn">
                                                    {[
                                                        { id: 'vcb', name: 'VCB', color: 'bg-green-600' },
                                                        { id: 'tcb', name: 'TCB', color: 'bg-red-600' },
                                                        { id: 'mb', name: 'MB', color: 'bg-blue-800' },
                                                        { id: 'bidv', name: 'BIDV', color: 'bg-blue-600' }
                                                    ].map(bank => (
                                                        <button
                                                            key={bank.id}
                                                            onClick={() => setSubMethod(bank.id)}
                                                            className={`flex items-center justify-center p-2 rounded-lg border-2 transition-all gap-2 ${subMethod === bank.id ? 'border-amber-500 bg-white text-black' : 'border-transparent bg-white/10 text-white/60 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            <span className="text-[10px] font-black">{bank.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Sub-options for E-wallets */}
                                            {paymentMethod === 'momo' && method.id === 'momo' && (
                                                <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 rounded-xl border border-white/10 animate-fadeIn">
                                                    {[
                                                        { id: 'momo_sub', name: 'MoMo', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
                                                        { id: 'vnpay', name: 'VNPay', icon: 'https://vnpay.vn/wp-content/uploads/2020/07/vnpay-logo.png' },
                                                        { id: 'zalopay', name: 'ZaloPay', icon: 'https://img.mservice.io/momo-payment/210811/momo-payment_1628675662700.png' }
                                                    ].map(wallet => (
                                                        <button
                                                            key={wallet.id}
                                                            onClick={() => setSubMethod(wallet.id)}
                                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all gap-1 ${subMethod === wallet.id ? 'border-amber-500 bg-white shadow-md' : 'border-transparent bg-white/10 hover:bg-white/20'
                                                                }`}
                                                        >
                                                            <div className="w-5 h-5 rounded-md overflow-hidden bg-white">
                                                                <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '💰' }} />
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase text-white/80">{wallet.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Mã giảm giá */}
                            <div className="mb-10">
                                <div className="flex gap-2 h-12">
                                    <input
                                        type="text"
                                        placeholder="Mã voucher hoặc giới thiệu..."
                                        className="flex-1 bg-white/10 rounded-xl outline-none px-4 text-sm font-black border border-white/20 focus:border-white transition-all uppercase placeholder:text-gray-500"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="bg-red-600 text-white px-6 rounded-xl font-black text-sm hover:bg-red-700 transition-all"
                                        >
                                            XÓA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isApplying}
                                            className="bg-white text-black px-6 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {isApplying ? '...' : 'ÁP DỤNG'}
                                        </button>
                                    )}
                                </div>
                                {couponStatus && (
                                    <p className={`text-xs mt-2 font-bold ${couponStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                        {couponStatus.message}
                                    </p>
                                )}
                            </div>

                            {/* Tính toán */}
                            <div className="space-y-4 border-t border-white/10 pt-6">
                                <div className="flex justify-between text-sm font-bold opacity-70">
                                    <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold opacity-70">
                                    <span>Phí vận chuyển:</span>
                                    <span>{formatPrice(shippingFee)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm font-black text-green-400">
                                        <span>Giảm giá (Ưu đãi Sin):</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-4 border-t border-white/20">
                                    <span className="text-lg font-black uppercase italic">TỔNG CỘNG</span>
                                    <span className="text-3xl font-black text-red-500 tracking-tighter">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || cartItems.length === 0}
                                className="w-full h-16 bg-red-600 hover:bg-white hover:text-red-700 text-white font-black text-xl rounded-2xl mt-10 transition-all shadow-lg active:scale-95 uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:bg-red-600 disabled:hover:text-white">
                                {isPlacingOrder ? 'DANG XU LY DON HANG' : 'HOÀN TẤT ĐẶT HÀNG'}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </button>

                            <p className="text-[11px] text-center mt-5 text-gray-500 font-bold uppercase tracking-tighter italic">
                                Bằng cách đặt hàng, bạn đồng ý với các điều khoản của Sin Store
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full text-center shadow-2xl scale-in-center">
                        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </div>
                        <h2 className="text-4xl font-black uppercase text-slate-900 mb-4 tracking-tighter">Xác nhận thành công!</h2>
                        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Thời gian giao hàng dự kiến</p>
                            <p className="text-xl font-black text-[#008d71] italic">{deliveryEstimate}</p>
                            <p className="text-xs font-bold text-gray-400 mt-2">* Nhân viên sẽ gọi xác nhận trong 15 phút</p>
                        </div>
                        <p className="text-lg font-bold text-slate-500 mb-10 italic">Cảm ơn bạn đã lựa chọn PhoneSin. Chúng tôi đã lưu hóa đơn và sẽ sớm liên hệ xác nhận đơn hàng.</p>

                        <div className="space-y-4">
                            <Link
                                to="/orders"
                                className="block w-full py-5 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all"
                            >
                                Xem lịch sử đơn hàng
                            </Link>
                            <Link
                                to={`/invoice/${successfulOrderId}`}
                                className="block w-full py-5 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg"
                            >
                                Xem hóa đơn VAT
                            </Link>
                            <Link
                                to="/"
                                className="block w-full py-5 border-2 border-black text-black font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default CheckoutPage;

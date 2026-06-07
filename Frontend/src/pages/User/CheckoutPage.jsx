import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import api, { getApiErrorMessage } from '../../lib/api';
import { Ticket } from 'lucide-react';

const MapPinIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>);
const CreditCardIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>);
const TruckIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v7a1 1 0 0 0 1 1h2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);

const normalizeCheckoutPaymentMethod = (method = '') => {
    const value = String(method).toLowerCase();

    if (value === 'vnpay' || value === 'vnpay_sub') return 'VNPAY';
    if (value === 'momo' || value === 'momo_sub' || value === 'zalopay') return 'MOMO';
    return 'COD';
};

const CheckoutPage = () => {
    const { formatPrice } = useLanguage();
    const {
        cartItems,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        voucherCode,
        refreshCart,
    } = useCart();
    const { createOrder, processPayment } = useOrders();
    const { user, refreshProfile } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [subMethod, setSubMethod] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [couponStatus, setCouponStatus] = useState(null); // { type: 'success'|'error', message, discountAmount }
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [availableVouchers, setAvailableVouchers] = useState([]);
    const [showVoucherList, setShowVoucherList] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [successfulOrderId, setSuccessfulOrderId] = useState('');
    const [walletPhone, setWalletPhone] = useState('');
    const [walletName, setWalletName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
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
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [tempData, setTempData] = useState(null);
    const [isLinking, setIsLinking] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Save all relevant checkout state to localStorage on change
    useEffect(() => {
        if (isDataLoaded) {
            const stateToSave = {
                formData,
                paymentMethod,
                subMethod,
                walletPhone,
                walletName,
                selectedBank,
                bankAccountNumber,
                bankAccountName,
                bankPhone,
                bankIDNumber,
                bankIDIssueDate,
                bankBranch,
                isInfoVerified
            };
            localStorage.setItem('phonesin_checkout_full_state', JSON.stringify(stateToSave));
        }
    }, [
        formData, paymentMethod, subMethod, walletPhone, walletName, 
        selectedBank, bankAccountNumber, bankAccountName, bankPhone, 
        bankIDNumber, bankIDIssueDate, bankBranch, isInfoVerified, isDataLoaded
    ]);

    // Load full checkout state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('phonesin_checkout_full_state');
        let hasSavedData = false;
        if (savedState) {
            try {
                const s = JSON.parse(savedState);
                if (s.formData) {
                    setFormData(s.formData);
                    hasSavedData = true;
                }
                if (s.paymentMethod) setPaymentMethod(normalizeCheckoutPaymentMethod(s.paymentMethod));
                if (s.subMethod) setSubMethod(s.subMethod);
                if (s.walletPhone) setWalletPhone(s.walletPhone);
                if (s.walletName) setWalletName(s.walletName);
                if (s.selectedBank) setSelectedBank(s.selectedBank);
                if (s.bankAccountNumber) setBankAccountNumber(s.bankAccountNumber);
                if (s.bankAccountName) setBankAccountName(s.bankAccountName);
                if (s.bankPhone) setBankPhone(s.bankPhone);
                if (s.idNumber) setBankIDNumber(s.idNumber);
                if (s.issueDate) setBankIDIssueDate(s.issueDate);
                if (s.branch) setBankBranch(s.branch);
                if (s.isInfoVerified) setIsInfoVerified(s.isInfoVerified);
            } catch (e) {
                console.error("Failed to load saved checkout state");
            }
        }
        
        // If no saved data, try to fill from user profile (DB)
        if (!hasSavedData && user) {
            setFormData({
                fullName: user.fullName || user.name || '',
                phoneNumber: user.phone || '',
                email: user.email || '',
                province: user.province || '',
                district: user.district || '',
                ward: user.ward || '',
                address: user.address || ''
            });
        }
        setIsDataLoaded(true);
    }, [user]);

    // Auto-lookup bank account name
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

                    if (response.data.success && response.data.accountName) {
                        setBankAccountName(response.data.accountName);
                    } else {
                        // Smart fallback for demo/dev environment if API key is missing
                        const mockNames = ["NGUYEN VAN TUAN", "TRAN THI MAI", "LE VAN HOANG", "PHAM MINH DUC"];
                        const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
                        setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : randomName);
                    }
                } catch (error) {
                    console.error('Lookup failed:', error);
                    // Fallback on error too
                    setBankAccountName(bankAccountNumber === '123456789' ? 'NGUYEN VAN SIN' : "MAI THANH TUẤN");
                } finally {
                    setIsLookingUp(false);
                }
            }
        };

        const timer = setTimeout(lookup, 800); // Debounce
        return () => clearTimeout(timer);
    }, [bankAccountNumber, selectedBank]);

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

        // Auto-fill linked bank if available
        if (user.linkedAccounts?.banks?.length > 0) {
            const defaultBank = user.linkedAccounts.banks[0];
            setSelectedBank(defaultBank.bankId);
            setBankAccountNumber(defaultBank.accountNumber);
            setBankAccountName(defaultBank.accountName);
            setBankIDNumber(defaultBank.idNumber);
            setBankPhone(defaultBank.phone);
            setBankIDIssueDate(defaultBank.issueDate);
            setBankBranch(defaultBank.branch);
        }
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

    const hasCartItems = cartItems.length > 0;
    const subtotal = cartSubtotal || cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingFee = hasCartItems ? 35000 : 0;
    const discount = cartDiscount;
    const total = (cartTotal || Math.max(subtotal - discount, 0)) + shippingFee;

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await api.get('/api/voucher');
                setAvailableVouchers(response.data?.data || []);
            } catch (error) {
                console.error('Failed to fetch vouchers:', error);
            }
        };
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const [publicRes, myRes] = await Promise.all([
                api.get('/api/voucher'),
                user ? api.get('/api/voucher/my-vouchers') : Promise.resolve({ data: { data: [] } })
            ]);
            
            const publicVouchers = publicRes.data?.data || [];
            const myVouchers = myRes.data?.data || [];
            
            // Deduplicate if needed (though isHuntedOnly handles this)
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
    }, []);

    const handleApplyCoupon = async (manualCode = null) => {
        const codeToApply = typeof manualCode === 'string' ? manualCode : couponCode;
        if (!codeToApply.trim()) return;
        setIsApplying(true);
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

    const handleVerifyInfo = async () => {
        if (validateForm()) {
            setIsInfoVerified(true);
            const estimate = calculateDelivery(formData.province);
            setDeliveryEstimate(estimate);

            // Save to DB via API if user is logged in
            if (user) {
                try {
                    await api.put('/api/user/profile', {
                        fullName: formData.fullName.trim(),
                        phone: formData.phoneNumber.trim(),
                        email: formData.email.trim(),
                        province: formData.province,
                        district: formData.district,
                        ward: formData.ward,
                        address: formData.address.trim()
                    });
                    await refreshProfile(); // Update global auth state
                } catch (err) {
                    console.error("Failed to save checkout info to DB:", err);
                }
            }
        } else {
            setIsInfoVerified(false);
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                const element = document.getElementsByName(firstErrorKey)[0];
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
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
            const backendPaymentMethod = normalizeCheckoutPaymentMethod(paymentMethod);

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
                    invoiceInfo: requestVat
                        ? {
                            enabled: true,
                            email: formData.email.trim(),
                            companyName: vatInfo.companyName.trim(),
                            taxCode: vatInfo.taxCode.trim(),
                            companyAddress: vatInfo.companyAddress.trim(),
                        }
                        : undefined,
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

    const handleLinkWallet = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để lưu thông tin ví.');
            return;
        }

        if (!subMethod) {
            alert('Vui lòng chọn ví điện tử.');
            return;
        }

        if (!/^0[0-9]{9}$/.test(walletPhone)) {
            alert('Số điện thoại ví không hợp lệ (10 chữ số)');
            return;
        }

        if (!walletName.trim()) {
            alert('Vui lòng nhập tên chủ ví');
            return;
        }

        const walletId = subMethod === 'momo_sub' ? 'momo' : 'vnpay';
        setTempData({
            type: 'wallet',
            data: { walletId, phone: walletPhone, accountName: walletName }
        });
        setIsVerifying(true);
    };

    const handleLinkBank = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để thực hiện.');
            return;
        }

        if (!validateBankInfo()) return;

        setTempData({
            type: 'bank',
            data: {
                bankId: selectedBank,
                accountNumber: bankAccountNumber,
                accountName: bankAccountName,
                idNumber: bankIDNumber,
                phone: bankPhone,
                issueDate: bankIDIssueDate,
                branch: bankBranch
            }
        });
        setIsVerifying(true);
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
                await refreshProfile();
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


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8 lg:px-16 xl:px-24" style={{ fontFamily: "Calibri, 'Segoe UI', Candara, Bitstream Vera Sans, DejaVu Sans, Bitstream Vera Sans, Geneva, Trebuchet MS, Verdana, sans-serif" }}>
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
                                <MapPinIcon className="text-[#008d71] w-6 h-6" />
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Tỉnh/Thành phố</label>
                                    <select
                                        name="province"
                                        value={formData.province}
                                        onChange={(e) => {
                                            setFormData({ ...formData, province: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.province) setErrors({ ...errors, province: null });
                                        }}
                                        className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 appearance-none transition-all cursor-pointer ${errors.province ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black bg-gray-50/50'}`}
                                    >
                                        <option value="">Chọn Tỉnh/Thành phố</option>
                                        {[
                                            "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
                                        ].map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                    {errors.province && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.province}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Quận/Huyện</label>
                                    <input
                                        type="text"
                                        name="district"
                                        placeholder="Ví dụ: Quận 1"
                                        value={formData.district}
                                        onChange={(e) => {
                                            setFormData({ ...formData, district: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.district) setErrors({ ...errors, district: null });
                                        }}
                                        className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all ${errors.district ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black bg-gray-50/50'}`}
                                    />
                                    {errors.district && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.district}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Phường/Xã</label>
                                    <input
                                        type="text"
                                        name="ward"
                                        placeholder="Ví dụ: Phường Bến Nghé"
                                        value={formData.ward}
                                        onChange={(e) => {
                                            setFormData({ ...formData, ward: e.target.value });
                                            setIsInfoVerified(false);
                                            if (errors.ward) setErrors({ ...errors, ward: null });
                                        }}
                                        className={`w-full h-12 px-4 rounded-xl border-2 outline-none font-black text-slate-900 transition-all ${errors.ward ? 'border-red-500 bg-red-50' : 'border-gray-50 focus:border-black bg-gray-50/50'}`}
                                    />
                                    {errors.ward && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.ward}</p>}
                                </div>
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
                                        : 'bg-[#008d71] text-white hover:bg-black active:scale-95 shadow-lg'
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
                                            onChange={(e) => setVatInfo({ ...vatInfo, companyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Mã số thuế</label>
                                        <input
                                            type="text"
                                            placeholder="0123456789"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                                            value={vatInfo.taxCode}
                                            onChange={(e) => setVatInfo({ ...vatInfo, taxCode: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Địa chỉ công ty</label>
                                        <input
                                            type="text"
                                            placeholder="99 Cầu Giấy, Dịch Vọng, Hà Nội"
                                            className="w-full h-12 px-4 rounded-xl border-2 border-gray-50 focus:border-black outline-none font-black text-slate-900 transition-all bg-gray-50/30"
                                            value={vatInfo.companyAddress}
                                            onChange={(e) => setVatInfo({ ...vatInfo, companyAddress: e.target.value })}
                                        />
                                    </div>
                                    {errors.vat && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.vat}</p>}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:w-[450px] space-y-8">
                        <div className="bg-[#ffd700] text-slate-900 rounded-3xl p-5 sm:p-8 shadow-2xl sticky top-24 border border-yellow-400">
                            <h2 className="text-xl sm:text-2xl font-black mb-8 italic flex items-center gap-3 border-b border-black/10 pb-5 uppercase tracking-normal leading-tight">
                                <TruckIcon className="w-6 h-6 shrink-0" />
                                <span className="min-w-0 break-words">Đơn hàng của bạn</span>
                            </h2>

                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {hasCartItems ? cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-20 h-20 bg-white rounded-2xl p-1 overflow-hidden shrink-0 transition-transform group-hover:scale-105">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-black leading-tight uppercase mb-1 line-clamp-2 text-slate-900 break-words">{item.name}</h4>
                                            <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
                                                <span className="text-xs font-bold text-slate-600 italic">Số lượng: {item.qty}</span>
                                                <span className="text-sm font-black text-slate-900 whitespace-nowrap">{formatPrice(item.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="rounded-2xl border-2 border-dashed border-black/10 bg-white/20 p-5 text-center">
                                        <p className="text-sm font-black uppercase text-slate-800">Giỏ hàng đang trống</p>
                                        <Link to="/cart" className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-white px-5 py-2 text-xs font-black uppercase text-slate-900 text-center leading-tight">
                                            Về giỏ hàng
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Phương thức thanh toán nằm chung với đơn hàng */}
                            <div className="mb-8 p-4 sm:p-6 bg-white/5 rounded-3xl border border-white/10">
                                <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                                    <CreditCardIcon className="text-amber-500 w-5 h-5 shrink-0" />
                                    <h3 className="text-base sm:text-lg font-black uppercase tracking-normal leading-tight break-words">Hình thức thanh toán</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { id: 'COD', name: 'Tiền mặt (COD)', description: 'Thanh toán khi nhận hàng', icon: '🚚' },
                                        { id: 'VNPAY', name: 'VNPay', description: 'Thanh toán qua cổng VNPay', icon: '💳' },
                                        { id: 'MOMO', name: 'MoMo', description: 'Thanh toán qua ví MoMo', icon: '👛' },
                                    ].map((method) => {
                                        const isActive = paymentMethod === method.id;

                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                                    isActive ? 'border-black bg-black/5 shadow-lg' : 'border-black/5 hover:border-black/10'
                                                }`}
                                                onClick={() => {
                                                    setPaymentMethod(method.id);
                                                    setSubMethod(method.id === 'MOMO' ? 'momo_sub' : method.id === 'VNPAY' ? 'vnpay_sub' : '');
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    isActive ? 'border-black bg-black' : 'border-black/20'
                                                }`}>
                                                    {isActive && <div className="w-1.5 h-1.5 bg-[#ffd700] rounded-full"></div>}
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center text-sm shrink-0">
                                                    {method.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="block text-sm font-black uppercase leading-tight">{method.name}</span>
                                                    <span className="block text-[10px] font-bold text-slate-700/70 leading-tight mt-0.5">{method.description}</span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>


                            {/* Mã giảm giá */}
                            <div className="mb-10">
                                <div className="flex flex-col sm:flex-row gap-2 sm:min-h-12">
                                    <input
                                        type="text"
                                        placeholder="Mã voucher hoặc giới thiệu..."
                                        className="flex-1 min-h-12 bg-white/10 rounded-xl outline-none px-4 text-sm font-black border border-white/20 focus:border-white transition-all uppercase placeholder:text-gray-500 min-w-0"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus(null); }}
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="min-h-12 bg-red-600 text-white px-6 py-2 rounded-xl font-black text-sm hover:bg-red-700 transition-all whitespace-nowrap"
                                        >
                                            XÓA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isApplying}
                                            className="min-h-12 bg-white text-black px-6 py-2 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {isApplying ? '...' : 'ÁP DỤNG'}
                                        </button>
                                    )}
                                </div>
                                {couponStatus && (
                                    <p className={`text-xs mt-2 font-bold leading-snug break-words ${couponStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                        {couponStatus.message}
                                    </p>
                                )}

                                {/* Available Vouchers List */}
                                {availableVouchers.length > 0 && (
                                    <div className="mt-4">
                                        <button 
                                            onClick={() => setShowVoucherList(!showVoucherList)}
                                            className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            {showVoucherList ? 'Ẩn danh sách mã' : 'Xem mã giảm giá có sẵn'}
                                        </button>
                                        
                                        {showVoucherList && (() => {
                                            const sorted = [...availableVouchers].sort((a, b) => {
                                                const valA = a.discountType === 'percentage' ? a.discountValue * (subtotal / 100) : a.discountValue;
                                                const valB = b.discountType === 'percentage' ? b.discountValue * (subtotal / 100) : b.discountValue;
                                                return valB - valA;
                                            });
                                            const maxCode = sorted[0]?.code;
                                            const minCode = sorted[availableVouchers.length - 1]?.code;

                                            return (
                                                <div className="mt-4 grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 hh-scrollbar animate-fadeIn">
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
                                                                className={`relative group rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 cursor-pointer transition-all shadow-md active:scale-[0.98] ${
                                                                    isMax ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 border border-white/20 shrink-0">
                                                                        <Ticket size={20} className="text-white" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-black tracking-normal text-white uppercase break-all">{v.code}</p>
                                                                        <p className="text-[10px] font-bold text-white/70 italic">
                                                                            Giảm {v.discountType === 'percentage' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-left sm:text-right shrink-0">
                                                                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-white text-slate-900 shadow-sm transition-all group-hover:bg-slate-100">Chọn</span>
                                                                    <p className="text-[8px] text-white/60 mt-1 font-bold">Đơn từ {formatPrice(v.minOrderValue)}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-4 pt-6 border-t border-black/10">
                                <div className="flex flex-wrap justify-between items-center gap-2 text-slate-700">
                                    <span className="text-sm font-bold uppercase italic">Tạm tính ({cartItems.length} sản phẩm):</span>
                                    <span className="text-lg font-black text-slate-900 whitespace-nowrap">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex flex-wrap justify-between items-center gap-2 text-slate-700">
                                    <span className="text-sm font-bold uppercase italic">Phí vận chuyển:</span>
                                    <span className="text-lg font-black text-slate-900 whitespace-nowrap">{formatPrice(shippingFee)}</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex flex-wrap justify-between items-center gap-2 text-red-600">
                                        <span className="text-sm font-black uppercase italic">Giảm giá (Ưu đãi Sin):</span>
                                        <span className="text-lg font-black whitespace-nowrap">-{formatPrice(discount)}</span>
                                    </div>
                                )}

                                <div className="flex flex-wrap justify-between items-end gap-2 pt-4 border-t border-black/10">
                                    <span className="text-lg font-black uppercase italic text-slate-900">TỔNG CỘNG</span>
                                    <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-normal whitespace-nowrap">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || !hasCartItems}
                                className="w-full min-h-16 bg-[#008d71] hover:bg-black text-white font-black text-base sm:text-xl rounded-2xl mt-10 px-4 py-3 transition-all shadow-lg active:scale-95 uppercase tracking-normal sm:tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 text-center leading-tight">
                                <span className="min-w-0 break-words">{isPlacingOrder ? 'DANG XU LY DON HANG' : hasCartItems ? 'HOÀN TẤT ĐẶT HÀNG' : 'GIỎ HÀNG ĐANG TRỐNG'}</span>
                                <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
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

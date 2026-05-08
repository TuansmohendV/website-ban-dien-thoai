import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';
import { 
  BarChart3, 
  ShoppingBag, 
  Ticket, 
  History, 
  User, 
  MessageSquare, 
  Star, 
  LogOut,
  ChevronRight,
  Info,
  ShieldCheck,
  CreditCard,
  Truck,
  PhoneCall,
  Zap,
  Lock,
  CheckCircle2,
  Camera,
  MapPin,
  Mail,
  Smartphone,
  Calendar,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const { orders, cancelOrder, clearCancelledOrders, clearAllOrders } = useOrders();
    const { formatPrice } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [showOTP, setShowOTP] = useState(false);
    const [isVip, setIsVip] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("https://cdn.hoanghamobile.vn/Uploads/2025/06/16/2025-06-16-141858.png");
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileNotice, setProfileNotice] = useState(null);
    const [tabNotice, setTabNotice] = useState('');
    const [tabLoading, setTabLoading] = useState(false);
    const [myReviews, setMyReviews] = useState([]);
    const [editingReviewId, setEditingReviewId] = useState('');
    const [editingReviewRating, setEditingReviewRating] = useState(0);
    const [editingReviewContent, setEditingReviewContent] = useState('');
    const [reviewActionLoadingId, setReviewActionLoadingId] = useState('');
    const [reviewStats, setReviewStats] = useState({ total: 0, average: 0 });
    const [searchHistoryItems, setSearchHistoryItems] = useState([]);
    const [orderHistoryItems, setOrderHistoryItems] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [addressForm, setAddressForm] = useState({
        label: 'Nha',
        recipientName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        street: '',
        note: '',
        isDefault: false,
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const fileInputRef = React.useRef(null);

    const [profileData, setProfileData] = useState({
        fullName: user?.name || '',
        gender: 'Nam',
        phone: user?.phone || '',
        email: user?.email || '',
        dob: '',
        address: '',
        city: 'Hồ Chí Minh',
        ward: 'Phường Thủ Đức',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        const parsedDob = user.dateOfBirth
            ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
            : '';

        setProfileData((prevData) => ({
            ...prevData,
            fullName: user.fullName || user.name || '',
            phone: user.phone || '',
            email: user.email || '',
            dob: parsedDob,
            gender:
                user.gender === 'female'
                    ? 'Nữ'
                    : user.gender === 'male'
                        ? 'Nam'
                        : 'Khác',
        }));
    }, [user]);

    const sidebarItems = [
        { id: 'overview', label: 'Tổng quan', icon: <BarChart3 size={20} /> },
        { id: 'orders', label: 'Đơn hàng của bạn', icon: <ShoppingBag size={20} /> },
        { id: 'vouchers', label: 'Trung tâm voucher', icon: <Ticket size={20} /> },
        { id: 'history', label: 'Lịch sử mua hàng', icon: <History size={20} /> },
        { id: 'info', label: 'Thông tin cá nhân', icon: <User size={20} /> },
        { id: 'referral', label: 'Giới thiệu bạn bè', icon: <Ticket size={20} className="text-red-500" /> },
        { id: 'comments', label: 'Quản lý bình luận', icon: <MessageSquare size={20} /> },
        { id: 'ratings', label: 'Quản lý đánh giá', icon: <Star size={20} /> },
        {
            id: 'logout',
            label: 'Đăng xuất',
            icon: <LogOut size={20} />,
            action: async () => {
                await logout();
                navigate('/login');
            },
        },
    ];

    const membershipTiers = [
        { id: 'edu', label: 'Edu', color: 'from-[#60a5fa] to-[#3b82f6]', unlocked: false, desc: 'Dành cho Học sinh - Sinh viên' },
        { id: 'new', label: 'New', color: 'from-[#059669] to-[#10b981]', unlocked: true, status: 'Đã mua 00đ/01đ', update: '11/04/2026', next: '01đ để lên hạng', isCurrent: true },
        { id: 'silver', label: 'Silver', color: 'from-[#4b5563] to-[#374151]', unlocked: false, desc: 'Hạng Bạc' }
    ];

    const perkCards = [
        { icon: <CheckCircle2 className="text-emerald-600" />, title: 'Điều kiện hạng thành viên', desc: 'Chưa phát sinh giao dịch' },
        { icon: <ShieldCheck className="text-emerald-600" />, title: 'Nguyên tắc chiết khẩu', desc: 'Triển khai theo các chiến dịch riêng dành cho khách hàng mới' },
        { icon: <User className="text-emerald-600" />, title: 'Nâng hạng thành viên', desc: 'Nhận ngay Voucher ưu đãi lớn' },
        { icon: <Zap className="text-emerald-600" />, title: 'Chương trình Lỗi đổi liền', desc: 'Đổi mới hoặc đổi sản phẩm tương đương' },
        { icon: <CreditCard className="text-emerald-600" />, title: 'Ưu đãi khi Trả góp', desc: 'Lãi suất 0% - 0 Phí chuyển đổi' },
        { icon: <Truck className="text-emerald-600" />, title: 'Giao hàng 2h - Miễn phí vận chuyển', desc: 'Áp dụng với đơn hàng trên 300.000đ' },
        { icon: <PhoneCall className="text-emerald-600" />, title: 'Hotline tư vấn đặc quyền', desc: '1900.2091' },
    ];

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setProfileNotice(null);

        const rawDob = String(profileData.dob || '').trim();
        const dobSlashFormat = rawDob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        const dobIsoFormat = rawDob.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        let normalizedDob;
        if (!rawDob) {
            normalizedDob = undefined;
        } else if (dobSlashFormat) {
            normalizedDob = `${dobSlashFormat[3]}-${dobSlashFormat[2]}-${dobSlashFormat[1]}`;
        } else if (dobIsoFormat) {
            normalizedDob = rawDob;
        } else {
            setProfileNotice({
                type: 'error',
                message: 'Ngay sinh khong hop le. Vui long nhap theo dinh dang DD/MM/YYYY.',
            });
            return;
        }

        try {
            setIsSavingProfile(true);
            await updateProfile({
                fullName: profileData.fullName,
                email: profileData.email,
                gender:
                    profileData.gender === 'Nữ'
                        ? 'female'
                        : profileData.gender === 'Nam'
                            ? 'male'
                            : 'other',
                dateOfBirth: normalizedDob,
                avatar: avatarUrl,
            });
            setShowOTP(true);
        } catch (error) {
            setProfileNotice({
                type: 'error',
                message: error.message || 'Khong the cap nhat thong tin luc nay.',
            });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
        }
    };

    const loadTabData = async (tabId) => {
        if (!['vouchers', 'history', 'comments', 'ratings'].includes(tabId)) {
            return;
        }

        setTabLoading(true);
        setTabNotice('');

        try {
            if (tabId === 'history') {
                const response = await api.get('/api/orders/user');
                setOrderHistoryItems(response.data?.data || []);
            }

            if (tabId === 'comments') {
                const response = await api.get('/api/reviews/my');
                const items = response.data?.data || [];
                setMyReviews(items);
                const total = items.length;
                const average =
                    total > 0
                        ? items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
                        : 0;
                setReviewStats({ total, average });
            }

            if (tabId === 'ratings') {
                const response = await api.get('/api/reviews/my');
                const items = response.data?.data || [];
                setMyReviews(items);
                const total = items.length;
                const average =
                    total > 0
                        ? items.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total
                        : 0;
                setReviewStats({ total, average });
            }

            if (tabId === 'vouchers') {
                const response = await api.get('/api/address');
                const nextAddresses = response.data?.data || [];
                setAddresses(nextAddresses);
                if (nextAddresses.length > 0) {
                    setAddressForm((prev) => ({
                        ...prev,
                        recipientName: prev.recipientName || nextAddresses[0].recipientName || '',
                        phone: prev.phone || nextAddresses[0].phone || '',
                    }));
                }
            }
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong tai du lieu cho tab nay.'));
        } finally {
            setTabLoading(false);
        }
    };

    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    const handleDeleteSearchHistoryItem = async (id) => {
        try {
            await api.delete(`/api/user/search-history/${id}`);
            setSearchHistoryItems((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong xoa duoc lich su tim kiem.'));
        }
    };

    const handleClearSearchHistory = async () => {
        try {
            await api.delete('/api/user/search-history');
            setSearchHistoryItems([]);
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong xoa duoc toan bo lich su tim kiem.'));
        }
    };

    const handleMarkNotificationRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications((prev) =>
                prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
            );
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong danh dau da doc duoc.'));
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        try {
            await api.patch('/api/notifications/read-all');
            setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong danh dau tat ca da doc duoc.'));
        }
    };

    const handleRemoveWishlistItem = async (id) => {
        try {
            await api.delete(`/api/user/wishlist/${id}`);
            // kept for backwards compatibility
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong xoa duoc san pham yeu thich.'));
        }
    };

    const handleStartEditReview = (item) => {
        setEditingReviewId(item._id);
        setEditingReviewRating(Number(item.rating || 0));
        setEditingReviewContent(item.comment || '');
    };

    const handleCancelEditReview = () => {
        setEditingReviewId('');
        setEditingReviewRating(0);
        setEditingReviewContent('');
    };

    const handleSaveEditReview = async (reviewId) => {
        if (editingReviewRating < 1 || editingReviewRating > 5) {
            setTabNotice('Vui long chon so sao tu 1 den 5.');
            return;
        }

        if (!editingReviewContent.trim()) {
            setTabNotice('Vui long nhap noi dung danh gia.');
            return;
        }

        try {
            setReviewActionLoadingId(reviewId);
            await api.patch(`/api/reviews/${reviewId}`, {
                rating: editingReviewRating,
                comment: editingReviewContent.trim(),
                title: `Danh gia ${editingReviewRating} sao`,
            });
            handleCancelEditReview();
            await loadTabData(activeTab);
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong cap nhat duoc danh gia.'));
        } finally {
            setReviewActionLoadingId('');
        }
    };

    const handleDeleteMyReview = async (reviewId) => {
        if (!window.confirm('Ban chac chan muon xoa danh gia nay?')) {
            return;
        }

        try {
            setReviewActionLoadingId(reviewId);
            await api.delete(`/api/reviews/${reviewId}`);
            await loadTabData(activeTab);
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong xoa duoc danh gia.'));
        } finally {
            setReviewActionLoadingId('');
        }
    };

    const handleCreateAddress = async (e) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setTabNotice('');
        try {
            await api.post('/api/address', addressForm);
            setAddressForm((prev) => ({
                ...prev,
                district: '',
                ward: '',
                street: '',
                note: '',
                isDefault: false,
            }));
            await loadTabData('vouchers');
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong them duoc dia chi.'));
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            await api.delete(`/api/address/${id}`);
            await loadTabData('vouchers');
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong xoa duoc dia chi.'));
        }
    };

    const handleSetDefaultAddress = async (address) => {
        try {
            await api.put(`/api/address/${address._id}`, { ...address, isDefault: true });
            await loadTabData('vouchers');
        } catch (error) {
            setTabNotice(getApiErrorMessage(error, 'Khong dat duoc dia chi mac dinh.'));
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f3f6] py-10 font-sans">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
                
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar */}
                    <aside className="lg:w-[320px] shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-4 space-y-1">
                                {sidebarItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={item.action || (() => { setActiveTab(item.id); setShowOTP(false); })}
                                        className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl text-sm sm:text-[15px] font-bold transition-all ${
                                            activeTab === item.id 
                                            ? 'bg-[#e5f9e0] text-[#008d71] shadow-sm shadow-[#008d71]/10' 
                                            : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className={activeTab === item.id ? 'text-[#008d71]' : 'text-gray-400'}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1">
                        
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Tổng quan</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Spending Card */}
                                    <div className={`rounded-3xl p-8 border shadow-sm flex items-center gap-6 transition-all duration-500 ${isVip ? 'bg-gradient-to-br from-slate-900 to-black border-yellow-500/50 shadow-yellow-500/20' : 'bg-white border-gray-100'}`}>
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transform rotate-12 shrink-0 transition-all duration-700 ${isVip ? 'bg-gradient-to-tr from-yellow-600 to-yellow-200 scale-110' : 'bg-gradient-to-tr from-yellow-400 to-yellow-200'}`}>
                                            <span className="text-white text-3xl">{isVip ? '💎' : '🪙'}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className={`font-bold text-sm uppercase tracking-wider ${isVip ? 'text-yellow-500' : 'text-gray-500'}`}>Tổng chi tiêu</p>
                                            <p className={`text-[32px] font-black leading-none ${isVip ? 'text-white' : 'text-gray-900'}`}>{isVip ? '150.000.000đ' : '00đ'}</p>
                                            <p className={`text-xs font-bold mt-2 italic ${isVip ? 'text-yellow-200/60' : 'text-gray-400'}`}>
                                                {isVip ? 'Bạn đang ở hạng thẻ cao nhất' : <>Cần chi tiêu thêm <span className="text-[#008d71]">01đ</span> để lên hạng <span className="text-[#3b82f6]">SILVER</span></>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Barcode Card */}
                                    <div className={`rounded-3xl p-8 border shadow-sm flex items-center justify-between transition-all duration-500 ${isVip ? 'bg-gradient-to-br from-slate-900 to-black border-yellow-500/50' : 'bg-white border-gray-100'}`}>
                                        <div className="space-y-4">
                                            <div className={`px-6 py-3 border-2 rounded-xl flex items-center justify-center bg-white shadow-sm overflow-hidden min-w-[200px] transition-all ${isVip ? 'border-yellow-500 shadow-yellow-500/20' : 'border-slate-900'}`}>
                                                <div className="flex flex-col items-center">
                                                    <div className="h-10 flex items-end gap-[1px]">
                                                        {[...Array(40)].map((_, i) => (<div key={i} className={`bg-slate-950 ${i % 3 === 0 ? 'w-[2px]' : i % 5 === 0 ? 'w-[3px]' : 'w-[1px]'} ${i % 4 === 0 ? 'h-full' : 'h-[80%]'}`}></div>))}
                                                    </div>
                                                    <span className="text-[10px] font-black tracking-[0.4em] mt-1">{profileData.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 text-right">
                                            <p className={`text-[13px] font-black leading-tight ${isVip ? 'text-white' : 'text-gray-900'}`}>Đưa mã này cho nhân viên để được tích điểm và nhận quà</p>
                                            <div className={`w-full h-8 rounded-lg transition-all ${isVip ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-[#008d71]'}`}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#e5f9e0] border border-[#008d71]/20 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4"><Info size={20} className="text-[#008d71]" /><span className="text-[#008d71] font-black text-sm">Bạn là Học sinh - Sinh viên - Giáo viên? Đăng ký thành viên Edu ngay</span></div>
                                    <ChevronRight size={20} className="text-[#008d71] group-hover:translate-x-1 transition-transform" />
                                </div>
                                <section className="space-y-6">
                                    <h3 className="text-xl font-black text-gray-900">Khám phá ưu đãi hạng thành viên</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {membershipTiers.map(tier => (
                                          <div key={tier.id} className={`relative flex flex-col h-[200px] rounded-3xl overflow-hidden shadow-lg group ${tier.unlocked ? 'cursor-default' : 'cursor-not-allowed'}`}>
                                              <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-90 group-hover:scale-105 transition-transform duration-500`}></div>
                                              <div className="relative z-10 p-6 h-full flex flex-col">
                                                  <div className="flex justify-between items-start mb-auto">
                                                       <div className="px-6 py-1.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm"><span className="text-white font-black uppercase text-sm tracking-widest">{tier.label}</span></div>
                                                       {tier.isCurrent && <span className="bg-white text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm">New</span>}
                                                  </div>
                                                  <div className="mt-auto space-y-2">
                                                      {!tier.unlocked ? (
                                                          <div className="flex items-center gap-2 text-white/80"><Lock size={14} /><span className="text-xs font-bold uppercase tracking-wide">Chưa mở khóa thành viên</span></div>
                                                      ) : (
                                                          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                                                              <div className="flex justify-between items-end"><div className="space-y-1"><p className="text-[10px] text-white/80 font-bold uppercase">Đã mua <span className="text-white">00đ/01đ</span></p><p className="text-[10px] text-white/80 font-bold uppercase">Cập nhật: <span className="text-white">11/04/2026</span></p><p className="text-[10px] text-white/80 font-bold uppercase">Cần mua thêm: <span className="text-white">01đ</span></p></div></div>
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                        ))}
                                    </div>
                                    <div className="hidden md:flex items-center justify-between px-10 relative pt-4">
                                        <div className="absolute left-10 right-10 h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0"></div>
                                        <div className="absolute left-10 w-1/3 h-1 bg-[#008d71] top-1/2 -translate-y-1/2 z-0"></div>
                                        {[1,2,3,4,5].map(i => (<div key={i} className={`w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${i <= 2 ? 'bg-[#008d71]' : 'bg-gray-200'}`}></div>))}
                                    </div>
                                </section>
                                <div className="space-y-4">
                                    {perkCards.map((perk, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between group hover:border-[#008d71]/40 transition-colors">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">{perk.icon}</div>
                                                <div className="space-y-1"><h4 className="text-[15px] font-black text-gray-900 leading-none">{perk.title}</h4><p className="text-[13px] font-bold text-gray-400">{perk.desc}</p></div>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 group-hover:text-[#008d71] transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. PERSONAL INFO TAB */}
                        {activeTab === 'info' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">
                                    {showOTP ? 'Cap nhat thong tin thanh cong' : 'Cập nhật thông tin cá nhân'}
                                </h2>

                                {showOTP ? (
                                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8 flex flex-col items-center">
                                        <div className="text-center space-y-2">
                                            <p className="text-gray-600 font-bold">Thong tin tai khoan cua ban da duoc dong bo len backend thanh cong.</p>
                                        </div>
                                        <div className="w-full max-w-lg space-y-6">
                                            <div className="rounded-2xl border border-[#008d71]/20 bg-[#e5f9e0] px-6 py-5 text-sm font-bold text-[#008d71] text-center">
                                                Ho ten, email, gioi tinh va ngay sinh hien da lay du lieu tu backend va cap nhat thanh cong.
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowOTP(false)}
                                                className="w-full bg-[#008d71] text-white h-12 sm:h-16 rounded-xl font-black uppercase tracking-wider hover:bg-[#007a62] transition-colors shadow-lg shadow-[#008d71]/20"
                                            >
                                                Quay lai form
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col xl:flex-row gap-8 items-start">
                                        {/* Main Form Column - Expanded */}
                                        <div className="flex-[1.4] bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                            <form onSubmit={handleUpdateInfo} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Họ tên:</label>
                                                    <input 
                                                        type="text" 
                                                        value={profileData.fullName}
                                                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                                                        className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Giới tính:</label>
                                                    <div className="flex gap-8 pl-1">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <input type="radio" name="gender" checked={profileData.gender === 'Nam'} onChange={() => setProfileData({...profileData, gender: 'Nam'})} className="w-5 h-5 accent-[#008d71]" />
                                                            <span className="text-[15px] font-bold text-gray-700 group-hover:text-gray-900">Nam</span>
                                                        </label>
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <input type="radio" name="gender" checked={profileData.gender === 'Nữ'} onChange={() => setProfileData({...profileData, gender: 'Nữ'})} className="w-5 h-5 accent-[#008d71]" />
                                                            <span className="text-[15px] font-bold text-gray-700 group-hover:text-gray-900">Nữ</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Điện thoại:</label>
                                                    <input 
                                                        type="tel" 
                                                        disabled
                                                        value={profileData.phone}
                                                        className="w-full h-[58px] bg-gray-50 border border-gray-100 rounded-xl px-5 font-bold text-gray-400 cursor-not-allowed"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Email:</label>
                                                    <input 
                                                        type="email" 
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                                        className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Ngày tháng năm sinh:</label>
                                                    <input 
                                                        type="text" 
                                                        value={profileData.dob}
                                                        onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
                                                        placeholder="DD/MM/YYYY"
                                                        className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Địa chỉ:</label>
                                                    <input 
                                                        type="text" 
                                                        value={profileData.address}
                                                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                                        placeholder="Địa chỉ *"
                                                        className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-5 font-bold text-gray-900 shadow-sm focus:border-[#008d71] outline-none transition-all"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Tỉnh/Thành phố:</label>
                                                        <select value={profileData.city} onChange={(e) => setProfileData({...profileData, city: e.target.value})} className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-4 font-bold text-gray-900 outline-none focus:border-[#008d71]">
                                                            <option>Hồ Chí Minh</option>
                                                            <option>Hà Nội</option>
                                                            <option>Đà Nẵng</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-black text-gray-500 uppercase tracking-wide">Xã/Phường:</label>
                                                        <select value={profileData.ward} onChange={(e) => setProfileData({...profileData, ward: e.target.value})} className="w-full h-[58px] bg-white border border-gray-200 rounded-xl px-4 font-bold text-gray-900 outline-none focus:border-[#008d71]">
                                                            <option>Phường Thủ Đức</option>
                                                            <option>Quận 1</option>
                                                            <option>Quận 3</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="pt-4 space-y-6">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-full h-[1px] bg-gray-100 relative">
                                                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[12px] font-bold text-gray-400 italic whitespace-nowrap">Đổi mật khẩu tại trang riêng để bảo mật hơn.</span>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to="/change-password"
                                                        className="w-full h-[52px] rounded-2xl bg-gray-900 text-white font-black uppercase tracking-wider hover:bg-black transition-colors active:scale-[0.98] flex items-center justify-center"
                                                    >
                                                        Đổi mật khẩu
                                                    </Link>
                                                </div>

                                                {profileNotice && (
                                                    <div className={`rounded-2xl px-5 py-4 text-sm font-bold ${profileNotice.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#e5f9e0] text-[#008d71] border border-[#008d71]/20'}`}>
                                                        {profileNotice.message}
                                                    </div>
                                                )}

                                                <button 
                                                    type="submit"
                                                    disabled={isSavingProfile}
                                                    className="w-full bg-[#008d71] text-white h-[58px] rounded-2xl font-black uppercase tracking-wider hover:bg-[#007a62] transition-colors shadow-xl shadow-[#008d71]/20 mt-4 active:scale-[0.98] disabled:opacity-70"
                                                >
                                                    {isSavingProfile ? 'Dang luu...' : 'Xác nhận'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* Right Profile Summary Column */}
                                        <div className={`w-full xl:w-[400px] rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col items-center transition-all duration-500 ${isVip ? 'bg-gradient-to-br from-slate-900 to-black border-yellow-500/30' : 'bg-white border-gray-100'}`}>
                                            <h4 className={`text-[18px] font-black mb-8 self-start ${isVip ? 'text-yellow-500' : 'text-gray-900'}`}>Tư cách hiển thị</h4>
                                            
                                            <div className="relative group mb-6">
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    onChange={handleAvatarChange} 
                                                    accept="image/*" 
                                                    className="hidden" 
                                                />
                                                <div 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className={`w-36 h-36 rounded-full border-4 overflow-hidden shadow-2xl cursor-pointer transition-all duration-700 hover:rotate-6 ${isVip ? 'border-yellow-500 shadow-yellow-500/40 scale-110' : 'border-[#e5f9e0] hover:border-[#008d71]'}`}
                                                >
                                                    <img 
                                                        src={avatarUrl} 
                                                        alt="Avatar" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div 
                                                    onClick={(e) => { e.stopPropagation(); setIsVip(!isVip); }}
                                                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap cursor-pointer z-20 ${isVip ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg' : 'bg-[#008d71] text-white opacity-0 group-hover:opacity-100'}`}
                                                >
                                                    {isVip ? '💎 Gold User' : '✨ Toggle UI Theme'}
                                                </div>
                                                <button 
                                                    onClick={() => fileInputRef.current.click()}
                                                    className={`absolute bottom-1 right-1 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all transform hover:scale-110 active:scale-90 ${isVip ? 'bg-yellow-500 text-slate-950 border-yellow-400' : 'bg-white text-[#008d71] border-gray-100'}`}
                                                >
                                                    <Camera size={20} />
                                                </button>
                                            </div>

                                            <div className="text-center space-y-1 mb-10">
                                                <div className={`flex items-center justify-center gap-1.5 font-black text-sm uppercase transition-colors ${isVip ? 'text-yellow-500/70' : 'text-[#008d71]/60'}`}>
                                                    <Camera size={14} /> Thay đổi ảnh đại diện
                                                </div>
                                                <p className={`text-[20px] font-black uppercase tracking-tighter pt-4 transition-colors ${isVip ? 'text-white' : 'text-gray-900'}`}>{profileData.phone}</p>
                                                <p className={`text-[18px] font-black uppercase tracking-tighter transition-colors ${isVip ? 'text-white/80' : 'text-gray-900/80'}`}>{profileData.fullName}</p>
                                            </div>

                                            <div className="w-full space-y-6">
                                                <div className="flex flex-col items-center">
                                                    <p className="text-[14px] font-black text-gray-900 uppercase mb-4 self-start">Các tài khoản liên kết</p>
                                                    <p className="text-[12px] font-medium text-gray-400 text-center leading-relaxed">
                                                        Bạn có thể đăng nhập qua Google, Facebook nhanh vào website. Để đăng nhập được bạn cần liên kết các tài khoản mạng xã hội với tài khoản của website.
                                                    </p>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    {/* Facebook */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center gap-3 bg-[#f0f2f5] py-2.5 rounded-xl border border-gray-100">
                                                            <div className="bg-[#3b5998] text-white p-1 rounded-md">
                                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V1.5c-.32-.04-1.42-.15-2.7-.15-2.68 0-4.5 1.63-4.5 4.65v3h-3.5v4h3.5V23h4v-9.5z"/></svg>
                                                            </div>
                                                            <span className="text-[14px] font-black text-gray-700">Đã liên kết</span>
                                                        </div>
                                                        <button className="w-fit mx-auto flex items-center gap-2 text-[12px] font-black text-gray-500 uppercase tracking-widest pl-2 hover:text-[#ef3d4e] transition-colors border border-gray-200 px-4 py-1.5 rounded-lg bg-gray-50/50">
                                                           <ShieldAlert size={14} /> Hủy liên kết tài khoản Facebook
                                                        </button>
                                                    </div>

                                                    {/* Google */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center gap-3 bg-[#f0f2f5] py-2.5 rounded-xl border border-gray-100">
                                                            <div className="bg-white p-1 rounded-md shadow-sm">
                                                                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                            </div>
                                                            <span className="text-[14px] font-black text-gray-700">Đã liên kết</span>
                                                        </div>
                                                        <button className="w-fit mx-auto flex items-center gap-2 text-[12px] font-black text-gray-500 uppercase tracking-widest pl-2 hover:text-[#ef3d4e] transition-colors border border-gray-200 px-4 py-1.5 rounded-lg bg-gray-50/50">
                                                           <ShieldAlert size={14} /> Hủy liên kết tài khoản Google
                                                        </button>
                                                    </div>

                                                    {/* Zalo */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-center gap-3 bg-gray-50 py-2.5 rounded-xl border-2 border-dashed border-gray-200 opacity-60">
                                                            <div className="bg-[#0068ff] text-white p-1 rounded-md">
                                                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm4.5 9h-2.1l.6-3h-1.5l-.6 3H11l.6-3H10.1l-.6 3h-1.5l.6-3H7.1l.6-3h-2l-.6 3h-1.5z"/></svg>
                                                            </div>
                                                            <span className="text-[14px] font-black text-gray-400 italic text-center">Chưa liên kết</span>
                                                        </div>
                                                        <button className="w-fit mx-auto flex items-center gap-2 text-[12px] font-black text-[#008d71] uppercase tracking-widest pl-2 hover:underline transition-all border border-[#008d71]/20 px-4 py-1.5 rounded-lg bg-[#e5f9e0]/40">
                                                           Liên kết tài khoản Zalo
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. REFERRAL TAB */}
                        {activeTab === 'referral' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight text-center">Mời bạn, Nhận quà!</h2>
                                <div className="bg-slate-900 rounded-3xl sm:rounded-[40px] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                                        <div className="flex-1 space-y-6">
                                            <p className="text-red-400 font-black uppercase tracking-[0.3em] text-xs">Chương trình đối tác Sin</p>
                                            <h3 className="text-2xl sm:text-4xl font-black italic tracking-tighter uppercase leading-tight sm:leading-none">Kiếm tiền triệu mỗi tháng cùng PhoneSin</h3>
                                            <p className="text-white/60 font-bold leading-relaxed">Chia sẻ mã giới thiệu của bạn cho bạn bè. Nhận ngay 500k cho mỗi đơn hàng thành công đầu tiên của họ.</p>
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                                <div className="bg-white/10 border border-white/20 backdrop-blur-md px-6 py-4 rounded-2xl flex-1 flex flex-col justify-center">
                                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">Mã của bạn</span>
                                                    <span className="text-2xl font-black tracking-widest text-red-500">SINPHONEAVA</span>
                                                </div>
                                                <button className="bg-red-600 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95" onClick={() => { navigator.clipboard.writeText('SINPHONEAVA'); alert('Đã sao chép mã!'); }}>
                                                    Sao chép mã
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-40 h-40 sm:w-56 sm:h-56 bg-gradient-to-br from-red-600 to-red-400 rounded-[40px] sm:rounded-[60px] flex items-center justify-center rotate-12 shadow-2xl shadow-red-500/20">
                                            <span className="text-7xl">🎁</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-10 border-t border-white/10">
                                        {[
                                            { label: 'Đã giới thiệu', value: '02' },
                                            { label: 'Đang chờ', value: '01' },
                                            { label: 'Tiền đã nhận', value: '1.000k' },
                                            { label: 'Hạng thưởng', value: 'Standard' }
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { title: 'Tặng ngay 500k', desc: 'Cho mỗi người bạn giới thiệu thành công đơn hàng đầu tiên.' },
                                        { title: 'Bạn bè được giảm 200k', desc: 'Khi họ sử dụng mã của bạn cho lần mua đầu tiên.' },
                                        { title: 'Không giới hạn', desc: 'Mời càng nhiều, nhận càng nhiều. Cơ hội nhận giải Diamond.' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                            <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-sm text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. ORDERS TAB */}
                        {activeTab === 'orders' && (() => {
                            const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
                            return (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Đơn hàng của bạn</h2>
                                        {orders.length > 0 && (
                                            <span className="bg-[#008d71]/10 text-[#008d71] text-sm font-black px-3 py-1 rounded-full">
                                                {orders.length} / 50
                                            </span>
                                        )}
                                    </div>
                                    {orders.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {cancelledCount > 0 && (
                                                <button
                                                    onClick={() => { if(window.confirm(`Xóa ${cancelledCount} đơn đã hủy?`)) clearCancelledOrders(); }}
                                                    className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-wide"
                                                >
                                                    🗑️ Xóa đơn đã hủy ({cancelledCount})
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { if(window.confirm('Xóa toàn bộ lịch sử đơn hàng? Hành động này không thể hoàn tác.')) clearAllOrders(); }}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-black bg-gray-50 text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all uppercase tracking-wide"
                                            >
                                                Xóa tất cả
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {orders.length === 0 ? (
                                    <div className="bg-white rounded-3xl py-24 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center px-4 sm:px-10">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                                            <ShoppingBag size={40} className="text-gray-200" />
                                        </div>
                                        <h4 className="text-gray-900 font-black text-[20px] mb-2">Chưa có đơn hàng nào</h4>
                                        <p className="text-gray-400 font-bold max-w-sm">Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</p>
                                        <button onClick={() => navigate('/')} className="mt-6 bg-[#008d71] text-white px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-[#007a62] transition-colors shadow-lg">
                                            Mua sắm ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => {
                                            const statusMap = {
                                                pending: { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700' },
                                                processing: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-700' },
                                                shipping: { label: 'Đang giao hàng', cls: 'bg-indigo-100 text-indigo-700' },
                                                delivered: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-700' },
                                                cancelled: { label: 'Đã hủy', cls: 'bg-gray-100 text-gray-500' },
                                            };
                                            const st = statusMap[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-500' };
                                            return (
                                                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                                    {/* Order Header */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
                                                        <div>
                                                            <span className="font-black text-gray-900 text-sm">Mã đơn: {order.id}</span>
                                                            <p className="text-xs font-bold text-gray-400 mt-0.5">Ngày đặt: {order.date}</p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${st.cls}`}>{st.label}</span>
                                                    </div>
                                                    {/* Items */}
                                                    <div className="px-6 py-4 space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-4">
                                                                <div className="w-16 h-16 bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0">
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                                </div>
                                                                <div className="flex-1 flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-black text-gray-900 text-sm leading-tight">{item.name}</p>
                                                                        <p className="text-xs font-bold text-gray-400 mt-0.5">x{item.qty}</p>
                                                                    </div>
                                                                    <span className="font-black text-gray-900 text-sm">{formatPrice(item.price)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Footer */}
                                                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-500">Tổng tiền:</span>
                                                            <span className="text-lg font-black text-[#008d71]">{formatPrice(order.totalAmount)}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {order.status === 'pending' && (
                                                                <button
                                                                    onClick={() => { if(window.confirm('Hủy đơn hàng này?')) cancelOrder(order.id); }}
                                                                    className="px-4 py-2 text-xs font-black bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase tracking-wide"
                                                                >
                                                                    Hủy đơn
                                                                </button>
                                                            )}
                                                            {order.status === 'delivered' && (
                                                                <Link
                                                                    to={`/invoice/${order.id}`}
                                                                    className="px-4 py-2 text-xs font-black bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all uppercase tracking-wide"
                                                                >
                                                                    Xuất hóa đơn
                                                                </Link>
                                                            )}
                                                            <Link
                                                                to={`/orders`}
                                                                className="px-4 py-2 text-xs font-black bg-[#008d71] text-white rounded-xl hover:bg-[#007a62] transition-all uppercase tracking-wide shadow-sm"
                                                            >
                                                                Xem chi tiết
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            );
                        })()}

                        {activeTab === 'history' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Lịch sử mua hàng</h2>
                                {tabLoading ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Dang tai du lieu...</div>
                                ) : orderHistoryItems.length === 0 ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Chua co lich su mua hang.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {orderHistoryItems.map((item) => (
                                            <div key={item._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                                <div>
                                                    <p className="font-black text-gray-900">Don hang #{item._id?.slice(-6) || ''}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                                                        {' · '}
                                                        {item.items?.length || 0} san pham
                                                    </p>
                                                    <p className="text-sm text-[#008d71] font-bold mt-1">
                                                        {formatPrice(item.totalAmount || 0)}
                                                    </p>
                                                </div>
                                                <span className="text-xs font-black text-gray-500 uppercase">{item.status || 'pending'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Quản lý bình luận</h2>
                                </div>
                                {tabLoading ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Dang tai du lieu...</div>
                                ) : myReviews.length === 0 ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Ban chua co binh luan nao.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {myReviews.map((item) => (
                                            <div key={item._id} className="bg-white rounded-2xl p-4 border border-gray-100">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-black text-gray-900">{item.product?.name || 'San pham'}</p>
                                                    <span className="text-xs text-gray-400">
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 mt-2">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} size={14} fill={s <= Number(item.rating || 0) ? "#f59e0b" : "none"} color={s <= Number(item.rating || 0) ? "#f59e0b" : "#cbd5e1"} />
                                                    ))}
                                                </div>
                                                {editingReviewId === item._id ? (
                                                    <div className="mt-3 space-y-3">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <button key={s} onClick={() => setEditingReviewRating(s)} type="button">
                                                                    <Star size={16} fill={s <= editingReviewRating ? "#f59e0b" : "none"} color={s <= editingReviewRating ? "#f59e0b" : "#cbd5e1"} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            rows={3}
                                                            value={editingReviewContent}
                                                            onChange={(e) => setEditingReviewContent(e.target.value)}
                                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={reviewActionLoadingId === item._id}
                                                                onClick={() => handleSaveEditReview(item._id)}
                                                                className="px-3 py-1.5 text-xs font-black rounded-lg bg-[#008d71] text-white disabled:opacity-60"
                                                            >
                                                                Luu
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleCancelEditReview}
                                                                className="px-3 py-1.5 text-xs font-black rounded-lg bg-gray-100 text-gray-600"
                                                            >
                                                                Huy
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 mt-2">{item.comment || item.title || 'Danh gia san pham'}</p>
                                                )}
                                                {editingReviewId !== item._id && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button onClick={() => handleStartEditReview(item)} className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                                                            Sua
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMyReview(item._id)}
                                                            disabled={reviewActionLoadingId === item._id}
                                                            className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-lg disabled:opacity-60"
                                                        >
                                                            Xoa
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'ratings' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Quản lý đánh giá</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                        <p className="text-sm font-bold text-gray-500">Tong so danh gia</p>
                                        <p className="text-3xl font-black text-gray-900 mt-2">{reviewStats.total}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                                        <p className="text-sm font-bold text-gray-500">Diem trung binh</p>
                                        <p className="text-3xl font-black text-[#008d71] mt-2">{reviewStats.average.toFixed(1)} / 5</p>
                                    </div>
                                </div>
                                {tabLoading ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Dang tai du lieu...</div>
                                ) : myReviews.length === 0 ? (
                                    <div className="bg-white rounded-3xl py-16 border border-gray-100 text-center">Chua co danh gia nao.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {myReviews.map((item) => (
                                            <div key={item._id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={item.product?.image || ''}
                                                        alt={item.product?.name || 'product'}
                                                        className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                                                    />
                                                    <div>
                                                        <p className="font-black text-gray-900">{item.product?.name || 'San pham'}</p>
                                                        <div className="flex gap-1 mt-1">
                                                            {[1,2,3,4,5].map((s) => (
                                                                <Star key={s} size={13} fill={s <= Number(item.rating || 0) ? "#f59e0b" : "none"} color={s <= Number(item.rating || 0) ? "#f59e0b" : "#cbd5e1"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStartEditReview(item)} className="text-xs font-black text-amber-600">Sua</button>
                                                    <button onClick={() => handleDeleteMyReview(item._id)} className="text-xs font-black text-red-500">Xoa</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'vouchers' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <h2 className="text-2xl sm:text-[28px] font-black text-gray-900 tracking-tight">Sổ địa chỉ giao hàng</h2>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <form onSubmit={handleCreateAddress} className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="Ten nguoi nhan" value={addressForm.recipientName} onChange={(e) => setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))} required />
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="So dien thoai" value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} required />
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="Tinh/Thanh pho" value={addressForm.province} onChange={(e) => setAddressForm((prev) => ({ ...prev, province: e.target.value }))} required />
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="Quan/Huyen" value={addressForm.district} onChange={(e) => setAddressForm((prev) => ({ ...prev, district: e.target.value }))} required />
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="Phuong/Xa" value={addressForm.ward} onChange={(e) => setAddressForm((prev) => ({ ...prev, ward: e.target.value }))} required />
                                        <input className="w-full h-11 border border-gray-200 rounded-xl px-4" placeholder="So nha, ten duong" value={addressForm.street} onChange={(e) => setAddressForm((prev) => ({ ...prev, street: e.target.value }))} required />
                                        <button disabled={isSavingAddress} className="h-11 px-5 bg-[#008d71] text-white rounded-xl font-black disabled:opacity-60">
                                            {isSavingAddress ? 'Dang luu...' : 'Them dia chi'}
                                        </button>
                                    </form>
                                    <div className="space-y-3">
                                        {tabLoading ? (
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">Dang tai du lieu...</div>
                                        ) : addresses.length === 0 ? (
                                            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">Chua co dia chi nao.</div>
                                        ) : (
                                            addresses.map((address) => (
                                                <div key={address._id} className="bg-white rounded-2xl p-4 border border-gray-100">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-black text-gray-900">
                                                                {address.recipientName} - {address.phone}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {address.street}, {address.ward}, {address.district}, {address.province}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {!address.isDefault && (
                                                                <button onClick={() => handleSetDefaultAddress(address)} className="text-xs font-black text-[#008d71]">
                                                                    Dat mac dinh
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleDeleteAddress(address._id)} className="text-xs font-black text-red-500">
                                                                Xoa
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tabNotice && (
                            <div className="mt-4 rounded-2xl px-5 py-4 text-sm font-bold bg-red-50 text-red-600 border border-red-100">
                                {tabNotice}
                            </div>
                        )}

                    </main>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;

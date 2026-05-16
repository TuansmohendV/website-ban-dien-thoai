import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X, ShoppingBag, Tag, Settings, Headphones, CheckCheck } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const typeConfig = {
    order:     { icon: ShoppingBag, color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Đơn hàng' },
    promotion: { icon: Tag,          color: 'text-orange-500', bg: 'bg-orange-50', label: 'Ưu đãi' },
    system:    { icon: Settings,     color: 'text-gray-500',   bg: 'bg-gray-50',   label: 'Hệ thống' },
    support:   { icon: Headphones,   color: 'text-purple-500', bg: 'bg-purple-50', label: 'Hỗ trợ' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    return `${days} ngày trước`;
};

const NotificationBell = () => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const res = await api.get('/api/notifications/unread-count');
            setUnreadCount(Number(res.data?.data?.count || 0));
        } catch { /* silent */ }
    };

    // Fetch all notifications
    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get('/api/notifications?limit=20');
            setNotifications(res.data?.data || []);
            const count = (res.data?.data || []).filter(n => !n.isRead).length;
            setUnreadCount(count);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    // Poll every 60 seconds for new notifications
    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        if (!open) fetchNotifications();
        setOpen(!open);
    };

    const handleMarkOne = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const handleMarkAll = async () => {
        try {
            await api.patch('/api/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#008d71]/10 transition-all group"
                title="Thông báo"
            >
                <Bell
                    size={20}
                    strokeWidth={1.8}
                    className={`transition-colors ${open ? 'text-[#008d71]' : 'text-gray-600 group-hover:text-[#008d71]'} ${unreadCount > 0 ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`}
                />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-0.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none shadow">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-3 w-[360px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden flex flex-col"
                     style={{ maxHeight: '480px' }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#008d71]/5 to-transparent shrink-0">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-[#008d71]" />
                            <span className="text-[14px] font-black text-gray-800">Thông báo</span>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAll}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#008d71] hover:underline">
                                    <CheckCheck size={13} />
                                    Đọc tất cả
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-2 border-[#008d71] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[12px] text-gray-400 font-medium">Đang tải...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Bell size={24} className="text-gray-300" />
                                </div>
                                <p className="text-[13px] text-gray-400 font-medium">Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => {
                                    const cfg = typeConfig[n.type] || typeConfig.system;
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => !n.isRead && handleMarkOne(n._id)}
                                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${n.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/70'}`}
                                        >
                                            <div className={`shrink-0 w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
                                                <Icon size={16} className={cfg.color} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-[13px] leading-snug ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'} line-clamp-2`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.isRead && (
                                                        <span className="shrink-0 w-2 h-2 mt-1 bg-[#008d71] rounded-full" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                                    <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-2.5 shrink-0">
                        <Link
                            to="/notifications"
                            onClick={() => setOpen(false)}
                            className="block text-center text-[12px] font-bold text-[#008d71] hover:underline"
                        >
                            Xem tất cả thông báo →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

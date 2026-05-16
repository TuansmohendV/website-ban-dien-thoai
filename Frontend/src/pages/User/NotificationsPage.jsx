import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, Tag, Settings, Headphones, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const typeConfig = {
    order:     { icon: ShoppingBag, color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Đơn hàng',   border: 'border-blue-100' },
    promotion: { icon: Tag,          color: 'text-orange-500', bg: 'bg-orange-50', label: 'Ưu đãi',      border: 'border-orange-100' },
    system:    { icon: Settings,     color: 'text-gray-500',   bg: 'bg-gray-50',   label: 'Hệ thống',   border: 'border-gray-100' },
    support:   { icon: Headphones,   color: 'text-purple-500', bg: 'bg-purple-50', label: 'Hỗ trợ',     border: 'border-purple-100' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} giờ trước`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/notifications?limit=50');
            const data = res.data?.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch { /* silent */ }
        finally { setLoading(false); }
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

    const filtered = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.isRead)
            : notifications.filter(n => n.type === filter);

    const tabs = [
        { key: 'all', label: 'Tất cả', count: notifications.length },
        { key: 'unread', label: 'Chưa đọc', count: unreadCount },
        { key: 'promotion', label: '🏷️ Ưu đãi' },
        { key: 'order', label: '📦 Đơn hàng' },
        { key: 'system', label: '⚙️ Hệ thống' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-[18px] font-black text-gray-900">Thông báo</h1>
                            {unreadCount > 0 && (
                                <p className="text-[12px] text-gray-500">{unreadCount} thông báo chưa đọc</p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAll}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-[#008d71] hover:bg-[#008d71]/10 px-3 py-1.5 rounded-full transition-all"
                        >
                            <CheckCheck size={15} />
                            Đọc tất cả
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="max-w-3xl mx-auto px-4 flex gap-2 overflow-x-auto no-scrollbar pb-3">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                                filter === tab.key
                                    ? 'bg-[#008d71] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`ml-1 ${filter === tab.key ? 'text-white/80' : 'text-gray-400'}`}>
                                    ({tab.count})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-2 border-[#008d71] border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-[14px]">Đang tải thông báo...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <Bell size={36} className="text-gray-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-[16px] font-bold text-gray-500">Không có thông báo nào</p>
                            <p className="text-[13px] text-gray-400 mt-1">Các ưu đãi và cập nhật sẽ xuất hiện ở đây</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((n) => {
                            const cfg = typeConfig[n.type] || typeConfig.system;
                            const Icon = cfg.icon;
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => !n.isRead && handleMarkOne(n._id)}
                                    className={`relative bg-white rounded-2xl border p-4 flex gap-4 items-start shadow-sm transition-all cursor-pointer hover:shadow-md ${
                                        n.isRead ? 'border-gray-100 opacity-75' : `${cfg.border} ring-1 ring-inset ${cfg.border}`
                                    }`}
                                >
                                    {/* Unread dot */}
                                    {!n.isRead && (
                                        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#008d71] rounded-full" />
                                    )}

                                    {/* Icon */}
                                    <div className={`shrink-0 w-11 h-11 rounded-2xl ${cfg.bg} flex items-center justify-center`}>
                                        <Icon size={20} className={cfg.color} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[11px] text-gray-400">{timeAgo(n.createdAt)}</span>
                                        </div>
                                        <h3 className={`text-[14px] leading-snug mb-1 ${n.isRead ? 'font-semibold text-gray-700' : 'font-bold text-gray-900'}`}>
                                            {n.title}
                                        </h3>
                                        <p className="text-[12px] text-gray-500 leading-relaxed">{n.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;

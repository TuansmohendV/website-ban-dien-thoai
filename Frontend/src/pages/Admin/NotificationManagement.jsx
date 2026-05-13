import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  ShieldAlert, 
  ShoppingBag, 
  UserPlus, 
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NotificationManagement = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const primaryColor = localStorage.getItem('primaryColor') || '#2563eb';

  const notifications = [
    { id: 1, type: 'fraud', title: 'CẢNH BÁO LỪA ĐẢO!', content: 'Phát hiện hành vi gian lận thanh toán từ địa chỉ IP: 192.168.1.45. Cần kiểm tra ngay!', time: '2 phút trước', status: 'unread' },
    { id: 2, type: 'order', title: 'Đơn hàng mới #1294', content: 'Khách hàng Nguyễn Văn A vừa đặt mua iPhone 15 Pro Max.', time: '15 phút trước', status: 'unread' },
    { id: 3, type: 'user', title: 'Thành viên mới', content: 'Có thêm 5 người dùng vừa đăng ký tài khoản mới trong hôm nay.', time: '1 giờ trước', status: 'read' },
    { id: 4, type: 'fraud', title: 'Truy cập bất thường', content: 'Nhiều yêu cầu đăng nhập sai liên tiếp từ tài khoản: admin_test.', time: '3 giờ trước', status: 'read' },
    { id: 5, type: 'order', title: 'Đơn hàng đã hoàn thành', content: 'Đơn hàng #1280 đã được giao thành công cho khách hàng.', time: '5 giờ trước', status: 'read' },
    { id: 6, type: 'system', title: 'Cập nhật hệ thống', content: 'Phiên bản v2.4.0 đã được triển khai thành công với các bản vá bảo mật mới.', time: '1 ngày trước', status: 'read' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'fraud': return <ShieldAlert size={20} color="#ef4444" />;
      case 'order': return <ShoppingBag size={20} color="#2563eb" />;
      case 'user': return <UserPlus size={20} color="#10b981" />;
      default: return <Bell size={20} color="#64748b" />;
    }
  };

  return (
    <div className="notification-page">
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="page-title">Tất cả thông báo</h1>
          <p className="page-subtitle">Theo dõi và quản lý toàn bộ tin tức, cảnh báo bảo mật từ hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Đánh dấu tất cả đã đọc
          </button>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: '#fecdd3' }}>
            <Trash2 size={18} /> Xóa tất cả
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="notif-controls" style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'unread', 'fraud', 'order', 'system'].map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                background: activeFilter === filter ? primaryColor : '#f1f5f9',
                color: activeFilter === filter ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              {filter === 'all' ? 'Tất cả' : filter === 'unread' ? 'Chưa đọc' : filter === 'fraud' ? 'Lừa đảo' : filter === 'order' ? 'Đơn hàng' : 'Hệ thống'}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Tìm kiếm thông báo..." style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
        </div>
      </div>

      {/* Notification List */}
      <div className="notif-full-list" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className="notif-full-item"
            style={{ 
              padding: '20px 25px', display: 'flex', gap: '20px', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer',
              background: notif.status === 'unread' ? `${primaryColor}05` : 'transparent',
              position: 'relative'
            }}
          >
            {notif.status === 'unread' && <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: primaryColor }}></div>}
            
            <div style={{ 
              width: '45px', height: '45px', borderRadius: '12px', background: notif.type === 'fraud' ? '#fff1f2' : '#f1f5f9', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
            }}>
              {getIcon(notif.type)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: notif.type === 'fraud' ? '#ef4444' : '#1e293b' }}>{notif.title}</h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notif.time}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{notif.content}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="icon-btn-v" style={{ padding: '8px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}

        {/* Pagination */}
        <div style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Hiển thị 1 - 6 của 24 thông báo</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button disabled style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#cbd5e1' }}><ChevronLeft size={18} /></button>
            <button style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b' }}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .notif-full-item:hover { background: #f8fafc !important; }
        .btn-outline:hover { background: #f1f5f9; border-color: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default NotificationManagement;

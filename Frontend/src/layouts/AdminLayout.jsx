import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../pages/Admin/Admin.css';
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Ticket, 
  Bell,
  Home,
  LogOut, 
  Menu, 
  X,
  Search,
  ChevronRight,
  User,
  Image as ImageIcon,
  LayoutTemplate,
  Hash,
  Dna,
  Settings,
  Warehouse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [logo, setLogo] = useState(localStorage.getItem('adminLogo') || null);
  const [primaryColor, setPrimaryColor] = useState(localStorage.getItem('primaryColor') || '#2563eb');
  const [sidebarTheme, setSidebarTheme] = useState(localStorage.getItem('sidebarTheme') || 'dark');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Listen for changes in localStorage to update assets and theme instantly
  React.useEffect(() => {
    const syncTheme = () => {
      const savedLogo = localStorage.getItem('adminLogo');
      const savedColor = localStorage.getItem('primaryColor');
      const savedTheme = localStorage.getItem('sidebarTheme');
      
      if (savedLogo !== logo) setLogo(savedLogo);
      if (savedColor && savedColor !== primaryColor) setPrimaryColor(savedColor);
      if (savedTheme && savedTheme !== sidebarTheme) setSidebarTheme(savedTheme);
    };
    window.addEventListener('storage', syncTheme);
    const interval = setInterval(syncTheme, 1000); 
    return () => {
      window.removeEventListener('storage', syncTheme);
      clearInterval(interval);
    };
  }, [logo, primaryColor, sidebarTheme]);

  // Handle click outside search
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.header-search')) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Sản phẩm' },
    { path: '/admin/inventory', icon: <Warehouse size={20} />, label: 'Tồn kho' },
    { path: '/admin/categories', icon: <ListTree size={20} />, label: 'Danh mục' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Đơn hàng' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Khách hàng' },
    { path: '/admin/promotions', icon: <Ticket size={20} />, label: 'Khuyến mãi' },
    { path: '/admin/banners', icon: <LayoutTemplate size={20} />, label: 'Quản lý Banner' },
    { path: '/admin/news', icon: <MessageSquare size={20} />, label: 'Tin tức & Blog' },
    { path: '/admin/support', icon: <MessageSquare size={20} />, label: 'Hỗ trợ' },
    { path: '/admin/feedback', icon: <MessageSquare size={20} />, label: 'Phản hồi' },
    { path: '/admin/media', icon: <ImageIcon size={20} />, label: 'Thư viện Media' },
    { path: '/admin/icons', icon: <Dna size={20} />, label: 'Thư viện Icon' },
    { path: '/admin/hashtags', icon: <Hash size={20} />, label: 'Hashtags' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Cài đặt hệ thống' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(adminSearchTerm.toLowerCase())
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon-wrapper" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px' }}>
              {logo ? <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span className="logo-icon">📱</span>}
            </div>
            {isSidebarOpen && <span className="logo-text">PhoneSin Admin</span>}
          </div>
          <button className="mobile-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {isSidebarOpen && <span className="nav-label">{item.label}</span>}
              {isSidebarOpen && location.pathname === item.path && <ChevronRight size={16} className="active-indicator" />}
            </Link>
          ))}
          {filteredMenuItems.length === 0 && (
            <div style={{ padding: '20px', color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
              Không tìm thấy mục nào
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <span className="nav-icon"><Home size={20} /></span>
            {isSidebarOpen && <span className="nav-label">Quay lại trang chủ</span>}
          </Link>
          <button 
            className="nav-item logout-btn" 
            onClick={() => {
              if(window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                logout();
                window.location.href = '/login';
              }
            }}
            style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: '12px 15px' }}
          >
            <span className="nav-icon"><LogOut size={20} /></span>
            {isSidebarOpen && <span className="nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`admin-main ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="desktop-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="header-search" style={{ position: 'relative' }}>
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Tìm kiếm nhanh..." 
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {adminSearchTerm && (
                <button 
                  onClick={() => setAdminSearchTerm('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {isSearchFocused && adminSearchTerm && (
                <div className="admin-search-dropdown" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: 0, width: '100%',
                  background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e2e8f0', zIndex: 1002, overflow: 'hidden'
                }}>
                  <div style={{ padding: '10px 15px', borderBottom: '1px solid #f1f5f9', fontSize: '12px', fontWeight: '700', color: '#64748b', background: '#f8fafc' }}>
                    KẾT QUẢ TÌM KIẾM
                  </div>
                  <div style={{ maxHieght: '300px', overflowY: 'auto' }}>
                    {filteredMenuItems.map(item => (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => {
                          setAdminSearchTerm('');
                          setIsSearchFocused(false);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', textDecoration: 'none', color: '#1e293b', borderBottom: '1px solid #f8fafc' }}
                      >
                        <div style={{ color: primaryColor }}>{item.icon}</div>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                      </Link>
                    ))}
                    {filteredMenuItems.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        Không tìm thấy trang nào khớp
                      </div>
                    )}
                  </div>
                  <Link 
                    to={`/admin/categories?q=${adminSearchTerm}`}
                    onClick={() => {
                      setAdminSearchTerm('');
                      setIsSearchFocused(false);
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: '#eff6ff', color: primaryColor, textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}
                  >
                    Tìm "{adminSearchTerm}" trong Danh mục &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="header-right">
            <div style={{ position: 'relative' }}>
              <button className="header-icon-btn" onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                <Bell size={20} />
                <span className="badge">3</span>
              </button>

              {isNotificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Thông báo hệ thống</h3>
                    <span>Đánh dấu tất cả đã đọc</span>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item urgent">
                      <div className="notif-icon"><Bell size={16} color="#ef4444" /></div>
                      <div className="notif-content">
                        <p className="notif-title">CẢNH BÁO LỪA ĐẢO!</p>
                        <p className="notif-text">Phát hiện hành vi gian lận thanh toán từ địa chỉ IP: 192.168.1.45. Cần kiểm tra ngay!</p>
                        <span className="notif-time">2 phút trước</span>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notif-icon"><ShoppingBag size={16} color="#2563eb" /></div>
                      <div className="notif-content">
                        <p className="notif-title">Đơn hàng mới #1294</p>
                        <p className="notif-text">Khách hàng Nguyễn Văn A vừa đặt mua iPhone 15 Pro Max.</p>
                        <span className="notif-time">15 phút trước</span>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notif-icon"><Users size={16} color="#10b981" /></div>
                      <div className="notif-content">
                        <p className="notif-title">Thành viên mới</p>
                        <p className="notif-text">Có thêm 5 người dùng vừa đăng ký tài khoản mới trong hôm nay.</p>
                        <span className="notif-time">1 giờ trước</span>
                      </div>
                    </div>
                  </div>
                  <div className="notification-footer">
                    <Link to="/admin/notifications">Xem tất cả thông báo</Link>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">
                <User size={20} />
              </div>
              <div className="admin-info">
                <span className="admin-name">{user?.fullName || user?.name || 'Quản trị viên'}</span>
                <span className="admin-role">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      <style jsx="true">{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
          color: #1e293b;
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar Styles */
        .admin-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: ${sidebarTheme === 'dark' ? '#0f172a' : 'white'};
          color: ${sidebarTheme === 'dark' ? 'white' : '#1e293b'};
          width: 260px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          border-right: ${sidebarTheme === 'light' ? '1px solid #e2e8f0' : 'none'};
        }

        .admin-sidebar.closed {
          width: 80px;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.25rem;
          white-space: nowrap;
          background: linear-gradient(to right, #60a5fa, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-nav {
          padding: 20px 10px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          position: relative;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .nav-item.active {
          background: ${primaryColor};
          color: white;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
        }

        .nav-label {
          margin-left: 12px;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .active-indicator {
          margin-left: auto;
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          background: ${sidebarTheme === 'dark' ? '#0f172a' : 'white'};
        }

        /* Main Content Styles */
        .admin-main {
          flex: 1;
          margin-left: 260px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .admin-main.collapsed {
          margin-left: 80px;
        }

        .admin-header {
          height: 70px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 900;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .desktop-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: flex;
          align-items: center;
        }

        .header-search {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          padding: 8px 16px;
          border-radius: 10px;
          width: 300px;
        }

        .search-icon {
          color: #94a3b8;
          margin-right: 10px;
        }

        .header-search input {
          background: none;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-icon-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .header-icon-btn:hover {
          background: #f1f5f9;
        }

        .badge {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          border: 2px solid white;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 20px;
          border-left: 1px solid #e2e8f0;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${primaryColor};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-info {
          display: flex;
          flex-direction: column;
        }

        .admin-name {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .admin-role {
          font-size: 0.75rem;
          color: #64748b;
        }

        .admin-content {
          padding: 30px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }

        .mobile-toggle {
          display: none;
        }

        /* Notification Dropdown */
        .notification-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 350px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          z-index: 1001;
          overflow: hidden;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notification-header {
          padding: 15px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h3 { font-size: 1rem; margin: 0; font-weight: 700; }
        .notification-header span { font-size: 12px; color: ${primaryColor}; cursor: pointer; }

        .notification-list { max-height: 400px; overflow-y: auto; }

        .notification-item {
          padding: 15px 20px;
          display: flex;
          gap: 15px;
          border-bottom: 1px solid #f8fafc;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notification-item:hover { background: #f8fafc; }

        .notification-item.urgent { background: #fff1f2; }
        .notification-item.urgent:hover { background: #ffe4e6; }

        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-item.urgent .notif-icon { background: #fecdd3; }

        .notif-content { flex: 1; }
        .notif-title { font-size: 13px; font-weight: 700; margin: 0; }
        .notif-text { font-size: 12px; color: #64748b; margin: 4px 0; line-height: 1.4; }
        .notif-time { font-size: 11px; color: #94a3b8; }

        .notification-footer {
          padding: 12px;
          text-align: center;
          border-top: 1px solid #f1f5f9;
        }

        .notification-footer a {
          font-size: 13px;
          color: #64748b;
          text-decoration: none;
          font-weight: 600;
        }

        .notification-footer a:hover { color: ${primaryColor}; }

        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
            width: 100%;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .desktop-toggle {
            display: none;
          }
          .mobile-toggle {
            display: block;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
          }
          .header-search {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;

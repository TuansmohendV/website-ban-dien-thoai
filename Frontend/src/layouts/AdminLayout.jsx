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
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Sản phẩm' },
    { path: '/admin/categories', icon: <ListTree size={20} />, label: 'Danh mục' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Đơn hàng' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Khách hàng' },
    { path: '/admin/promotions', icon: <Ticket size={20} />, label: 'Khuyến mãi' },
    { path: '/admin/feedback', icon: <MessageSquare size={20} />, label: 'Phản hồi' },
    { path: '/admin/icons', icon: <ImageIcon size={20} />, label: 'Thư viện Icon' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">📱</span>
            {isSidebarOpen && <span className="logo-text">PhoneSin Admin</span>}
          </div>
          <button className="mobile-toggle" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
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
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <span className="nav-icon"><Home size={20} /></span>
            {isSidebarOpen && <span className="nav-label">Quay lại trang chủ</span>}
          </Link>
          <Link to="/" className="nav-item" onClick={logout}>
            <span className="nav-icon"><LogOut size={20} /></span>
            {isSidebarOpen && <span className="nav-label">Đăng xuất</span>}
          </Link>
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
            <div className="header-search">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Tìm kiếm nhanh..." />
            </div>
          </div>

          <div className="header-right">
            <button className="header-icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
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
          background: #0f172a;
          color: white;
          width: 260px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
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
          background: #2563eb;
          color: white;
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
          background: linear-gradient(135deg, #2563eb, #a855f7);
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

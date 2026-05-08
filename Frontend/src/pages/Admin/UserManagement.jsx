import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck, 
  History, 
  Mail, 
  Phone,
  Search,
  MoreVertical,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  ArrowUpDown,
  XCircle
} from 'lucide-react';

const initialUsers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0901234567', role: 'Khách hàng', status: 'Hoạt động', joinedDate: '12/01/2026', totalOrders: 5, spent: '45,000,000 ₫' },
  { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', phone: '0987654321', role: 'Khách hàng', status: 'Bị khóa', joinedDate: '15/02/2026', totalOrders: 1, spent: '2,500,000 ₫' },
  { id: 3, name: 'Lê Văn C', email: 'vanc_admin@phonesin.com', phone: '0912345678', role: 'Admin', status: 'Hoạt động', joinedDate: '01/01/2026', totalOrders: 0, spent: '0 ₫' },
  { id: 4, name: 'Phạm Minh D', email: 'minhd_staff@phonesin.com', phone: '0933445566', role: 'Nhân viên', status: 'Hoạt động', joinedDate: '10/03/2026', totalOrders: 0, spent: '0 ₫' },
];

const UserManagement = () => {
  const [usersData, setUsersData] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Nhân viên');

  const [rolePermissions, setRolePermissions] = useState({
    'Admin': {
      'Sản phẩm': { view: true, add: true, edit: true, delete: true },
      'Đơn hàng': { view: true, add: true, edit: true, delete: true },
      'Người dùng': { view: true, add: true, edit: true, delete: true },
      'Khuyến mãi': { view: true, add: true, edit: true, delete: true },
    },
    'Nhân viên': {
      'Sản phẩm': { view: true, add: true, edit: true, delete: false },
      'Đơn hàng': { view: true, add: false, edit: true, delete: false },
      'Người dùng': { view: true, add: false, edit: false, delete: false },
      'Khuyến mãi': { view: true, add: true, edit: true, delete: false },
    },
    'Khách hàng': {
      'Sản phẩm': { view: true, add: false, edit: false, delete: false },
      'Đơn hàng': { view: true, add: false, edit: false, delete: false },
      'Người dùng': { view: false, add: false, edit: false, delete: false },
      'Khuyến mãi': { view: true, add: false, edit: false, delete: false },
    }
  });

  const modules = ['Sản phẩm', 'Đơn hàng', 'Người dùng', 'Khuyến mãi'];
  const actions = [
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' }
  ];

  const handlePermissionChange = (role, module, action) => {
    if (role === 'Admin') return; // Admin luôn có toàn quyền
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [action]: !prev[role][module][action]
        }
      }
    }));
  };

  const toggleUserStatus = (id) => {
    setUsersData(usersData.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'Hoạt động' ? 'Bị khóa' : 'Hoạt động' };
      }
      return user;
    }));
  };

  const handleActionClick = (actionName, user = null) => {
    if (actionName === 'Xem chi tiết' && user) {
      setSelectedUser(user);
      setShowDetailModal(true);
    } else {
      alert(`Chức năng ${actionName} đang được phát triển.`);
    }
  };

  const filteredUsers = usersData.filter(user => {
    // Tab filter
    if (activeTab === 'customers' && user.role !== 'Khách hàng') return false;
    if (activeTab === 'staff' && user.role === 'Khách hàng') return false;

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    if (searchTerm && !user.name.toLowerCase().includes(searchLower) && !user.email.toLowerCase().includes(searchLower) && !user.phone.includes(searchTerm)) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'Tất cả') {
      if (statusFilter === 'Hoạt động' && user.status !== 'Hoạt động') return false;
      if (statusFilter === 'Đang khóa' && user.status !== 'Bị khóa') return false;
    }

    return true;
  }).sort((a, b) => {
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`).getTime();
    };
    
    if (sortOrder === 'newest') {
      return parseDate(b.joinedDate) - parseDate(a.joinedDate);
    } else if (sortOrder === 'oldest') {
      return parseDate(a.joinedDate) - parseDate(b.joinedDate);
    }
    return 0;
  });

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản trị Người dùng</h1>
          <p className="page-subtitle">Quản lý tài khoản khách hàng, nhân viên và phân quyền hệ thống.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowPermissionModal(true)}>
          <Shield size={18} />
          Quản lý phân quyền
        </button>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} /> Khách hàng
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <ShieldCheck size={18} /> Nhân viên & Admin
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, email, số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Tất cả">Trạng thái: Tất cả</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Đang khóa">Đang khóa</option>
            </select>
          </div>
          <div className="filter-item">
            <ArrowUpDown size={16} />
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Ngày tham gia</th>
                <th>Thống kê mua hàng</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar" style={{ background: user.role === 'Admin' ? '#eff6ff' : '#f8fafc' }}>
                          {user.role === 'Admin' ? <Shield size={18} color="#2563eb" /> : <Users size={18} color="#64748b" />}
                        </div>
                        <div className="user-info-text">
                          <span className="user-name-bold">{user.name}</span>
                          <span className="user-id">ID: USR-{user.id}00{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-item"><Mail size={14} /> {user.email}</div>
                        <div className="contact-item"><Phone size={14} /> {user.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td><span className="date-text">{user.joinedDate}</span></td>
                    <td>
                      <div className="user-stats">
                        <span className="orders-count"><History size={14} /> {user.totalOrders} đơn</span>
                        <span className="spent-amount">{user.spent}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`status-pill clickable ${user.status === 'Hoạt động' ? 'active' : 'locked'}`}
                        onClick={() => toggleUserStatus(user.id)}
                        title="Click để thay đổi trạng thái"
                      >
                        {user.status === 'Hoạt động' ? <UserCheck size={14} /> : <UserX size={14} />}
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn view" title="Lịch sử mua hàng" onClick={() => handleActionClick('Xem chi tiết', user)}><ChevronRight size={18} /></button>
                        <button 
                          className={`action-btn ${user.status === 'Hoạt động' ? 'lock' : 'unlock'}`} 
                          title={user.status === 'Hoạt động' ? 'Khóa tài khoản' : 'Mở khóa'}
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          {user.status === 'Hoạt động' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button className="action-btn more" onClick={() => handleActionClick('Menu tùy chọn')}><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced Permission Management Modal */}
      {showPermissionModal && (
        <div className="modal-overlay" onClick={() => setShowPermissionModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '35px', borderRadius: '24px',
            width: '95%', maxWidth: '850px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Thiết lập quyền truy cập</h2>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.95rem' }}>Tùy chỉnh chi tiết quyền hạn cho từng vai trò trong hệ thống.</p>
              </div>
              <button onClick={() => setShowPermissionModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}>
                <XCircle size={24} color="#64748b" />
              </button>
            </div>

            {/* Role Selection Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#f8fafc', padding: '6px', borderRadius: '14px' }}>
              {Object.keys(rolePermissions).map(role => (
                <button 
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: selectedRole === role ? 'white' : 'transparent',
                    color: selectedRole === role ? '#2563eb' : '#64748b',
                    fontWeight: '700', cursor: 'pointer', boxShadow: selectedRole === role ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Permission Matrix */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ textAlign: 'left', padding: '15px 20px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Danh mục quản lý</th>
                    {actions.map(action => (
                      <th key={action.key} style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>{action.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => (
                    <tr key={module} style={{ borderTop: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '700', color: '#1e293b' }}>{module}</td>
                      {actions.map(action => (
                        <td key={action.key} style={{ textAlign: 'center', padding: '18px 20px' }}>
                          <label style={{ cursor: selectedRole === 'Admin' ? 'not-allowed' : 'pointer', position: 'relative', display: 'inline-block', width: '22px', height: '22px' }}>
                            <input 
                              type="checkbox"
                              checked={rolePermissions[selectedRole][module][action.key]}
                              onChange={() => handlePermissionChange(selectedRole, module, action.key)}
                              disabled={selectedRole === 'Admin'}
                              style={{ 
                                cursor: 'pointer', width: '20px', height: '20px', 
                                borderRadius: '6px', accentColor: '#2563eb' 
                              }}
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '35px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPermissionModal(false)} style={{ 
                padding: '12px 30px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                background: 'white', fontWeight: '700', cursor: 'pointer', color: '#475569'
              }}>
                Hủy bỏ
              </button>
              <button className="btn-primary" style={{ padding: '12px 40px' }} onClick={() => {
                alert('Đã lưu thay đổi cấu hình phân quyền!');
                setShowPermissionModal(false);
              }}>
                Cập nhật cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '0', borderRadius: '24px',
            width: '95%', maxWidth: '800px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ background: '#f8fafc', padding: '30px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '900' }}>
                     {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                     <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{selectedUser.name}</h2>
                     <span className={`role-badge ${selectedUser.role.toLowerCase()}`}>{selectedUser.role}</span>
                  </div>
               </div>
               <button onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: '#fff', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XCircle size={24} color="#64748b" />
               </button>
            </div>
            <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
               <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Thông tin cá nhân</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email</label>
                        <div style={{ fontWeight: '600' }}>{selectedUser.email}</div>
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                        <div style={{ fontWeight: '600' }}>{selectedUser.phone}</div>
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Ngày tham gia</label>
                        <div style={{ fontWeight: '600' }}>{selectedUser.joinedDate}</div>
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Trạng thái tài khoản</label>
                        <span className={`status-pill ${selectedUser.status === 'Hoạt động' ? 'active' : 'locked'}`}>{selectedUser.status}</span>
                     </div>
                  </div>
               </div>
               <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                     Lịch sử mua hàng
                     <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#2563eb' }}>Tổng chi tiêu: {selectedUser.spent}</span>
                  </h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f8fafc' }}>
                           <tr>
                              <th style={{ textAlign: 'left', padding: '12px' }}>Mã đơn</th>
                              <th style={{ textAlign: 'left', padding: '12px' }}>Sản phẩm</th>
                              <th style={{ textAlign: 'right', padding: '12px' }}>Giá trị</th>
                           </tr>
                        </thead>
                        <tbody>
                           {[
                              { id: 'ORD-5521', product: 'iPhone 15 Pro Max', price: '34,990,000 ₫' },
                              { id: 'ORD-4120', product: 'Sạc 20W Apple', price: '590,000 ₫' },
                              { id: 'ORD-3091', product: 'Ốp lưng Clear Case', price: '1,290,000 ₫' },
                           ].map(order => (
                              <tr key={order.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                 <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>#{order.id}</td>
                                 <td style={{ padding: '12px' }}>{order.product}</td>
                                 <td style={{ padding: '12px', textAlign: 'right' }}>{order.price}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px 30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
               <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
               <button className="btn-primary" style={{ padding: '10px 25px' }}>Gửi email ưu đãi</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;

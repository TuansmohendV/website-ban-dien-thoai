import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
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
  Edit,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  ChevronRight,
  Filter,
  ArrowUpDown,
  XCircle
} from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';

const roleLabels = {
  admin: 'Admin',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa rõ' : date.toLocaleDateString('vi-VN');
};

const mapUserForAdmin = (user = {}) => ({
  id: user._id || user.id || '',
  name: user.fullName || user.name || 'Khách hàng',
  email: user.email || 'Chưa cập nhật',
  phone: user.phone || 'Chưa cập nhật',
  rawEmail: user.email || '',
  rawPhone: user.phone || '',
  rawRole: user.role || 'customer',
  isActive: user.isActive !== false,
  role: roleLabels[user.role] || 'Khách hàng',
  status: user.isActive === false ? 'Bị khóa' : 'Hoạt động',
  joinedDate: formatDate(user.createdAt),
  totalOrders: Number(user.totalOrders || 0),
  spent: `${Number(user.spent || 0).toLocaleString('vi-VN')} ₫`,
});

const UserManagement = () => {
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Nhân viên');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [passwordForm, setPasswordForm] = useState({ password: '' });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/api/users/admin');
      setUsersData((response.data?.data || []).map(mapUserForAdmin));
      setLoadError('');
    } catch (error) {
      setUsersData([]);
      setLoadError(getApiErrorMessage(error, 'Không thể tải người dùng từ database.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const toggleUserStatus = async (user) => {
    const nextIsActive = user.status !== 'Hoạt động';

    try {
      await api.put(`/api/users/admin/${user.id}`, { isActive: nextIsActive });
      setUsersData(usersData.map(item => (
        item.id === user.id
          ? {
              ...item,
              isActive: nextIsActive,
              status: nextIsActive ? 'Hoạt động' : 'Bị khóa',
            }
          : item
      )));
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật trạng thái người dùng.'));
    }
  };

  const handleActionClick = (actionName, user = null) => {
    if (actionName === 'Xem chi tiết' && user) {
      setSelectedUser(user);
      setShowDetailModal(true);
    } else {
      alert(`Chức năng ${actionName} đang được phát triển.`);
    }
  };

  const openCreateCustomerModal = () => {
    setCustomerForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
    });
    setActiveTab('customers');
    setShowCreateCustomerModal(true);
  };

  const handleCustomerFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateCustomer = async () => {
    if (!customerForm.email.trim() && !customerForm.phone.trim()) {
      alert('Vui lòng nhập email hoặc số điện thoại.');
      return;
    }

    if (customerForm.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsCreatingCustomer(true);

    try {
      await api.post('/api/users/admin/customers', {
        fullName: customerForm.fullName,
        email: customerForm.email,
        phone: customerForm.phone,
        password: customerForm.password,
        isActive: customerForm.isActive,
      });
      await loadUsers();
      setShowCreateCustomerModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể tạo khách hàng.'));
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setEditUserForm({
      fullName: user.name === 'Khách hàng' ? '' : user.name,
      email: user.rawEmail,
      phone: user.rawPhone,
      isActive: user.isActive,
    });
    setActiveMenuId(null);
    setShowEditUserModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordForm({ password: '' });
    setActiveMenuId(null);
    setShowPasswordModal(true);
  };

  const handleEditUserFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditUserForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ password: e.target.value });
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    if (!editUserForm.email.trim() && !editUserForm.phone.trim()) {
      alert('Vui lòng nhập email hoặc số điện thoại.');
      return;
    }

    setIsSavingUser(true);

    try {
      await api.put(`/api/users/admin/${selectedUser.id}`, editUserForm);
      await loadUsers();
      setShowEditUserModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật người dùng.'));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser) return;

    if (passwordForm.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await api.put(`/api/users/admin/${selectedUser.id}/password`, passwordForm);
      setShowPasswordModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật mật khẩu.'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setActiveMenuId(null);

    if (!window.confirm(`Xóa người dùng "${user.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/users/admin/${user.id}`);
      await loadUsers();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể xóa người dùng.'));
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
      const timestamp = new Date(`${year}-${month}-${day}`).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };
    
    if (sortOrder === 'newest') {
      return parseDate(b.joinedDate) - parseDate(a.joinedDate);
    } else if (sortOrder === 'oldest') {
      return parseDate(a.joinedDate) - parseDate(b.joinedDate);
    }
    return 0;
  });

  const customerCount = usersData.filter(user => user.role === 'Khách hàng').length;
  const staffCount = usersData.length - customerCount;

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản trị Người dùng</h1>
          <p className="page-subtitle">Quản lý tài khoản khách hàng, nhân viên và phân quyền hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={openCreateCustomerModal}>
            <Plus size={18} />
            Thêm khách hàng
          </button>
          <button className="btn-primary" onClick={() => setShowPermissionModal(true)}>
            <Shield size={18} />
            Quản lý phân quyền
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button 
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={18} /> Khách hàng ({customerCount})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <ShieldCheck size={18} /> Nhân viên & Admin ({staffCount})
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
                          <span className="user-id">ID: {user.id}</span>
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
                        onClick={() => toggleUserStatus(user)}
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
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.status === 'Hoạt động' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <div style={{ position: 'relative' }}>
                          <button
                            className="action-btn more"
                            onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                            title="Menu tùy chọn"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === user.id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              top: '42px',
                              width: '190px',
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.14)',
                              padding: '8px',
                              zIndex: 20
                            }}>
                              <button className="menu-action" onClick={() => openEditUserModal(user)}>
                                <Edit size={15} /> Sửa thông tin
                              </button>
                              <button className="menu-action" onClick={() => openPasswordModal(user)}>
                                <KeyRound size={15} /> Đổi mật khẩu
                              </button>
                              <button className="menu-action danger" onClick={() => handleDeleteUser(user)}>
                                <Trash2 size={15} /> Xóa người dùng
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    {isLoading ? 'Đang tải người dùng từ database...' : loadError || 'Không tìm thấy người dùng nào phù hợp.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCustomerModal(false)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '32px', borderRadius: '22px',
            width: '95%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Thêm khách hàng</h2>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.9rem' }}>Tạo tài khoản khách hàng mới trong hệ thống.</p>
              </div>
              <button onClick={() => setShowCreateCustomerModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Họ tên
                <input name="fullName" value={customerForm.fullName} onChange={handleCustomerFormChange} placeholder="Nhập họ tên khách hàng" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Email
                <input name="email" value={customerForm.email} onChange={handleCustomerFormChange} placeholder="email@example.com" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Số điện thoại
                <input name="phone" value={customerForm.phone} onChange={handleCustomerFormChange} placeholder="09xxxxxxxx" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Mật khẩu
                <input name="password" type="password" value={customerForm.password} onChange={handleCustomerFormChange} placeholder="Ít nhất 6 ký tự" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#334155' }}>
                <input name="isActive" type="checkbox" checked={customerForm.isActive} onChange={handleCustomerFormChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                Kích hoạt tài khoản
              </label>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateCustomerModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleCreateCustomer} disabled={isCreatingCustomer} style={{ padding: '12px 28px', opacity: isCreatingCustomer ? 0.75 : 1, cursor: isCreatingCustomer ? 'not-allowed' : 'pointer' }}>
                {isCreatingCustomer ? 'Đang tạo...' : 'Tạo khách hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && (
        <div className="modal-overlay" onClick={() => setShowEditUserModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '32px', borderRadius: '22px',
            width: '95%', maxWidth: '520px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Sửa thông tin</h2>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.9rem' }}>{selectedUser?.name}</p>
              </div>
              <button onClick={() => setShowEditUserModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Họ tên
                <input name="fullName" value={editUserForm.fullName} onChange={handleEditUserFormChange} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Email
                <input name="email" value={editUserForm.email} onChange={handleEditUserFormChange} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Số điện thoại
                <input name="phone" value={editUserForm.phone} onChange={handleEditUserFormChange} style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#334155' }}>
                <input name="isActive" type="checkbox" checked={editUserForm.isActive} onChange={handleEditUserFormChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                Tài khoản đang hoạt động
              </label>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditUserModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSaveUser} disabled={isSavingUser} style={{ padding: '12px 28px', opacity: isSavingUser ? 0.75 : 1, cursor: isSavingUser ? 'not-allowed' : 'pointer' }}>
                {isSavingUser ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '32px', borderRadius: '22px',
            width: '95%', maxWidth: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Đổi mật khẩu</h2>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.9rem' }}>{selectedUser?.name}</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#64748b" />
              </button>
            </div>

            <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
              Mật khẩu mới
              <input type="password" value={passwordForm.password} onChange={handlePasswordFormChange} placeholder="Ít nhất 6 ký tự" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
            </label>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPasswordModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleUpdatePassword} disabled={isUpdatingPassword} style={{ padding: '12px 28px', opacity: isUpdatingPassword ? 0.75 : 1, cursor: isUpdatingPassword ? 'not-allowed' : 'pointer' }}>
                {isUpdatingPassword ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      <style jsx="true">{`
        .menu-action {
          width: 100%;
          border: none;
          background: white;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 0.86rem;
          cursor: pointer;
          text-align: left;
        }

        .menu-action:hover {
          background: #f8fafc;
          color: #2563eb;
        }

        .menu-action.danger {
          color: #ef4444;
        }

        .menu-action.danger:hover {
          background: #fef2f2;
        }
      `}</style>

    </div>
  );
};

export default UserManagement;

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  UserX, 
  UserCheck, 
  Mail, 
  Phone, 
  Calendar,
  ChevronRight,
  ArrowUpDown,
  Lock,
  Unlock,
  Key,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api, { getApiErrorMessage } from '../../lib/api';

const UserManagement = () => {
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Form states
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
  });

  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    isActive: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    password: '',
  });

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/api/users/admin');
      const rawUsers = response.data?.data || [];
      
      const mapped = rawUsers.map(user => ({
        id: user._id,
        name: user.fullName || 'Khách hàng',
        email: user.email ? (user.email.length > 20 ? user.email.substring(0, 17) + '...' : user.email) : 'Chưa cập nhật',
        rawEmail: user.email || '',
        phone: user.phone || 'Chưa có',
        rawPhone: user.phone || '',
        role: user.role === 'admin' ? 'Admin' : (user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'),
        status: user.isActive ? 'Hoạt động' : 'Bị khóa',
        isActive: user.isActive,
        joinedDate: new Date(user.createdAt).toLocaleDateString('vi-VN'),
        spent: user.isVIP ? 'VIP' : 'Thường', // Legacy mapping
        isVIP: user.isVIP,
        avatar: user.avatar || null
      }));
      
      setUsersData(mapped);
    } catch (error) {
      setLoadError(getApiErrorMessage(error, 'Không thể tải danh sách người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleActionClick = async (actionName, user = null) => {
    if (actionName === 'Xem chi tiết' && user) {
      setSelectedUser(user);
      setShowDetailModal(true);
      
      // Fetch real order history
      setIsLoadingOrders(true);
      try {
        const response = await api.get('/api/admin/orders', { params: { user: user.id } });
        setUserOrders(response.data?.data || []);
      } catch (error) {
        console.error('Lỗi tải lịch sử mua hàng:', error);
        setUserOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    } else {
      alert(`Chức năng ${actionName} đang được phát triển.`);
    }
  };

  const toggleUserStatus = async (user) => {
    const nextIsActive = !user.isActive;

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
    setIsSavingUser(true);
    try {
      await api.put(`/api/users/admin/${selectedUser.id}`, {
        fullName: editUserForm.fullName,
        email: editUserForm.email,
        phone: editUserForm.phone,
        isActive: editUserForm.isActive,
      });
      await loadUsers();
      setShowEditUserModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật thông tin người dùng.'));
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!selectedUser || !passwordForm.password) return;
    if (passwordForm.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await api.put(`/api/users/admin/${selectedUser.id}/password`, {
        password: passwordForm.password,
      });
      alert('Đã cập nhật mật khẩu thành công.');
      setShowPasswordModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật mật khẩu.'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendPromoEmail = async () => {
    if (!selectedUser?.rawEmail) {
      alert('Người dùng này chưa có địa chỉ email.');
      return;
    }

    setIsSendingEmail(true);
    try {
      const response = await api.post('/api/admin/users/promo-email', {
        userId: selectedUser.id,
        subject: 'Ưu đãi đặc biệt từ PhoneSin Mobile',
        content: `Chào ${selectedUser.name}, chúng tôi có một ưu đãi đặc biệt dành riêng cho bạn. Hãy ghé thăm cửa hàng ngay hôm nay nhé!`
      });
      alert(response.data?.message || 'Đã gửi email ưu đãi thành công!');
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể gửi email ưu đãi.'));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Khóa tài khoản ${user.name} và ẩn khỏi danh sách hiện tại? Dữ liệu vẫn được giữ trong hệ thống.`)) {
      try {
        await api.delete(`/api/users/admin/${user.id}`);
        setUsersData(usersData.filter(item => item.id !== user.id));
        setActiveMenuId(null);
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể khóa người dùng.'));
      }
    }
  };

  // Filter and Sort Logic
  const filteredUsers = usersData.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.rawEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'Tất cả' || user.status === statusFilter;
    const matchesTab = activeTab === 'customers' ? user.role === 'Khách hàng' : user.role !== 'Khách hàng';

    return matchesSearch && matchesStatus && matchesTab;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.joinedDate) - new Date(a.joinedDate);
    return new Date(a.joinedDate) - new Date(b.joinedDate);
  });

  // Calculate pages
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const displayedUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  const customerCount = usersData.filter(u => u.role === 'Khách hàng').length;
  const staffCount = usersData.filter(u => u.role !== 'Khách hàng').length;

  const exportToExcel = () => {
    if (usersData.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const exportData = usersData.map(u => ({
      'ID': u.id,
      'Họ tên': u.name,
      'Email': u.rawEmail,
      'Số điện thoại': u.rawPhone,
      'Vai trò': u.role,
      'Trạng thái': u.status,
      'Ngày tham gia': u.joinedDate,
      'VIP': u.isVIP ? 'Có' : 'Không'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Người dùng');
    
    XLSX.writeFile(workbook, 'Danh_sach_nguoi_dung_PhoneSin.xlsx');
  };

  // Permission Matrix Logic
  const [selectedRole, setSelectedRole] = useState('Nhân viên');
  const modules = ['Sản phẩm', 'Đơn hàng', 'Khách hàng', 'Khuyến mãi', 'Nội dung'];
  const actions = [
    { label: 'Xem', key: 'view' },
    { label: 'Thêm', key: 'create' },
    { label: 'Sửa', key: 'edit' },
    { label: 'Xóa', key: 'delete' }
  ];

  const [rolePermissions, setRolePermissions] = useState({
    'Admin': modules.reduce((acc, mod) => ({
      ...acc,
      [mod]: actions.reduce((a, act) => ({ ...a, [act.key]: true }), {})
    }), {}),
    'Nhân viên': modules.reduce((acc, mod) => ({
      ...acc,
      [mod]: actions.reduce((a, act) => ({ ...a, [act.key]: mod === 'Khách hàng' ? false : true }), {})
    }), {}),
    'Biên tập viên': modules.reduce((acc, mod) => ({
      ...acc,
      [mod]: actions.reduce((a, act) => ({ ...a, [act.key]: mod === 'Nội dung' }), {})
    }), {})
  });

  const handlePermissionChange = (role, module, action) => {
    if (role === 'Admin') return; // Admin always has full access
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

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Người dùng</h1>
          <p className="page-subtitle">Kiểm soát quyền truy cập, thông tin khách hàng và nhân viên hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={exportToExcel} style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <Download size={18} />
            Xuất Excel
          </button>
          <button className="btn-outline" onClick={openCreateCustomerModal}>
            <UserPlus size={18} />
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
              <option value="Bị khóa">Bị khóa</option>
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
                <th>VIP</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : displayedUsers.length > 0 ? (
                displayedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar">
                          {user.avatar ? <img src={user.avatar} alt="" /> : user.name.charAt(0)}
                        </div>
                        <div className="user-text">
                          <span className="user-name-bold">{user.name}</span>
                          <span className="user-id">ID: {user.id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <div className="contact-item"><Mail size={12} /> {user.email}</div>
                        <div className="contact-item"><Phone size={12} /> {user.phone}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isVIP && (
                        <span style={{ 
                          background: '#fff7ed', color: '#ea580c', padding: '4px 8px', 
                          borderRadius: '6px', fontSize: '11px', fontWeight: '800', border: '1px solid #ffedd5' 
                        }}>VIP</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`status-dot ${user.status === 'Hoạt động' ? 'active' : 'locked'}`}></span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: user.status === 'Hoạt động' ? '#10b981' : '#ef4444' }}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td><div className="joined-date">{user.joinedDate}</div></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn view" title="Lịch sử mua hàng" onClick={() => handleActionClick('Xem chi tiết', user)}><ChevronRight size={18} /></button>
                        <div style={{ position: 'relative' }}>
                          <button 
                            className={`action-btn more ${activeMenuId === user.id ? 'active' : ''}`}
                            onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenuId === user.id && (
                            <div className="action-menu card">
                              <button className="menu-action" onClick={() => openEditUserModal(user)}>
                                <Edit3 size={14} /> Sửa thông tin
                              </button>
                              <button className="menu-action" onClick={() => toggleUserStatus(user)}>
                                {user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                                {user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                              </button>
                              <button className="menu-action" onClick={() => openPasswordModal(user)}>
                                <Key size={14} /> Đổi mật khẩu
                              </button>
                              <div className="menu-divider"></div>
                              <button className="menu-action danger" onClick={() => handleDeleteUser(user)}>
                                <Trash2 size={14} /> Xóa tài khoản
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '15px 20px', 
          borderTop: '1px solid #f1f5f9',
          background: '#f8fafc',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {sortedUsers.length > 0 ? indexOfFirstUser + 1 : 0} - {Math.min(indexOfLastUser, sortedUsers.length)} trong {sortedUsers.length} người dùng
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#1e293b' }}
            >
              Trước
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
              Trang {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage >= totalPages ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? '#94a3b8' : '#1e293b' }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

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
                        <div style={{ fontWeight: '600' }}>{selectedUser.rawEmail}</div>
                     </div>
                     <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                        <div style={{ fontWeight: '600' }}>{selectedUser.rawPhone}</div>
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
                      <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#2563eb' }}>
                        Tổng chi tiêu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                      </span>
                  </h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', minHeight: '150px' }}>
                      {isLoadingOrders ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải lịch sử...</div>
                      ) : userOrders.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                          <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Mã đơn</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Sản phẩm</th>
                                <th style={{ textAlign: 'right', padding: '12px' }}>Giá trị</th>
                                <th style={{ textAlign: 'center', padding: '12px' }}>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userOrders.map(order => (
                                <tr key={order._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                                  <td style={{ padding: '12px', color: '#2563eb', fontWeight: '600' }}>#{order._id.slice(-6).toUpperCase()}</td>
                                  <td style={{ padding: '12px' }}>
                                    {order.items?.[0]?.name || 'Không rõ'}
                                    {order.items?.length > 1 && ` (+${order.items.length - 1})`}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                  </td>
                                  <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{ 
                                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                      background: order.status === 'delivered' ? '#dcfce7' : '#fee2e2',
                                      color: order.status === 'delivered' ? '#166534' : '#991b1b'
                                    }}>
                                      {order.status === 'delivered' ? 'Đã giao' : 'Đang xử lý'}
                                    </span>
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch sử mua hàng.</div>
                      )}
                  </div>
               </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '20px 30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
               <button onClick={() => setShowDetailModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Đóng</button>
               <button 
                  className="btn-primary" 
                  style={{ padding: '10px 25px', opacity: isSendingEmail ? 0.7 : 1, cursor: isSendingEmail ? 'not-allowed' : 'pointer' }}
                  onClick={handleSendPromoEmail}
                  disabled={isSendingEmail}
               >
                  {isSendingEmail ? 'Đang gửi...' : 'Gửi email ưu đãi'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals (Edit, Password, Permission, Create) would go here - omitted for brevity but they exist in the original file */}
      
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

            <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155', position: 'relative' }}>
              Mật khẩu mới
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={passwordForm.password} 
                  onChange={handlePasswordFormChange} 
                  placeholder="Ít nhất 6 ký tự" 
                  style={{ padding: '12px 14px', paddingRight: '45px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', width: '100%' }} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', 
                    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' 
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
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

      {showCreateCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCustomerModal(false)} style={{
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Tạo khách hàng mới</h2>
                <p style={{ color: '#64748b', marginTop: '5px', fontSize: '0.9rem' }}>Nhập thông tin để đăng ký tài khoản cho khách hàng.</p>
              </div>
              <button onClick={() => setShowCreateCustomerModal(false)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={22} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Họ tên
                <input name="fullName" value={customerForm.fullName} onChange={handleCustomerFormChange} placeholder="Nguyễn Văn A" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Email
                <input name="email" value={customerForm.email} onChange={handleCustomerFormChange} placeholder="example@gmail.com" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Số điện thoại
                <input name="phone" value={customerForm.phone} onChange={handleCustomerFormChange} placeholder="0901234567" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', gap: '8px', fontWeight: 700, color: '#334155' }}>
                Mật khẩu khởi tạo
                <input name="password" type="password" value={customerForm.password} onChange={handleCustomerFormChange} placeholder="Ít nhất 6 ký tự" style={{ padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#334155' }}>
                <input name="isActive" type="checkbox" checked={customerForm.isActive} onChange={handleCustomerFormChange} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                Kích hoạt tài khoản ngay
              </label>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCreateCustomerModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', color: '#475569' }}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleCreateCustomer} disabled={isCreatingCustomer} style={{ padding: '12px 28px', opacity: isCreatingCustomer ? 0.75 : 1, cursor: isCreatingCustomer ? 'not-allowed' : 'pointer' }}>
                {isCreatingCustomer ? 'Đang xử lý...' : 'Tạo khách hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .management-container {
          animation: fadeIn 0.4s ease-out;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #0f172a;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          margin: 5px 0 0 0;
          font-size: 1rem;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
          transform: translateY(-2px);
        }

        .btn-outline {
          background: white;
          color: #2563eb;
          border: 2px solid #2563eb;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          background: #eff6ff;
        }

        .card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #f1f5f9;
        }

        .user-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: #2563eb;
          color: white;
        }

        .filters-bar {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 12px;
          width: 350px;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          border-radius: 12px;
        }

        .filter-item select {
          border: none;
          outline: none;
          font-weight: 600;
          color: #475569;
          background: transparent;
          cursor: pointer;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          padding: 18px 20px;
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-table td {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #f1f5f9;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          overflow: hidden;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-name-bold {
          display: block;
          font-weight: 800;
          color: #0f172a;
          font-size: 0.95rem;
        }

        .user-id {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #475569;
          font-weight: 600;
        }

        .role-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .role-badge.admin { background: #fee2e2; color: #ef4444; }
        .role-badge.nhân viên { background: #fef9c3; color: #a16207; }
        .role-badge.khách hàng { background: #dcfce7; color: #166534; }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.active { background: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15); }
        .status-dot.locked { background: #ef4444; box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15); }

        .joined-date {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #f8fafc;
          border-color: #2563eb;
          color: #2563eb;
        }

        .action-btn.view:hover {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .action-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 200px;
          z-index: 50;
          padding: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.2s ease-out;
        }

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

        .menu-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 6px 0;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .status-pill.active { background: #dcfce7; color: #166534; }
        .status-pill.locked { background: #fee2e2; color: #991b1b; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;

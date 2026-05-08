import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Search, 
  Filter,
  Calendar,
  Zap,
  Tag,
  Percent,
  X
} from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';

const typeLabels = {
  fixed: 'Giảm tiền',
  percentage: 'Phần trăm',
};

const typeValues = {
  'Giảm tiền': 'fixed',
  'Vận chuyển': 'fixed',
  'Phần trăm': 'percentage',
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const mapVoucherForAdmin = (voucher = {}) => ({
  id: voucher._id || voucher.id,
  code: voucher.code || '',
  type: typeLabels[voucher.discountType] || 'Giảm tiền',
  discountType: voucher.discountType || 'fixed',
  value: Number(voucher.discountValue || 0),
  minSpend: Number(voucher.minOrderValue || 0),
  maxDiscount: Number(voucher.maxDiscount || 0),
  used: Number(voucher.usedCount || 0),
  total: Number(voucher.usageLimit || 0),
  usageLimitPerUser: Number(voucher.usageLimitPerUser || 1),
  expiry: toDateInput(voucher.expiresAt),
  status: voucher.status || (voucher.isActive === false ? 'Tạm tắt' : 'Hoạt động'),
  isActive: voucher.isActive !== false,
});

const PromotionManagement = () => {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    code: '', type: 'Giảm tiền', value: '', minSpend: '', total: '', expiry: '', isActive: true
  });

  const loadPromos = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await api.get('/api/voucher/admin');
      setPromos((response.data?.data || []).map(mapVoucherForAdmin));
      setLoadError('');
    } catch (error) {
      setPromos([]);
      setLoadError(getApiErrorMessage(error, 'Không thể tải mã khuyến mãi từ database.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  // Derived Stats
  const stats = useMemo(() => {
    const active = promos.filter(p => p.status === 'Hoạt động').length;
    const totalUsed = promos.reduce((sum, p) => sum + p.used, 0);
    const totalSaved = promos.reduce((sum, p) => {
      const val = p.type === 'Phần trăm' ? (p.value * 1000000 / 100) : (p.value * p.used);
      return sum + val;
    }, 0);
    return { active, totalUsed, totalSaved: (totalSaved / 1000000).toFixed(1) };
  }, [promos]);

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minSpend: promo.minSpend,
        total: promo.total,
        expiry: promo.expiry,
        isActive: promo.isActive,
      });
    } else {
      setEditingPromo(null);
      setFormData({ code: '', type: 'Giảm tiền', value: '', minSpend: 0, total: 0, expiry: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.value || !formData.expiry) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    const cleanData = {
      ...formData,
      value: Math.max(0, Number(formData.value) || 0),
      minSpend: Math.max(0, Number(formData.minSpend) || 0),
      total: Math.max(0, Number(formData.total) || 0)
    };

    const payload = {
      code: cleanData.code,
      discountType: typeValues[cleanData.type] || 'fixed',
      discountValue: cleanData.value,
      minOrderValue: cleanData.minSpend,
      usageLimit: cleanData.total,
      expiresAt: cleanData.expiry,
      isActive: cleanData.isActive,
    };

    setIsSaving(true);

    try {
      if (editingPromo) {
        await api.put(`/api/voucher/admin/${editingPromo.id}`, payload);
      } else {
        await api.post('/api/voucher/admin', payload);
      }

      await loadPromos();
      setShowModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể lưu mã khuyến mãi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      try {
        await api.delete(`/api/voucher/admin/${id}`);
        setPromos(promos.filter(p => p.id !== id));
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể xóa mã khuyến mãi.'));
      }
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã: ${code}`);
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Khuyến mãi</h1>
          <p className="page-subtitle">Tạo mã giảm giá, chương trình ưu đãi và voucher cho khách hàng.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Tạo mã mới
        </button>
      </div>

      <div className="promo-stats-grid">
        <div className="p-stat-card">
          <div className="p-stat-icon zap"><Zap size={20} /></div>
          <div className="p-stat-info">
            <span className="p-stat-label">Mã đang chạy</span>
            <span className="p-stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="p-stat-card">
          <div className="p-stat-icon usage"><Ticket size={20} /></div>
          <div className="p-stat-info">
            <span className="p-stat-label">Tổng lượt dùng</span>
            <span className="p-stat-value">{stats.totalUsed.toLocaleString()}</span>
          </div>
        </div>
        <div className="p-stat-card">
          <div className="p-stat-icon saving"><Percent size={20} /></div>
          <div className="p-stat-info">
            <span className="p-stat-label">Tiết kiệm cho khách</span>
            <span className="p-stat-value">{stats.totalSaved}M ₫</span>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="filters-bar no-shadow">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm theo mã giảm giá..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã / Loại</th>
                <th>Giá trị</th>
                <th>Điều kiện tối thiểu</th>
                <th>Đã dùng</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromos.length > 0 ? filteredPromos.map((promo) => (
                <tr key={promo.id}>
                  <td>
                    <div className="promo-code-container">
                      <div className="coupon-icon"><Tag size={16} /></div>
                      <div>
                        <span className="promo-code-text">{promo.code}</span>
                        <span className="promo-type">{promo.type}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="promo-value-text">
                      {promo.type === 'Phần trăm' ? `${promo.value}%` : `${promo.value.toLocaleString()} ₫`}
                    </span>
                  </td>
                  <td>{promo.minSpend.toLocaleString()} ₫</td>
                  <td>
                    <div className="usage-progress">
                      <span className="usage-text">
                        {promo.used}/{promo.total === 0 ? '∞' : promo.total}
                      </span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: promo.total === 0 ? '100%' : `${Math.min((promo.used / promo.total) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-display">
                      <Calendar size={14} />
                      {new Date(promo.expiry).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${promo.status === 'Hoạt động' ? 'active' : 'expired'}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" title="Copy mã" onClick={() => copyToClipboard(promo.code)}><Copy size={16} /></button>
                      <button className="action-btn edit" onClick={() => handleOpenModal(promo)}><Edit size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(promo.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    {isLoading ? 'Đang tải mã khuyến mãi từ database...' : loadError || 'Không tìm thấy mã khuyến mãi nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPromo ? 'Chỉnh sửa Khuyến mãi' : 'Tạo mã Khuyến mãi mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label>Mã khuyến mãi *</label>
                  <input 
                    type="text" 
                    placeholder="VD: PHONESIN2026" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="input-group">
                  <label>Loại giảm giá</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option>Giảm tiền</option>
                    <option>Phần trăm</option>
                    <option>Vận chuyển</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Giá trị giảm *</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder={formData.type === 'Phần trăm' ? 'VD: 10' : 'VD: 50000'}
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Đơn tối thiểu (₫)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.minSpend}
                    onChange={e => setFormData({...formData, minSpend: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Tổng lượt dùng (0 = vô hạn)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.total}
                    onChange={e => setFormData({...formData, total: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Ngày hết hạn *</label>
                  <input 
                    type="date" 
                    value={formData.expiry}
                    onChange={e => setFormData({...formData, expiry: e.target.value})}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#334155' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                  Kích hoạt mã
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;

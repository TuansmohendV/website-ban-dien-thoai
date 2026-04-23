import React, { useState, useMemo } from 'react';
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

const initialPromos = [
  { id: 1, code: 'VOUCHER10', type: 'Giảm tiền', value: 500000, minSpend: 10000000, used: 45, total: 100, expiry: '2026-04-30', status: 'Hoạt động' },
  { id: 2, code: 'SAVE20', type: 'Phần trăm', value: 20, minSpend: 2000000, used: 120, total: 0, expiry: '2026-05-15', status: 'Hoạt động' },
  { id: 3, code: 'FREESHIP', type: 'Vận chuyển', value: 50000, minSpend: 0, used: 890, total: 1000, expiry: '2026-05-01', status: 'Hết hạn' },
  { id: 4, code: 'WELCOME5', type: 'Phần trăm', value: 5, minSpend: 0, used: 12, total: 0, expiry: '2026-12-31', status: 'Hoạt động' },
];

const PromotionManagement = () => {
  const [promos, setPromos] = useState(initialPromos);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    code: '', type: 'Giảm tiền', value: '', minSpend: '', total: '', expiry: ''
  });

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
        expiry: promo.expiry
      });
    } else {
      setEditingPromo(null);
      setFormData({ code: '', type: 'Giảm tiền', value: '', minSpend: 0, total: 0, expiry: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
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

    if (editingPromo) {
      setPromos(promos.map(p => p.id === editingPromo.id ? { 
        ...p, 
        ...cleanData,
        status: new Date(formData.expiry) < new Date() ? 'Hết hạn' : 'Hoạt động' 
      } : p));
    } else {
      const newPromo = {
        id: Date.now(),
        ...cleanData,
        used: 0,
        status: new Date(formData.expiry) < new Date() ? 'Hết hạn' : 'Hoạt động'
      };
      setPromos([newPromo, ...promos]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) {
      setPromos(promos.filter(p => p.id !== id));
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
              {filteredPromos.map((promo) => (
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
              ))}
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
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleSave}>Lưu thông tin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;

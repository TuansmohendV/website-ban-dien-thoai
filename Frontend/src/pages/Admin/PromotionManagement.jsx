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
  X,
  ChevronLeft,
  ChevronRight
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
  isHuntedOnly: voucher.isHuntedOnly === true,
  missionTask: voucher.missionTask || '',
});

const PromotionManagement = () => {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [isLoadingProofs, setIsLoadingProofs] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessingReview, setIsProcessingReview] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const promosPerPage = 10;
  
  const [formData, setFormData] = useState({
    code: '', type: 'Giảm tiền', value: '', minSpend: '', total: '', expiry: '', isActive: true,
    isHuntedOnly: false, missionTask: ''
  });

  const loadPromos = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/api/voucher/admin');
      const mappedPromos = (response.data?.data || []).map(mapVoucherForAdmin);
      setPromos(mappedPromos);
    } catch (error) {
      const msg = getApiErrorMessage(error) || 'Failed to load promotions';
      setLoadError(msg);
      console.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPendingProofs = useCallback(async () => {
    setIsLoadingProofs(true);
    try {
      const response = await api.get('/api/voucher/admin/pending-proofs');
      setPendingProofs(response.data?.data || []);
    } catch (error) {
      console.error('Failed to load pending proofs:', error);
    } finally {
      setIsLoadingProofs(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
    loadPendingProofs();
  }, [loadPromos, loadPendingProofs]);

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredPromos.length / promosPerPage);
  const currentPromos = filteredPromos.slice(
    (currentPage - 1) * promosPerPage,
    currentPage * promosPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        isHuntedOnly: promo.isHuntedOnly,
        missionTask: promo.missionTask,
      });
    } else {
      setEditingPromo(null);
      setFormData({ 
        code: '', type: 'Giảm tiền', value: '', minSpend: 0, total: 0, expiry: '', isActive: true,
        isHuntedOnly: false, missionTask: ''
      });
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
      isHuntedOnly: cleanData.isHuntedOnly,
      missionTask: cleanData.missionTask,
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

  const handleReview = async (id, status) => {
    setIsProcessingReview(true);
    try {
      await api.post(`/api/voucher/admin/review-proof/${id}`, { status, adminNote: reviewNote });
      alert(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} thành công!`);
      setReviewNote('');
      loadPendingProofs();
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setIsProcessingReview(false);
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={() => setShowReviewModal(true)} style={{ position: 'relative' }}>
            <Zap size={20} className="text-amber-500" />
            Duyệt Voucher {pendingProofs.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>{pendingProofs.length}</span>}
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={20} />
            Tạo mã mới
          </button>
        </div>
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
              {currentPromos.length > 0 ? currentPromos.map((promo) => (
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

        {/* Pagination Footer */}
        {filteredPromos.length > 0 && (
          <div className="table-footer" style={{
            padding: '15px 25px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fcfcfd'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Hiển thị {(currentPage - 1) * promosPerPage + 1}-{Math.min(currentPage * promosPerPage, filteredPromos.length)} trên {filteredPromos.length} mã
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.85rem', fontWeight: '700' }}>
                Trang {currentPage} / {totalPages}
              </span>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '30px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                    />
                    Kích hoạt mã
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isHuntedOnly}
                      onChange={e => setFormData({...formData, isHuntedOnly: e.target.checked})}
                      style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                    />
                    Mã dành cho Săn Voucher
                  </label>
                </div>

                {formData.isHuntedOnly && (
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#ef4444' }}>Mô tả nhiệm vụ (Dành cho thợ săn)</label>
                    <textarea 
                      placeholder="VD: Chia sẻ sản phẩm lên Facebook hoặc Chờ đợi hệ thống xác thực..." 
                      value={formData.missionTask}
                      onChange={e => setFormData({...formData, missionTask: e.target.value})}
                      style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>
                )}
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
      {/* Review Proof Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Phê duyệt minh chứng Săn Voucher</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              {isLoadingProofs ? (
                <p>Đang tải danh sách chờ duyệt...</p>
              ) : pendingProofs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Ticket size={48} style={{ margin: '0 auto 15px', color: '#cbd5e1' }} />
                  <p style={{ color: '#64748b', fontWeight: 600 }}>Không có minh chứng nào đang chờ duyệt.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Voucher</th>
                        <th>Minh chứng</th>
                        <th>Ghi chú Admin</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProofs.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div style={{ fontSize: '13px' }}>
                              <p style={{ fontWeight: 800 }}>{p.user?.fullName}</p>
                              <p style={{ color: '#64748b', fontSize: '11px' }}>{p.user?.phone}</p>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Tag size={14} className="text-emerald-500" />
                              <span style={{ fontWeight: 800 }}>{p.voucher?.code}</span>
                            </div>
                          </td>
                          <td>
                            <a href={p.proofImage} target="_blank" rel="noreferrer" style={{ display: 'block', width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                              <img src={p.proofImage} alt="Proof" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                            </a>
                          </td>
                          <td>
                            <input 
                              type="text" 
                              placeholder="Nhập lý do nếu từ chối..." 
                              value={reviewNote}
                              onChange={(e) => setReviewNote(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                            />
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleReview(p._id, 'approved')}
                                disabled={isProcessingReview}
                                className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-black rounded-lg hover:bg-emerald-600 transition-all"
                              >
                                Duyệt
                              </button>
                              <button 
                                onClick={() => handleReview(p._id, 'rejected')}
                                disabled={isProcessingReview}
                                className="px-3 py-1.5 bg-red-500 text-white text-[11px] font-black rounded-lg hover:bg-red-600 transition-all"
                              >
                                Từ chối
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;

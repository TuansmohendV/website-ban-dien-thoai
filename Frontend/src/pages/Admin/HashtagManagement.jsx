import React, { useState } from 'react';
import { 
  Hash, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Package, 
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';

const HashtagManagement = () => {
  const primaryColor = localStorage.getItem('primaryColor') || '#2563eb';
  const [showModal, setShowModal] = useState(false);
  const [editingHashtag, setEditingHashtag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [hashtags, setHashtags] = useState([
    { id: 1, name: 'iPhone15', usageCount: 245, trend: '+12%', products: ['iPhone 15 Pro Max', 'iPhone 15 Plus'], date: '22/04/2026' },
    { id: 2, name: 'GiamGiaSoc', usageCount: 156, trend: '+45%', products: ['Samsung S24 Ultra', 'Oppo Reno 11'], date: '21/04/2026' },
    { id: 3, name: 'TraGop0%', usageCount: 890, trend: '+5%', products: ['Tất cả điện thoại'], date: '20/04/2026' },
    { id: 4, name: 'BaoHanh2Nam', usageCount: 320, trend: '+8%', products: ['Xiaomi 14', 'Redmi Note 13'], date: '19/04/2026' },
  ]);

  const [formData, setFormData] = useState({ name: '' });

  const handleOpenModal = (hashtag = null) => {
    if (hashtag) {
      setEditingHashtag(hashtag);
      setFormData({ name: hashtag.name });
    } else {
      setEditingHashtag(null);
      setFormData({ name: '' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingHashtag) {
      setHashtags(hashtags.map(h => h.id === editingHashtag.id ? { ...h, name: formData.name.replace(/\s+/g, '') } : h));
    } else {
      const newHashtag = {
        id: Date.now(),
        name: formData.name.replace(/\s+/g, ''),
        usageCount: 0,
        trend: 'New',
        products: [],
        date: new Date().toLocaleDateString('vi-VN')
      };
      setHashtags([newHashtag, ...hashtags]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Xóa hashtag này khỏi giao diện? (Dữ liệu gốc vẫn còn)')) {
      setHashtags(hashtags.filter(h => h.id !== id));
    }
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Hashtag</h1>
          <p className="page-subtitle" style={{ color: '#1e3a8a' }}>Quản lý các thẻ từ khóa giúp phân loại sản phẩm và tối ưu hóa tìm kiếm.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ background: primaryColor }}>
          <Plus size={20} />
          Thêm Hashtag mới
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '25px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Hash size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng số Hashtag</span>
            <h2 className="stat-value">{hashtags.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}><TrendingUp size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Xu hướng (Tháng này)</span>
            <h2 className="stat-value">#GiamGiaSoc</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><Package size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Sản phẩm có tag</span>
            <h2 className="stat-value">1,240</h2>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="filters-bar no-shadow">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm hashtag..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hashtag</th>
                <th>Độ phổ biến (Lượt dùng)</th>
                <th>Xu hướng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filtered = hashtags.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const displayed = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                if (displayed.length === 0) {
                  return (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        Không tìm thấy hashtag nào.
                      </td>
                    </tr>
                  );
                }

                return displayed.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: primaryColor }}>
                        <Hash size={16} />
                        {h.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', maxWidth: '100px' }}>
                          <div style={{ width: `${Math.min((h.usageCount / 1000) * 100, 100)}%`, height: '100%', background: primaryColor, borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748b' }}>{h.usageCount}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: h.trend.startsWith('+') ? '#10b981' : '#64748b', fontWeight: '700', fontSize: '13px' }}>
                        {h.trend}
                      </span>
                    </td>
                    <td><span style={{ fontSize: '13px', color: '#64748b' }}>{h.date}</span></td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => handleOpenModal(h)} title="Sửa tên"><Edit size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(h.id)} title="Xóa"><Trash2 size={16} /></button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '5px 12px', fontSize: '12px', background: `${primaryColor}15`, color: primaryColor, boxShadow: 'none' }}
                          onClick={() => {
                            alert(`Hashtag #${h.name} đang được sử dụng cho:\n${h.products.length > 0 ? h.products.join('\n') : 'Chưa có sản phẩm nào'}`);
                          }}
                        >
                          Xem sản phẩm
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination Bar */}
        {(() => {
          const filtered = hashtags.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
          const totalPages = Math.ceil(filtered.length / itemsPerPage);

          return (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '15px 25px', 
              borderTop: '1px solid #f1f5f9',
              background: 'white',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} - {Math.min(currentPage * itemsPerPage, filtered.length)} trên {filtered.length} hashtag
              </span>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
                >
                  Trước
                </button>
                
                {(() => {
                  const pages = [];
                  const minPagesToShow = 10;
                  let start = 1;
                  let end = Math.max(minPagesToShow, totalPages);
                  
                  if (totalPages > minPagesToShow && currentPage > 6) {
                    start = Math.max(1, currentPage - 5);
                    end = Math.min(totalPages, start + 9);
                    if (end - start < 9) start = Math.max(1, end - 9);
                  } else if (totalPages > minPagesToShow) {
                    end = 10;
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        style={{ 
                          minWidth: '40px', height: '40px', borderRadius: '8px', border: '1px solid',
                          borderColor: currentPage === i ? primaryColor : '#e2e8f0',
                          background: currentPage === i ? primaryColor : 'white',
                          color: currentPage === i ? 'white' : '#64748b',
                          fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(Math.max(10, totalPages), p + 1))}
                  disabled={currentPage >= Math.max(10, totalPages)}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage >= Math.max(10, totalPages) ? '#f8fafc' : 'white', cursor: currentPage >= Math.max(10, totalPages) ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
                >
                  Sau
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Hashtag Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>{editingHashtag ? 'Chỉnh sửa Hashtag' : 'Thêm Hashtag mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Tên Hashtag (Viết liền, không dấu)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: '700' }}>#</span>
                  <input 
                    type="text" 
                    style={{ paddingLeft: '25px' }}
                    placeholder="VD: iPhone15Pro" 
                    value={formData.name}
                    onChange={e => setFormData({ name: e.target.value.replace(/\s+/g, '') })}
                  />
                </div>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>Hashtag sẽ được sử dụng để lọc sản phẩm trên website.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleSave} style={{ background: primaryColor }}>Lưu Hashtag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagManagement;

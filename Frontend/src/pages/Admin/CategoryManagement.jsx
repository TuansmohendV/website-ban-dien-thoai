import React, { useCallback, useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  Layers,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';

const buildSlug = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const mapCategoryForAdmin = (category = {}) => ({
  id: category._id || category.id || category.slug,
  name: category.name || 'Chưa đặt tên',
  slug: category.slug || buildSlug(category.name),
  productCount: Number(category.productCount || 0),
  subCategories: category.subCategories || [],
  icon: category.icon || category.iconCode || '',
  isDerived: Boolean(category.isDerived),
});

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);

  const [iconLibrary, setIconLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '' });

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const response = await api.get('/api/categories', {
        params: { includeInactive: true, includeDerived: true },
      });
      setCategories((response.data?.data || []).map(mapCategoryForAdmin));
    } catch (error) {
      setCategories([]);
      setLoadError(getApiErrorMessage(error, 'Không thể tải danh mục từ database.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load latest icons from library
  useEffect(() => {
    const saved = localStorage.getItem('admin_icon_library');
    if (saved) setIconLibrary(JSON.parse(saved));
  }, [showModal]); // Refresh when modal opens

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || '' });
    } else {
      setEditingCat(null);
      setFormData({ name: '', slug: '', icon: '' });
    }
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' ? buildSlug(value) : prev.slug
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return alert('Vui lòng nhập tên danh mục');

    const payload = {
      name: formData.name.trim(),
      slug: formData.slug || buildSlug(formData.name),
      icon: formData.icon.trim(),
    };

    setIsSaving(true);

    try {
      if (editingCat && !editingCat.isDerived) {
        await api.put(`/api/categories/${editingCat.id}`, payload);
      } else {
        await api.post('/api/categories', payload);
      }

      await loadCategories();
      setShowModal(false);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể lưu danh mục.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.isDerived) {
      alert('Danh mục này đang được suy ra từ sản phẩm trong database. Hãy tạo danh mục chính thức trước khi xóa.');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.delete(`/api/categories/${cat.id}`);
        setCategories(categories.filter(c => c.id !== cat.id));
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể xóa danh mục.'));
      }
    }
  };

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (iconCode) => {
    const found = iconLibrary.find(i => i.id === iconCode);
    if (found) return <img src={found.url} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />;
    return <Layers size={18} color="#94a3b8" />;
  };

  const currentIconPreview = iconLibrary.find(i => i.id === formData.icon);

  return (
    <div className="management-container">
      <div className="header-actions" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Quản lý Danh mục</h1>
          <p className="page-subtitle" style={{ margin: '5px 0 0', color: '#64748b' }}>Sử dụng mã 4 số từ Thư viện Icon để gán biểu tượng.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ padding: '12px 24px', borderRadius: '12px' }}>
          <Plus size={20} />
          Thêm danh mục
        </button>
      </div>

      <div className="category-content-layout" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div className="card no-padding">
          <div className="filters-bar" style={{ padding: '15px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <div className="search-box" style={{ 
                display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', 
                padding: '10px 15px', borderRadius: '10px', width: '100%', maxWidth: '400px'
              }}>
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" placeholder="Tìm kiếm danh mục..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', marginLeft: '10px', width: '100%' }} 
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '20px' }}>Icon</th>
                  <th>Tên danh mục</th>
                  <th>Đường dẫn (Slug)</th>
                  <th>Mã Icon</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCats.length > 0 ? filteredCats.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ paddingLeft: '20px' }}>
                      <div className="cat-icon" style={{ backgroundColor: '#eff6ff' }}>
                         {getIcon(cat.icon)}
                      </div>
                    </td>
                    <td>
                      <span className="cat-name-text">{cat.name}</span>
                      {cat.isDerived && (
                        <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
                          Tự nhận từ sản phẩm
                        </span>
                      )}
                    </td>
                    <td><code className="slug-code">/{cat.slug}</code></td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#2563eb' }}>#{cat.icon || 'Chưa gán'}</span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      <div className="actions-cell" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="action-btn edit" onClick={() => handleOpenModal(cat)}><Edit size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(cat)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      {isLoading ? 'Đang tải danh mục từ database...' : loadError || 'Không tìm thấy danh mục nào.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
           <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '25px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Hệ thống Quản lý Asset</h4>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Biểu tượng được quản lý tập trung qua mã 4 số bảo mật và tối ưu dung lượng.</p>
              </div>
           </div>
           
           <Link to="/admin/icons" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', border: '1px dashed #2563eb' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ExternalLink size={28} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Đi tới Thư viện Icon</h4>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Quản lý, tải lên và lấy mã code cho các biểu tượng của bạn tại đây.</p>
              </div>
           </Link>
        </div>
      </div>

      {/* Category Modal refactored for Code Entry */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-content" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '450px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{editingCat ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tên danh mục *</label>
                <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Ví dụ: Ốp lưng iPhone" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                 <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Gán biểu tượng (Nhập mã 4 số)</label>
                 <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input 
                      name="icon" 
                      value={formData.icon} 
                      onChange={handleInputChange} 
                      type="text" 
                      maxLength="4"
                      placeholder="Gõ mã 4 số..." 
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1.1rem', fontWeight: '700', color: '#2563eb', textAlign: 'center', letterSpacing: '2px' }} 
                    />
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '12px', 
                      background: currentIconPreview ? '#f0f9ff' : '#f8fafc',
                      border: `2px solid ${currentIconPreview ? '#2563eb' : '#e2e8f0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {currentIconPreview ? (
                        <img src={currentIconPreview.url} alt="" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                      ) : (
                        <Layers size={24} color="#cbd5e1" />
                      )}
                    </div>
                 </div>
                 <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                    * Xem mã code tại <Link to="/admin/icons" style={{ color: '#2563eb', fontWeight: '600' }}>Thư viện Icon</Link>
                 </p>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleSave} disabled={isSaving} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '700', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.75 : 1 }}>
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .cat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cat-name-text { font-weight: 600; color: #1e293b; font-size: 1rem; }
        .slug-code {
          background: #f8fafc;
          padding: 4px 10px;
          border-radius: 6px;
          color: #64748b;
          font-size: 0.85rem;
          border: 1px solid #f1f5f9;
        }
        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.edit { background: #f1f5f9; color: #475569; }
        .action-btn.delete { background: #fef2f2; color: #ef4444; }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(0.95); }
      `}</style>
    </div>
  );
};

export default CategoryManagement;

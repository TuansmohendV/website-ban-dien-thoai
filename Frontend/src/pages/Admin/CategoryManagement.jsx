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
  ShieldCheck,
  Eye,
  EyeOff,
  Star,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Link, useLocation } from 'react-router-dom';
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
  isActive: category.isActive !== false,
  isFeatured: Boolean(category.isFeatured),
});

const extractIconArray = (payload = {}) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.icons)) return payload.data.icons;
  if (Array.isArray(payload?.icons)) return payload.icons;
  return [];
};

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
  const location = useLocation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const catsPerPage = 10;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [location.search]);

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
    const loadIconLibrary = async () => {
      try {
        const response = await api.get('/api/admin/icons', {
          params: { page: 1, limit: 200 },
        });
        const icons = extractIconArray(response.data).map((icon) => ({
          id: icon._id || icon.id || '',
          url: icon.url || '',
          name: icon.name || '',
        }));
        setIconLibrary(icons);
        localStorage.setItem('admin_icon_library', JSON.stringify(icons));
      } catch {
        try {
          const publicResponse = await api.get('/api/icons/public');
          const icons = extractIconArray(publicResponse.data).map((icon) => ({
            id: icon._id || icon.id || '',
            url: icon.url || '',
            name: icon.name || '',
          }));
          setIconLibrary(icons);
          localStorage.setItem('admin_icon_library', JSON.stringify(icons));
        } catch {
          const saved = localStorage.getItem('admin_icon_library');
          if (saved) {
            setIconLibrary(JSON.parse(saved));
          } else {
            setIconLibrary([]);
          }
        }
      }
    };

    loadIconLibrary();
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
      alert('Danh mục này đang được suy ra từ sản phẩm trong database. Hãy tạo danh mục chính thức trước khi ẩn.');
      return;
    }

    if (window.confirm('Ẩn danh mục này khỏi giao diện? Dữ liệu vẫn được giữ trong hệ thống.')) {
      try {
        await api.delete(`/api/categories/${cat.id}`);
        setCategories(categories.filter(c => c.id !== cat.id));
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể ẩn danh mục.'));
      }
    }
  };

  const toggleStatus = async (cat) => {
    if (cat.isDerived) return alert('Không thể ẩn danh mục tự nhận. Hãy tạo danh mục chính thức.');
    
    try {
      const newStatus = !cat.isActive;
      await api.put(`/api/categories/${cat.id}`, { isActive: newStatus });
      setCategories(categories.map(c => c.id === cat.id ? { ...c, isActive: newStatus } : c));
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật trạng thái.'));
    }
  };

  const toggleFeatured = async (cat) => {
    if (cat.isDerived) return alert('Không thể đánh dấu nổi bật danh mục tự nhận. Hãy tạo danh mục chính thức.');
    
    try {
      const newFeatured = !cat.isFeatured;
      await api.put(`/api/categories/${cat.id}`, { isFeatured: newFeatured });
      setCategories(categories.map(c => c.id === cat.id ? { ...c, isFeatured: newFeatured } : c));
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật trạng thái nổi bật.'));
    }
  };

  const filteredCats = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCats.length / catsPerPage);
  const indexOfLastCat = currentPage * catsPerPage;
  const indexOfFirstCat = indexOfLastCat - catsPerPage;
  const displayedCats = filteredCats.slice(indexOfFirstCat, indexOfLastCat);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const exportToExcel = () => {
    if (categories.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const exportData = categories.map(c => ({
      'ID Danh mục': c.id,
      'Tên danh mục': c.name,
      'Đường dẫn (Slug)': c.slug,
      'Mã Icon': c.icon || 'Chưa gán',
      'Số sản phẩm': c.productCount || 0,
      'Trạng thái': c.isActive ? 'Hiện' : 'Ẩn',
      'Nổi bật': c.isFeatured ? 'Có' : 'Không',
      'Loại': c.isDerived ? 'Tự động' : 'Tạo thủ công'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh mục');
    
    XLSX.writeFile(workbook, 'Danh_sach_danh_muc_PhoneSin.xlsx');
  };

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
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={exportToExcel} style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <Download size={18} />
            Xuất Excel
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ padding: '12px 24px', borderRadius: '12px' }}>
            <Plus size={20} />
            Thêm danh mục
          </button>
        </div>
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
                  <th>Thao tác nhanh</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {displayedCats.length > 0 ? displayedCats.map((cat) => (
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
                    <td>
                      <div className="quick-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className={`qa-btn ${cat.isActive ? 'active' : ''}`} 
                          title={cat.isActive ? 'Ẩn danh mục' : 'Hiện danh mục'}
                          onClick={() => toggleStatus(cat)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0',
                            background: cat.isActive ? '#eff6ff' : 'white', color: cat.isActive ? '#2563eb' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          {cat.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          className={`qa-btn ${cat.isFeatured ? 'active' : ''}`} 
                          title={cat.isFeatured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                          onClick={() => toggleFeatured(cat)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0',
                            background: cat.isFeatured ? '#fff7ed' : 'white', color: cat.isFeatured ? '#f59e0b' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Star size={16} fill={cat.isFeatured ? "#f59e0b" : "none"} />
                        </button>
                      </div>
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
              Hiển thị {filteredCats.length > 0 ? indexOfFirstCat + 1 : 0} - {Math.min(indexOfLastCat, filteredCats.length)} trong {filteredCats.length} danh mục
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

        .qa-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .qa-btn:hover {
          background: #f1f5f9;
          color: #2563eb;
        }

        .qa-btn.active {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }
      `}</style>
    </div>
  );
};

export default CategoryManagement;

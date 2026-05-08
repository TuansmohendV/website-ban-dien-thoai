import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Link as LinkIcon,
  LayoutTemplate,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  MapPin,
  Image as ImageIcon,
  X,
  Upload,
  Link2
} from 'lucide-react';

const BannerManagement = () => {
  const [banners, setBanners] = useState([
    { id: 1, title: 'Siêu sale iPhone 15 Pro Max', type: 'Main Carousel', targetPage: 'Trang chủ', image: 'https://cdn.tgdd.vn/2024/03/banner/800-200-800x200-2.png', link: '/category/iphone', status: 'active', position: 1 },
    { id: 2, title: 'Samsung S24 Ultra - Đặt trước ngay', type: 'Main Carousel', targetPage: 'Trang chủ', image: 'https://cdn.tgdd.vn/2024/04/banner/S24-800-200-800x200.png', link: '/category/samsung', status: 'active', position: 2 },
    { id: 3, title: 'Thu cũ đổi mới - Trợ giá 2 triệu', type: 'Sub Banner', targetPage: 'Trang chủ', image: 'https://cdn.tgdd.vn/2024/03/banner/TGDD-720-220-720x220.png', link: '/trade-in', status: 'active', position: 1 },
    { id: 4, title: 'Phụ kiện giảm đến 50%', type: 'Side Banner', targetPage: 'Chi tiết sản phẩm', image: 'https://cdn.tgdd.vn/2024/03/banner/Phukien-390-210-390x210.png', link: '/category/phu-kien', status: 'hidden', position: 1 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả loại');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageSource, setImageSource] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Main Carousel',
    targetPage: 'Trang chủ',
    image: '',
    link: '',
    status: 'active',
    position: 1
  });

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ ...banner });
      setImagePreview(banner.image);
      setImageSource('url');
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        type: 'Main Carousel',
        targetPage: 'Trang chủ',
        image: '',
        link: '',
        status: 'active',
        position: banners.length + 1
      });
      setImagePreview('');
      setImageSource('upload');
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.image) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc và chọn hình ảnh');
      return;
    }

    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...formData } : b));
    } else {
      setBanners([...banners, { id: Date.now(), ...formData }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const filteredBanners = banners.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         b.targetPage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Tất cả loại' || b.type === typeFilter;
    const matchesStatus = statusFilter === 'Tất cả trạng thái' || 
                         (statusFilter === 'Hiển thị' && b.status === 'active') || 
                         (statusFilter === 'Đang ẩn' && b.status === 'hidden');
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Banner & Quảng cáo</h1>
          <p className="page-subtitle">Quản lý danh sách banner, vị trí hiển thị và liên kết trên toàn hệ thống.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Thêm Banner mới
        </button>
      </div>

      <div className="filters-bar card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tiêu đề hoặc trang hiển thị..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option>Tất cả loại</option>
              <option>Main Carousel</option>
              <option>Sub Banner</option>
              <option>Side Banner</option>
            </select>
          </div>
          <div className="filter-item">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tất cả trạng thái</option>
              <option>Hiển thị</option>
              <option>Đang ẩn</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>Banner Preview</th>
                <th>Thông tin Banner</th>
                <th>Trang hiển thị</th>
                <th>Liên kết (Link)</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.length > 0 ? filteredBanners.map((banner) => (
                <tr key={banner.id}>
                  <td style={{ paddingLeft: '20px', width: '220px' }}>
                    <div className="banner-table-preview" style={{ 
                      width: '180px', height: '60px', borderRadius: '8px', overflow: 'hidden', 
                      background: '#f1f5f9', border: '1px solid #e2e8f0' 
                    }}>
                      <img src={banner.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{banner.title}</span>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <LayoutTemplate size={12} /> {banner.type}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                      <MapPin size={14} color="#2563eb" />
                      {banner.targetPage}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '13px', fontWeight: '500' }}>
                      <LinkIcon size={14} />
                      <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.link}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#1e293b', textAlign: 'center', width: '40px' }}>
                      {banner.position}
                    </div>
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${banner.status === 'active' ? 'active' : 'hidden'}`}
                      style={{ 
                        backgroundColor: banner.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: banner.status === 'active' ? '#16a34a' : '#ef4444',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                        display: 'inline-flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      {banner.status === 'active' ? <Eye size={12} /> : <EyeOff size={12} />}
                      {banner.status === 'active' ? 'Hiển thị' : 'Đang ẩn'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn edit" onClick={() => handleOpenModal(banner)}><Edit size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(banner.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Không tìm thấy banner nào khớp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2>{editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h2>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                <div className="form-column">
                   <div className="form-section-custom">
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <ImageIcon size={18} /> Hình ảnh Banner
                    </h3>
                    
                    <div className="image-source-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                      <button className={`source-tab-btn ${imageSource === 'upload' ? 'active' : ''}`} onClick={() => setImageSource('upload')}><Upload size={16} /> Tải ảnh lên</button>
                      <button className={`source-tab-btn ${imageSource === 'url' ? 'active' : ''}`} onClick={() => setImageSource('url')}><Link2 size={16} /> Sử dụng URL</button>
                    </div>

                    {imageSource === 'upload' ? (
                      <div className="upload-zone" onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed #cbd5e1', borderRadius: '16px', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#f8fafc', position: 'relative', overflow: 'hidden' }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                        {imagePreview ? <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" /> : (
                          <>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}><Plus size={30} color="#64748b" /></div>
                            <span style={{ fontWeight: '600', color: '#64748b' }}>Chọn tệp hình ảnh</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="input-group">
                        <label>URL Hình ảnh *</label>
                        <input type="text" value={formData.image} onChange={e => { setFormData({...formData, image: e.target.value}); setImagePreview(e.target.value); }} placeholder="https://..." />
                        {imagePreview && (
                          <div style={{ marginTop: '15px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '180px' }}>
                            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-section-custom">
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: '#2563eb' }}>Cấu hình chi tiết</h3>
                    <div className="input-group"><label>Tiêu đề Banner *</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tiêu đề banner..." /></div>
                    <div className="input-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Loại Banner</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option>Main Carousel</option><option>Sub Banner</option><option>Side Banner</option>
                        </select>
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Vị trí STT</label>
                        <input type="number" min="1" value={formData.position} onChange={e => setFormData({...formData, position: Math.max(1, parseInt(e.target.value) || 1)})} />
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Trang hiển thị *</label>
                      <select value={formData.targetPage} onChange={e => setFormData({...formData, targetPage: e.target.value})}>
                        <option value="Trang chủ">Trang chủ</option><option value="Trang Danh mục">Trang Danh mục</option><option value="Chi tiết sản phẩm">Chi tiết sản phẩm</option><option value="Trang Tin tức">Trang Tin tức</option><option value="Trang Khuyến mãi">Trang Khuyến mãi</option><option value="Trang Liên hệ">Trang Liên hệ</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Link điều hướng</label>
                      <select 
                        value={formData.link} 
                        onChange={e => setFormData({...formData, link: e.target.value})}
                      >
                        <option value="">Không có liên kết</option>
                        <option value="/">Trang chủ</option>
                        <option value="/category/iphone">Danh mục iPhone</option>
                        <option value="/category/samsung">Danh mục Samsung</option>
                        <option value="/category/oppo">Danh mục Oppo</option>
                        <option value="/category/laptop">Danh mục Laptop</option>
                        <option value="/category/phu-kien">Phụ kiện</option>
                        <option value="/trade-in">Thu cũ đổi mới</option>
                        <option value="/flash-voucher">Flash Voucher</option>
                        <option value="/contact">Trang liên hệ</option>
                      </select>
                    </div>
                    <div className="input-group" style={{ marginTop: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.status === 'active'} onChange={e => setFormData({...formData, status: e.target.checked ? 'active' : 'hidden'})} style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontWeight: '600' }}>Kích hoạt hiển thị</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button><button className="btn-primary" onClick={handleSave}>Lưu Banner</button></div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-content.large { background: white; width: 100%; max-height: 90vh; border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: modalSlideIn 0.3s ease-out; overflow: hidden; }
        @keyframes modalSlideIn { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-header { padding: 20px 30px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 30px; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 20px 30px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 12px; background: #f8fafc; }
        .form-section-custom { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #f1f5f9; }
        .source-tab-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .source-tab-btn.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
        .upload-zone:hover { border-color: #2563eb !important; background: #eff6ff !important; }
      `}</style>
    </div>
  );
};

export default BannerManagement;

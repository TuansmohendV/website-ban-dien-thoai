import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
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
  Upload,
  Link2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X
} from 'lucide-react';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadBanners = async () => {
    try {
      const res = await api.get('/api/banners/admin');
      setBanners(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tất cả loại');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imageSource, setImageSource] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Main Carousel',
    targetPage: 'Trang chủ',
    imageUrl: '',
    linkUrl: '',
    status: 'active',
    position: 1,
    bgColor: '#ffffff',
    textColor: '#1e293b',
    titleAlign: 'left',
    titleIsBold: true,
    titleIsItalic: false
  });

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ ...banner });
      setImagePreview(banner.imageUrl);
      setImageSource('url');
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        type: 'Main Carousel',
        targetPage: 'Trang chủ',
        imageUrl: '',
        linkUrl: '',
        status: 'active',
        position: banners.length + 1,
        bgColor: '#ffffff',
        textColor: '#1e293b',
        titleAlign: 'left',
        titleIsBold: true,
        titleIsItalic: false
      });
      setImagePreview('');
      setImageSource('upload');
    }
    setShowModal(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);

      // Upload to server
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      try {
        const res = await api.post('/api/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.success) {
          setFormData(prev => ({ ...prev, imageUrl: res.data.url }));
        }
      } catch (err) {
        alert('Lỗi tải ảnh lên: ' + err.message);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.imageUrl) {
      alert('Vui lòng chọn hình ảnh banner');
      return;
    }

    try {
      if (editingBanner) {
        await api.put(`/api/banners/admin/${editingBanner._id}`, formData);
      } else {
        await api.post('/api/banners/admin', formData);
      }
      setShowModal(false);
      loadBanners();
    } catch (err) {
      alert('Lỗi lưu banner: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này khỏi giao diện? (Dữ liệu trong database vẫn còn)')) {
      try {
        await api.delete(`/api/banners/admin/${id}`);
        setBanners(banners.filter(b => b._id !== id));
      } catch (err) {
        alert('Không thể xóa banner: ' + (err.response?.data?.message || err.message));
      }
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBanners.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

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
              {currentItems.length > 0 ? currentItems.map((banner) => (
                <tr key={banner._id}>
                  <td style={{ paddingLeft: '20px', width: '220px' }}>
                    <div className="banner-table-preview" style={{ 
                      width: '180px', height: '60px', borderRadius: '8px', overflow: 'hidden', 
                      background: '#f1f5f9', border: '1px solid #e2e8f0' 
                    }}>
                      <img src={banner.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>{banner.title || 'Không có tiêu đề'}</span>
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
                      <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.linkUrl || 'N/A'}</span>
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
                      <button className="action-btn delete" onClick={() => handleDelete(banner._id)}><Trash2 size={16} /></button>
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

        {/* Pagination UI */}
        <div className="pagination-container" style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredBanners.length)} trên tổng số {filteredBanners.length} mục
          </span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
            >
              Trước
            </button>
            
            {/* Luôn hiển thị ít nhất 10 trang đầu tiên */}
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
                      borderColor: currentPage === i ? '#2563eb' : '#e2e8f0',
                      background: currentPage === i ? '#2563eb' : 'white',
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
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                            {/* LIVE PREVIEW OVERLAY */}
                            <div style={{ 
                              position: 'absolute', inset: 0, display: 'flex', padding: '20px',
                              flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.1)',
                              alignItems: formData.titleAlign === 'center' ? 'center' : formData.titleAlign === 'right' ? 'flex-end' : 'flex-start',
                              textAlign: formData.titleAlign
                            }}>
                               <h4 style={{ 
                                 margin: 0, fontSize: '24px', 
                                 color: formData.textColor || '#1e293b',
                                 fontWeight: formData.titleIsBold ? '900' : '500',
                                 fontStyle: formData.titleIsItalic ? 'italic' : 'normal',
                                 textShadow: '0 2px 4px rgba(255,255,255,0.5)'
                               }}>
                                 {formData.title || 'Tiêu đề Preview'}
                               </h4>
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}><Plus size={30} color="#64748b" /></div>
                            <span style={{ fontWeight: '600', color: '#64748b' }}>Chọn tệp hình ảnh</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="input-group">
                        <label>URL Hình ảnh *</label>
                        <input type="text" value={formData.imageUrl} onChange={e => { setFormData({...formData, imageUrl: e.target.value}); setImagePreview(e.target.value); }} placeholder="https://..." />
                        {imagePreview && (
                          <div style={{ marginTop: '15px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '180px', position: 'relative' }}>
                            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                            {/* LIVE PREVIEW OVERLAY */}
                            <div style={{ 
                              position: 'absolute', inset: 0, display: 'flex', padding: '15px',
                              flexDirection: 'column', justifyContent: 'center',
                              alignItems: formData.titleAlign === 'center' ? 'center' : formData.titleAlign === 'right' ? 'flex-end' : 'flex-start',
                              textAlign: formData.titleAlign
                            }}>
                               <h4 style={{ 
                                 margin: 0, fontSize: '18px', 
                                 color: formData.textColor || '#1e293b',
                                 fontWeight: formData.titleIsBold ? '900' : '500',
                                 fontStyle: formData.titleIsItalic ? 'italic' : 'normal',
                                 textShadow: '0 2px 4px rgba(255,255,255,0.5)'
                               }}>
                                 {formData.title || 'Tiêu đề Preview'}
                               </h4>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-column">
                  <div className="form-section-custom">
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '20px', color: '#2563eb' }}>Cấu hình chi tiết</h3>
                    <div className="input-group">
                      <label>Tiêu đề Banner (Tùy chọn)</label>
                      <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tiêu đề banner..." />
                    </div>

                    <div className="styling-tools" style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: '#475569' }}>Tùy chỉnh kiểu chữ tiêu đề</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                        {/* Color Picker */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={formData.textColor || '#1e293b'} 
                            onChange={e => setFormData({...formData, textColor: e.target.value})}
                            style={{ width: '30px', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', fontWeight: '600' }}>Màu chữ</span>
                        </div>

                        {/* Alignment */}
                        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                          {[
                            { val: 'left', icon: <AlignLeft size={16} /> },
                            { val: 'center', icon: <AlignCenter size={16} /> },
                            { val: 'right', icon: <AlignRight size={16} /> }
                          ].map(align => (
                            <button 
                              key={align.val}
                              onClick={() => setFormData({...formData, titleAlign: align.val})}
                              style={{ 
                                padding: '6px', borderRadius: '6px', border: 'none', 
                                background: formData.titleAlign === align.val ? 'white' : 'transparent',
                                color: formData.titleAlign === align.val ? '#2563eb' : '#64748b',
                                cursor: 'pointer', display: 'flex', boxShadow: formData.titleAlign === align.val ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                              }}
                            >
                              {align.icon}
                            </button>
                          ))}
                        </div>

                        {/* Bold / Italic */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setFormData({...formData, titleIsBold: !formData.titleIsBold})}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                              background: formData.titleIsBold ? '#eff6ff' : 'white',
                              color: formData.titleIsBold ? '#2563eb' : '#64748b',
                              fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                          >
                            <Bold size={16} />
                          </button>
                          <button 
                            onClick={() => setFormData({...formData, titleIsItalic: !formData.titleIsItalic})}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                              background: formData.titleIsItalic ? '#eff6ff' : 'white',
                              color: formData.titleIsItalic ? '#2563eb' : '#64748b',
                              fontStyle: 'italic', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                            }}
                          >
                            <Italic size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="input-row" style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Loại Banner</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option>Main Carousel</option><option>Sub Banner</option><option>Side Banner</option>
                        </select>
                      </div>
                      <div className="input-group" style={{ flex: 1 }}>
                        <label>Vị trí STT (Slide số)</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={formData.position} 
                          onChange={e => {
                            const newPos = Math.max(1, parseInt(e.target.value) || 1);
                            setFormData(prev => ({ ...prev, position: newPos }));
                            
                            // SMART SWITCH: Check if another banner already exists at this STT on the same page
                            const existingAtPos = banners.find(b => 
                              b.position === newPos && 
                              b.targetPage === formData.targetPage &&
                              (!editingBanner || b._id !== editingBanner._id)
                            );

                            if (existingAtPos) {
                              setEditingBanner(existingAtPos);
                              setFormData({ ...existingAtPos, position: newPos });
                              setImagePreview(existingAtPos.imageUrl);
                              setImageSource('url'); // Hiện ảnh cũ bằng link
                            } else if (editingBanner) {
                              // If we were editing and moved to an empty slot, start a "New" entry for this STT
                              setEditingBanner(null);
                              setFormData(prev => ({
                                ...prev,
                                title: '',
                                imageUrl: '',
                                position: newPos,
                                _id: undefined 
                              }));
                              setImagePreview('');
                              setImageSource('upload'); // Tự động mở lại chỗ upload ảnh từ máy tính
                            }
                          }} 
                        />
                        <p style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>* Thay đổi số này để chuyển sang chỉnh sửa Slide khác.</p>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Trang hiển thị *</label>
                      <select value={formData.targetPage} onChange={e => setFormData({...formData, targetPage: e.target.value})}>
                        <option value="Trang chủ">Trang chủ</option><option value="Trang Danh mục">Trang Danh mục</option><option value="Chi tiết sản phẩm">Chi tiết sản phẩm</option><option value="Trang Tin tức">Trang Tin tức</option><option value="Trang Khuyến mãi">Trang Khuyến mãi</option><option value="Trang Liên hệ">Trang Liên hệ</option><option value="Trang Săn Voucher">Trang Săn Voucher</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Link điều hướng</label>
                      <select 
                        value={formData.linkUrl} 
                        onChange={e => setFormData({...formData, linkUrl: e.target.value})}
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

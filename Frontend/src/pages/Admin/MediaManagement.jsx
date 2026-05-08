import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Grid, List, Trash2, Download, Eye, Image as ImageIcon, 
  Video, File, Filter, CheckSquare, Square, Upload, X, Play, FileText, 
  Copy, Check, Loader2, FileUp, MousePointer2
} from 'lucide-react';

const MediaManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeType, setActiveType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  const [mediaData, setMediaData] = useState([
    { id: 1, name: 'iphone-15-banner.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x600', url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&h=450&fit=crop', date: '22/04/2026' },
    { id: 2, name: 'promo-video-intro.mp4', type: 'video', size: '15.8 MB', duration: '0:30', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', date: '21/04/2026', thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=250&fit=crop' },
    { id: 3, name: 'samsung-s24-ultra.png', type: 'image', size: '1.2 MB', dimensions: '1200x800', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=500&fit=crop', date: '20/04/2026' },
    { id: 4, name: 'brand-guidelines.pdf', type: 'file', size: '4.5 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', date: '19/04/2026' },
    { id: 5, name: 'summer-sale-poster.webp', type: 'image', size: '450 KB', dimensions: '1080x1080', url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&h=250&fit=crop', date: '18/04/2026' },
    { id: 6, name: 'review-iphone-15.mp4', type: 'video', size: '24.2 MB', duration: '5:12', url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', date: '17/04/2026', thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop' },
  ]);

  const filteredMedia = activeType === 'all' ? mediaData : mediaData.filter(m => m.type === activeType);

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length === 0) return;

    // Start simulation
    setUploadingFiles(files.map(f => ({ name: f.name, progress: 0 })));
    
    // Simulate upload progress for each file
    files.forEach((file, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Add to media data when "done"
          const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'file';
          const newMediaItem = {
            id: Date.now() + index,
            name: file.name,
            type: type,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            date: new Date().toLocaleDateString('vi-VN'),
            url: URL.createObjectURL(file),
            thumbnail: type === 'image' ? URL.createObjectURL(file) : null,
            dimensions: type === 'image' ? 'Processing...' : null,
            duration: type === 'video' ? 'Processing...' : null
          };

          setMediaData(prev => [newMediaItem, ...prev]);
          
          // Clear uploading state when last file is done
          if (index === files.length - 1) {
            setTimeout(() => {
              setUploadingFiles([]);
              setShowUploadModal(false);
            }, 500);
          }
        }
        setUploadingFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
      }, 300);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e);
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Thư viện Phương tiện</h1>
          <p className="page-subtitle">Quản lý tập trung hình ảnh, video và tài liệu của hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedItems.length > 0 && (
            <button className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={() => setMediaData(mediaData.filter(m => !selectedItems.includes(m.id)))}>
              <Trash2 size={18} /> Xóa {selectedItems.length} mục
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            <Upload size={20} /> Tải lên tệp mới
          </button>
        </div>
      </div>

      <div className="media-toolbar card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 25px !important' }}>
        <div className="filter-group">
          <button className={`btn-tab ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>Tất cả</button>
          <button className={`btn-tab ${activeType === 'image' ? 'active' : ''}`} onClick={() => setActiveType('image')}><ImageIcon size={16} /> Hình ảnh</button>
          <button className={`btn-tab ${activeType === 'video' ? 'active' : ''}`} onClick={() => setActiveType('video')}><Video size={16} /> Video</button>
          <button className={`btn-tab ${activeType === 'file' ? 'active' : ''}`} onClick={() => setActiveType('file')}><FileText size={16} /> Tài liệu</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="search-box" style={{ width: '250px' }}>
            <Search size={18} /><input type="text" placeholder="Tìm tên tệp..." />
          </div>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'grid' ? 'white' : 'transparent' }}>
              <Grid size={18} color={viewMode === 'grid' ? '#2563eb' : '#94a3b8'} />
            </button>
            <button onClick={() => setViewMode('list')} style={{ padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: viewMode === 'list' ? 'white' : 'transparent' }}>
              <List size={18} color={viewMode === 'list' ? '#2563eb' : '#94a3b8'} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {filteredMedia.map(item => (
            <div 
              key={item.id} 
              className={`media-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
              style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
              onClick={() => toggleSelect(item.id)}
            >
              <div style={{ height: '140px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {item.type === 'image' ? (
                  <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : item.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img src={item.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                      <Play size={24} color="white" fill="white" />
                    </div>
                  </div>
                ) : (
                  <FileText size={40} color="#94a3b8" />
                )}
                
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  {selectedItems.includes(item.id) ? <CheckSquare size={18} color="#2563eb" fill="white" /> : <Square size={18} color="white" style={{ opacity: 0.5 }} />}
                </div>

                <div className="media-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'none', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <button className="media-btn" onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}><Eye size={16} /></button>
                  <button className="media-btn" onClick={(e) => e.stopPropagation()}><Download size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '12px' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.size}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card table-card">
           <table className="admin-table">
             <thead>
               <tr>
                 <th style={{ width: '40px', paddingLeft: '20px' }}></th>
                 <th>Tệp tin</th><th>Loại</th><th>Dung lượng</th><th>Ngày tải lên</th><th>Thao tác</th>
               </tr>
             </thead>
             <tbody>
               {filteredMedia.map(item => (
                 <tr key={item.id} className={selectedItems.includes(item.id) ? 'selected-row' : ''} onClick={() => toggleSelect(item.id)}>
                   <td style={{ paddingLeft: '20px' }}>{selectedItems.includes(item.id) ? <CheckSquare size={18} color="#2563eb" /> : <Square size={18} color="#94a3b8" />}</td>
                   <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.type === 'image' ? <ImageIcon size={16} /> : item.type === 'video' ? <Video size={16} /> : <File size={16} />}</div><span style={{ fontWeight: '600' }}>{item.name}</span></div></td>
                   <td><span className="badge">{item.type}</span></td><td>{item.size}</td><td>{item.date}</td>
                   <td><div className="actions-cell"><button className="action-btn view" onClick={() => setPreviewItem(item)}><Eye size={16} /></button><button className="action-btn delete"><Trash2 size={16} /></button></div></td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header"><h2>Tải lên tệp mới</h2><button onClick={() => setShowUploadModal(false)} className="close-btn"><X size={24} /></button></div>
            <div className="modal-body" style={{ padding: '30px' }}>
              <div 
                className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileUpload} />
                <div className="dropzone-content">
                  <div className="icon-wrapper"><Upload size={32} /></div>
                  <h3>Kéo thả tệp vào đây</h3>
                  <p>Hoặc nhấp để chọn tệp từ máy tính</p>
                  <span className="hint">Hỗ trợ Hình ảnh, Video và Tài liệu (PDF, DOC...)</span>
                </div>
              </div>

              {uploadingFiles.length > 0 && (
                <div className="upload-progress-list" style={{ marginTop: '25px' }}>
                  <h4 style={{ marginBottom: '15px', fontSize: '14px' }}>Đang tải lên {uploadingFiles.length} tệp...</h4>
                  {uploadingFiles.map((file, idx) => (
                    <div key={idx} style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ fontWeight: '600' }}>{file.name}</span>
                        <span>{Math.round(file.progress)}%</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${file.progress}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer"><button className="btn-outline" onClick={() => setShowUploadModal(false)}>Hủy bỏ</button></div>
          </div>
        </div>
      )}

      {/* Preview Modal (Simplified for this version) */}
      {previewItem && (
        <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
          <div className="modal-content" style={{ maxWidth: '800px', padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', background: '#000', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button onClick={() => setPreviewItem(null)} style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: 'white', width: '32px', height: '32px', cursor: 'pointer' }}><X size={20} /></button>
              {previewItem.type === 'image' ? (
                <img src={previewItem.url} style={{ maxWidth: '100%', maxHeight: '80vh' }} alt="" />
              ) : previewItem.type === 'video' ? (
                <video src={previewItem.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }} />
              ) : previewItem.name.toLowerCase().endsWith('.pdf') ? (
                <iframe src={previewItem.url} style={{ width: '100%', height: '85vh', border: 'none' }} title="PDF Preview" />
              ) : (
                <div style={{ color: 'white', textAlign: 'center', padding: '60px' }}>
                  <FileText size={80} color="#94a3b8" style={{ marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{previewItem.name}</h2>
                  <p style={{ color: '#94a3b8', marginBottom: '30px', maxWidth: '400px', margin: '0 auto 30px' }}>Trình duyệt không hỗ trợ xem trực tiếp định dạng này. Vui lòng tải về máy để xem nội dung chi tiết.</p>
                  <a href={previewItem.url} download={previewItem.name} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <Download size={18} /> Tải tệp về máy
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .media-card:hover { border-color: #2563eb !important; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .media-card.selected { border-color: #2563eb !important; background: #eff6ff !important; }
        .media-card:hover .media-overlay { display: flex !important; }
        .media-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .upload-dropzone { border: 2px dashed #e2e8f0; border-radius: 20px; padding: 40px; cursor: pointer; transition: all 0.2s; background: #f8fafc; text-align: center; }
        .upload-dropzone:hover, .upload-dropzone.dragging { border-color: #2563eb; background: #eff6ff; }
        .icon-wrapper { width: 64px; height: 64px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; color: #2563eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .dropzone-content h3 { margin-bottom: 5px; font-size: 18px; }
        .dropzone-content p { color: #64748b; font-size: 14px; margin-bottom: 15px; }
        .hint { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .selected-row { background: #eff6ff !important; }
        .btn-tab { padding: 8px 16px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #64748b; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-tab.active { background: white; color: #2563eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .badge { background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
      `}</style>
    </div>
  );
};

export default MediaManagement;

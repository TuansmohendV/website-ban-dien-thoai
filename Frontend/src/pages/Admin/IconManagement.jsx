import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Search, Plus, Image as ImageIcon, Copy, Check } from 'lucide-react';

const IconManagement = () => {
  // Load icons from localStorage to stay in sync with Category page
  const [icons, setIcons] = useState(() => {
    const saved = localStorage.getItem('admin_icon_library');
    return saved ? JSON.parse(saved) : [
      { id: '1001', url: 'https://cdn-icons-png.flaticon.com/512/3616/3616215.png', name: 'Smartphone System' },
      { id: '1002', url: 'https://cdn-icons-png.flaticon.com/512/688/688531.png', name: 'Tablet System' },
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    localStorage.setItem('admin_icon_library', JSON.stringify(icons));
  }, [icons]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newIcon = {
          id: (Math.floor(Math.random() * 9000) + 1000).toString(), // Random 4 digits
          url: reader.result,
          name: file.name
        };
        setIcons(prev => [newIcon, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteIcon = (id) => {
    if (window.confirm('Xóa biểu tượng này khỏi thư viện?')) {
      setIcons(icons.filter(icon => icon.id !== id));
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredIcons = icons.filter(icon => 
    icon.id.includes(searchTerm) || icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Thư viện Biểu tượng</h1>
          <p className="page-subtitle">Quản lý và cấp mã 4 số cho các icon sử dụng toàn hệ thống.</p>
        </div>
        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={20} />
          Tải lên icon mới
          <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
      </div>

      <div className="filters-bar card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo mã 4 số hoặc tên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="icon-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {filteredIcons.map((icon) => (
          <div key={icon.id} className="card" style={{ 
            padding: '20px', 
            textAlign: 'center', 
            position: 'relative',
            transition: 'all 0.2s',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              <img src={icon.url} alt="" style={{ maxWidth: '40px', maxHeight: '40px' }} />
            </div>
            
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#2563eb', marginBottom: '5px' }}>
              #{icon.id}
            </div>
            
            <div style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '15px' }}>
              {icon.name}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button 
                onClick={() => copyToClipboard(icon.id)}
                style={{ 
                  flex: 1, 
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: copiedId === icon.id ? '#f0fdf4' : '#f1f5f9',
                  color: copiedId === icon.id ? '#22c55e' : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                {copiedId === icon.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === icon.id ? 'Đã chép' : 'Sao chép'}
              </button>
              <button 
                onClick={() => deleteIcon(icon.id)}
                style={{ 
                  padding: '8px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: '#fef2f2',
                  color: '#ef4444',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {filteredIcons.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
            <ImageIcon size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
            <p>Không tìm thấy biểu tượng nào. Háy tải lên để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconManagement;

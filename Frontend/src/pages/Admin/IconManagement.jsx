import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Search, Plus, Image as ImageIcon, Copy, Check } from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';

const mapIconForView = (icon = {}) => ({
  id: icon._id || icon.id || '',
  url: icon.url || '',
  name: icon.name || 'Unnamed icon',
  category: icon.category || 'general',
});

const extractIconArray = (payload = {}) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.icons)) return payload.data.icons;
  if (Array.isArray(payload?.icons)) return payload.icons;
  return [];
};

const normalizeIconUrl = (url = '') => {
  const value = String(url || '').trim();
  if (!value) return '';
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return `https://${value}`;
};

const IconManagement = () => {
  const [icons, setIcons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadIcons = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response = await api.get('/api/admin/icons', {
          params: { page: 1, limit: 1000, t: Date.now() },
        });
        const mappedIcons = extractIconArray(response.data).map(mapIconForView);
        setIcons(mappedIcons);
      } catch (error) {
        setIcons([]);
        setLoadError(
          getApiErrorMessage(
            error,
            'Không thể tải icon từ API admin. Vui lòng đăng nhập lại bằng tài khoản admin.'
          )
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadIcons();
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadTasks = files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ name: file.name, url: reader.result });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));

    try {
      const payloads = await Promise.all(uploadTasks);
      const createdIcons = await Promise.all(
        payloads.map((payload) => api.post('/api/admin/icons', payload))
      );
      const newIcons = createdIcons
        .map((response) => mapIconForView(response.data?.data?.icon))
        .filter((icon) => icon.id);
      setIcons((prev) => [...newIcons, ...prev]);
    } catch (error) {
      alert(getApiErrorMessage(error, 'Tải lên icon thất bại.'));
    } finally {
      e.target.value = '';
    }
  };

  const deleteIcon = async (id) => {
    if (window.confirm('Ẩn biểu tượng này khỏi thư viện? Dữ liệu vẫn được giữ trong hệ thống.')) {
      try {
        await api.delete(`/api/admin/icons/${id}`);
        setIcons((prev) => prev.filter((icon) => icon.id !== id));
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể ẩn icon.'));
      }
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
        {isLoading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#64748b' }}>
            Đang tải icon từ database...
          </div>
        )}

        {!isLoading && loadError && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#ef4444' }}>
            {loadError}
          </div>
        )}

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
              <img
                src={normalizeIconUrl(icon.url)}
                alt={icon.name}
                style={{ maxWidth: '40px', maxHeight: '40px', display: 'block' }}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  const parent = event.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            
            <div style={{ 
              fontWeight: '800', 
              fontSize: '1rem', 
              color: '#2563eb', 
              marginBottom: '5px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%'
            }} title={`#${icon.id}`}>
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
        
        {!isLoading && !loadError && filteredIcons.length === 0 && (
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

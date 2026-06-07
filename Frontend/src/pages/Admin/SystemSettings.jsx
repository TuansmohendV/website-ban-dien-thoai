import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, Globe, Shield, Mail, Phone, MapPin, Facebook, Instagram, Youtube,
  Image as ImageIcon, Smartphone, Lock, Bell, Palette, Upload, X, Check,
  Info, ExternalLink
} from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [websiteName, setWebsiteName] = useState(localStorage.getItem('websiteName') || 'PhoneSin - Hệ thống bán lẻ điện thoại');
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem('adminLogo') || null);
  const [faviconPreview, setFaviconPreview] = useState(localStorage.getItem('adminFavicon') || null);
  
  // Contact States
  const [contactInfo, setContactInfo] = useState({
    hotline: localStorage.getItem('hotline') || '1800 1234',
    techHotline: localStorage.getItem('techHotline') || '0988 777 999',
    email: localStorage.getItem('email') || 'support@phonesin.vn',
    businessEmail: localStorage.getItem('businessEmail') || 'business@phonesin.vn',
    address: localStorage.getItem('address') || '123 Đường Công Nghệ, Hà Nội',
    googleMap: localStorage.getItem('googleMap') || '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.097073749448!2d105.84758507592474!3d21.0287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab953357c995%3A0x1babf6f4f9457601!2zSGFub2ksIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" width="100%" height="250" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showMapCode, setShowMapCode] = useState(false);

  // SEO & Security States
  const [seoInfo, setSeoInfo] = useState({
    metaTitle: localStorage.getItem('metaTitle') || 'PhoneSin | Điện thoại, Laptop chính hãng',
    metaDesc: localStorage.getItem('metaDesc') || 'PhoneSin cung cấp điện thoại và phụ kiện giá tốt nhất.',
    metaKeywords: localStorage.getItem('metaKeywords') || 'điện thoại, laptop, phụ kiện, phonesin',
    googleConsole: localStorage.getItem('googleConsole') || '',
    isMaintenance: localStorage.getItem('isMaintenance') === 'true',
    sessionTimeout: localStorage.getItem('sessionTimeout') || '60'
  });

  const [appearance, setAppearance] = useState({
    primaryColor: localStorage.getItem('primaryColor') || '#2563eb',
    sidebarTheme: localStorage.getItem('sidebarTheme') || 'light'
  });

  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const tabs = [
    { id: 'general', label: 'Cấu hình chung', icon: <Globe size={18} /> },
    { id: 'contact', label: 'Thông tin liên hệ', icon: <Phone size={18} /> },
    { id: 'social', label: 'Mạng xã hội', icon: <Facebook size={18} /> },
    { id: 'security', label: 'Bảo mật & SEO', icon: <Shield size={18} /> },
    { id: 'appearance', label: 'Giao diện', icon: <Palette size={18} /> },
  ];

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setLogoPreview(reader.result);
        else setFaviconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('websiteName', websiteName);
    if (logoPreview) localStorage.setItem('adminLogo', logoPreview);
    if (faviconPreview) localStorage.setItem('adminFavicon', faviconPreview);
    
    // Save Contact Info
    Object.keys(contactInfo).forEach(key => {
      localStorage.setItem(key, contactInfo[key]);
    });
    
    // Save SEO & Security
    Object.keys(seoInfo).forEach(key => {
      localStorage.setItem(key, seoInfo[key]);
    });
    
    // Save Appearance
    Object.keys(appearance).forEach(key => {
      localStorage.setItem(key, appearance[key]);
    });
    
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Cài đặt Hệ thống</h1>
          <p className="page-subtitle">Quản lý các thông tin cơ bản, cấu hình vận hành và giao diện website.</p>
        </div>
        <button className="btn-primary" onClick={handleSaveAll} disabled={isSaving} style={{ background: appearance.primaryColor }}>
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isSaving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
        </button>
      </div>

      <div className="settings-layout" style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        <div className="settings-sidebar" style={{ width: '280px', flexShrink: 0 }}>
          <div className="card no-padding" style={{ padding: '10px' }}>
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', padding: '15px 20px', borderRadius: '12px', border: 'none',
                  background: activeTab === tab.id ? `${appearance.primaryColor}15` : 'transparent',
                  color: activeTab === tab.id ? appearance.primaryColor : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', marginBottom: '5px'
                }}
              >
                <span style={{ color: activeTab === tab.id ? appearance.primaryColor : '#94a3b8' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-content" style={{ flex: 1 }}>
          <div className="card" style={{ padding: '30px' }}>
            {activeTab === 'general' && (
              <div className="settings-form">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Globe size={24} color="#2563eb" /> Cấu hình chung
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div className="input-group">
                    <label>Tên Website</label>
                    <input type="text" value={websiteName} onChange={(e) => setWebsiteName(e.target.value)} />
                  </div>
                  <div className="input-group"><label>Slogan (Tagline)</label><input type="text" defaultValue="Công nghệ cho mọi người" /></div>
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>Logo & Favicon</h3>
                  <div style={{ display: 'flex', gap: '40px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>Logo Website</label>
                      <div className="logo-upload-box" style={{ width: '220px', height: '80px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' }}>
                        {logoPreview ? <img src={logoPreview} style={{ height: '70%', width: 'auto', objectFit: 'contain' }} alt="" /> : <ImageIcon size={24} color="#94a3b8" />}
                        <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                      </div>
                      <button className="btn-outline" onClick={() => logoInputRef.current.click()}><Upload size={14} style={{ marginRight: '6px' }} /> Thay đổi Logo</button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <label style={{ fontSize: '13px', color: '#64748b', display: 'block', marginBottom: '10px' }}>Favicon (16x16)</label>
                      <div className="favicon-upload-box" style={{ width: '80px', height: '80px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                        {faviconPreview ? <img src={faviconPreview} style={{ width: '32px', height: '32px', objectFit: 'contain' }} alt="" /> : <ImageIcon size={24} color="#94a3b8" />}
                        <input type="file" ref={faviconInputRef} hidden accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} />
                      </div>
                      <button className="btn-outline" onClick={() => faviconInputRef.current.click()}><Upload size={14} style={{ marginRight: '6px' }} /> Thay đổi Favicon</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="settings-form">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={24} color="#2563eb" /> Thông tin liên hệ
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div className="input-group"><label>Hotline CSKH</label><input type="text" name="hotline" value={contactInfo.hotline} onChange={handleContactChange} /></div>
                  <div className="input-group"><label>Hotline Kỹ thuật</label><input type="text" name="techHotline" value={contactInfo.techHotline} onChange={handleContactChange} /></div>
                  <div className="input-group"><label>Email hỗ trợ</label><input type="email" name="email" value={contactInfo.email} onChange={handleContactChange} /></div>
                  <div className="input-group"><label>Địa chỉ trụ sở</label><input type="text" name="address" value={contactInfo.address} onChange={handleContactChange} /></div>
                </div>
                
                <div className="input-group" style={{ marginTop: '25px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <label style={{ marginBottom: 0, fontWeight: '700' }}>Vị trí cửa hàng (Google Maps)</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <button 
                        onClick={() => setShowMapCode(!showMapCode)}
                        className="btn-outline" 
                        style={{ fontSize: '12px', padding: '6px 12px', borderColor: showMapCode ? '#2563eb' : '#e2e8f0' }}
                      >
                        {showMapCode ? 'Ẩn mã nhúng' : 'Chỉnh sửa mã nhúng'}
                      </button>
                      <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                        <ExternalLink size={12} /> Lấy mã từ Google
                      </a>
                    </div>
                  </div>

                  {showMapCode && (
                    <div style={{ marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
                      <textarea 
                        rows="4" 
                        name="googleMap"
                        value={contactInfo.googleMap}
                        onChange={handleContactChange}
                        style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #2563eb', fontFamily: 'monospace', fontSize: '12px', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }} 
                        placeholder="Dán mã <iframe ...></iframe> tại đây..."
                      ></textarea>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Lưu ý: Chỉ dán đoạn mã bắt đầu bằng &lt;iframe và kết thúc bằng &lt;/iframe&gt;</p>
                    </div>
                  )}
                  
                  {/* Map Preview */}
                  <div className="map-preview-container" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div 
                      className="map-preview" 
                      style={{ width: '100%', height: '300px' }}
                      dangerouslySetInnerHTML={{ __html: contactInfo.googleMap }}
                    ></div>
                    {!contactInfo.googleMap && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <MapPin size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                        <p>Chưa có bản đồ nào được thiết lập</p>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px', color: '#64748b', fontSize: '12px', background: '#f1f5f9', padding: '10px 15px', borderRadius: '10px' }}>
                    <Info size={14} color="#2563eb" />
                    <span>Bản đồ này sẽ hiển thị tại trang <b>Liên hệ</b> và giúp khách hàng tìm thấy bạn dễ dàng hơn.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="settings-form">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Facebook size={24} color="#2563eb" /> Mạng xã hội
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="input-group"><label>Facebook Fanpage</label><input type="text" defaultValue="https://facebook.com/phonesin.official" /></div>
                  <div className="input-group"><label>Youtube Channel</label><input type="text" defaultValue="https://youtube.com/c/phonesin_tech" /></div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-form">
                <div style={{ marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield size={24} color="#2563eb" /> Cấu hình SEO
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                      <label>Meta Title (Tiêu đề SEO)</label>
                      <input type="text" value={seoInfo.metaTitle} onChange={(e) => setSeoInfo({...seoInfo, metaTitle: e.target.value})} placeholder="Hiển thị trên tab trình duyệt và Google" />
                    </div>
                    <div className="input-group">
                      <label>Meta Description (Mô tả SEO)</label>
                      <textarea rows="3" value={seoInfo.metaDesc} onChange={(e) => setSeoInfo({...seoInfo, metaDesc: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}></textarea>
                    </div>
                    <div className="input-group">
                      <label>Meta Keywords (Từ khóa cách nhau bởi dấu phẩy)</label>
                      <input type="text" value={seoInfo.metaKeywords} onChange={(e) => setSeoInfo({...seoInfo, metaKeywords: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label>Google Search Console (Mã xác minh HTML Meta Tag)</label>
                      <input type="text" value={seoInfo.googleConsole} onChange={(e) => setSeoInfo({...seoInfo, googleConsole: e.target.value})} placeholder='<meta name="google-site-verification" content="..." />' />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '30px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={24} color="#ef4444" /> Bảo mật & Vận hành
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f2', padding: '15px 20px', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#991b1b' }}>Chế độ bảo trì (Maintenance Mode)</h4>
                        <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px' }}>Khi bật, khách hàng sẽ thấy thông báo bảo trì và không thể đặt hàng.</p>
                      </div>
                      <button 
                        onClick={() => setSeoInfo({...seoInfo, isMaintenance: !seoInfo.isMaintenance})}
                        style={{ width: '50px', height: '26px', background: seoInfo.isMaintenance ? '#ef4444' : '#cbd5e1', borderRadius: '13px', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
                      >
                        <div style={{ position: 'absolute', top: '3px', left: seoInfo.isMaintenance ? '27px' : '3px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'all 0.3s' }}></div>
                      </button>
                    </div>

                    <div className="input-group">
                      <label>Thời gian tự động đăng xuất (Phút)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input 
                          type="number" 
                          min="1"
                          value={seoInfo.sessionTimeout} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setSeoInfo({...seoInfo, sessionTimeout: Math.max(1, val).toString()});
                          }} 
                          style={{ width: '120px' }} 
                        />
                        <span style={{ fontSize: '14px', color: '#64748b' }}>Phút không hoạt động sẽ tự động thoát tài khoản.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-form">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Palette size={24} color="#2563eb" /> Tùy chỉnh Giao diện
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  {/* Brand Color */}
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>Màu sắc thương hiệu</h3>
                    <div className="input-group">
                      <label>Màu chủ đạo (Primary Color)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input 
                          type="color" 
                          value={appearance.primaryColor} 
                          onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                          style={{ width: '60px', height: '40px', padding: '2px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        />
                        <input 
                          type="text" 
                          value={appearance.primaryColor} 
                          onChange={(e) => setAppearance({...appearance, primaryColor: e.target.value})}
                          style={{ flex: 1 }}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>Màu này sẽ áp dụng cho Nút bấm, Link và các biểu tượng chính trên toàn website.</p>
                    </div>
                  </div>

                  {/* Sidebar Style */}
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', fontWeight: '700' }}>Phong cách Admin</h3>
                    <div className="input-group">
                      <label>Giao diện Sidebar</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                        <div 
                          onClick={() => setAppearance({...appearance, sidebarTheme: 'light'})}
                          style={{ 
                            padding: '15px', borderRadius: '12px', border: `2px solid ${appearance.sidebarTheme === 'light' ? appearance.primaryColor : '#e2e8f0'}`,
                            background: '#f8fafc', cursor: 'pointer', textAlign: 'center'
                          }}
                        >
                          <div style={{ width: '100%', height: '40px', background: 'white', borderRadius: '4px', marginBottom: '10px', border: '1px solid #e2e8f0' }}></div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: appearance.sidebarTheme === 'light' ? appearance.primaryColor : '#64748b' }}>Sáng (Light)</span>
                        </div>
                        <div 
                          onClick={() => setAppearance({...appearance, sidebarTheme: 'dark'})}
                          style={{ 
                            padding: '15px', borderRadius: '12px', border: `2px solid ${appearance.sidebarTheme === 'dark' ? appearance.primaryColor : '#e2e8f0'}`,
                            background: '#1e293b', cursor: 'pointer', textAlign: 'center', color: 'white'
                          }}
                        >
                          <div style={{ width: '100%', height: '40px', background: '#0f172a', borderRadius: '4px', marginBottom: '10px' }}></div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: appearance.sidebarTheme === 'dark' ? 'white' : '#94a3b8' }}>Tối (Dark)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Section */}
                <div style={{ marginTop: '40px', padding: '30px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', fontWeight: '700' }}>XEM TRƯỚC GIAO DIỆN:</h3>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button 
                      onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 2000); }}
                      style={{ padding: '10px 25px', background: appearance.primaryColor, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.1s' }}
                      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Nút mẫu
                    </button>
                    <span 
                      onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 2000); }}
                      style={{ color: appearance.primaryColor, fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Đường dẫn mẫu
                    </span>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: appearance.primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Check size={16} />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '15px' }}>* Đây là các thành phần dùng để thử nghiệm màu sắc bạn vừa chọn.</p>
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'contact' && activeTab !== 'social' && activeTab !== 'security' && activeTab !== 'appearance' && (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                <h3>Đang phát triển</h3>
                <p>Tính năng này đang được hoàn thiện và sẽ sớm ra mắt.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: '#10b981', color: 'white', padding: '15px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 1000, animation: 'slideIn 0.3s ease-out' }}>
          <Check size={20} />
          <span style={{ fontWeight: '600' }}>Cập nhật hệ thống thành công!</span>
        </div>
      )}

      <style jsx="true">{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .logo-upload-box:hover, .favicon-upload-box:hover { border-color: #2563eb !important; background: #eff6ff !important; }
        .Loader2 { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .map-preview iframe { width: 100% !important; height: 100% !important; }
      `}</style>
    </div>
  );
};

const Loader2 = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default SystemSettings;

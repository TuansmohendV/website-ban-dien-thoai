import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, Tag, CheckCircle, Clock,
  ChevronLeft, ChevronRight, MoreVertical, Image as ImageIcon, X, FileText, Save,
  ChevronDown, Monitor, Smartphone, Upload, Link2, Video, Play, Bold, Italic, 
  Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, 
  Heading1, Heading2, List as ListIcon, ListOrdered, Undo, Redo
} from 'lucide-react';

const NewsManagement = () => {
  const [posts, setPosts] = useState([
    { id: 1, title: 'Đánh giá chi tiết iPhone 15 Pro Max sau 6 tháng sử dụng', category: 'Đánh giá', author: 'Quản trị viên', date: '22/04/2026', views: 1250, status: 'Published', thumbnail: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=250&fit=crop', summary: 'Bài viết đánh giá trải nghiệm thực tế iPhone 15 Pro Max về pin, camera và hiệu năng sau một thời gian dài sử dụng.', type: 'article', content: '<p>Nội dung bài viết đánh giá chi tiết...</p>' },
    { id: 2, title: 'Top 5 điện thoại tầm trung đáng mua nhất đầu năm 2026', category: 'Tư vấn', author: 'Minh Tuấn', date: '20/04/2026', views: 856, status: 'Published', thumbnail: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&h=250&fit=crop', summary: 'Tổng hợp những mẫu điện thoại có hiệu năng tốt, giá cả phải chăng phù hợp cho đa số người dùng.', type: 'article', content: '<p>Nội dung tư vấn mua sắm...</p>' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [mediaSource, setMediaSource] = useState('upload');
  const [mediaPreview, setMediaPreview] = useState('');
  
  const fileInputRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '', category: 'Tin công nghệ', summary: '', content: '', thumbnail: '', videoUrl: '', status: 'Published', type: 'article'
  });

  // CRITICAL: Initialize editor content only ONCE when editor opens or editingPost changes
  useEffect(() => {
    if (showEditor && editorRef.current) {
      // We only set this if the editor is currently empty or we are loading a different post
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content;
      }
    }
  }, [showEditor, editingPost?.id]); 

  const handleOpenEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({ ...post });
      setMediaPreview(post.thumbnail);
    } else {
      setEditingPost(null);
      setFormData({ title: '', category: 'Tin công nghệ', summary: '', content: '', thumbnail: '', videoUrl: '', status: 'Published', type: 'article' });
      setMediaPreview('');
    }
    setShowEditor(true);
  };

  const execCommand = (e, command, value = null) => {
    if (e) e.preventDefault();
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
        setFormData(prev => ({ ...prev, thumbnail: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const html = `<img src="${reader.result}" style="max-width:100%; border-radius:12px; margin:15px 0;" alt="Image"><p><br></p>`;
        execCommand(null, 'insertHTML', html);
      };
      reader.readAsDataURL(file);
    }
  };

  const insertImage = (e) => {
    e.preventDefault();
    const mode = window.confirm('Tải ảnh từ máy (OK) hoặc Nhập link (Cancel)?');
    if (mode) contentImageInputRef.current.click();
    else {
      const url = prompt('Nhập link ảnh:');
      if (url) execCommand(e, 'insertImage', url);
    }
  };

  const insertVideo = (e) => {
    e.preventDefault();
    const url = prompt('Nhập link YouTube:');
    if (url) {
      let embedUrl = url;
      if (url.includes('v=')) embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
      else if (url.includes('be/')) embedUrl = `https://www.youtube.com/embed/${url.split('be/')[1]}`;
      
      const html = `<div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:20px 0;border-radius:12px;"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div><p><br></p>`;
      execCommand(e, 'insertHTML', html);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.thumbnail) { alert('Vui lòng điền đủ Tiêu đề và Ảnh đại diện!'); return; }
    
    // Final sync from editor DOM to state
    const finalContent = editorRef.current ? editorRef.current.innerHTML : formData.content;
    
    const postData = { ...formData, content: finalContent };

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...p, ...postData } : p));
    } else {
      setPosts([{ id: Date.now(), ...postData, author: 'Quản trị viên', date: new Date().toLocaleDateString('vi-VN'), views: 0 }, ...posts]);
    }
    setShowEditor(false);
  };

  return (
    <div className="management-container">
      {!showEditor ? (
        <>
          <div className="header-actions">
            <div><h1 className="page-title">Quản lý Tin tức & Blog</h1><p className="page-subtitle">Soạn thảo và quản lý bài viết công nghệ.</p></div>
            <button className="btn-primary" onClick={() => handleOpenEditor()}><Plus size={20} /> Viết bài mới</button>
          </div>
          <div className="card table-card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th style={{ paddingLeft: '20px' }}>Bài viết</th><th>Danh mục</th><th>Tác giả</th><th>Ngày đăng</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td style={{ paddingLeft: '20px', minWidth: '350px' }}><div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}><div style={{ width: '80px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}><img src={post.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><span style={{ fontWeight: '600' }}>{post.title}</span></div></td>
                      <td><span className="badge">{post.category}</span></td>
                      <td>{post.author}</td><td>{post.date}</td>
                      <td><span style={{ color: post.status === 'Published' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>{post.status}</span></td>
                      <td><div className="actions-cell"><button className="action-btn edit" onClick={() => handleOpenEditor(post)}><Edit size={16} /></button><button className="action-btn delete" onClick={() => setPosts(posts.filter(p => p.id !== post.id))}><Trash2 size={16} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="news-editor-view">
          <div className="editor-header">
            <div><button className="btn-back" onClick={() => setShowEditor(false)}><ChevronLeft size={20} /> Quay lại</button><h1 className="page-title" style={{ marginTop: '5px' }}>{editingPost ? 'Chỉnh sửa' : 'Viết bài mới'}</h1></div>
            <div style={{ display: 'flex', gap: '15px' }}><button className="btn-outline"><Eye size={18} /> Xem trước</button><button className="btn-primary" onClick={handleSave}><Save size={18} /> Lưu bài viết</button></div>
          </div>

          <div className="editor-layout">
            <div className="editor-main">
              <div className="card" style={{ padding: '30px' }}>
                <div className="input-group">
                  <label>Tiêu đề bài viết *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Nhập tiêu đề..." className="title-input" />
                </div>
                
                <div className="rich-editor-wrapper">
                  <div className="editor-toolbar-rich">
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'undo')}><Undo size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'redo')}><Redo size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'formatBlock', 'H1')}><Heading1 size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'formatBlock', 'H2')}><Heading2 size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'bold')}><Bold size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'italic')}><Italic size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'underline')}><Underline size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => { const c = prompt('Mã màu:'); if(c) execCommand(e, 'foreColor', c); }}><Palette size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'justifyLeft')}><AlignLeft size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'justifyCenter')}><AlignCenter size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'justifyRight')}><AlignRight size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'insertUnorderedList')}><ListIcon size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => execCommand(e, 'insertOrderedList')}><ListOrdered size={16} /></button>
                    <div className="toolbar-divider"></div>
                    <button className="tool-btn" onMouseDown={insertImage}><ImageIcon size={16} /></button>
                    <button className="tool-btn" onMouseDown={insertVideo}><Video size={16} /></button>
                    <button className="tool-btn" onMouseDown={(e) => { const l = prompt('Link:'); if(l) execCommand(e, 'createLink', l); }}><Link2 size={16} /></button>
                    <input type="file" ref={contentImageInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleContentImageUpload} />
                  </div>
                  <div ref={editorRef} contentEditable="true" className="rich-editor-content" suppressContentEditableWarning={true}></div>
                </div>
              </div>
            </div>

            <div className="editor-sidebar">
              <div className="card" style={{ marginBottom: '25px' }}>
                <h3 className="sidebar-title">Ảnh đại diện</h3>
                <div className="tab-group">
                   <button className={`btn-tab-small ${mediaSource === 'upload' ? 'active' : ''}`} onClick={() => setMediaSource('upload')}>Tải lên</button>
                   <button className={`btn-tab-small ${mediaSource === 'url' ? 'active' : ''}`} onClick={() => setMediaSource('url')}>Link</button>
                </div>
                <div className="upload-zone" onClick={() => mediaSource === 'upload' && fileInputRef.current.click()}>
                  {mediaSource === 'upload' && <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleMediaChange} />}
                  {mediaPreview ? <img src={mediaPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Plus size={32} color="#94a3b8" />}
                </div>
                {mediaSource === 'url' && <input type="text" value={formData.thumbnail} onChange={e => { setFormData({...formData, thumbnail: e.target.value}); setMediaPreview(e.target.value); }} placeholder="Link ảnh..." style={{ marginTop: '10px' }} />}
              </div>
              <div className="card">
                <h3 className="sidebar-title">Cài đặt</h3>
                <div className="input-group"><label>Danh mục</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Tin công nghệ</option><option>Đánh giá</option><option>Tư vấn</option></select></div>
                <div className="input-group"><label>Trạng thái</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Published</option><option>Draft</option></select></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .editor-header { position: sticky; top: 0; background: #f8fafc; padding: 20px 0; z-index: 100; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .btn-back { display: flex; align-items: center; gap: 8px; background: none; border: none; color: #64748b; cursor: pointer; font-weight: 600; }
        .title-input { font-size: 1.6rem; font-weight: 800; border: none; border-bottom: 2px solid #f1f5f9; border-radius: 0; padding: 15px 0; width: 100%; outline: none; }
        .editor-layout { display: grid; grid-template-columns: 1fr 350px; gap: 30px; }
        .rich-editor-wrapper { border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; margin-top: 20px; }
        .editor-toolbar-rich { background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 15px 20px; z-index: 90; }
        .tool-btn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 8px; background: white; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .tool-btn:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
        .toolbar-divider { width: 1px; height: 20px; background: #e2e8f0; margin: 0 4px; }
        .rich-editor-content { height: 60vh; overflow-y: auto; padding: 30px; outline: none; fontSize: 1.1rem; line-height: 1.8; background: white; }
        .rich-editor-content::-webkit-scrollbar { width: 8px; }
        .rich-editor-content::-webkit-scrollbar-track { background: #f1f5f9; }
        .rich-editor-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .rich-editor-content::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .rich-editor-content h1 { font-size: 2.2rem; font-weight: 800; margin: 1.5rem 0 1rem; color: #1e293b; }
        .rich-editor-content h2 { font-size: 1.8rem; font-weight: 700; margin: 1.2rem 0 0.8rem; color: #1e293b; }
        .rich-editor-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 15px 0; display: block; }
        .rich-editor-content ul { list-style-type: disc; margin-left: 25px; margin-bottom: 1rem; }
        .rich-editor-content ol { list-style-type: decimal; margin-left: 25px; margin-bottom: 1rem; }
        .rich-editor-content li { margin-bottom: 0.5rem; }
        .sidebar-title { fontSize: 1rem; fontWeight: 700; marginBottom: 15px; }
        .tab-group { display: flex; gap: 10px; marginBottom: 15px; }
        .btn-tab-small { padding: 6px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-weight: 600; cursor: pointer; font-size: 12px; }
        .btn-tab-small.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
        .upload-zone { height: 180px; borderRadius: 16px; border: 2px dashed #cbd5e1; display: flex; alignItems: center; justifyContent: center; overflow: hidden; background: #f8fafc; cursor: pointer; }
        .badge { background: #f1f5f9; color: #475569; padding: 4px 10px; borderRadius: 6px; fontSize: 12px; fontWeight: 600; }
      `}</style>
    </div>
  );
};

export default NewsManagement;

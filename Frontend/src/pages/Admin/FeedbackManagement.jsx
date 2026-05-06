import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Send, 
  Star, 
  Search,
  Filter,
  User,
  ExternalLink,
  Flag,
  X,
  History
} from 'lucide-react';

const initialComments = [
  { id: 1, user: 'Hoàng Anh', rating: 5, content: 'Máy dùng rất tốt, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop dài dài!', product: 'iPhone 15 Pro Max', date: '22/04/2026', status: 'Đã duyệt' },
  { id: 2, user: 'Minh Quân', rating: 2, content: 'Sản phẩm giao hơi chậm, hộp bị móp méo nhẹ. Hy vọng shop cải thiện.', product: 'Samsung S24 Ultra', date: '21/04/2026', status: 'Chờ duyệt' },
  { id: 3, user: 'Linh Chi', rating: 1, content: 'Quảng cáo sai sự thật, làm ăn không uy tín. Nội dung vi phạm chính sách của cửa hàng!', product: 'Tai nghe Airpods Pro', date: '20/04/2026', status: 'Vi phạm' },
  { id: 4, user: 'Khánh Duy', rating: 4, content: 'Giá hợp lý, hàng chính hãng check ok nha mọi người.', product: 'Xiaomi 14', date: '19/04/2026', status: 'Đã duyệt' },
];

const FeedbackManagement = () => {
  const [activeTab, setActiveTab] = useState('comments');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Khuyến mãi cuối tuần rực rỡ!', content: 'Giảm giá 50% cho tất cả phụ kiện iPhone...', target: 'Tất cả người dùng', date: '22/04/2026', status: 'Thành công' },
    { id: 2, title: 'Thông báo bảo trì hệ thống', content: 'Hệ thống sẽ bảo trì từ 12h đêm nay...', target: 'Tất cả người dùng', date: '21/04/2026', status: 'Thành công' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('Tất cả đánh giá');
  const [statusFilter, setStatusFilter] = useState('Trạng thái: Tất cả');

  // Handle Actions
  const handleApprove = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: 'Đã duyệt' } : c));
    alert('Đã duyệt bình luận thành công!');
  };

  const handleFlag = (id) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: 'Vi phạm' } : c));
    alert('Đã đánh dấu vi phạm bình luận này.');
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  const handleSendNotify = (e) => {
    e.preventDefault();
    const newNotify = {
      id: Date.now(),
      title: e.target.title.value,
      content: e.target.content.value,
      target: e.target.target.value,
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'Thành công'
    };

    if (!newNotify.title || !newNotify.content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    setNotifications([newNotify, ...notifications]);
    alert('Thông báo hệ thống đã được gửi thành công!');
    setShowNotifyModal(false);
  };

  // Filter Logic
  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      // Tự động phân tách dữ liệu theo Tab
      if (activeTab === 'comments') {
        if (c.status === 'Vi phạm') return false; // Không hiện vi phạm ở tab thường
      } else if (activeTab === 'reports') {
        if (c.status !== 'Vi phạm') return false; // Chỉ hiện vi phạm ở tab báo cáo
      }

      const matchesSearch = c.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           c.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRating = ratingFilter === 'Tất cả đánh giá' || c.rating === parseInt(ratingFilter);
      
      // Nếu ở tab thường thì mới áp dụng lọc trạng thái (vì tab vi phạm đã cố định trạng thái)
      const matchesStatus = activeTab === 'reports' ? true : 
                          (statusFilter === 'Trạng thái: Tất cả' || c.status === statusFilter);
      
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [comments, searchTerm, ratingFilter, statusFilter, activeTab]);

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Tương tác & Phản hồi</h1>
          <p className="page-subtitle">Quản lý bình luận, đánh giá và gửi thông báo hệ thống.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNotifyModal(true)}>
          <Bell size={18} />
          Gửi thông báo mới
        </button>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        <button 
          className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveTab('comments')}
        >
          <MessageSquare size={18} /> Bình luận & Đánh giá
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Flag size={18} /> Báo cáo vi phạm
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} /> Lịch sử thông báo
        </button>
      </div>

      {/* Feedback List */}
      <div className="feedback-list card">
        <div className="filters-bar no-shadow">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bình luận..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="filter-item">
              <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                <option>Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
          {activeTab === 'comments' && (
            <div className="filter-item">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option>Trạng thái: Tất cả</option>
                <option>Chờ duyệt</option>
                <option>Đã duyệt</option>
              </select>
            </div>
          )}
          </div>
        </div>

        {activeTab === 'history' ? (
          <div className="history-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề / Nội dung</th>
                  <th>Đối tượng</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td>
                      <div style={{ maxWidth: '300px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{n.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</div>
                      </div>
                    </td>
                    <td><span className="role-badge khách">{n.target}</span></td>
                    <td><span className="comment-date">{n.date}</span></td>
                    <td><span className="status-tag đã-duyệt">{n.status}</span></td>
                    <td>
                      <button className="action-btn delete" onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="comments-grid">
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <div key={comment.id} className={`comment-card ${comment.status === 'Vi phạm' ? 'flagged' : ''}`}>
                  <div className="comment-header">
                    <div className="user-info">
                      <div className="user-avatar-small"><User size={14} /></div>
                      <span className="user-name">{comment.user}</span>
                      <span className="dot">•</span>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <div className="comment-status">
                      <span className={`status-tag ${comment.status.replace(' ', '-').toLowerCase()}`}>
                        {comment.status}
                      </span>
                    </div>
                  </div>

                  <div className="comment-product">
                    <span className="label">Sản phẩm:</span>
                    <span className="p-link">{comment.product} <ExternalLink size={12} /></span>
                  </div>

                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < comment.rating ? "#f59e0b" : "none"} color={i < comment.rating ? "#f59e0b" : "#cbd5e1"} />
                    ))}
                  </div>

                  <p className="comment-body">{comment.content}</p>

                  <div className="comment-actions">
                    {comment.status === 'Chờ duyệt' && (
                      <button className="btn-approve" onClick={() => handleApprove(comment.id)}>
                        <CheckCircle2 size={16} /> Duyệt
                      </button>
                    )}
                    {comment.status !== 'Vi phạm' && (
                      <button className="btn-reject" onClick={() => handleFlag(comment.id)}>
                        <XCircle size={16} /> Đánh dấu vi phạm
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(comment.id)}>
                      <Trash2 size={16} /> Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                Không tìm thấy bình luận nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showNotifyModal && (
        <div className="modal-overlay" onClick={() => setShowNotifyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>Gửi thông báo hệ thống</h2>
              <button className="close-btn" onClick={() => setShowNotifyModal(false)}><X size={24} /></button>
            </div>
            <form className="modal-body" onSubmit={handleSendNotify}>
              <div className="input-group">
                <label>Tiêu đề thông báo</label>
                <input name="title" type="text" placeholder="VD: Khuyến mãi cuối tuần rực rỡ!" required />
              </div>
              <div className="input-group">
                <label>Nội dung thông báo</label>
                <textarea name="content" rows="4" placeholder="Nhập nội dung chi tiết gửi đến người dùng..." required></textarea>
              </div>
              <div className="input-group">
                <label>Đối tượng nhận</label>
                <select name="target">
                  <option>Tất cả người dùng</option>
                  <option>Khách hàng VIP</option>
                  <option>Người dùng mới (trong 30 ngày)</option>
                  <option>Người dùng chưa mua hàng</option>
                </select>
              </div>
              <div className="input-group">
                <label>Liên kết đính kèm (URL)</label>
                <input name="url" type="text" placeholder="https://phonesin.com/khuyen-mai" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowNotifyModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary"><Send size={18} /> Gửi ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;

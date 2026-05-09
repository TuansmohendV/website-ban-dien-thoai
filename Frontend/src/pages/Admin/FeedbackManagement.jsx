import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  History,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api, { getApiErrorMessage } from '../../lib/api';

const moderationLabelMap = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Vi phạm',
};

const mapReviewForAdmin = (review = {}) => ({
  id: review._id,
  user: review.user?.fullName || 'Khách hàng',
  rating: Number(review.rating || 0),
  content: review.comment || review.title || 'Đánh giá sản phẩm',
  product: review.product?.name || 'Sản phẩm',
  date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : '',
  status: moderationLabelMap[review.moderationStatus] || 'Chờ duyệt',
  isVIP: review.user?.isVIP || false,
});

const FeedbackManagement = () => {
  const [activeTab, setActiveTab] = useState('comments');
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('Tất cả đánh giá');
  const [statusFilter, setStatusFilter] = useState('Trạng thái: Tất cả');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    setCommentsError('');
    try {
      const response = await api.get('/api/admin/reviews', {
        params: { page: 1, limit: 200 },
      });
      const list = (response.data?.data || []).map(mapReviewForAdmin);
      setComments(list);
    } catch (error) {
      setComments([]);
      setCommentsError(getApiErrorMessage(error, 'Không thể tải bình luận từ database.'));
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await api.get('/api/admin/broadcasts');
      const list = (response.data?.data || []).map(b => ({
        id: b._id,
        title: b.title,
        content: b.message,
        target: b.targetAudience === 'all' ? 'Tất cả người dùng' : 
                b.targetAudience === 'new_users' ? 'Người dùng mới' : 
                b.targetAudience === 'active_users' ? 'Người dùng tích cực' : 'Khác',
        date: new Date(b.createdAt).toLocaleDateString('vi-VN'),
        status: b.isSent ? 'Đã gửi' : 'Chưa gửi',
        isSent: b.isSent
      }));
      setNotifications(list);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
    loadNotifications();
  }, [loadComments, loadNotifications]);

  // Handle Actions
  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/admin/reviews/${id}`, { moderationStatus: 'approved' });
      await loadComments();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể duyệt bình luận.'));
    }
  };

  const handleFlag = async (id) => {
    try {
      await api.patch(`/api/admin/reviews/${id}`, { moderationStatus: 'rejected' });
      await loadComments();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể đánh dấu vi phạm.'));
    }
  };

  const handleReset = async (id) => {
    try {
      await api.patch(`/api/admin/reviews/${id}`, { moderationStatus: 'pending' });
      await loadComments();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể đặt lại trạng thái.'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?')) {
      try {
        await api.delete(`/api/admin/reviews/${id}`);
        await loadComments();
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể xóa bình luận.'));
      }
    }
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await api.delete(`/api/admin/broadcasts/${id}`);
        await loadNotifications();
      } catch (error) {
        alert(getApiErrorMessage(error, 'Không thể xóa thông báo.'));
      }
    }
  };

  const handleSendNotify = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const message = e.target.content.value;
    const targetLabel = e.target.target.value;

    const targetMap = {
      'Tất cả người dùng': 'all',
      'Khách hàng VIP': 'active_users',
      'Người dùng mới (trong 30 ngày)': 'new_users',
      'Người dùng chưa mua hàng': 'unpurchased_users'
    };

    const targetAudience = targetMap[targetLabel] || 'all';

    if (!title || !message) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    try {
      // 1. Create broadcast
      const createRes = await api.post('/api/admin/broadcasts', {
        title,
        message,
        targetAudience
      });

      const broadcastId = createRes.data.data.broadcast._id;

      // 2. Send broadcast
      await api.post(`/api/admin/broadcasts/${broadcastId}/send`);

      alert('Thông báo hệ thống đã được gửi thành công!');
      setShowNotifyModal(false);
      await loadNotifications();
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể gửi thông báo.'));
    }
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
      const statusText = statusFilter.replace('Trạng thái: ', '');
      const matchesStatus = activeTab === 'reports' ? true :
                          (statusFilter === 'Trạng thái: Tất cả' || c.status === statusText);
      
      return matchesSearch && matchesRating && matchesStatus;
    });
  }, [comments, searchTerm, ratingFilter, statusFilter, activeTab]);

  // Pagination calculations
  const totalPages = Math.ceil((activeTab === 'history' ? notifications.length : filteredComments.length) / itemsPerPage);
  const currentItems = (activeTab === 'history' ? notifications : filteredComments).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, ratingFilter, statusFilter]);

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

        {isLoadingComments && activeTab !== 'history' ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
            Đang tải bình luận từ database...
          </div>
        ) : commentsError && activeTab !== 'history' ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
            {commentsError}
          </div>
        ) : activeTab === 'history' ? (
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
                 {activeTab === 'history' ? (
                   currentItems.map(n => (
                     <tr key={n.id}>
                       <td>
                         <div style={{ maxWidth: '300px' }}>
                           <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{n.title}</div>
                           <div style={{ fontSize: '0.85rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</div>
                         </div>
                       </td>
                       <td><span className="role-badge khách">{n.target}</span></td>
                       <td><span className="comment-date">{n.date}</span></td>
                       <td><span className={`status-tag ${n.isSent ? 'đã-duyệt' : 'chờ-duyệt'}`}>{n.status}</span></td>
                       <td>
                         <button className="action-btn delete" onClick={() => handleDeleteNotification(n.id)}>
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))
                 ) : null}
               </tbody>
            </table>
          </div>
        ) : (
          <div className="comments-grid">
            {currentItems.length > 0 ? (
              currentItems.map((comment) => (
                <div key={comment.id} className={`comment-card ${comment.status === 'Vi phạm' ? 'flagged' : ''}`}>
                  <div className="comment-header">
                    <div className="user-info">
                      <div className="user-avatar-small"><User size={14} /></div>
                      <span className="user-name">
                        {comment.user}
                        {comment.isVIP && (
                          <span style={{ 
                            marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', 
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                            color: 'white', fontSize: '0.65rem', fontWeight: '900',
                            textTransform: 'uppercase', letterSpacing: '0.5px',
                            boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)'
                          }}>
                            VIP
                          </span>
                        )}
                      </span>
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
                        <CheckCircle2 size={16} /> Duyệt đánh giá
                      </button>
                    )}
                    {comment.status === 'Đã duyệt' && (
                      <button className="btn-reset" onClick={() => handleReset(comment.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                        background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                      }}>
                        Hoàn tác duyệt
                      </button>
                    )}
                    {comment.status !== 'Vi phạm' ? (
                      <button className="btn-reject" onClick={() => handleFlag(comment.id)}>
                        <XCircle size={16} /> Đánh dấu vi phạm
                      </button>
                    ) : (
                      <button className="btn-reset" onClick={() => handleReset(comment.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                        background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px',
                        fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                      }}>
                        Bỏ đánh dấu vi phạm
                      </button>
                    )}
                    <button className="btn-delete" onClick={() => handleDelete(comment.id)}>
                      <Trash2 size={16} /> Xóa
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            padding: '25px', gap: '15px', borderTop: '1px solid #f1f5f9' 
          }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-btn ${currentPage === 1 ? 'disabled' : ''}`}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={18} />
            </button>
            
            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
              Trang {currentPage} / {totalPages}
            </span>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              style={{
                width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <ChevronRight size={18} />
            </button>
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

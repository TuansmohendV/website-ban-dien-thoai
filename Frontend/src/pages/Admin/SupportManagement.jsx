import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, MessageSquare, RefreshCw, Search, Send, User } from 'lucide-react';
import { io } from 'socket.io-client';
import api, { getApiErrorMessage } from '../../lib/api';
import { AUTH_TOKEN_KEY, getStorageItem } from '../../lib/session';

const statusLabels = {
  open: 'Mới',
  in_progress: 'Đang xử lý',
  resolved: 'Đã phản hồi',
  closed: 'Đã đóng',
};

const priorityLabels = {
  low: 'Thấp',
  medium: 'Vừa',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/admin/support/tickets', {
        params: { limit: 200 },
      });
      const nextTickets = response.data?.data || [];
      setTickets(nextTickets);
      setSelectedId((current) => current || nextTickets[0]?._id || '');
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể tải ticket hỗ trợ.'));
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    const token = getStorageItem(AUTH_TOKEN_KEY);

    if (!token) {
      return undefined;
    }

    const socket = io(api.defaults.baseURL || window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('support:ticket-updated', ({ ticket }) => {
      if (!ticket) return;

      setTickets((current) => {
        const exists = current.some((item) => item._id === ticket._id);

        if (exists) {
          return current.map((item) => (item._id === ticket._id ? ticket : item));
        }

        return [ticket, ...current];
      });
      setSelectedId((current) => current || ticket._id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredTickets = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const customer = ticket.userId?.fullName || ticket.userId?.email || ticket.userId?.phone || '';
      const matchesSearch =
        !keyword ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.description.toLowerCase().includes(keyword) ||
        customer.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const selectedTicket = tickets.find((ticket) => ticket._id === selectedId) || filteredTickets[0];

  const updateTicket = async (payload) => {
    if (!selectedTicket) return;

    setIsSaving(true);
    try {
      const response = await api.patch(`/api/admin/support/tickets/${selectedTicket._id}`, payload);
      const updated = response.data?.data?.ticket;
      if (updated) {
        setTickets((current) => current.map((ticket) => (ticket._id === updated._id ? updated : ticket)));
      }
      setReply('');
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật ticket.'));
    } finally {
      setIsSaving(false);
    }
  };

  const sendReply = () => {
    const content = reply.trim();
    if (!content) {
      alert('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    updateTicket({
      adminResponse: content,
      status: 'resolved',
    });
  };

  return (
    <div className="support-admin">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Hỗ trợ khách hàng</h1>
          <p className="page-subtitle">Xem và phản hồi các ticket được gửi từ chat hoặc trang hỗ trợ.</p>
        </div>
        <button className="btn-outline" onClick={loadTickets} disabled={isLoading}>
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      <div className="support-grid">
        <section className="card ticket-list-card">
          <div className="support-filters">
            <div className="search-box">
              <Search size={18} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm khách, tiêu đề, nội dung..."
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="open">Mới</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã phản hồi</option>
              <option value="closed">Đã đóng</option>
            </select>
          </div>

          <div className="ticket-list">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => {
                  setSelectedId(ticket._id);
                  setReply('');
                }}
                className={`ticket-item ${selectedTicket?._id === ticket._id ? 'active' : ''}`}
              >
                <div className="ticket-title-row">
                  <strong>{ticket.title}</strong>
                  <span className={`ticket-status ${ticket.status}`}>{statusLabels[ticket.status] || ticket.status}</span>
                </div>
                <p>{ticket.description}</p>
                <div className="ticket-meta">
                  <span><User size={13} /> {ticket.userId?.fullName || ticket.userId?.email || 'Khách hàng'}</span>
                  <span><Clock size={13} /> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : ''}</span>
                </div>
              </button>
            ))}

            {!isLoading && filteredTickets.length === 0 && (
              <div className="empty-support">Chưa có ticket phù hợp.</div>
            )}
            {isLoading && <div className="empty-support">Đang tải ticket...</div>}
          </div>
        </section>

        <section className="card ticket-detail-card">
          {selectedTicket ? (
            <>
              <div className="detail-header">
                <div>
                  <h2>{selectedTicket.title}</h2>
                  <p>{selectedTicket.userId?.fullName || 'Khách hàng'} · {selectedTicket.userId?.email || selectedTicket.userId?.phone || 'Chưa có liên hệ'}</p>
                </div>
                <span className={`ticket-status ${selectedTicket.status}`}>{statusLabels[selectedTicket.status] || selectedTicket.status}</span>
              </div>

              <div className="detail-body">
                <div className="message-card customer">
                  <MessageSquare size={18} />
                  <div>
                    <strong>Nội dung khách gửi</strong>
                    <p>{selectedTicket.description}</p>
                  </div>
                </div>

                {selectedTicket.adminResponse && (
                  <div className="message-card admin">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Phản hồi hiện tại</strong>
                      <p>{selectedTicket.adminResponse}</p>
                      <small>{selectedTicket.respondedAt ? new Date(selectedTicket.respondedAt).toLocaleString('vi-VN') : ''}</small>
                    </div>
                  </div>
                )}

                {Array.isArray(selectedTicket.messages) && selectedTicket.messages.length > 0 && (
                  <div className="thread-card">
                    <strong>Lịch sử chat realtime</strong>
                    <div className="thread-list">
                      {selectedTicket.messages.map((item) => (
                        <div key={item._id || `${item.sender}-${item.createdAt}`} className={`thread-message ${item.sender}`}>
                          <span>{item.sender === 'admin' ? 'Admin' : 'Khách'}</span>
                          <p>{item.text}</p>
                          <small>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ticket-controls">
                  <label>
                    Trạng thái
                    <select value={selectedTicket.status} onChange={(event) => updateTicket({ status: event.target.value })}>
                      <option value="open">Mới</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="resolved">Đã phản hồi</option>
                      <option value="closed">Đã đóng</option>
                    </select>
                  </label>
                  <label>
                    Mức ưu tiên
                    <select value={selectedTicket.priority} onChange={(event) => updateTicket({ priority: event.target.value })}>
                      <option value="low">Thấp</option>
                      <option value="medium">Vừa</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </label>
                </div>

                <div className="reply-box">
                  <textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Nhập phản hồi gửi cho khách..."
                  />
                  <button className="btn-primary" onClick={sendReply} disabled={isSaving}>
                    <Send size={18} />
                    {isSaving ? 'Đang gửi' : 'Gửi phản hồi'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-detail">Chọn một ticket để xem chi tiết.</div>
          )}
        </section>
      </div>

      <style jsx="true">{`
        .support-admin {
          animation: fadeIn 0.4s ease-out;
        }

        .support-grid {
          display: grid;
          grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
          gap: 20px;
        }

        .ticket-list-card,
        .ticket-detail-card {
          padding: 0;
          overflow: hidden;
        }

        .support-filters {
          padding: 16px;
          display: flex;
          gap: 10px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }

        .support-filters .search-box {
          min-width: 0;
          flex: 1;
        }

        .support-filters select,
        .ticket-controls select {
          height: 40px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0 10px;
          background: white;
          color: #475569;
          font-weight: 600;
        }

        .ticket-list {
          max-height: calc(100vh - 240px);
          overflow-y: auto;
        }

        .ticket-item {
          width: 100%;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: white;
          padding: 16px;
          text-align: left;
          cursor: pointer;
        }

        .ticket-item:hover,
        .ticket-item.active {
          background: #eff6ff;
        }

        .ticket-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .ticket-title-row strong {
          color: #0f172a;
          font-size: 14px;
        }

        .ticket-item p {
          margin: 8px 0 10px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ticket-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: #94a3b8;
          font-size: 12px;
        }

        .ticket-meta span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .ticket-status {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          background: #f1f5f9;
          color: #64748b;
        }

        .ticket-status.open { background: #fff7ed; color: #c2410c; }
        .ticket-status.in_progress { background: #eff6ff; color: #1d4ed8; }
        .ticket-status.resolved { background: #ecfdf5; color: #047857; }
        .ticket-status.closed { background: #f1f5f9; color: #475569; }

        .detail-header {
          padding: 22px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .detail-header h2 {
          margin: 0;
          font-size: 20px;
          color: #0f172a;
        }

        .detail-header p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .detail-body {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
        }

        .message-card.customer {
          background: #f8fafc;
          color: #2563eb;
        }

        .message-card.admin {
          background: #ecfdf5;
          color: #047857;
        }

        .message-card strong {
          color: #0f172a;
          display: block;
          margin-bottom: 8px;
        }

        .message-card p {
          color: #334155;
          margin: 0;
          line-height: 1.6;
        }

        .message-card small {
          display: block;
          margin-top: 8px;
          color: #64748b;
        }

        .thread-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          background: white;
        }

        .thread-card > strong {
          display: block;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .thread-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .thread-message {
          max-width: 78%;
          border-radius: 14px;
          padding: 10px 12px;
          background: #f1f5f9;
          color: #334155;
        }

        .thread-message.admin {
          align-self: flex-end;
          background: #eff6ff;
        }

        .thread-message.user {
          align-self: flex-start;
        }

        .thread-message span {
          display: block;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .thread-message p {
          margin: 0;
          font-size: 13px;
          line-height: 1.5;
        }

        .thread-message small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
        }

        .ticket-controls {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .ticket-controls label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
          font-weight: 800;
          color: #475569;
        }

        .reply-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reply-box textarea {
          min-height: 140px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          outline: none;
          resize: vertical;
        }

        .reply-box button {
          align-self: flex-end;
        }

        .empty-support,
        .empty-detail {
          padding: 32px;
          text-align: center;
          color: #94a3b8;
          font-weight: 700;
        }

        @media (max-width: 1100px) {
          .support-grid {
            grid-template-columns: 1fr;
          }

          .ticket-list {
            max-height: 420px;
          }
        }
      `}</style>
    </div>
  );
};

export default SupportManagement;

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X,
  Truck, 
  Eye, 
  Download, 
  Search, 
  Filter,
  User,
  MapPin,
  Phone,
  Package,
  Calendar
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';

const OrderManagement = () => {
  const { orders, markDelivered, cancelOrder, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Status mapping
  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Chờ xác nhận', color: '#3b82f6' };
      case 'processing': return { label: 'Đang xử lý', color: '#f59e0b' };
      case 'shipping': return { label: 'Đang giao', color: '#8b5cf6' };
      case 'delivered': return { label: 'Đã hoàn tất', color: '#10b981' };
      case 'cancelled': return { label: 'Đã hủy', color: '#ef4444' };
      default: return { label: 'Lỗi', color: '#64748b' };
    }
  };

  const orderStatuses = [
    { label: 'Tất cả', count: orders.length, color: '#64748b' },
    { label: 'Chờ xác nhận', status: 'pending', color: '#3b82f6' },
    { label: 'Đang xử lý', status: 'processing', color: '#f59e0b' },
    { label: 'Đã hoàn tất', status: 'delivered', color: '#10b981' },
    { label: 'Đã hủy', status: 'cancelled', color: '#ef4444' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.customerInfo?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'Tất cả') return matchesSearch;
    
    const statusObj = orderStatuses.find(s => s.label === activeTab);
    return matchesSearch && o.status === statusObj?.status;
  });

  // Calculate pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const displayedOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const formatDate = (order) => {
    try {
      const dateStr = order.createdAt || order.date || order.id.split('-')[1];
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Mới đặt' : date.toLocaleDateString('vi-VN');
    } catch (e) {
      return 'Mới đặt';
    }
  };

  const formatDateTime = (order) => {
    try {
      const dateStr = order.createdAt || order.date || order.id.split('-')[1];
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'Vừa xong' : date.toLocaleString('vi-VN');
    } catch (e) {
      return 'Vừa xong';
    }
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Đơn hàng</h1>
          <p className="page-subtitle">Theo dõi trạng thái và xử lý đơn đặt hàng từ khách hàng.</p>
        </div>
        <div className="btn-group">
          <button className="btn-outline"><Download size={18} /> Xuất báo cáo</button>
        </div>
      </div>

      {/* Order Status Tabs */}
      <div className="status-tabs">
        {orderStatuses.map((status, index) => (
          <button 
            key={index} 
            className={`status-tab ${activeTab === status.label ? 'active' : ''}`}
            onClick={() => setActiveTab(status.label)}
          >
            {status.label}
            <span className="count-badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
              {status.status ? orders.filter(o => o.status === status.status).length : orders.length}
            </span>
          </button>
        ))}
      </div>

      <div className="full-width-table-container">
        {/* Order List */}
        <div className="order-list-section card">
          <div className="filters-row">
            <div className="search-box">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Tìm mã đơn, tên khách, SĐT..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', minWidth: '300px' }}
              />
            </div>
            <button className="btn-icon-square"><Filter size={18} /></button>
          </div>

          <div className="orders-table-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            <table className="admin-table simple" style={{ flex: 1, minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng thanh toán</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {displayedOrders.length > 0 ? displayedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const itemCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
                  const itemPreview = order.items?.[0]?.name || '';
                  
                  return (
                    <tr key={order.id} className="hover-row">
                      <td>
                        <span className="order-id-short">{order.id.slice(0, 10)}...</span>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px'}}>{formatDateTime(order)}</div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <span className="c-name">{order.customerInfo?.name || 'Khách vãng lai'}</span>
                          <span className="c-phone" style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.customerInfo?.phone || 'Trống'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#1e293b' }}>
                           {itemPreview} {order.items?.length > 1 ? `và ${order.items.length - 1} sp khác` : ''}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
                           Tổng: {itemCount} sản phẩm
                        </div>
                      </td>
                      <td><span className="price-text" style={{ fontWeight: '700', color: '#1e293b' }}>{order.total?.toLocaleString()} ₫</span></td>
                      <td>
                        <select
                           value={order.status}
                           onClick={(e) => e.stopPropagation()}
                           onChange={(e) => { e.stopPropagation(); updateOrderStatus(order.id, e.target.value); }}
                           style={{ 
                             backgroundColor: `${statusInfo.color}15`, 
                             color: statusInfo.color, 
                             padding: '6px 28px 6px 12px', 
                             borderRadius: '20px', 
                             fontSize: '0.85rem', 
                             fontWeight: '600',
                             border: `1px solid ${statusInfo.color}40`,
                             outline: 'none',
                             cursor: 'pointer',
                             appearance: 'none',
                             WebkitAppearance: 'none',
                             backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${encodeURIComponent(statusInfo.color)}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
                             backgroundRepeat: 'no-repeat',
                             backgroundPositionX: 'calc(100% - 6px)',
                             backgroundPositionY: 'center',
                             backgroundSize: '18px',
                             transition: 'all 0.2s'
                           }}
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="delivered">Đã hoàn tất</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', minWidth: '160px' }}>
                        {order.status === 'pending' && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'processing'); }}
                             style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                             onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                             onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                          >
                             Duyệt đơn
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); updateOrderStatus(order.id, 'shipping'); }}
                             style={{ padding: '8px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                             onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                             onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                          >
                             Giao hàng
                          </button>
                        )}
                        {order.status === 'shipping' && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); markDelivered(order.id); }}
                             style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                             onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                             onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                          >
                             Hoàn tất
                          </button>
                        )}
                        <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                           style={{ padding: '8px 12px', background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                           onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = 'white'; }}
                           onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2563eb'; }}
                        >
                           Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Không có đơn hàng nào</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Thanh điều hướng Phân trang (Luôn hiển thị để giữ khung UI) */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '15px 20px', 
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              marginTop: 'auto'
            }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Hiển thị {filteredOrders.length > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} trong {filteredOrders.length} đơn
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#1e293b' }}
                >
                  Trước
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px', fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                  Trang {currentPage} / {Math.max(1, totalPages)}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage >= totalPages ? '#f1f5f9' : 'white', borderRadius: '6px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: currentPage >= totalPages ? '#94a3b8' : '#1e293b' }}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Modal Overlay */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="details-header">
                <div className="title-area">
                  <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Chi tiết đơn hàng #{selectedOrder.id.slice(0,10)}...</h3>
                  <span className="status-chip" style={{ backgroundColor: `${getStatusInfo(selectedOrder.status).color}15`, color: getStatusInfo(selectedOrder.status).color, marginLeft: '15px' }}>
                    {getStatusInfo(selectedOrder.status).label}
                  </span>
                </div>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                  <X size={24} />
                </button>
              </div>

              <div className="details-body">
                {/* Hành động nhanh */}
                <div className="action-btns-large" style={{ marginBottom: '25px', display: 'flex', gap: '15px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                    📦 Cập nhật trạng thái tự động:
                  </div>
                  {selectedOrder.status === 'pending' && (
                    <button className="btn-deliver" onClick={() => { updateOrderStatus(selectedOrder.id, 'processing'); setSelectedOrder(null); }} style={{ background: '#3b82f6', color: 'white' }}>
                      Xác nhận duyệt đơn
                    </button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <button className="btn-deliver" onClick={() => { updateOrderStatus(selectedOrder.id, 'shipping'); setSelectedOrder(null); }} style={{ background: '#8b5cf6', color: 'white' }}>
                      Bắt đầu giao hàng
                    </button>
                  )}
                  {selectedOrder.status === 'shipping' && (
                    <button className="btn-deliver" onClick={() => { markDelivered(selectedOrder.id); setSelectedOrder(null); }} style={{ background: '#10b981', color: 'white' }}>
                      <CheckCircle2 size={18} style={{ marginRight: '5px' }} /> Xác nhận đã nhận hàng
                    </button>
                  )}
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <button className="btn-cancel" onClick={() => { cancelOrder(selectedOrder.id); setSelectedOrder(null); }} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2' }}>
                      <XCircle size={18} style={{ marginRight: '5px' }} /> Hủy đơn hàng này
                    </button>
                  )}
                </div>

                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-icon"><User size={20} /></div>
                    <div className="info-content">
                      <label>Khách hàng</label>
                      <p>{selectedOrder.customerInfo?.name}</p>
                      <p className="sub-p"><Phone size={12} /> {selectedOrder.customerInfo?.phone}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon"><MapPin size={20} /></div>
                    <div className="info-content">
                      <label>Địa chỉ giao hàng</label>
                      <p>{selectedOrder.customerInfo?.address}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon"><Calendar size={20} /></div>
                    <div className="info-content">
                      <label>Thời gian đặt</label>
                      <p>{formatDateTime(selectedOrder)}</p>
                    </div>
                  </div>
                </div>

                <div className="order-items">
                  <h4 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>Danh sách Sản phẩm</h4>
                  <div className="items-list" style={{ border: 'none', padding: '0' }}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="item-row" style={{ padding: '15px 0', borderBottom: '1px solid #f8fafc', gridTemplateColumns: '60px 1fr 80px 120px' }}>
                        <div className="item-img" style={{ width: '60px', height: '60px' }}>{item.image ? <img src={item.image} alt="" className="w-full h-full object-contain" /> : '📱'}</div>
                        <div className="item-info">
                          <span className="item-name" style={{ fontSize: '1rem', color: '#1e293b' }}>{item.name}</span>
                          <span className="item-variant" style={{ marginTop: '4px', display: 'block' }}>Phân loại: Gốc</span>
                        </div>
                        <div className="item-qty" style={{ fontSize: '1rem' }}>x{item.quantity}</div>
                        <div className="item-price" style={{ fontSize: '1.05rem', color: '#2563eb' }}>{item.price?.toLocaleString()} ₫</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="order-summary" style={{ marginTop: '20px', background: '#f8fafc', padding: '25px', borderRadius: '16px' }}>
                  <div className="summary-row">
                    <span>Tạm tính</span>
                    <span>{(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString()} ₫</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="summary-row">
                    <span>Giảm giá Code/Voucher</span>
                    <span className="discount">-{ (selectedOrder.discount || 0).toLocaleString() } ₫</span>
                  </div>
                  <div className="summary-row total" style={{ fontSize: '1.3rem', borderTopColor: '#cbd5e1' }}>
                    <span>Tổng thanh toán</span>
                    <span style={{ color: '#2563eb' }}>{(selectedOrder.total || 0).toLocaleString()} ₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .status-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 25px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .status-tab {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .status-tab:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .status-tab.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .count-badge {
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 0.75rem;
        }

        .status-tab.active .count-badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .full-width-table-container {
           width: 100%;
        }

        .order-list-section {
          padding: 0 !important;
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }

        .filters-row {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .search-box {
           display: flex;
           align-items: center;
           gap: 10px;
           background: #f8fafc;
           padding: 10px 15px;
           border-radius: 10px;
           border: 1px solid #e2e8f0;
           flex: 1;
           max-width: 400px;
        }
        .search-box input {
           border: none;
           background: transparent;
           outline: none;
           font-size: 0.95rem;
           width: 100%;
        }

        .orders-table-wrapper {
          overflow-x: auto;
        }

        .admin-table th {
           background: #f8fafc;
           color: #64748b;
           font-size: 0.85rem;
           padding: 15px 20px;
        }
        
        .admin-table td {
           padding: 20px;
        }

        .hover-row {
          transition: background 0.2s;
        }
        .hover-row:hover { background: #f8fafc; }

        .order-id-short {
          font-weight: 700;
          color: #2563eb;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
        }

        .c-name { font-weight: 600; color: #1e293b; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .order-detail-modal {
          background: white;
          width: 100%;
          max-width: 900px;
          height: 90vh;
          max-height: 800px;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
           from { opacity: 0; transform: translateY(30px); }
           to { opacity: 1; transform: translateY(0); }
        }

        .details-header {
          padding: 25px 30px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-area {
           display: flex;
           align-items: center;
        }

        .close-btn {
           background: #f1f5f9;
           border: none;
           width: 40px; height: 40px;
           border-radius: 50%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #64748b;
           cursor: pointer;
           transition: all 0.2s;
        }
        .close-btn:hover { background: #e2e8f0; color: #ef4444; transform: rotate(90deg); }

        .btn-deliver, .btn-cancel {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          display: flex;
          align-items: center;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          transition: transform 0.1s;
        }
        .btn-deliver:hover, .btn-cancel:hover { transform: translateY(-2px); }

        .details-body {
          padding: 30px;
          overflow-y: auto;
          flex: 1;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .info-card {
          display: flex;
          gap: 15px;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 12px;
        }

        .info-icon {
          width: 45px;
          height: 45px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-content label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-content p {
          font-weight: 600;
          margin-top: 6px;
          font-size: 0.95rem;
          color: #1e293b;
        }

        .sub-p { color: #64748b; font-weight: 400 !important; font-size: 0.85rem !important; margin-top: 4px !important; }

        .order-items { margin-bottom: 30px; }
        .order-items h4 { margin-bottom: 15px; font-size: 1.1rem; color: #1e293b; font-weight: 700; }

        .item-row { display: grid; align-items: center; gap: 20px; }
        .item-img { background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; padding: 5px; border: 1px solid #f1f5f9; }
        .item-qty { font-weight: 600; color: #64748b; }
        .item-price { text-align: right; font-weight: 700; color: #1e293b; }

        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1rem; color: #64748b; }
        .discount { color: #ef4444; font-weight: 600; }
        .summary-row.total { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e1; color: #1e293b; font-weight: 700; }

        @media (max-width: 1024px) {
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;

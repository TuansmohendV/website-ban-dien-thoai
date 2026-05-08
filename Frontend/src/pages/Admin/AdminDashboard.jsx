import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import api from '../../lib/api';
import { normalizeProduct } from '../../lib/products';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get('/api/products', {
          params: { limit: 200, sort: 'popular', includeInactive: true },
        });
        setProducts((response.data?.data || []).map(normalizeProduct));
      } catch {
        setProducts([]);
      }
    };

    loadProducts();
  }, []);
  
  const totalRevenue = orders.reduce((sum, order) => {
    const val = order.totalAmount || order.total || order.amount || 0;
    return sum + (Number(val) || 0);
  }, 0);
  const totalProducts = products.length;

  const chartValues = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' });
    const dayBuckets = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      return {
        key,
        day: formatter.format(date),
        rawTotal: 0,
      };
    });

    const bucketMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]));

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt || order.date || Date.now())
        .toISOString()
        .slice(0, 10);
      const targetBucket = bucketMap.get(dateKey);

      if (targetBucket) {
        targetBucket.rawTotal += Number(order.totalAmount || order.total || 0);
      }
    });

    const maxTotal = Math.max(...dayBuckets.map((bucket) => bucket.rawTotal), 1);

    return dayBuckets.map((bucket) => ({
      day: bucket.day,
      val: Math.max(Math.round((bucket.rawTotal / maxTotal) * 100), bucket.rawTotal > 0 ? 12 : 6),
      label: `${Math.round(bucket.rawTotal / 1000000)}M`,
    }));
  }, [orders]);

  const topProducts = products
    .slice()
    .sort((left, right) => Number(right.soldCount || 0) - Number(left.soldCount || 0))
    .slice(0, 3);
  
  const stats = [
    { label: 'Doanh thu', value: `${totalRevenue.toLocaleString()} ₫`, icon: <DollarSign />, trend: '+12.5%', isPositive: true, color: '#3b82f6' },
    { label: 'Đơn hàng', value: orders.length.toString(), icon: <ShoppingBag />, trend: '+5.2%', isPositive: true, color: '#10b981' },
    { label: 'Khách hàng mới', value: '42', icon: <Users />, trend: '+14%', isPositive: true, color: '#f59e0b' },
    { label: 'Tồn kho thấp', value: products.filter(p => (p.stock || 0) < 5).length.toString(), icon: <AlertTriangle />, trend: 'Cần nhập', isPositive: false, color: '#ef4444' },
  ];

  const recentOrders = orders.slice(0, 5).map(o => {
    const amount = o.totalAmount || o.total || o.amount || 0;
    const name = o.customer?.fullName || o.customer?.name || o.customerInfo?.name || 'Khách vãng lai';
    
    // Xử lý ngày tháng: "12:37:40, 22/04/2026" -> Lấy "22/04/2026"
    let displayDate = 'Vừa xong';
    if (o.date) {
      const parts = o.date.split(',');
      displayDate = parts.length > 1 ? parts[1].trim() : parts[0];
    }

    return {
      id: o.id,
      customer: name,
      date: displayDate,
      amount: `${(Number(amount) || 0).toLocaleString()} ₫`,
      status: o.status === 'delivered' || o.status === 'Đã giao' ? 'Đã giao' : o.status === 'cancelled' || o.status === 'Đã hủy' ? 'Đã hủy' : 'Đang xử lý',
      statusColor: (o.status === 'delivered' || o.status === 'Đã giao') ? '#10b981' : (o.status === 'cancelled' || o.status === 'Đã hủy') ? '#ef4444' : '#f59e0b'
    };
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title" style={{ fontSize: '28px', fontWeight: '800' }}>Tổng quan hệ thống</h1>
        <p className="page-subtitle">Dữ liệu được cập nhật thời gian thực từ cửa hàng của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-value-row">
                <h2 className="stat-value">{stat.value}</h2>
                <span className={`stat-trend ${stat.isPositive ? 'positive' : 'negative'}`}>
                  {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Revenue Chart Section */}
        <div className="chart-section card" style={{ overflow: 'visible' }}>
          <div className="card-header">
            <h3>Báo cáo doanh thu</h3>
            <select className="card-select">
              <option>Theo ngày</option>
              <option>Theo tháng</option>
              <option>Theo năm</option>
            </select>
          </div>
          <div className="chart-area" style={{ height: '300px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '30px', paddingTop: '20px' }}>
             {chartValues.map((item, idx) => (
               <div key={idx} className="bar-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                 {/* Bar */}
                 <div className="bar-item" style={{ 
                    height: `${item.val}%`, 
                    width: '35px', 
                    backgroundColor: '#2563eb', 
                    borderRadius: '8px 8px 0 0',
                   position: 'relative',
                    transition: 'height 0.5s ease'
                 }}>
                   <span style={{ 
                      position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', 
                      fontSize: '11px', fontWeight: '700', color: '#1e293b' 
                   }}>{item.label}</span>
                 </div>
                 {/* Label */}
                 <span style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', fontWeight: '500' }}>{item.day}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Top Products Section */}
        <div className="top-products-section card">
          <div className="card-header">
            <h3>Sản phẩm bán chạy nhất</h3>
            <button className="card-action" onClick={() => navigate('/admin/products')}>Xem tất cả</button>
          </div>
          <div className="product-list">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={product.id} className="product-item">
                <div className="product-img" style={{ overflow: 'hidden' }}>
                  {product.image ? <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '📱'}
                </div>
                <div className="product-details">
                  <span className="product-name">{product.name}</span>
                  <span className="product-category">Tồn kho: {product.stock || 0}</span>
                </div>
                <div className="product-sales">
                  <span className="sales-count">{Number(product.soldCount || 0).toLocaleString()} lượt bán</span>
                  <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <TrendingUp size={10} /> {94 - i}% Hài lòng
                  </div>
                </div>
              </div>
            )) : (
              <div className="product-item">
                <div className="product-details">
                  <span className="product-name">Chưa có dữ liệu sản phẩm</span>
                  <span className="product-category">Danh sách sẽ hiện khi backend có sản phẩm</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Sentiment Section */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
           <div className="card-header">
              <h3>Đánh giá khách hàng</h3>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                   <span style={{ color: '#10b981', fontWeight: '600' }}>Tích cực (4-5 sao)</span>
                   <span>85%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                   <div style={{ width: '85%', height: '100%', background: '#10b981' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                   <span style={{ color: '#f59e0b', fontWeight: '600' }}>Trung bình (3 sao)</span>
                   <span>10%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                   <div style={{ width: '10%', height: '100%', background: '#f59e0b' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                   <span style={{ color: '#ef4444', fontWeight: '600' }}>Tiêu cực (1-2 sao)</span>
                   <span>5%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                   <div style={{ width: '5%', height: '100%', background: '#ef4444' }}></div>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>* Dựa trên 1,240 đánh giá mới nhất từ website.</p>
           </div>
        </div>

        {/* Recent Orders Table */}
        <div className="recent-orders-section card full-width">
          <div className="card-header">
            <h3>Đơn hàng mới nhất</h3>
            <button className="card-action" onClick={() => navigate('/admin/orders')}>Quản lý đơn hàng</button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id" style={{ color: '#2563eb', fontWeight: 'bold' }}>{order.id}</span></td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: `${order.statusColor}15`, color: order.statusColor }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => navigate('/admin/orders')}>Chi tiết</button>
                    </td>
                  </tr>
                )) : (
                   <tr>
                     <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa có đơn hàng nào</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../lib/api';
import { normalizeProduct, slugifyValue } from '../../lib/products';

const MAX_TABLE_THUMBNAIL_LENGTH = 200000;

const CATEGORY_LABELS = {
  'dien-thoai': 'Điện thoại',
  smartphone: 'Điện thoại',
  mobile: 'Điện thoại',
  laptop: 'Laptop',
  tablet: 'Máy tính bảng',
  ipad: 'Máy tính bảng',
  'dong-ho': 'Đồng hồ',
  smartwatch: 'Đồng hồ',
  'am-thanh': 'Âm thanh',
  audio: 'Âm thanh',
  headphone: 'Âm thanh',
  speaker: 'Âm thanh',
  'man-hinh': 'Màn hình',
  monitor: 'Màn hình',
  'linh-kien-may-tinh': 'Linh kiện máy tính',
  'linh-kien': 'Linh kiện máy tính',
  component: 'Linh kiện máy tính',
  'phu-kien': 'Phụ kiện',
  accessory: 'Phụ kiện',
  'smart-home': 'Smart home',
  'tivi-dien-may': 'Tivi, điện máy',
  tv: 'Tivi, điện máy',
  tivi: 'Tivi, điện máy',
  'dien-may': 'Tivi, điện máy',
  'dich-vu': 'Dịch vụ',
  service: 'Dịch vụ',
};

const getCategoryValue = (category) => {
  if (!category) return '';
  if (typeof category === 'string') return category.trim();
  if (typeof category === 'object') {
    return category.name || category.title || category.slug || category.label || '';
  }
  return String(category).trim();
};

const getInventoryCategoryLabel = (product = {}, normalized = {}) => {
  const rawCategory =
    getCategoryValue(product.categoryRef) ||
    getCategoryValue(product.category) ||
    getCategoryValue(normalized.backendCategory) ||
    getCategoryValue(normalized.category);
  const categoryKey = slugifyValue(rawCategory);

  return CATEGORY_LABELS[categoryKey] || rawCategory || 'Chưa phân loại';
};

const getTableThumbnail = (image = '') => {
  const value = String(image || '');

  if (!value.startsWith('data:')) {
    return value;
  }

  return value.length <= MAX_TABLE_THUMBNAIL_LENGTH ? value : '';
};

const mapProductForInventory = (product) => {
  const normalized = normalizeProduct(product);
  const stock = normalized.countInStock || 0;
  
  // Phân loại trạng thái kho
  let status = 'In Stock';
  let statusColor = '#10b981';
  let statusBg = '#ecfdf5';

  if (stock <= 0) {
    status = 'Out of Stock';
    statusColor = '#ef4444';
    statusBg = '#fef2f2';
  } else if (stock <= 10) {
    status = 'Low Stock';
    statusColor = '#f59e0b';
    statusBg = '#fffbeb';
  }

  return {
    id: normalized.backendId || normalized.id,
    name: normalized.name,
    sku: normalized.sku || `PS-${normalized.id.slice(-6).toUpperCase()}`,
    category: getInventoryCategoryLabel(product, normalized),
    price: normalized.price || 0,
    priceDisplay: normalized.priceDisplay,
    stock: stock,
    status,
    statusColor,
    statusBg,
    thumbnail: getTableThumbnail(normalized.image)
  };
};

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'stock', direction: 'asc' });
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const primaryColor = localStorage.getItem('primaryColor') || '#2563eb';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/products', {
        params: { limit: 500, includeInactive: true }
      });
      const mapped = (response.data?.data || []).map(mapProductForInventory);
      setProducts(mapped);
    } catch (error) {
      console.error('Lỗi tải dữ liệu tồn kho:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Tính toán số liệu thống kê
  const stats = useMemo(() => {
    return {
      total: products.length,
      outOfStock: products.filter(p => p.stock <= 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    };
  }, [products]);

  // Lọc và Sắp xếp
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, statusFilter, categoryFilter, sortConfig]);

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToExcel = () => {
    const exportData = filteredProducts.map(p => ({
      'Mã SKU': p.sku,
      'Tên sản phẩm': p.name,
      'Danh mục': p.category,
      'Đơn giá': p.total || p.price,
      'Số lượng tồn': p.stock,
      'Trạng thái': p.status === 'In Stock' ? 'Còn hàng' : p.status === 'Low Stock' ? 'Sắp hết hàng' : 'Hết hàng',
      'Tổng giá trị tồn': p.price * p.stock
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ton_Kho');
    
    // Tự động điều chỉnh độ rộng cột
    const wscols = [
      { wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Bao_cao_ton_kho_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Tồn kho</h1>
          <p className="page-subtitle">Theo dõi số lượng, tình trạng hàng hóa và xuất báo cáo tồn kho.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={loadData} disabled={isLoading}>
            <RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} /> Làm mới
          </button>
          <button className="btn-primary" onClick={exportToExcel} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
            <Download size={18} /> Xuất file Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '25px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Package size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Tổng mặt hàng</span>
            <h2 className="stat-value">{stats.total}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><XCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Đã hết hàng</span>
            <h2 className="stat-value" style={{ color: '#ef4444' }}>{stats.outOfStock}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Sắp hết hàng</span>
            <h2 className="stat-value" style={{ color: '#f59e0b' }}>{stats.lowStock}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><BarChart3 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Giá trị kho (tr.đ)</span>
            <h2 className="stat-value" style={{ color: '#10b981' }}>{(stats.totalValue / 1000000).toFixed(1)}</h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên sản phẩm hoặc mã SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="filter-item">
            <Filter size={16} style={{ marginRight: '8px', color: '#64748b' }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              <option value="All">Tất cả trạng thái</option>
              <option value="In Stock">Còn hàng</option>
              <option value="Low Stock">Sắp hết hàng</option>
              <option value="Out of Stock">Đã hết hàng</option>
            </select>
          </div>

          <div className="filter-item">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'Tất cả danh mục' : cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card table-card" style={{ overflow: 'visible' }}>
        <div className="table-responsive inventory-table-wrap">
          <table className="admin-table inventory-table">
            <colgroup>
              <col className="inventory-col-product" />
              <col className="inventory-col-sku" />
              <col className="inventory-col-category" />
              <col className="inventory-col-price" />
              <col className="inventory-col-stock" />
              <col className="inventory-col-status" />
              <col className="inventory-col-action" />
            </colgroup>
            <thead>
              <tr>
                <th className="inventory-product-header">Sản phẩm</th>
                <th>SKU</th>
                <th>Danh mục</th>
                <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                  <span className="sortable-header">Giá bán <ArrowUpDown size={14} /></span>
                </th>
                <th onClick={() => requestSort('stock')} style={{ cursor: 'pointer' }}>
                  <span className="sortable-header">Số lượng tồn <ArrowUpDown size={14} /></span>
                </th>
                <th>Trạng thái</th>
                <th className="inventory-action-header">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan="7" style={{ padding: '20px' }}><div className="skeleton-line" style={{ height: '40px', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div></td></tr>
                ))
              ) : displayedProducts.length > 0 ? (
                displayedProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="inventory-product-cell">
                      <div className="inventory-product-info">
                        <div className="inventory-product-thumb">
                          {p.thumbnail ? (
                            <img src={p.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <Package size={18} color="#94a3b8" />
                          )}
                        </div>
                        <span className="inventory-product-name">{p.name}</span>
                      </div>
                    </td>
                    <td><code className="inventory-sku">{p.sku}</code></td>
                    <td><span className="inventory-category">{p.category}</span></td>
                    <td><span className="inventory-price">{p.priceDisplay}</span></td>
                    <td>
                      <div className="inventory-stock">
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: p.stock <= 10 ? '#ef4444' : '#1e293b' }}>{p.stock}</span>
                        {p.stock <= 10 ? <TrendingDown size={14} color="#ef4444" /> : <TrendingUp size={14} color="#10b981" />}
                      </div>
                    </td>
                    <td>
                      <span className="inventory-status" style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                        backgroundColor: p.statusBg, color: p.statusColor
                      }}>
                        {p.status === 'In Stock' ? <CheckCircle2 size={14} /> : p.status === 'Low Stock' ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                        {p.status === 'In Stock' ? 'Còn hàng' : p.status === 'Low Stock' ? 'Sắp hết' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="inventory-action-cell">
                      <button 
                        onClick={() => navigate(`/admin/products?search=${encodeURIComponent(p.name)}`)}
                        className="btn-icon"
                        title="Xem chi tiết tại Quản lý sản phẩm"
                        style={{ 
                          width: '32px', height: '32px', borderRadius: '8px', 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #e2e8f0', background: 'white', color: '#64748b',
                          transition: 'all 0.2s', cursor: 'pointer'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = primaryColor; e.currentTarget.style.color = primaryColor; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    <Package size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Smart Pagination Bar (Cố định 10 trang) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px 25px', 
          borderTop: '1px solid #f1f5f9'
        }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} trên {filteredProducts.length} mặt hàng
          </span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
            >
              Trước
            </button>
            
            {/* Thuật toán hiển thị 10 nút trang cố định */}
            {(() => {
              const startPage = Math.max(1, currentPage - 5);
              const endPage = startPage + 9;
              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }
              return pages.map(pageNum => (
                <button 
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{ 
                    width: '38px', height: '38px', borderRadius: '8px', border: '1px solid #e2e8f0', 
                    background: currentPage === pageNum ? primaryColor : 'white',
                    color: currentPage === pageNum ? 'white' : '#1e293b',
                    fontWeight: '700', cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: currentPage === pageNum ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none'
                  }}
                >
                  {pageNum}
                </button>
              ));
            })()}

            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={totalPages === 0 || currentPage >= totalPages}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: totalPages === 0 || currentPage >= totalPages ? '#f8fafc' : 'white', cursor: totalPages === 0 || currentPage >= totalPages ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .filter-item {
          display: flex;
          align-items: center;
          background: #f8fafc;
          padding: 8px 15px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .filter-item:hover {
          border-color: ${primaryColor};
          background: white;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .inventory-table-wrap {
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
        }
        .inventory-table {
          min-width: 1120px;
          table-layout: fixed;
        }
        .inventory-table th,
        .inventory-table td {
          vertical-align: middle;
        }
        .inventory-table th {
          white-space: nowrap;
          font-size: 0.82rem;
          line-height: 1.2;
          padding: 16px 18px;
        }
        .inventory-table td {
          font-size: 0.92rem;
          padding: 18px;
        }
        .inventory-col-product { width: 39%; }
        .inventory-col-sku { width: 11%; }
        .inventory-col-category { width: 12%; }
        .inventory-col-price { width: 12%; }
        .inventory-col-stock { width: 12%; }
        .inventory-col-status { width: 10%; }
        .inventory-col-action { width: 4%; }
        .inventory-product-header,
        .inventory-product-cell {
          padding-left: 25px !important;
        }
        .inventory-action-header,
        .inventory-action-cell {
          padding-right: 25px !important;
          text-align: right;
        }
        .sortable-header {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .sortable-header svg {
          opacity: 0.5;
          flex-shrink: 0;
        }
        .inventory-product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .inventory-product-thumb {
          width: 45px;
          height: 45px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          flex: 0 0 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .inventory-product-name {
          min-width: 0;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .inventory-sku {
          display: inline-block;
          max-width: 100%;
          background: #f1f5f9;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 0.74rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }
        .inventory-category {
          display: inline-block;
          max-width: 100%;
          padding: 5px 10px;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          font-size: 0.78rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
          position: static;
        }
        .inventory-price {
          display: inline-block;
          font-weight: 700;
          white-space: nowrap;
        }
        .inventory-stock,
        .inventory-status {
          white-space: nowrap;
        }
        .inventory-stock {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 1200px) {
          .inventory-table {
            min-width: 1040px;
          }
          .inventory-table th,
          .inventory-table td {
            padding-left: 14px;
            padding-right: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryManagement;

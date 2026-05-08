import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Star, 
  Tag, 
  Edit, 
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Cpu,
  HardDrive,
  Dna,
  Smartphone,
  X,
  Hash
} from 'lucide-react';
import { allProducts } from '../../data/allProducts';
import HashtagManagement from './HashtagManagement';

const ProductManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showHashtagManager, setShowHashtagManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả danh mục');
  const [statusFilter, setStatusFilter] = useState('Trạng thái: Tất cả');
  const [localProducts, setLocalProducts] = useState(allProducts.slice(0, 5));
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state (mock)
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Filter products based on all criteria
  const filteredProducts = localProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tất cả danh mục' || p.category === categoryFilter;
    
    // Status logic
    const stock = p.stock || 24;
    const isOutOfStock = stock <= 0;
    const isHidden = p.isHidden || false;
    
    let matchesStatus = true;
    if (statusFilter === 'Đang hiển thị') matchesStatus = !isHidden && !isOutOfStock;
    if (statusFilter === 'Đang ẩn') matchesStatus = isHidden;
    if (statusFilter === 'Hết hàng') matchesStatus = isOutOfStock;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentProducts.map(p => p.id));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác.')) {
      setLocalProducts(localProducts.filter(p => p.id !== id));
      setSelectedIds(selectedIds.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`)) {
      setLocalProducts(localProducts.filter(p => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }
  };

  const toggleStatus = (id) => {
    setLocalProducts(localProducts.map(p => 
      p.id === id ? { ...p, isHidden: !p.isHidden } : p
    ));
  };

  const toggleFeatured = (id) => {
    setLocalProducts(localProducts.map(p => 
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    ));
  };

  const getStatusInfo = (product) => {
    const stock = product.stock || 24; 
    if (product.isHidden) return { label: 'Đang ẩn', color: '#94a3b8' };
    if (stock <= 0) return { label: 'Hết hàng', color: '#ef4444' };
    return { label: 'Hiển thị', color: '#10b981' };
  };

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '0',
    brand: '',
    screen: '',
    cpu: '',
    ram: '8GB',
    rom: '256GB',
    isHidden: false,
    isFeatured: false,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const toggleForm = (product = null) => {
    if (product) {
       setEditingProduct(product);
       setFormData({
         name: product.name || '',
         category: product.category || 'dien-thoai',
         price: product.price ? product.price.replace(/[^\d]/g, '') : '',
         stock: product.stock || 0,
         brand: 'Apple',
         screen: '6.7 inch, OLED',
         cpu: 'A17 Pro',
         ram: '8GB',
         rom: '256GB',
         isHidden: product.isHidden || false,
         isFeatured: product.isFeatured || false,
         image: product.image || null
       });
       setImagePreview(product.image || null);
    } else {
       setEditingProduct(null);
       setFormData({
         name: '', category: 'dien-thoai', price: '', stock: '0', brand: '', 
         screen: '', cpu: '', ram: '8GB', rom: '256GB', isHidden: false, isFeatured: false, image: null
       });
       setImagePreview(null);
    }
    setShowForm(!showForm);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      alert('Giá và số lượng tồn kho không được là số âm');
      return;
    }

    const priceFormatted = Number(formData.price).toLocaleString() + ' ₫';
    
    if (editingProduct) {
      setLocalProducts(localProducts.map(p => 
        p.id === editingProduct.id ? { ...p, ...formData, price: priceFormatted, image: imagePreview } : p
      ));
    } else {
      const newProduct = {
        id: `p${localProducts.length + 1}`,
        ...formData,
        price: priceFormatted,
        image: imagePreview || 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumb-600x600.jpg'
      };
      setLocalProducts([newProduct, ...localProducts]);
    }
    setShowForm(false);
  };

  return (
    <div className="management-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">Quản lý Sản phẩm</h1>
          <p className="page-subtitle">Quản lý danh sách, thông tin và cấu hình sản phẩm của bạn.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selectedIds.length > 0 && (
            <button className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={handleBulkDelete}>
              <Trash2 size={18} />
              Xóa {selectedIds.length} mục đã chọn
            </button>
          )}
          <button className="btn-outline" onClick={() => setShowHashtagManager(true)}>
            <Hash size={18} />
            Quản lý Hashtag
          </button>
          <button className="btn-primary" onClick={() => toggleForm()}>
            <Plus size={20} />
            Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar card">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, SKU, thương hiệu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <div className="filter-item">
            <Filter size={16} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option>Tất cả danh mục</option>
              <option>dien-thoai</option>
              <option>iPhone</option>
              <option>Samsung</option>
              <option>Oppo</option>
              <option>Phụ kiện</option>
            </select>
          </div>
          <div className="filter-item">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Trạng thái: Tất cả</option>
              <option>Đang hiển thị</option>
              <option>Đang ẩn</option>
              <option>Hết hàng</option>
            </select>
          </div>
          <button className="btn-outline" onClick={() => {
            setSearchTerm('');
            setCategoryFilter('Tất cả danh mục');
            setStatusFilter('Trạng thái: Tất cả');
            setSelectedIds([]);
          }}>Làm mới</button>
        </div>
      </div>

      {/* Product Table */}
      <div className="card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedIds.length === currentProducts.length && currentProducts.length > 0} onChange={toggleSelectAll} /></th>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tôn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác nhanh</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? currentProducts.map((product) => {
                const status = getStatusInfo(product);
                const isSelected = selectedIds.includes(product.id);
                return (
                  <tr key={product.id} className={isSelected ? 'selected-row' : ''} style={{ backgroundColor: isSelected ? '#f8fafc' : 'transparent' }}>
                    <td><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} /></td>
                    <td>
                      <div className="product-info-cell">
                        <div className="product-thumb">
                          {product.image ? <img src={product.image} alt="" className="w-full h-full object-contain" /> : '📱'}
                        </div>
                        <div className="product-text">
                          <span className="product-name-bold">{product.name}</span>
                          <span className="product-sku">ID: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category || 'Mặc định'}</td>
                    <td><span className="price-bold">{product.price}</span></td>
                    <td>{product.stock || 24}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="quick-actions">
                        <button 
                          className={`qa-btn ${!product.isHidden ? 'active' : ''}`} 
                          title={product.isHidden ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
                          onClick={() => toggleStatus(product.id)}
                        >
                          {product.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          className={`qa-btn ${product.isFeatured ? 'active' : ''}`} 
                          title="Nổi bật"
                          onClick={() => toggleFeatured(product.id)}
                        >
                          <Star size={16} fill={product.isFeatured ? "#2563eb" : "none"} />
                        </button>
                        <button className="qa-btn" title="Gắn hashtag">
                          <Tag size={16} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => toggleForm(product)} title="Chỉnh sửa"><Edit size={16} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(product.id)} title="Xóa"><Trash2 size={16} /></button>
                        <div className="relative group">
                          <button className="action-btn more"><MoreVertical size={16} /></button>
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye size={14} /> Xem trên web
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Tag size={14} /> Sao chép SKU
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1">
                              <Trash2 size={14} /> Lưu trữ
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Không tìm thấy sản phẩm nào khớp với tiêu chí lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span className="pagination-info">
            Hiển thị {(currentPage - 1) * productsPerPage + 1}-{Math.min(currentPage * productsPerPage, filteredProducts.length)} trên tổng số {filteredProducts.length} sản phẩm
          </span>
          <div className="pagination-btns">
            <button 
              className={`p-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`p-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button 
              className={`p-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3><Smartphone size={18} /> Thông tin cơ bản</h3>
                  <div className="input-group">
                    <label>Tên sản phẩm *</label>
                    <input name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Nhập tên sản phẩm" />
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Danh mục *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="dien-thoai">dien-thoai</option>
                        <option value="iPhone">iPhone</option>
                        <option value="Samsung">Samsung</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Thương hiệu</label>
                      <input name="brand" type="text" value={formData.brand} onChange={handleInputChange} placeholder="Apple" />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Giá niêm yết (₫)</label>
                      <input name="price" type="number" min="0" value={formData.price} onChange={handleInputChange} placeholder="0" />
                    </div>
                    <div className="input-group">
                      <label>Số lượng tồn kho</label>
                      <input name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} placeholder="24" />
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="form-section">
                  <h3><Cpu size={18} /> Thông số kỹ thuật</h3>
                  <div className="specs-grid">
                    <div className="input-group">
                      <label><Monitor size={14} /> Màn hình</label>
                      <input name="screen" type="text" value={formData.screen} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                      <label><Cpu size={14} /> CPU</label>
                      <input name="cpu" type="text" value={formData.cpu} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                      <label><Dna size={14} /> RAM</label>
                      <select name="ram" value={formData.ram} onChange={handleInputChange}>
                        <option value="8GB">8GB</option>
                        <option value="12GB">12GB</option>
                        <option value="16GB">16GB</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label><HardDrive size={14} /> ROM</label>
                      <select name="rom" value={formData.rom} onChange={handleInputChange}>
                        <option value="128GB">128GB</option>
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                   <h3><ImageIcon size={18} /> Hình ảnh sản phẩm</h3>
                  <div className="image-upload-wrapper">
                    <label className="upload-zone" style={{ 
                        border: '2px dashed #e2e8f0', 
                        borderRadius: '16px', 
                        padding: '30px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        background: '#f8fafc',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                        height: '200px',
                        justifyContent: 'center'
                      }}>
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      
                      {imagePreview ? (
                        <div style={{ position: 'absolute', inset: 0, padding: '10px', background: 'white' }}>
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectContain: 'contain' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>Thay đổi</div>
                        </div>
                      ) : (
                        <>
                          <Plus size={32} color="#94a3b8" />
                          <span style={{ marginTop: '10px', fontWeight: '600', color: '#64748b' }}>Nhấp để chọn ảnh</span>
                          <small style={{ color: '#94a3b8' }}>JPG, PNG, WEBP</small>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Cài đặt trạng thái</h3>
                  <div className="checkbox-group">
                    <label className="switch-label">
                      <input name="isHidden" type="checkbox" checked={formData.isHidden} onChange={handleInputChange} />
                      <span>Đang ẩn khỏi cửa hàng</span>
                    </label>
                    <label className="switch-label">
                      <input name="isFeatured" type="checkbox" checked={formData.isFeatured} onChange={handleInputChange} />
                      <span>Sản phẩm nổi bật</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
              <button className="btn-primary" onClick={handleSave}>Lưu sản phẩm</button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .management-container {
          animation: fadeIn 0.4s ease-out;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 25px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .btn-outline {
          background: white;
          color: #475569;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 25px !important;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 15px;
          border-radius: 10px;
          flex: 1;
          min-width: 300px;
        }

        .search-box input {
          background: none;
          border: none;
          outline: none;
          margin-left: 10px;
          width: 100%;
        }

        .filter-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0 12px;
          border-radius: 8px;
        }

        .filter-item select {
          padding: 8px 0;
          background: none;
          border: none;
          outline: none;
          font-size: 0.9rem;
          color: #475569;
        }

        /* Table Components */
        .table-card {
          padding: 0 !important;
          overflow: hidden;
        }

        .product-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-thumb {
          width: 40px;
          height: 40px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .product-name-bold {
          display: block;
          font-weight: 600;
          color: #1e293b;
        }

        .product-sku {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .price-bold {
          font-weight: 700;
          color: #1e293b;
        }

        .quick-actions {
          display: flex;
          gap: 8px;
        }

        .qa-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #64748b;
          transition: all 0.2s;
        }

        .qa-btn:hover {
          background: #f1f5f9;
          color: #2563eb;
        }

        .qa-btn.active {
          color: #2563eb;
          border-color: #bfdbfe;
          background: #eff6ff;
        }

        .actions-cell {
          display: flex;
          gap: 5px;
        }

        .action-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.edit { background: #eff6ff; color: #2563eb; }
        .action-btn.delete { background: #fef2f2; color: #ef4444; }
        .action-btn.more { background: #f8fafc; color: #64748b; }

        .table-footer {
          padding: 20px 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #f1f5f9;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: #64748b;
        }

        .pagination-btns {
          display: flex;
          gap: 8px;
        }

        .p-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          color: #475569;
        }

        .p-btn.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content.large {
          width: 90%;
          max-width: 1000px;
          background: white;
          border-radius: 20px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          padding: 20px 30px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

        .modal-body {
          padding: 30px;
          overflow-y: auto;
          flex: 1;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .form-section {
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }

        .form-section h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #334155;
        }

        .input-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .input-group input, .input-group select {
          padding: 10px 15px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          font-size: 0.9rem;
          transition: border-color 0.2s;
        }

        .input-group input:focus { border-color: #2563eb; }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .image-upload-zone {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-upload-zone:hover {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-placeholder small { color: #94a3b8; }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .switch-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #475569;
        }

        .modal-footer {
          padding: 20px 30px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {/* Hashtag Manager Modal */}
      {showHashtagManager && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '1000px', width: '95%', height: '90vh', overflow: 'hidden', padding: 0 }}>
             <div style={{ height: '100%', overflowY: 'auto', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-40px' }}>
                   <button className="close-btn" onClick={() => setShowHashtagManager(false)} style={{ zIndex: 10 }}><X size={24} /></button>
                </div>
                <HashtagManagement />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

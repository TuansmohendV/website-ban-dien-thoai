import React, { useEffect, useState } from 'react';
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
  RefreshCcw,
  Monitor,
  Cpu,
  HardDrive,
  Dna,
  Smartphone,
  X,
  Hash,
  Flame,
  ThumbsUp,
  TrendingUp,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Video,
  Link2,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Type,
  ShieldCheck,
  Zap,
  Layers,
  User,
  Package,
  ExternalLink
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import HashtagManagement from './HashtagManagement';
import api, { getApiErrorMessage } from '../../lib/api';
import { normalizeProduct } from '../../lib/products';
import { useRef } from 'react';

const mapProductForAdmin = (product) => {
  const normalized = normalizeProduct(product);

  return {
    ...normalized,
    id: normalized.backendId || normalized.routeId || normalized.id,
    price: normalized.priceDisplay,
    stock: normalized.countInStock,
    category: normalized.backendCategory || normalized.category,
    isHidden: normalized.status !== 'active',
    isFeatured: Boolean(product.isFeatured),
    isBestSeller: Boolean(product.isBestSeller),
    isRecommended: Boolean(product.isRecommended),
    videoUrl: Array.isArray(product.videoUrl) ? product.videoUrl : (product.videoUrl ? [product.videoUrl] : []),
  };
};

const ProductManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [showHashtagManager, setShowHashtagManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả danh mục');
  const [statusFilter, setStatusFilter] = useState('Trạng thái: Tất cả');
  const [localProducts, setLocalProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  
  const editorRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const location = useLocation();

  // Handle direct links from other pages (e.g., Inventory)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(decodeURIComponent(search));
    }
  }, [location.search]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/api/products', {
            params: { limit: 200, sort: 'newest', includeInactive: true },
          }),
          api.get('/api/categories')
        ]);
        
        setLocalProducts((productsRes.data?.data || []).map(mapProductForAdmin));
        setDbCategories(categoriesRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setLocalProducts([]);
        setDbCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Sync editor content when form opens for editing
  useEffect(() => {
    if (showForm && editorRef.current) {
      editorRef.current.innerHTML = formData.description || '';
    }
  }, [showForm, editingProduct?.id]);

  const execCommand = (e, command, value = null) => {
    if (e) e.preventDefault();
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
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
      let embedId = '';
      if (url.includes('v=')) embedId = url.split('v=')[1].split('&')[0];
      else if (url.includes('be/')) embedId = url.split('be/')[1];
      
      const embedUrl = `https://www.youtube-nocookie.com/embed/${embedId}`;
      const html = `<div class="video-wrapper" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:20px 0;border-radius:12px;"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><p><br></p>`;
      execCommand(e, 'insertHTML', html);
    }
  };

  // Filter products based on all criteria
  const filteredProducts = localProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Tất cả danh mục' || p.category === categoryFilter;
    
    // Status logic
    let matchesStatus = true;
    if (statusFilter === 'Đang hiển thị') matchesStatus = !p.isHidden && p.stock > 0 && p.status !== 'inactive';
    if (statusFilter === 'Đang ẩn') matchesStatus = p.isHidden && p.status !== 'inactive';
    if (statusFilter === 'Hết hàng') matchesStatus = p.stock <= 0 && p.status !== 'inactive';
    if (statusFilter === 'Đã xóa') matchesStatus = p.status === 'inactive';
    // Mặc định "Tất cả" thì hiện mọi thứ trừ hàng đã xóa (để cho gọn)
    if (statusFilter === 'Trạng thái: Tất cả') matchesStatus = p.status !== 'inactive';

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

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này? (Sản phẩm sẽ bị ẩn khỏi cửa hàng nhưng vẫn lưu trong DB)')) {
      try {
        setIsLoading(true);
        await api.delete(`/api/admin/products/${id}`);
        // Cập nhật lại trạng thái trong local state thành inactive thay vì xóa hẳn khỏi mảng
        setLocalProducts(localProducts.map(p => p.id === id ? { ...p, status: 'inactive', isHidden: true } : p));
        setSelectedIds(selectedIds.filter(item => item !== id));
        alert('Đã xóa mềm sản phẩm thành công!');
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm: ' + getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`)) {
      try {
        setIsLoading(true);
        // Xóa lần lượt (hoặc có thể viết API xóa hàng loạt nếu cần)
        await Promise.all(selectedIds.map(id => api.delete(`/api/admin/products/${id}`)));
        
        setLocalProducts(localProducts.map(p => 
          selectedIds.includes(p.id) ? { ...p, status: 'inactive', isHidden: true } : p
        ));
        setSelectedIds([]);
        alert(`Đã xóa mềm ${selectedIds.length} sản phẩm thành công!`);
      } catch (error) {
        alert('Lỗi khi xóa hàng loạt: ' + getApiErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleStatus = async (id) => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    
    try {
      const newStatus = product.isHidden ? 'active' : 'inactive';
      const response = await api.put(`/api/admin/products/${id}`, { status: newStatus });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === id ? updated : p));
    } catch (error) {
      alert('Không thể cập nhật trạng thái: ' + getApiErrorMessage(error));
    }
  };

  const toggleFeatured = async (id) => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    
    try {
      const newVal = !product.isFeatured;
      const response = await api.put(`/api/admin/products/${id}`, { isFeatured: newVal });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === id ? updated : p));
    } catch (error) {
      alert('Không thể cập nhật trạng thái nổi bật: ' + getApiErrorMessage(error));
    }
  };

  const toggleBestSeller = async (id) => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    
    try {
      const newVal = !product.isBestSeller;
      const response = await api.put(`/api/admin/products/${id}`, { isBestSeller: newVal });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === id ? updated : p));
    } catch (error) {
      alert('Không thể cập nhật trạng thái bán chạy: ' + getApiErrorMessage(error));
    }
  };

  const toggleRecommended = async (id) => {
    const product = localProducts.find(p => p.id === id);
    if (!product) return;
    
    try {
      const newVal = !product.isRecommended;
      const response = await api.put(`/api/admin/products/${id}`, { isRecommended: newVal });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === id ? updated : p));
    } catch (error) {
      alert('Không thể cập nhật trạng thái đề xuất: ' + getApiErrorMessage(error));
    }
  };

  const handleRestore = async (id) => {
    try {
      setIsLoading(true);
      const response = await api.put(`/api/admin/products/${id}`, { status: 'active' });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === id ? updated : p));
      alert('Đã khôi phục sản phẩm thành công!');
    } catch (error) {
      alert('Không thể khôi phục sản phẩm: ' + getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
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
    storage: '256GB',
    isHidden: false,
    isFeatured: false,
    isBestSeller: false,
    isRecommended: false,
    image: '',
    images: [],
    tags: [],
    specifications: {},
    description: '',
    videoUrl: []
  });
  const [showTagModal, setShowTagModal] = useState(false);
  const [taggingProduct, setTaggingProduct] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

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
         storage: '256GB',
         isHidden: product.isHidden || false,
         isFeatured: product.isFeatured || false,
         isBestSeller: product.isBestSeller || false,
         isRecommended: product.isRecommended || false,
          image: product.image || '',
          images: product.images || [],
          tags: product.tags || [],
          specifications: product.specifications || {},
          description: product.description || '',
          videoUrl: Array.isArray(product.videoUrl) ? product.videoUrl : (product.videoUrl ? [product.videoUrl] : [])
        });
        setImagePreview(product.image || null);
        setGalleryPreviews(product.images || []);
    } else {
        setEditingProduct(null);
        setFormData({
          name: '',
          category: 'dien-thoai',
          price: '',
          stock: '0',
          brand: '',
          screen: '', 
          cpu: '', 
          ram: '8GB', 
          storage: '256GB', 
          isHidden: false, 
          isFeatured: false, 
          isBestSeller: false, 
          isRecommended: false, 
          image: '', 
          images: [], 
          tags: [], 
          specifications: {}, 
          description: '',
          videoUrl: []
        });
        setImagePreview(null);
        setGalleryPreviews([]);
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

  const [newVideoUrl, setNewVideoUrl] = useState('');

  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      videoUrl: [...(prev.videoUrl || []), newVideoUrl.trim()]
    }));
    setNewVideoUrl('');
  };

  const removeVideoUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      videoUrl: prev.videoUrl.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    const finalDescription = editorRef.current ? editorRef.current.innerHTML.trim() : formData.description.trim();
    const finalDescriptionText = editorRef.current
      ? (editorRef.current.innerText || editorRef.current.textContent || '').replace(/\u00a0/g, ' ').trim()
      : finalDescription.replace(/<[^>]*>/g, '').replace(/\u00a0/g, ' ').trim();
    const hasEmbeddedContent = /<(img|iframe|video|source|embed|object)\b/i.test(finalDescription);

    if (!finalDescriptionText && !hasEmbeddedContent) {
      alert('Vui lòng nhập mô tả sản phẩm');
      return;
    }

    if (!formData.image && !editingProduct) {
      alert('Vui lòng chọn ảnh đại diện cho sản phẩm');
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      alert('Giá và số lượng tồn kho không được là số âm');
      return;
    }

    setIsLoading(true);
    try {
      // Collect dynamic specifications based on category
      const specFields = {
        'dien-thoai': ['screen', 'cpu', 'ram', 'storage'],
        'laptop': ['screen', 'cpu', 'gpu', 'ram', 'storage'],
        'tablet': ['screen', 'cpu', 'ram', 'storage'],
        'tivi-dien-may': ['screen', 'resolution', 'power', 'feature'],
        'man-hinh': ['screen', 'panel', 'refreshRate', 'ports'],
        'dong-ho': [
          'brand', 'gender', 'movement', 'strapType', 'strapColor', 
          'glassType', 'waterproof', 'dialType', 'caseSize', 'dialColor', 
          'handColor', 'caseMaterial', 'caseColor', 'warranty'
        ],
        'am-thanh': [
          'includedItems', 'otherFeatures', 'audioTech', 'chargingPort', 
          'chargingTime', 'earphoneTime', 'caseTime', 'connectionRange', 
          'connectionTech', 'weight'
        ]
      };

      const categoryFields = specFields[formData.category] || specFields['dien-thoai'];
      const dynamicSpecs = {};
      categoryFields.forEach(field => {
        if (formData[field]) dynamicSpecs[field] = formData[field];
      });

      const payload = {
        ...formData,
        description: finalDescription,
        price: Number(formData.price),
        countInStock: Number(formData.stock),
        categoryId: formData.category, 
        specifications: {
          ...formData.specifications,
          ...dynamicSpecs
        }
      };

      if (editingProduct) {
        const response = await api.put(`/api/admin/products/${editingProduct.id}`, payload);
        const updated = mapProductForAdmin(response.data?.data?.product);
        setLocalProducts(localProducts.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const response = await api.post('/api/admin/products', payload);
        const newlyCreated = mapProductForAdmin(response.data?.data?.product);
        setLocalProducts([newlyCreated, ...localProducts]);
      }
      setShowForm(false);
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendDetails = error?.response?.data?.details;
      const detailText = Array.isArray(backendDetails) ? `\n- ${backendDetails.join('\n- ')}` : '';
      
      alert(backendMessage ? `${backendMessage}${detailText}` : 'Không thể lưu sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result]);
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleQuickTag = (product) => {
    setTaggingProduct(product);
    setShowTagModal(true);
  };

  const addTag = async (tagName) => {
    if (!tagName || !taggingProduct) return;
    const cleanTag = tagName.replace(/\s+/g, '').replace('#', '');
    if (taggingProduct.tags?.includes(cleanTag)) return;
    
    const updatedTags = [...(taggingProduct.tags || []), cleanTag];
    
    try {
      const response = await api.put(`/api/admin/products/${taggingProduct.id}`, { tags: updatedTags });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === taggingProduct.id ? updated : p));
      setTaggingProduct(updated);
      setNewTag('');
    } catch (error) {
      alert('Không thể cập nhật tag: ' + getApiErrorMessage(error));
    }
  };

  const removeTag = async (tagToRemove) => {
    if (!taggingProduct) return;
    const updatedTags = (taggingProduct.tags || []).filter(t => t !== tagToRemove);
    
    try {
      const response = await api.put(`/api/admin/products/${taggingProduct.id}`, { tags: updatedTags });
      const updated = mapProductForAdmin(response.data?.data?.product);
      setLocalProducts(localProducts.map(p => p.id === taggingProduct.id ? updated : p));
      setTaggingProduct(updated);
    } catch (error) {
      alert('Không thể xóa tag: ' + getApiErrorMessage(error));
    }
  };

  const exportToExcel = () => {
    if (localProducts.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const exportData = localProducts.map(p => ({
      'ID Sản phẩm': p.id,
      'Tên sản phẩm': p.name,
      'Danh mục': p.category,
      'Giá bán': p.price,
      'Tồn kho': p.stock || 0,
      'Trạng thái': p.isHidden ? 'Đang ẩn' : ((p.stock || 24) <= 0 ? 'Hết hàng' : 'Đang hiển thị'),
      'Nổi bật': p.isFeatured ? 'Có' : 'Không',
      'Bán chạy': p.isBestSeller ? 'Có' : 'Không',
      'Đề xuất': p.isRecommended ? 'Có' : 'Không',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản phẩm');
    
    XLSX.writeFile(workbook, 'Danh_sach_san_pham_PhoneSin.xlsx');
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
          <button className="btn-outline" onClick={exportToExcel} style={{ backgroundColor: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <Download size={18} />
            Xuất Excel
          </button>
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
              {dbCategories.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Trạng thái: Tất cả</option>
              <option>Đang hiển thị</option>
              <option>Đang ẩn</option>
              <option>Hết hàng</option>
              <option>Đã xóa</option>
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
                          title="Nổi bật (Trang chủ)"
                          onClick={() => toggleFeatured(product.id)}
                        >
                          <Star size={16} fill={product.isFeatured ? "#f59e0b" : "none"} color={product.isFeatured ? "#f59e0b" : "#94a3b8"} />
                        </button>
                        <button 
                          className={`qa-btn ${product.isBestSeller ? 'active' : ''}`} 
                          title="Bán chạy"
                          onClick={() => toggleBestSeller(product.id)}
                        >
                          <Flame size={16} fill={product.isBestSeller ? "#ef4444" : "none"} color={product.isBestSeller ? "#ef4444" : "#94a3b8"} />
                        </button>
                        <button 
                          className={`qa-btn ${product.isRecommended ? 'active' : ''}`} 
                          title="Đề xuất"
                          onClick={() => toggleRecommended(product.id)}
                        >
                          <ThumbsUp size={16} fill={product.isRecommended ? "#2563eb" : "none"} color={product.isRecommended ? "#2563eb" : "#94a3b8"} />
                        </button>
                        <button 
                          className={`qa-btn ${(product.tags || []).length > 0 ? 'active' : ''}`} 
                          title="Gắn hashtag"
                          onClick={() => handleQuickTag(product)}
                        >
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
                            {product.status === 'inactive' && (
                              <button 
                                onClick={() => handleRestore(product.id)}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 border-b border-gray-100"
                              >
                                <RefreshCcw size={14} /> Khôi phục sản phẩm
                              </button>
                            )}
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Eye size={14} /> Xem trên web
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Tag size={14} /> Sao chép SKU
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 mt-1"
                            >
                              <Trash2 size={14} /> Xóa vĩnh viễn (Xóa mềm)
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
                    {isLoading ? 'Đang tải danh sách sản phẩm từ backend...' : 'Không tìm thấy sản phẩm nào khớp với tiêu chí lọc.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer" style={{ background: 'white', padding: '15px 25px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            Hiển thị {filteredProducts.length > 0 ? (currentPage - 1) * productsPerPage + 1 : 0}-{Math.min(currentPage * productsPerPage, filteredProducts.length)} trên tổng số {filteredProducts.length} sản phẩm
          </span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
            >
              Trước
            </button>
            
            {/* Luôn hiển thị ít nhất 10 trang đầu tiên */}
            {(() => {
              const pages = [];
              const minPagesToShow = 10;
              let start = 1;
              let end = Math.max(minPagesToShow, totalPages);
              
              // Nếu số trang thực tế > 10 và đang ở các trang cuối cửa sổ, thực hiện trượt
              if (totalPages > minPagesToShow && currentPage > 6) {
                start = Math.max(1, currentPage - 5);
                end = Math.min(totalPages, start + 9);
                if (end - start < 9) start = Math.max(1, end - 9);
              } else if (totalPages > minPagesToShow) {
                end = 10;
              }

              for (let i = start; i <= end; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    style={{ 
                      minWidth: '40px', height: '40px', borderRadius: '8px', border: '1px solid',
                      borderColor: currentPage === i ? '#2563eb' : '#e2e8f0',
                      background: currentPage === i ? '#2563eb' : 'white',
                      color: currentPage === i ? 'white' : '#64748b',
                      fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}

            <button 
              onClick={() => setCurrentPage(p => Math.min(Math.max(10, totalPages), p + 1))}
              disabled={currentPage >= Math.max(10, totalPages)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: currentPage >= Math.max(10, totalPages) ? '#f8fafc' : 'white', cursor: currentPage >= Math.max(10, totalPages) ? 'not-allowed' : 'pointer', color: '#64748b', fontWeight: '600' }}
            >
              Sau
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
                  <div className="input-group">
                    <label>Mô tả chi tiết sản phẩm (Hỗ trợ Ảnh/Video) *</label>
                    <div className="rich-editor-container" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                      <div className="editor-toolbar" style={{ padding: '8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'bold')} title="In đậm"><Bold size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'italic')} title="In nghiêng"><Italic size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'underline')} title="Gạch chân"><Underline size={16} /></button>
                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 5px' }}></div>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'justifyLeft')} title="Căn trái"><AlignLeft size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'justifyCenter')} title="Căn giữa"><AlignCenter size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'justifyRight')} title="Căn phải"><AlignRight size={16} /></button>
                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 5px' }}></div>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'insertUnorderedList')} title="Danh sách"><ListIcon size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'formatBlock', 'H2')} title="Tiêu đề lớn"><Heading1 size={16} /></button>
                        <button className="tb-btn" onClick={(e) => execCommand(e, 'formatBlock', 'H3')} title="Tiêu đề nhỏ"><Heading2 size={16} /></button>
                        <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 5px' }}></div>
                        <button className="tb-btn" onClick={insertImage} title="Chèn ảnh"><ImageIcon size={16} /></button>
                        <button className="tb-btn" onClick={insertVideo} title="Chèn Video Youtube" style={{ color: '#ef4444' }}><Video size={16} /></button>
                        <input type="file" ref={contentImageInputRef} onChange={handleContentImageUpload} accept="image/*" style={{ display: 'none' }} />
                      </div>
                      <div 
                        ref={editorRef}
                        contentEditable 
                        className="editor-content"
                        style={{ 
                          padding: '15px', minHeight: '250px', maxHeight: '500px', 
                          overflowY: 'auto', outline: 'none', fontSize: '0.95rem', lineHeight: '1.6'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Danh mục *</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="">-- Chọn danh mục --</option>
                        {dbCategories.map(cat => (
                          <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                        ))}
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
                  <div className="input-group">
                    <label><Video size={16} color="#ef4444" /> Danh sách Video Youtube</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={newVideoUrl} 
                        onChange={(e) => setNewVideoUrl(e.target.value)} 
                        placeholder="Dán link Youtube tại đây..." 
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                      />
                      <button className="btn-primary" onClick={(e) => { e.preventDefault(); addVideoUrl(); }} style={{ padding: '0 15px' }}>Thêm</button>
                    </div>
                    <div className="space-y-2">
                       {(formData.videoUrl || []).map((url, idx) => (
                         <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '13px' }}>
                            <Video size={14} className="text-red-500" />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                            <X size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => removeVideoUrl(idx)} />
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="form-section">
                  <h3><Cpu size={18} /> Thông số kỹ thuật</h3>
                  
                  {(() => {
                    const specFields = {
                      'dien-thoai': [
                        { key: 'screen', label: 'Màn hình', icon: <Monitor size={14} /> },
                        { key: 'cpu', label: 'CPU', icon: <Cpu size={14} /> },
                        { key: 'ram', label: 'RAM', icon: <Dna size={14} />, type: 'select', options: ['4GB', '8GB', '12GB', '16GB', '24GB'] },
                        { key: 'storage', label: 'ROM', icon: <HardDrive size={14} />, type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] }
                      ],
                      'laptop': [
                        { key: 'screen', label: 'Màn hình', icon: <Monitor size={14} /> },
                        { key: 'cpu', label: 'CPU', icon: <Cpu size={14} /> },
                        { key: 'gpu', label: 'GPU (Đồ họa)', icon: <TrendingUp size={14} /> },
                        { key: 'ram', label: 'RAM', icon: <Dna size={14} /> },
                        { key: 'storage', label: 'SSD/HDD', icon: <HardDrive size={14} /> }
                      ],
                      'tablet': [
                        { key: 'screen', label: 'Màn hình', icon: <Monitor size={14} /> },
                        { key: 'cpu', label: 'CPU', icon: <Cpu size={14} /> },
                        { key: 'ram', label: 'RAM', icon: <Dna size={14} /> },
                        { key: 'storage', label: 'Bộ nhớ', icon: <HardDrive size={14} /> }
                      ],
                      'tivi-dien-may': [
                        { key: 'screen', label: 'Kích thước màn hình', icon: <Monitor size={14} /> },
                        { key: 'resolution', label: 'Độ phân giải', icon: <Eye size={14} /> },
                        { key: 'power', label: 'Công suất', icon: <Flame size={14} /> },
                        { key: 'feature', label: 'Tính năng chính', icon: <Star size={14} /> }
                      ],
                      'man-hinh': [
                        { key: 'screen', label: 'Kích thước', icon: <Monitor size={14} /> },
                        { key: 'panel', label: 'Tấm nền', icon: <Layers size={14} /> },
                        { key: 'refreshRate', label: 'Tần số quét', icon: <Zap size={14} /> },
                        { key: 'ports', label: 'Cổng kết nối', icon: <Link2 size={14} /> }
                      ],
                      'dong-ho': [
                        { key: 'brand', label: 'Hãng', icon: <Star size={14} /> },
                        { key: 'gender', label: 'Giới tính', icon: <User size={14} />, type: 'select', options: ['Nam', 'Nữ', 'Unisex'] },
                        { key: 'movement', label: 'Loại máy', icon: <Cpu size={14} />, type: 'select', options: ['Pin (Quartz)', 'Cơ (Automatic)', 'Eco-Drive', 'Năng lượng MT'] },
                        { key: 'strapType', label: 'Loại dây', icon: <Layers size={14} /> },
                        { key: 'strapColor', label: 'Màu dây', icon: <Type size={14} /> },
                        { key: 'glassType', label: 'Loại kính', icon: <ShieldCheck size={14} /> },
                        { key: 'waterproof', label: 'Chống nước', icon: <Flame size={14} /> },
                        { key: 'dialType', label: 'Dạng mặt số', icon: <Monitor size={14} /> },
                        { key: 'caseSize', label: 'Size mặt số', icon: <TrendingUp size={14} /> },
                        { key: 'dialColor', label: 'Màu mặt số', icon: <Type size={14} /> },
                        { key: 'handColor', label: 'Màu Kim', icon: <Edit size={14} /> },
                        { key: 'caseMaterial', label: 'Chất liệu vỏ', icon: <HardDrive size={14} /> },
                        { key: 'caseColor', label: 'Màu vỏ', icon: <Type size={14} /> },
                        { key: 'warranty', label: 'Bảo hành chính hãng', icon: <ShieldCheck size={14} /> }
                      ],
                      'am-thanh': [
                        { key: 'includedItems', label: 'Sản phẩm bao gồm', icon: <Package size={14} /> },
                        { key: 'otherFeatures', label: 'Tính năng khác', icon: <Star size={14} /> },
                        { key: 'audioTech', label: 'Công nghệ âm thanh', icon: <Cpu size={14} /> },
                        { key: 'chargingPort', label: 'Cổng sạc', icon: <HardDrive size={14} /> },
                        { key: 'chargingTime', label: 'Thời gian sạc đầy', icon: <Zap size={14} /> },
                        { key: 'earphoneTime', label: 'Thời gian sử dụng tai nghe', icon: <Flame size={14} /> },
                        { key: 'caseTime', label: 'Thời gian sử dụng hộp sạc', icon: <HardDrive size={14} /> },
                        { key: 'connectionRange', label: 'Phạm vi kết nối', icon: <TrendingUp size={14} /> },
                        { key: 'connectionTech', label: 'Công nghệ kết nối', icon: <Link2 size={14} /> },
                        { key: 'weight', label: 'Trọng lượng', icon: <Layers size={14} /> }
                      ]
                    };

                    const currentFields = specFields[formData.category] || specFields['dien-thoai'];

                    return (
                      <div className="specs-grid">
                        {currentFields.map(field => (
                          <div className="input-group" key={field.key}>
                            <label>{field.icon} {field.label}</label>
                            {field.type === 'select' ? (
                              <select 
                                name={field.key} 
                                value={formData[field.key] || ''} 
                                onChange={handleInputChange}
                              >
                                <option value="">-- Chọn --</option>
                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : (
                              <input 
                                name={field.key} 
                                type="text" 
                                value={formData[field.key] || ''} 
                                onChange={handleInputChange} 
                                placeholder={`Nhập ${field.label.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  </div>
                
                <div className="form-section">
                   <h3><ImageIcon size={18} /> Hình ảnh sản phẩm</h3>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {/* Main Image */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>Ảnh đại diện</label>
                        <div className="image-upload-wrapper">
                          <label className="upload-zone" style={{ 
                              border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '20px', 
                              display: 'flex', flexDirection: 'column', alignItems: 'center', 
                              cursor: 'pointer', background: '#f8fafc', height: '150px', justifyContent: 'center', position: 'relative'
                            }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              <><Plus size={24} color="#94a3b8" /><small>Chọn ảnh chính</small></>
                            )}
                          </label>
                        </div>
                      </div>
                      
                      {/* Gallery */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>Ảnh bộ sưu tập (Gallery)</label>
                        <label className="upload-zone" style={{ 
                            border: '2px dashed #e2e8f0', borderRadius: '16px', padding: '20px', 
                            display: 'flex', flexDirection: 'column', alignItems: 'center', 
                            cursor: 'pointer', background: '#f8fafc', height: '150px', justifyContent: 'center'
                          }}>
                          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} style={{ display: 'none' }} />
                          <Plus size={24} color="#94a3b8" />
                          <small>{galleryPreviews.length} ảnh đã chọn</small>
                        </label>
                      </div>
                   </div>
                   
                   {/* Gallery Preview List */}
                   {galleryPreviews.length > 0 && (
                     <div style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {galleryPreviews.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative', flexShrink: 0, width: '60px', height: '60px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button 
                              onClick={() => {
                                setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
                                setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
                              }}
                              style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '2px', color: 'white', cursor: 'pointer' }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                     </div>
                   )}
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
                    <label className="switch-label">
                      <input name="isBestSeller" type="checkbox" checked={formData.isBestSeller} onChange={handleInputChange} />
                      <span>Bán chạy</span>
                    </label>
                    <label className="switch-label">
                      <input name="isRecommended" type="checkbox" checked={formData.isRecommended} onChange={handleInputChange} />
                      <span>Đề xuất</span>
                    </label>
                  </div>
                </div>

                {/* Hashtags Section */}
                <div className="form-section">
                   <h3><Hash size={18} /> Hashtags</h3>
                   <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                      <input 
                        type="text" 
                        placeholder="Thêm tag mới (VD: iPhone15)" 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                      />
                      <button 
                        className="btn-primary" 
                        onClick={() => addTag(newTag)}
                        style={{ padding: '0 15px' }}
                      >Thêm</button>
                   </div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(formData.tags || []).map(tag => (
                        <span key={tag} style={{ 
                          padding: '5px 12px', background: '#eff6ff', color: '#2563eb', 
                          borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '5px'
                        }}>
                          #{tag}
                          <X size={14} style={{ cursor: 'pointer' }} onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} />
                        </span>
                      ))}
                      {(formData.tags || []).length === 0 && <span style={{ color: '#94a3b8', fontSize: '13px italic' }}>Chưa có tag nào</span>}
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
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        /* Rich Editor Styles */
        .rich-editor-container:focus-within {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .tb-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tb-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .editor-content:empty:before {
          content: "Viết mô tả chi tiết sản phẩm, chèn video youtube hoặc ảnh tại đây...";
          color: #94a3b8;
        }

        .editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          display: block;
          margin: 15px 0;
        }

        .video-wrapper iframe {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

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
      {/* Quick Tag Modal */}
      {showTagModal && taggingProduct && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Gắn Hashtag: {taggingProduct.name}</h2>
              <button className="close-btn" onClick={() => setShowTagModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
               <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input 
                    type="text" 
                    placeholder="Nhập hashtag mới..." 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                  />
                  <button className="btn-primary" onClick={() => addTag(newTag)}>Thêm</button>
               </div>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(taggingProduct.tags || []).map(tag => (
                    <span key={tag} style={{ 
                      padding: '8px 15px', background: '#eff6ff', color: '#2563eb', 
                      borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bfdbfe'
                    }}>
                      #{tag}
                      <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  {(taggingProduct.tags || []).length === 0 && (
                    <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#94a3b8' }}>
                       Sản phẩm này chưa có hashtag nào.
                    </div>
                  )}
               </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setShowTagModal(false)}>Hoàn tất</button>
            </div>
          </div>
        </div>
      )}

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

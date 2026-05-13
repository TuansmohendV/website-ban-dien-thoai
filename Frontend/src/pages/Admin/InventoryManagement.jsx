import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, PackageCheck, RefreshCw, Save, Search, Warehouse } from 'lucide-react';
import * as XLSX from 'xlsx';
import api, { getApiErrorMessage } from '../../lib/api';
import { normalizeProduct } from '../../lib/products';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value || 0));

const mapInventoryProduct = (product) => {
  const normalized = normalizeProduct(product);
  const stock = Number(normalized.countInStock || 0);

  return {
    id: normalized.backendId || normalized.routeId || normalized.id,
    name: normalized.name,
    sku: product.sku || normalized.slug || '',
    brand: normalized.brand,
    category: normalized.backendCategory || normalized.category,
    image: normalized.image,
    price: normalized.priceNum,
    stock,
    status: normalized.status || 'active',
    isHidden: normalized.status !== 'active',
    updatedAt: product.updatedAt || product.createdAt || '',
  };
};

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [stockDrafts, setStockDrafts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/products', {
        params: { limit: 200, sort: 'newest', includeInactive: true },
      });
      const nextProducts = (response.data?.data || []).map(mapInventoryProduct);
      setProducts(nextProducts);
      setStockDrafts(Object.fromEntries(nextProducts.map((product) => [product.id, product.stock])));
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể tải dữ liệu tồn kho.'));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.brand.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = !product.isHidden && product.stock > 0;
      if (statusFilter === 'low') matchesStatus = !product.isHidden && product.stock > 0 && product.stock <= 5;
      if (statusFilter === 'out') matchesStatus = product.stock <= 0;
      if (statusFilter === 'hidden') matchesStatus = product.isHidden;

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
    const lowStock = products.filter((product) => !product.isHidden && product.stock > 0 && product.stock <= 5).length;
    const outOfStock = products.filter((product) => product.stock <= 0).length;

    return { totalStock, totalValue, lowStock, outOfStock };
  }, [products]);

  const saveStock = async (product) => {
    const nextStock = Number(stockDrafts[product.id]);

    if (Number.isNaN(nextStock) || nextStock < 0) {
      alert('Số lượng tồn kho không hợp lệ.');
      return;
    }

    setSavingId(product.id);
    try {
      const response = await api.put(`/api/admin/products/${product.id}`, {
        countInStock: nextStock,
      });
      const updated = mapInventoryProduct(response.data?.data?.product);
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
      setStockDrafts((current) => ({ ...current, [product.id]: updated.stock }));
    } catch (error) {
      alert(getApiErrorMessage(error, 'Không thể cập nhật tồn kho.'));
    } finally {
      setSavingId(null);
    }
  };

  const exportInventory = () => {
    if (filteredProducts.length === 0) {
      alert('Không có dữ liệu tồn kho để xuất.');
      return;
    }

    const rows = filteredProducts.map((product) => ({
      'Mã sản phẩm': product.id,
      SKU: product.sku,
      'Tên sản phẩm': product.name,
      'Thương hiệu': product.brand,
      'Danh mục': product.category,
      'Giá bán': product.price,
      'Tồn kho': product.stock,
      'Giá trị tồn': product.stock * product.price,
      'Trạng thái': product.isHidden ? 'Đang ẩn' : product.stock <= 0 ? 'Hết hàng' : product.stock <= 5 ? 'Sắp hết' : 'Còn hàng',
      'Cập nhật lần cuối': product.updatedAt ? new Date(product.updatedAt).toLocaleString('vi-VN') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ton kho');
    XLSX.writeFile(workbook, `Ton_kho_PhoneSin_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div>
          <h1 className="page-title">Quản lý tồn kho</h1>
          <p className="page-subtitle">Theo dõi số lượng, cập nhật tồn kho nhanh và xuất báo cáo Excel.</p>
        </div>
        <div className="inventory-actions">
          <button className="btn-outline" onClick={loadInventory} disabled={isLoading}>
            <RefreshCw size={18} />
            Làm mới
          </button>
          <button className="btn-primary export-btn" onClick={exportInventory}>
            <Download size={18} />
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="inventory-stat">
          <Warehouse size={22} />
          <div>
            <span>Tổng tồn</span>
            <strong>{stats.totalStock.toLocaleString('vi-VN')}</strong>
          </div>
        </div>
        <div className="inventory-stat">
          <PackageCheck size={22} />
          <div>
            <span>Giá trị tồn</span>
            <strong>{formatCurrency(stats.totalValue)}</strong>
          </div>
        </div>
        <div className="inventory-stat warning">
          <AlertTriangle size={22} />
          <div>
            <span>Sắp hết</span>
            <strong>{stats.lowStock}</strong>
          </div>
        </div>
        <div className="inventory-stat danger">
          <AlertTriangle size={22} />
          <div>
            <span>Hết hàng</span>
            <strong>{stats.outOfStock}</strong>
          </div>
        </div>
      </div>

      <div className="filters-bar card inventory-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm sản phẩm, SKU, thương hiệu, danh mục..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="filter-item">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả tồn kho</option>
            <option value="active">Còn hàng</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
            <option value="hidden">Đang ẩn</option>
          </select>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Giá trị tồn</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const draftStock = stockDrafts[product.id] ?? product.stock;
                const isDirty = Number(draftStock) !== product.stock;
                const statusLabel = product.isHidden
                  ? 'Đang ẩn'
                  : product.stock <= 0
                    ? 'Hết hàng'
                    : product.stock <= 5
                      ? 'Sắp hết'
                      : 'Còn hàng';

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="inventory-product">
                        <div className="inventory-thumb">
                          {product.image ? <img src={product.image} alt="" /> : <Warehouse size={20} />}
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.brand} · {product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      <input
                        className="stock-input"
                        type="number"
                        min="0"
                        value={draftStock}
                        onChange={(event) => setStockDrafts((current) => ({ ...current, [product.id]: event.target.value }))}
                      />
                    </td>
                    <td>{formatCurrency(Number(draftStock || 0) * product.price)}</td>
                    <td>
                      <span className={`inventory-status ${product.isHidden ? 'hidden' : product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'active'}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <button className="save-stock-btn" disabled={!isDirty || savingId === product.id} onClick={() => saveStock(product)}>
                        <Save size={15} />
                        {savingId === product.id ? 'Đang lưu' : 'Lưu'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-cell">Không có sản phẩm phù hợp.</td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan="7" className="empty-cell">Đang tải tồn kho...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx="true">{`
        .inventory-page {
          animation: fadeIn 0.4s ease-out;
        }

        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 24px;
        }

        .inventory-actions {
          display: flex;
          gap: 10px;
        }

        .export-btn {
          background: #10b981;
        }

        .inventory-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .inventory-stat {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          color: #2563eb;
        }

        .inventory-stat.warning { color: #d97706; }
        .inventory-stat.danger { color: #ef4444; }

        .inventory-stat span {
          display: block;
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .inventory-stat strong {
          color: #0f172a;
          font-size: 22px;
        }

        .inventory-filters {
          margin-bottom: 20px;
        }

        .inventory-product {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 260px;
        }

        .inventory-product strong {
          display: block;
          color: #1e293b;
          font-size: 14px;
        }

        .inventory-product span {
          display: block;
          color: #94a3b8;
          font-size: 12px;
          margin-top: 4px;
        }

        .inventory-thumb {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #64748b;
        }

        .inventory-thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .stock-input {
          width: 96px;
          padding: 9px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .inventory-status {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .inventory-status.active { background: #ecfdf5; color: #047857; }
        .inventory-status.low { background: #fffbeb; color: #b45309; }
        .inventory-status.out { background: #fef2f2; color: #dc2626; }
        .inventory-status.hidden { background: #f1f5f9; color: #64748b; }

        .save-stock-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 0;
          border-radius: 9px;
          padding: 9px 12px;
          background: #2563eb;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .save-stock-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }

        .empty-cell {
          text-align: center;
          padding: 32px;
          color: #94a3b8;
          font-weight: 700;
        }

        @media (max-width: 980px) {
          .inventory-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .inventory-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryManagement;

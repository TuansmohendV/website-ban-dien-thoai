import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Boxes,
  Check,
  Eye,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { getApiMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { adminService } from '../../services/shopApi';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Trang Chu',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'products',
    label: 'San Pham',
    path: '/admin/products',
    icon: Smartphone,
  },
  {
    id: 'orders',
    label: 'Don Hang',
    path: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    id: 'customers',
    label: 'Khach Hang',
    path: '/admin/customers',
    icon: Users,
  },
];

const CHART_COLORS = ['#1fb50e', '#5c7f7b', '#7f0c8f', '#8b6614', '#289dd6'];

const DEFAULT_PRODUCT_FORM = {
  name: '',
  image: '',
  brand: '',
  categoryId: '',
  category: '',
  description: '',
  price: '',
  originalPrice: '',
  countInStock: '',
  screen: '',
  battery: '',
  camera: '',
  ram: '',
  storage: '',
  colors: '',
  features: '',
  tags: '',
  chip: '',
  os: '',
  refreshRate: '',
  status: 'active',
};

const DEFAULT_CUSTOMER_FORM = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  role: 'user',
  isActive: true,
};

const PANEL_CLASS =
  'rounded-[18px] border border-white/5 bg-[#343d45] shadow-[0_16px_32px_rgba(7,10,14,0.24)]';

const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '--';
  }

  return parsedDate.toLocaleString('vi-VN');
};

const resolveSectionFromPath = (pathname = '') => {
  if (pathname.startsWith('/admin/products')) {
    return 'products';
  }

  if (pathname.startsWith('/admin/orders')) {
    return 'orders';
  }

  if (
    pathname.startsWith('/admin/customers') ||
    pathname.startsWith('/admin/users')
  ) {
    return 'customers';
  }

  return 'dashboard';
};

const buildStatusBadgeClass = (status = '') => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (
    normalizedStatus === 'active' ||
    normalizedStatus === 'confirmed' ||
    normalizedStatus === 'paid'
  ) {
    return 'bg-emerald-500/15 text-emerald-300';
  }

  if (normalizedStatus === 'pending' || normalizedStatus === 'packing') {
    return 'bg-amber-500/15 text-amber-300';
  }

  if (normalizedStatus === 'shipping') {
    return 'bg-sky-500/15 text-sky-300';
  }

  if (normalizedStatus === 'admin') {
    return 'bg-fuchsia-500/15 text-fuchsia-300';
  }

  return 'bg-rose-500/15 text-rose-300';
};

const SummaryCard = ({ icon: Icon, label, value, accent }) => (
  <div className={`${PANEL_CLASS} p-5 text-white`}>
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">
          {label}
        </p>
        <p className="mt-3 text-[30px] font-black leading-none">{value}</p>
      </div>
      <div
        className="rounded-2xl p-3 text-white"
        style={{ backgroundColor: accent }}
      >
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const EmptyPanel = ({ title, description }) => (
  <div className="rounded-[18px] border border-dashed border-slate-600 bg-[#2f373f] px-6 py-12 text-center text-slate-300">
    <p className="text-[18px] font-black uppercase tracking-wide text-white">
      {title}
    </p>
    <p className="mt-3 text-[14px] leading-6 text-slate-400">{description}</p>
  </div>
);

const AdminDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { formatPrice } = useLanguage();

  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerSummary, setCustomerSummary] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fetching, setFetching] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  const [productFilters, setProductFilters] = useState({
    keyword: '',
    status: '',
  });
  const [orderFilters, setOrderFilters] = useState({
    keyword: '',
    status: '',
  });
  const [customerFilters, setCustomerFilters] = useState({
    keyword: '',
    role: '',
  });

  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [customerForm, setCustomerForm] = useState(DEFAULT_CUSTOMER_FORM);

  const currentSection = resolveSectionFromPath(location.pathname);
  const isAdmin = user?.role === 'admin';

  const loadDashboard = async () => {
    const nextDashboard = await adminService.getDashboard();
    setDashboard(nextDashboard);
    return nextDashboard;
  };

  const loadProducts = async (filters = productFilters) => {
    const nextProducts = await adminService.getProducts({
      page: 1,
      limit: 50,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
    });
    setProducts(nextProducts.products || []);
    return nextProducts;
  };

  const loadOrders = async (filters = orderFilters) => {
    const nextOrders = await adminService.getOrders({
      page: 1,
      limit: 50,
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
    });
    setOrders(nextOrders.orders || []);
    return nextOrders;
  };

  const loadCustomers = async (filters = customerFilters) => {
    const nextCustomers = await adminService.getUsers({
      page: 1,
      limit: 50,
      keyword: filters.keyword || undefined,
      role: filters.role || undefined,
    });
    setCustomers(nextCustomers.users || []);
    setCustomerSummary(nextCustomers.summary || {});
    return nextCustomers;
  };

  const loadCategories = async () => {
    const nextCategories = await adminService.getCategories({
      page: 1,
      limit: 100,
      isActive: true,
    });
    setCategories(nextCategories.categories || []);
    return nextCategories;
  };

  const loadAdminSnapshot = async () => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }

    setFetching(true);
    setError('');

    try {
      await Promise.all([
        loadDashboard(),
        loadProducts(),
        loadOrders(),
        loadCustomers(),
        loadCategories(),
      ]);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the tai du lieu admin tu backend.'));
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    if (
      !location.pathname.startsWith('/admin/dashboard') &&
      !location.pathname.startsWith('/admin/products') &&
      !location.pathname.startsWith('/admin/orders') &&
      !location.pathname.startsWith('/admin/customers') &&
      !location.pathname.startsWith('/admin/users')
    ) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    loadAdminSnapshot();
  }, [isAuthenticated, isAdmin]);

  const summaryCards = useMemo(() => {
    const overview = dashboard?.overview || {};

    return [
      {
        icon: Users,
        label: 'Khach hang',
        value: overview.users?.total || 0,
        accent: '#289dd6',
      },
      {
        icon: Boxes,
        label: 'San pham',
        value: overview.products?.active || 0,
        accent: '#1fb50e',
      },
      {
        icon: ShoppingBag,
        label: 'Don hang',
        value: overview.orders?.total || 0,
        accent: '#8b6614',
      },
      {
        icon: ShieldCheck,
        label: 'Admin',
        value: overview.users?.admins || 0,
        accent: '#7f0c8f',
      },
    ];
  }, [dashboard]);

  const brandChartData = useMemo(() => {
    const brandMap = new Map();

    products.forEach((product) => {
      const brandName = product.brand || 'Khac';
      brandMap.set(brandName, (brandMap.get(brandName) || 0) + 1);
    });

    return Array.from(brandMap.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([label, value], index) => ({
        label,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [products]);

  const orderStatusData = useMemo(() => {
    const byStatus = dashboard?.orders?.byStatus || {};

    return Object.entries(byStatus)
      .filter(([, value]) => Number(value) > 0)
      .map(([label, value], index) => ({
        label,
        value: Number(value) || 0,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [dashboard]);

  const donutGradient = useMemo(() => {
    const total = orderStatusData.reduce((sum, item) => sum + item.value, 0);

    if (!total) {
      return 'conic-gradient(#47515b 0deg 360deg)';
    }

    let currentPercent = 0;
    const segments = orderStatusData.map((item) => {
      const nextPercent = currentPercent + (item.value / total) * 100;
      const segment = `${item.color} ${currentPercent}% ${nextPercent}%`;
      currentPercent = nextPercent;
      return segment;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [orderStatusData]);

  const maxBrandValue = useMemo(
    () => Math.max(...brandChartData.map((item) => item.value), 1),
    [brandChartData]
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProductFormChange = (field, value) => {
    setProductForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCustomerFormChange = (field, value) => {
    setCustomerForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setSubmittingProduct(true);
    setError('');
    setSuccess('');

    try {
      await adminService.createProduct({
        name: productForm.name.trim(),
        image: productForm.image.trim(),
        brand: productForm.brand.trim(),
        categoryId: productForm.categoryId || undefined,
        category: productForm.category.trim() || undefined,
        description: productForm.description.trim(),
        price: Number(productForm.price || 0),
        originalPrice: Number(productForm.originalPrice || 0),
        countInStock: Number(productForm.countInStock || 0),
        screen: productForm.screen.trim(),
        battery: productForm.battery.trim(),
        camera: productForm.camera.trim(),
        ram: productForm.ram.trim(),
        storage: productForm.storage.trim(),
        colors: productForm.colors,
        features: productForm.features,
        tags: productForm.tags,
        status: productForm.status,
        specifications: {
          chip: productForm.chip.trim(),
          os: productForm.os.trim(),
          refreshRate: productForm.refreshRate.trim(),
        },
      });

      setProductForm(DEFAULT_PRODUCT_FORM);
      setShowProductForm(false);
      setSuccess('Da tao san pham moi thanh cong.');
      await Promise.all([loadProducts(productFilters), loadDashboard()]);
      navigate('/admin/products');
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the tao san pham.'));
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    setSubmittingCustomer(true);
    setError('');
    setSuccess('');

    try {
      await adminService.createUser({
        fullName: customerForm.fullName.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        password: customerForm.password,
        role: customerForm.role,
        isActive: customerForm.isActive,
      });

      setCustomerForm(DEFAULT_CUSTOMER_FORM);
      setShowCustomerForm(false);
      setSuccess('Da tao tai khoan moi thanh cong.');
      await Promise.all([loadCustomers(customerFilters), loadDashboard()]);
      navigate('/admin/customers');
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the tao tai khoan.'));
    } finally {
      setSubmittingCustomer(false);
    }
  };

  const handleDeactivateProduct = async (product) => {
    if (!window.confirm(`Ngung ban san pham "${product.name}"?`)) {
      return;
    }

    setActionBusy(`product-${product._id}`);
    setError('');
    setSuccess('');

    try {
      await adminService.deactivateProduct(product._id);
      setSuccess('Da cap nhat trang thai san pham.');
      await Promise.all([loadProducts(productFilters), loadDashboard()]);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the ngung ban san pham.'));
    } finally {
      setActionBusy('');
    }
  };

  const handleDeactivateCustomer = async (customer) => {
    if (!window.confirm(`Khoa tai khoan "${customer.fullName}"?`)) {
      return;
    }

    setActionBusy(`customer-${customer._id}`);
    setError('');
    setSuccess('');

    try {
      await adminService.deactivateUser(customer._id);
      setSuccess('Da khoa tai khoan thanh cong.');
      await Promise.all([loadCustomers(customerFilters), loadDashboard()]);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the khoa tai khoan.'));
    } finally {
      setActionBusy('');
    }
  };

  const handleUpdateOrderStatus = async (order, nextStatus) => {
    const actionLabel = nextStatus === 'confirmed' ? 'xac nhan' : 'huy';

    if (!window.confirm(`Ban co chac muon ${actionLabel} don hang nay?`)) {
      return;
    }

    setActionBusy(`order-${order._id}-${nextStatus}`);
    setError('');
    setSuccess('');

    try {
      await adminService.updateOrder(order._id, {
        status: nextStatus,
        timelineMessage:
          nextStatus === 'confirmed'
            ? 'Admin da xac nhan don hang.'
            : 'Admin da huy don hang.',
      });
      setSuccess('Da cap nhat trang thai don hang.');
      await Promise.all([loadOrders(orderFilters), loadDashboard()]);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the cap nhat don hang.'));
    } finally {
      setActionBusy('');
    }
  };

  const handleProductSearch = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await loadProducts(productFilters);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the loc san pham.'));
    }
  };

  const handleOrderSearch = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await loadOrders(orderFilters);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the loc don hang.'));
    }
  };

  const handleCustomerSearch = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      await loadCustomers(customerFilters);
    } catch (apiError) {
      setError(getApiMessage(apiError, 'Khong the loc khach hang.'));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#353c44]" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#353c44] px-4 py-12 font-sans text-white">
        <div className="mx-auto max-w-[960px] rounded-[22px] border border-white/10 bg-[#2f363d] p-10">
          <div className="flex items-center gap-3 text-[#29a9d7]">
            <ShieldCheck size={22} />
            <span className="text-[12px] font-black uppercase tracking-[0.3em]">
              Admin Portal
            </span>
          </div>
          <h1 className="mt-6 text-[36px] font-black uppercase tracking-tight">
            Dang nhap de vao trang admin
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-300">
            Giao dien admin da duoc doi sang layout sidebar + bang du lieu. Ban hay
            dang nhap bang tai khoan admin de vao `/admin/dashboard`.
          </p>
          <div className="mt-8 rounded-[18px] bg-[#394149] p-5 text-[14px] text-slate-200">
            <p className="font-black uppercase tracking-wide text-white">
              Tai khoan test
            </p>
            <p className="mt-3">Email: `admin@mobileshop.local`</p>
            <p className="mt-1">Mat khau: `Admin@123456`</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login?redirect=%2Fadmin%2Fdashboard"
              className="rounded-xl bg-[#29a9d7] px-5 py-3 text-[13px] font-black uppercase tracking-wide text-white"
            >
              Dang nhap admin
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-white/10 px-5 py-3 text-[13px] font-black uppercase tracking-wide text-slate-200"
            >
              Ve trang chu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#353c44] px-4 py-12 font-sans text-white">
        <div className="mx-auto max-w-[900px] rounded-[22px] border border-white/10 bg-[#2f363d] p-10">
          <div className="flex items-center gap-3 text-rose-300">
            <ShieldAlert size={22} />
            <span className="text-[12px] font-black uppercase tracking-[0.3em]">
              Khong du quyen
            </span>
          </div>
          <h1 className="mt-6 text-[34px] font-black uppercase tracking-tight">
            Tai khoan nay khong co quyen admin
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-slate-300">
            Ban dang dang nhap bang <span className="font-black text-white">{user.email || user.fullName}</span>,
            nhung tai khoan nay khong co role admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#394149] font-sans text-white">
      <div className="grid min-h-screen lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-r border-white/5 bg-[#2f363d] px-0 py-5">
          <div className="px-10">
            <p className="text-[22px] font-black uppercase tracking-wide text-white">
              MENU
            </p>
          </div>

          <nav className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3 border-l-4 px-8 py-4 text-[13px] font-bold transition-colors ${
                    isActive
                      ? 'border-[#29a9d7] bg-[#29a9d7] text-white'
                      : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-white/10 px-6 pt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-bold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} />
              Dang xuat (ve Trang chu)
            </button>
          </div>
        </aside>

        <main className="px-5 py-5 lg:px-8">
          <div className="mx-auto max-w-[1300px] space-y-6">
            <div className={`${PANEL_CLASS} flex flex-wrap items-center justify-between gap-4 px-6 py-5`}>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-400">
                  PhoneSin Admin
                </p>
                <h1 className="mt-2 text-[30px] font-black uppercase tracking-tight text-white">
                  {currentSection === 'dashboard' && 'Trang Chu'}
                  {currentSection === 'products' && 'San Pham'}
                  {currentSection === 'orders' && 'Don Hang'}
                  {currentSection === 'customers' && 'Khach Hang'}
                </h1>
              </div>

              <button
                type="button"
                onClick={loadAdminSnapshot}
                disabled={fetching}
                className="inline-flex items-center gap-2 rounded-xl bg-[#29a9d7] px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white disabled:opacity-60"
              >
                <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
                Lam moi
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                {success}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryCard
                  key={card.label}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  accent={card.accent}
                />
              ))}
            </div>

            {currentSection === 'dashboard' && (
              <>
                <div className="grid gap-6 xl:grid-cols-2">
                  <section className={`${PANEL_CLASS} p-6`}>
                    <div className="flex items-center gap-3">
                      <BarChart3 size={18} className="text-[#29a9d7]" />
                      <h2 className="text-[20px] font-black text-white">
                        So luong san pham theo thuong hieu
                      </h2>
                    </div>

                    {brandChartData.length === 0 ? (
                      <div className="mt-6">
                        <EmptyPanel
                          title="Chua co du lieu chart"
                          description="Khi backend tra duoc danh sach san pham, chart cot se hien du lieu thuong hieu o day."
                        />
                      </div>
                    ) : (
                      <div className="mt-8">
                        <div className="grid h-[250px] grid-cols-4 gap-4 md:grid-cols-5">
                          {brandChartData.map((item) => (
                            <div
                              key={item.label}
                              className="flex h-full flex-col items-center justify-end gap-3"
                            >
                              <div className="flex h-full w-full items-end rounded-t-xl bg-white/5 px-2 pb-0">
                                <div
                                  className="w-full rounded-t-xl"
                                  style={{
                                    height: `${(item.value / maxBrandValue) * 100}%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                              <p className="text-center text-[12px] font-bold text-slate-300">
                                {item.label}
                              </p>
                              <p className="text-[13px] font-black text-white">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className={`${PANEL_CLASS} p-6`}>
                    <div className="flex items-center gap-3">
                      <Boxes size={18} className="text-[#29a9d7]" />
                      <h2 className="text-[20px] font-black text-white">
                        Don hang theo trang thai
                      </h2>
                    </div>

                    {orderStatusData.length === 0 ? (
                      <div className="mt-6">
                        <EmptyPanel
                          title="Chua co du lieu donut"
                          description="Khi he thong co don hang hop le, bieu do vong tron se hien tai day."
                        />
                      </div>
                    ) : (
                      <div className="mt-8 grid items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
                        <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full bg-[#2c333b]">
                          <div
                            className="flex h-[190px] w-[190px] items-center justify-center rounded-full"
                            style={{ background: donutGradient }}
                          >
                            <div className="flex h-[105px] w-[105px] flex-col items-center justify-center rounded-full bg-[#343d45]">
                              <span className="text-[12px] font-black uppercase tracking-wide text-slate-400">
                                Don
                              </span>
                              <span className="mt-1 text-[24px] font-black text-white">
                                {orderStatusData.reduce((sum, item) => sum + item.value, 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {orderStatusData.map((item) => (
                            <div
                              key={item.label}
                              className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className="inline-block h-3 w-3 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-[13px] font-bold text-slate-200">
                                  {item.label}
                                </span>
                              </div>
                              <span className="text-[14px] font-black text-white">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <section className={`${PANEL_CLASS} p-6`}>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-[20px] font-black text-white">
                        Don hang moi nhat
                      </h2>
                      <Link
                        to="/admin/orders"
                        className="text-[12px] font-black uppercase tracking-wide text-[#29a9d7]"
                      >
                        Xem them
                      </Link>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10 text-[12px] font-black uppercase tracking-wide text-slate-400">
                            <th className="pb-3 pr-4">Ma don</th>
                            <th className="pb-3 pr-4">Khach</th>
                            <th className="pb-3 pr-4">Tong tien</th>
                            <th className="pb-3">Trang thai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 6).map((order) => (
                            <tr key={order._id} className="border-b border-white/5 text-[14px]">
                              <td className="py-4 pr-4 font-black text-white">
                                {String(order._id).slice(-8).toUpperCase()}
                              </td>
                              <td className="py-4 pr-4 text-slate-200">
                                {order.customerInfo?.fullName || order.user?.fullName || 'Khach hang'}
                              </td>
                              <td className="py-4 pr-4 font-black text-white">
                                {formatPrice(order.total || 0)}
                              </td>
                              <td className="py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${buildStatusBadgeClass(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <section className={`${PANEL_CLASS} p-6`}>
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-[20px] font-black text-white">
                        Khach hang moi
                      </h2>
                      <Link
                        to="/admin/customers"
                        className="text-[12px] font-black uppercase tracking-wide text-[#29a9d7]"
                      >
                        Xem them
                      </Link>
                    </div>

                    <div className="mt-6 space-y-3">
                      {customers.slice(0, 5).map((customer, index) => (
                        <div
                          key={customer._id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#29a9d7] text-[14px] font-black text-white">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-[14px] font-black text-white">
                                {customer.fullName}
                              </p>
                              <p className="mt-1 text-[12px] text-slate-400">
                                {customer.email || customer.phone || '--'}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${buildStatusBadgeClass(customer.role)}`}
                          >
                            {customer.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}

            {currentSection === 'products' && (
              <div className="space-y-6">
                <section className={`${PANEL_CLASS} p-6`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[20px] font-black text-white">
                        Quan ly san pham
                      </h2>
                      <p className="mt-1 text-[13px] text-slate-400">
                        Danh sach hien thi dang bang, co loc va nut them moi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductForm((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#29a9d7] px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                    >
                      <PackagePlus size={16} />
                      {showProductForm ? 'Dong form' : 'Them san pham'}
                    </button>
                  </div>

                  <form
                    onSubmit={handleProductSearch}
                    className="mt-6 flex flex-wrap items-center gap-3"
                  >
                    <select
                      value={productFilters.status}
                      onChange={(event) =>
                        setProductFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                    >
                      <option value="">Tat ca trang thai</option>
                      <option value="active">Dang ban</option>
                      <option value="inactive">Ngung ban</option>
                    </select>

                    <div className="relative min-w-[240px] flex-1">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        value={productFilters.keyword}
                        onChange={(event) =>
                          setProductFilters((current) => ({
                            ...current,
                            keyword: event.target.value,
                          }))
                        }
                        placeholder="Tim kiem theo ten, thuong hieu..."
                        className="w-full rounded-xl border border-white/10 bg-[#2f363d] py-3 pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-white/10 px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                    >
                      Tim
                    </button>
                  </form>

                  {showProductForm && (
                    <form onSubmit={handleCreateProduct} className="mt-6 grid gap-4 md:grid-cols-2">
                      <input
                        value={productForm.name}
                        onChange={(event) =>
                          handleProductFormChange('name', event.target.value)
                        }
                        placeholder="Ten san pham"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <input
                        value={productForm.image}
                        onChange={(event) =>
                          handleProductFormChange('image', event.target.value)
                        }
                        placeholder="Link hinh anh"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <input
                        value={productForm.brand}
                        onChange={(event) =>
                          handleProductFormChange('brand', event.target.value)
                        }
                        placeholder="Thuong hieu"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <select
                        value={productForm.categoryId}
                        onChange={(event) => {
                          const nextCategoryId = event.target.value;
                          const matchedCategory = categories.find(
                            (category) => category._id === nextCategoryId
                          );

                          setProductForm((current) => ({
                            ...current,
                            categoryId: nextCategoryId,
                            category: matchedCategory?.name || current.category,
                          }));
                        }}
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                      >
                        <option value="">Chon danh muc</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <input
                        value={productForm.price}
                        onChange={(event) =>
                          handleProductFormChange('price', event.target.value)
                        }
                        type="number"
                        min="0"
                        placeholder="Gia"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <input
                        value={productForm.originalPrice}
                        onChange={(event) =>
                          handleProductFormChange('originalPrice', event.target.value)
                        }
                        type="number"
                        min="0"
                        placeholder="Gia goc"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.countInStock}
                        onChange={(event) =>
                          handleProductFormChange('countInStock', event.target.value)
                        }
                        type="number"
                        min="0"
                        placeholder="Ton kho"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <select
                        value={productForm.status}
                        onChange={(event) =>
                          handleProductFormChange('status', event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                      >
                        <option value="active">Dang ban</option>
                        <option value="inactive">Ngung ban</option>
                      </select>
                      <input
                        value={productForm.ram}
                        onChange={(event) =>
                          handleProductFormChange('ram', event.target.value)
                        }
                        placeholder="RAM"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.storage}
                        onChange={(event) =>
                          handleProductFormChange('storage', event.target.value)
                        }
                        placeholder="Bo nho"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.screen}
                        onChange={(event) =>
                          handleProductFormChange('screen', event.target.value)
                        }
                        placeholder="Man hinh"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.battery}
                        onChange={(event) =>
                          handleProductFormChange('battery', event.target.value)
                        }
                        placeholder="Pin"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.camera}
                        onChange={(event) =>
                          handleProductFormChange('camera', event.target.value)
                        }
                        placeholder="Camera"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.chip}
                        onChange={(event) =>
                          handleProductFormChange('chip', event.target.value)
                        }
                        placeholder="Chip"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.os}
                        onChange={(event) =>
                          handleProductFormChange('os', event.target.value)
                        }
                        placeholder="He dieu hanh"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.refreshRate}
                        onChange={(event) =>
                          handleProductFormChange('refreshRate', event.target.value)
                        }
                        placeholder="Tan so quet"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.colors}
                        onChange={(event) =>
                          handleProductFormChange('colors', event.target.value)
                        }
                        placeholder="Mau sac, cach nhau dau phay"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={productForm.features}
                        onChange={(event) =>
                          handleProductFormChange('features', event.target.value)
                        }
                        placeholder="Tinh nang, cach nhau dau phay"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <textarea
                        value={productForm.description}
                        onChange={(event) =>
                          handleProductFormChange('description', event.target.value)
                        }
                        placeholder="Mo ta san pham"
                        className="md:col-span-2 min-h-[110px] rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <div className="md:col-span-2 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={submittingProduct}
                          className="rounded-xl bg-[#29a9d7] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white disabled:opacity-60"
                        >
                          {submittingProduct ? 'Dang tao...' : 'Luu san pham'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm(DEFAULT_PRODUCT_FORM);
                            setShowProductForm(false);
                          }}
                          className="rounded-xl bg-white/10 px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                        >
                          Huy
                        </button>
                      </div>
                    </form>
                  )}
                </section>

                <section className={`${PANEL_CLASS} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-[#3f4851] text-[12px] font-black uppercase tracking-wide text-slate-200">
                        <tr>
                          <th className="px-4 py-4">Stt</th>
                          <th className="px-4 py-4">Ma</th>
                          <th className="px-4 py-4">Ten</th>
                          <th className="px-4 py-4">Gia</th>
                          <th className="px-4 py-4">Khuyen mai</th>
                          <th className="px-4 py-4">Hanh dong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => {
                          const promotionLabel =
                            Number(product.originalPrice || 0) > Number(product.price || 0)
                              ? `Giam ${formatPrice(
                                  Number(product.originalPrice || 0) - Number(product.price || 0)
                                )}`
                              : 'Online';

                          return (
                            <tr
                              key={product._id}
                              className="border-t border-white/5 bg-[#343d45] text-[14px] text-slate-100"
                            >
                              <td className="px-4 py-4 font-black">{index + 1}</td>
                              <td className="px-4 py-4 font-bold text-slate-300">
                                {(product.slug || product._id || '').slice(0, 8)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2a3138] p-2">
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-black text-white">{product.name}</p>
                                    <p className="mt-1 text-[12px] text-slate-400">
                                      {product.brand}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-black text-white">
                                {formatPrice(product.price || 0)}
                              </td>
                              <td className="px-4 py-4 text-slate-300">{promotionLabel}</td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/product/${product.slug || product._id}`}
                                    className="rounded-lg bg-white/10 p-2 text-slate-100 transition-colors hover:bg-white/20"
                                  >
                                    <Eye size={15} />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivateProduct(product)}
                                    disabled={actionBusy === `product-${product._id}`}
                                    className="rounded-lg bg-rose-500/15 p-2 text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-60"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {currentSection === 'orders' && (
              <div className="space-y-6">
                <section className={`${PANEL_CLASS} p-6`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[20px] font-black text-white">
                        Quan ly don hang
                      </h2>
                      <p className="mt-1 text-[13px] text-slate-400">
                        Bieu mau loc nhanh va bang du lieu theo giao dien mau.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleOrderSearch}
                    className="mt-6 flex flex-wrap items-center gap-3"
                  >
                    <select
                      value={orderFilters.status}
                      onChange={(event) =>
                        setOrderFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                    >
                      <option value="">Tat ca trang thai</option>
                      <option value="pending">Dang cho xu ly</option>
                      <option value="confirmed">Da xac nhan</option>
                      <option value="packing">Dang dong goi</option>
                      <option value="shipping">Dang giao</option>
                      <option value="cancelled">Da huy</option>
                    </select>

                    <div className="relative min-w-[240px] flex-1">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        value={orderFilters.keyword}
                        onChange={(event) =>
                          setOrderFilters((current) => ({
                            ...current,
                            keyword: event.target.value,
                          }))
                        }
                        placeholder="Tim theo ma don, ten khach..."
                        className="w-full rounded-xl border border-white/10 bg-[#2f363d] py-3 pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-white/10 px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                    >
                      Tim
                    </button>
                  </form>
                </section>

                <section className={`${PANEL_CLASS} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-[#3f4851] text-[12px] font-black uppercase tracking-wide text-slate-200">
                        <tr>
                          <th className="px-4 py-4">Stt</th>
                          <th className="px-4 py-4">Ma don</th>
                          <th className="px-4 py-4">Khach</th>
                          <th className="px-4 py-4">San pham</th>
                          <th className="px-4 py-4">Tong tien</th>
                          <th className="px-4 py-4">Ngay gio</th>
                          <th className="px-4 py-4">Trang thai</th>
                          <th className="px-4 py-4">Hanh dong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => {
                          const orderItems = (order.items || [])
                            .slice(0, 3)
                            .map((item) => item.product?.name || item.name || 'San pham')
                            .join(', ');

                          const canConfirm = !['confirmed', 'delivered', 'cancelled'].includes(
                            String(order.status || '').toLowerCase()
                          );
                          const canCancel = !['cancelled', 'delivered'].includes(
                            String(order.status || '').toLowerCase()
                          );

                          return (
                            <tr
                              key={order._id}
                              className="border-t border-white/5 bg-[#343d45] text-[14px] text-slate-100"
                            >
                              <td className="px-4 py-4 font-black">{index + 1}</td>
                              <td className="px-4 py-4 font-bold text-slate-200">
                                {String(order._id).slice(-12)}
                              </td>
                              <td className="px-4 py-4 text-white">
                                {order.customerInfo?.fullName || order.user?.fullName || '--'}
                              </td>
                              <td className="px-4 py-4 text-slate-300">
                                {orderItems || '--'}
                              </td>
                              <td className="px-4 py-4 font-black text-white">
                                {formatPrice(order.total || 0)}
                              </td>
                              <td className="px-4 py-4 text-slate-300">
                                {formatDateTime(order.createdAt)}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${buildStatusBadgeClass(order.status)}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order, 'confirmed')}
                                    disabled={
                                      !canConfirm ||
                                      actionBusy === `order-${order._id}-confirmed`
                                    }
                                    className="rounded-lg bg-emerald-500/15 p-2 text-emerald-200 transition-colors hover:bg-emerald-500/25 disabled:opacity-40"
                                  >
                                    <Check size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateOrderStatus(order, 'cancelled')}
                                    disabled={
                                      !canCancel ||
                                      actionBusy === `order-${order._id}-cancelled`
                                    }
                                    className="rounded-lg bg-rose-500/15 p-2 text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-40"
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {currentSection === 'customers' && (
              <div className="space-y-6">
                <section className={`${PANEL_CLASS} p-6`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-[20px] font-black text-white">
                        Quan ly khach hang
                      </h2>
                      <p className="mt-1 text-[13px] text-slate-400">
                        Tao user/admin moi va hien thi danh sach dang bang.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomerForm((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#29a9d7] px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                    >
                      <UserPlus size={16} />
                      {showCustomerForm ? 'Dong form' : 'Them khach hang'}
                    </button>
                  </div>

                  <form
                    onSubmit={handleCustomerSearch}
                    className="mt-6 flex flex-wrap items-center gap-3"
                  >
                    <select
                      value={customerFilters.role}
                      onChange={(event) =>
                        setCustomerFilters((current) => ({
                          ...current,
                          role: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                    >
                      <option value="">Tat ca vai tro</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <div className="relative min-w-[240px] flex-1">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        value={customerFilters.keyword}
                        onChange={(event) =>
                          setCustomerFilters((current) => ({
                            ...current,
                            keyword: event.target.value,
                          }))
                        }
                        placeholder="Tim theo ho ten, email, so dien thoai..."
                        className="w-full rounded-xl border border-white/10 bg-[#2f363d] py-3 pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-white/10 px-4 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                    >
                      Tim
                    </button>
                  </form>

                  {showCustomerForm && (
                    <form onSubmit={handleCreateCustomer} className="mt-6 grid gap-4 md:grid-cols-2">
                      <input
                        value={customerForm.fullName}
                        onChange={(event) =>
                          handleCustomerFormChange('fullName', event.target.value)
                        }
                        placeholder="Ho ten"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <input
                        value={customerForm.email}
                        onChange={(event) =>
                          handleCustomerFormChange('email', event.target.value)
                        }
                        placeholder="Email"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        value={customerForm.phone}
                        onChange={(event) =>
                          handleCustomerFormChange('phone', event.target.value)
                        }
                        placeholder="So dien thoai"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                      />
                      <input
                        type="password"
                        value={customerForm.password}
                        onChange={(event) =>
                          handleCustomerFormChange('password', event.target.value)
                        }
                        placeholder="Mat khau"
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none placeholder:text-slate-500"
                        required
                      />
                      <select
                        value={customerForm.role}
                        onChange={(event) =>
                          handleCustomerFormChange('role', event.target.value)
                        }
                        className="rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] text-white outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#2f363d] px-4 py-3 text-[13px] font-bold text-slate-200">
                        <input
                          type="checkbox"
                          checked={customerForm.isActive}
                          onChange={(event) =>
                            handleCustomerFormChange('isActive', event.target.checked)
                          }
                        />
                        Kich hoat tai khoan ngay
                      </label>

                      <div className="md:col-span-2 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={submittingCustomer}
                          className="rounded-xl bg-[#29a9d7] px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white disabled:opacity-60"
                        >
                          {submittingCustomer ? 'Dang tao...' : 'Luu tai khoan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerForm(DEFAULT_CUSTOMER_FORM);
                            setShowCustomerForm(false);
                          }}
                          className="rounded-xl bg-white/10 px-5 py-3 text-[12px] font-black uppercase tracking-wide text-white"
                        >
                          Huy
                        </button>
                      </div>
                    </form>
                  )}
                </section>

                <section className={`${PANEL_CLASS} overflow-hidden`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-[#3f4851] text-[12px] font-black uppercase tracking-wide text-slate-200">
                        <tr>
                          <th className="px-4 py-4">Stt</th>
                          <th className="px-4 py-4">Ho ten</th>
                          <th className="px-4 py-4">Email</th>
                          <th className="px-4 py-4">Tai khoan</th>
                          <th className="px-4 py-4">Mat khau</th>
                          <th className="px-4 py-4">Hanh dong</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer, index) => (
                          <tr
                            key={customer._id}
                            className="border-t border-white/5 bg-[#343d45] text-[14px] text-slate-100"
                          >
                            <td className="px-4 py-4 font-black">{index + 1}</td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-black text-white">{customer.fullName}</p>
                                <p className="mt-1 text-[12px] text-slate-400">
                                  {customer.phone || '--'}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-200">
                              {customer.email || '--'}
                            </td>
                            <td className="px-4 py-4 text-slate-300">
                              {customer.phone || (customer.email || '').split('@')[0] || '--'}
                            </td>
                            <td className="px-4 py-4 text-slate-400">••••••••</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${buildStatusBadgeClass(customer.role)}`}
                                >
                                  {customer.role}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateCustomer(customer)}
                                  disabled={actionBusy === `customer-${customer._id}`}
                                  className="rounded-lg bg-rose-500/15 p-2 text-rose-200 transition-colors hover:bg-rose-500/25 disabled:opacity-60"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-white/5 bg-[#3a434b] px-4 py-4 text-[12px] font-black uppercase tracking-wide text-slate-300">
                    <span>Tong user: {customerSummary.totalUsers || customers.length}</span>
                    <span>Admin: {customerSummary.totalAdminAccounts || 0}</span>
                    <span>User thuong: {customerSummary.regularUserAccounts || 0}</span>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

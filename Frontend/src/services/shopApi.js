import { api } from '../lib/api';
import {
  mapAddress,
  mapAuthPayload,
  mapBrand,
  mapCart,
  mapOrder,
  mapProductCard,
  mapProductDetail,
  mapSearchSuggestion,
} from '../lib/mappers';

export const authService = {
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return mapAuthPayload(data);
  },

  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return mapAuthPayload(data);
  },

  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  async forgotPassword(payload) {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  },

  async changePassword(payload) {
    const { data } = await api.put('/auth/change-password', payload);
    return data;
  },
};

export const userService = {
  async getProfile() {
    const { data } = await api.get('/user/profile');
    return data.user;
  },

  async updateProfile(payload) {
    const { data } = await api.put('/user/profile', payload);
    return data.user;
  },

  async getStats() {
    const { data } = await api.get('/user/stats');
    return data.stats;
  },
};

export const brandService = {
  async getBrands() {
    const { data } = await api.get('/brands');
    return (data.data || []).map(mapBrand);
  },
};

export const productService = {
  async getProducts(params = {}) {
    const { data } = await api.get('/products', { params });

    return {
      products: (data.data || []).map(mapProductCard),
      pagination: data.pagination || {
        page: 1,
        limit: params.limit || 12,
        total: 0,
        totalPages: 1,
      },
      filters: data.filters || {},
    };
  },

  async getProductById(id) {
    const { data } = await api.get(`/products/${id}`);

    return {
      product: mapProductDetail(data.product || {}),
      recentReviews: data.recentReviews || [],
    };
  },

  async getSuggestions(keyword = '') {
    const { data } = await api.get('/products/suggest', {
      params: { q: keyword },
    });

    return (data.data || []).map(mapSearchSuggestion);
  },
};

export const adminService = {
  async getDashboard() {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  async getProducts(params = {}) {
    const { data } = await api.get('/admin/products', { params });
    return {
      products: data.data || [],
      pagination: data.pagination || {
        page: 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1,
      },
    };
  },

  async createProduct(payload) {
    const { data } = await api.post('/admin/products', payload);
    return data.product || null;
  },

  async deactivateProduct(id) {
    const { data } = await api.delete(`/admin/products/${id}`);
    return data.product || null;
  },

  async getUsers(params = {}) {
    const { data } = await api.get('/admin/users', { params });
    return {
      users: data.data || [],
      summary: data.summary || {},
      pagination: data.pagination || {
        page: 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1,
      },
    };
  },

  async createUser(payload) {
    const { data } = await api.post('/admin/users', payload);
    return data.user || null;
  },

  async deactivateUser(id) {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data.user || null;
  },

  async getOrders(params = {}) {
    const { data } = await api.get('/admin/orders', { params });
    return {
      orders: data.data || [],
      pagination: data.pagination || {
        page: 1,
        limit: params.limit || 10,
        total: 0,
        totalPages: 1,
      },
    };
  },

  async updateOrder(id, payload) {
    const { data } = await api.patch(`/admin/orders/${id}`, payload);
    return data.order || null;
  },

  async getCategories(params = {}) {
    const { data } = await api.get('/admin/categories', { params });
    return {
      categories: data.data || [],
      pagination: data.pagination || {
        page: 1,
        limit: params.limit || 100,
        total: 0,
        totalPages: 1,
      },
    };
  },
};

export const cartService = {
  async getCart() {
    const { data } = await api.get('/cart');
    return mapCart(data);
  },

  async addToCart(payload) {
    const { data } = await api.post('/cart', payload);
    return mapCart(data.cart || {});
  },

  async updateCart(payload) {
    const { data } = await api.put('/cart', payload);
    return mapCart(data.cart || {});
  },

  async removeCartItem(payload) {
    const { data } = await api.delete('/cart', { data: payload });
    return mapCart(data.cart || {});
  },

  async clearCart() {
    const { data } = await api.delete('/cart', {
      data: { clearAll: true },
    });
    return mapCart(data.cart || {});
  },
};

export const voucherService = {
  async applyVoucher(payload) {
    const { data } = await api.post('/voucher/apply', payload);
    return data;
  },
};

export const addressService = {
  async getAddresses() {
    const { data } = await api.get('/address');
    return (data.data || []).map(mapAddress);
  },

  async createAddress(payload) {
    const { data } = await api.post('/address', payload);
    return mapAddress(data.address || {});
  },

  async updateAddress(id, payload) {
    const { data } = await api.put(`/address/${id}`, payload);
    return mapAddress(data.address || {});
  },

  async deleteAddress(id) {
    const { data } = await api.delete(`/address/${id}`);
    return data;
  },
};

export const orderService = {
  async createOrder(payload) {
    const { data } = await api.post('/orders', payload);
    return mapOrder(data.order || {});
  },

  async getMyOrders() {
    const { data } = await api.get('/orders/user');
    return (data.data || []).map(mapOrder);
  },

  async getOrderById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return mapOrder(data.order || {});
  },

  async cancelOrder(id, reason) {
    const { data } = await api.put(`/orders/cancel/${id}`, { reason });
    return mapOrder(data.order || {});
  },

  async processPayment(payload) {
    const { data } = await api.post('/payment', payload);
    return {
      order: mapOrder(data.order || {}),
      payment: data.payment || null,
    };
  },
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!(file instanceof File)) {
      reject(new Error('Khong tim thay tep hinh anh hop le.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () =>
      reject(new Error('Khong the doc tep hinh anh de upload.'));
    reader.readAsDataURL(file);
  });

export const uploadService = {
  async uploadProductImage(fileOrDataUrl, options = {}) {
    const fileData =
      typeof fileOrDataUrl === 'string'
        ? fileOrDataUrl
        : await fileToDataUrl(fileOrDataUrl);

    const { data } = await api.post('/uploads/image', {
      fileData,
      target: 'product',
      publicId: options.publicId,
    });

    return data.file || null;
  },
};

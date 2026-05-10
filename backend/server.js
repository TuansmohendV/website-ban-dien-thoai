import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import publicBrandRoutes from './routes/publicBrandRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchHistoryRoutes from './routes/searchHistoryRoutes.js';
import supportTicketRoutes from './routes/supportTicketRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import broadcastRoutes from './routes/broadcastRoutes.js';
import iconRoutes from './routes/iconRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import adminSupportRoutes from './routes/adminSupportRoutes.js';
import adminVoucherRoutes from './routes/adminVoucherRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminProductRoutes from './routes/adminProductRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import adminReviewRoutes from './routes/adminReviewRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '10mb' }));
app.use(express.urlencoded({ limit: process.env.REQUEST_BODY_LIMIT || '10mb', extended: true }));

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_product', (productId) => {
    socket.join(`product_${productId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is ready.',
    timestamp: new Date().toISOString(),
    modules: [
      'auth',
      'user',
      'address',
      'products',
      'categories',
      'reviews',
      'cart',
      'voucher',
      'orders',
      'payment',
      'brands',
      'faqs',
      'dashboard',
      'wishlist',
      'notifications',
      'search-history',
      'support-tickets',
      'broadcasts',
      'icons',
      'upload',
      'socket-io'
    ],
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Server mobile backend đang chạy.',
    modules: [
      'auth',
      'user',
      'address',
      'products',
      'categories',
      'reviews',
      'cart',
      'voucher',
      'orders',
      'payment',
      'brands',
      'faqs',
      'dashboard',
      'wishlist',
      'notifications',
      'search-history',
      'support-tickets',
      'broadcasts',
      'icons',
      'upload',
    ],
  });
});

// ─── Auth ────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── User-linked modules that can conflict with /api/user/:id ─────────────
app.use('/api/user/wishlist', wishlistRoutes);
app.use('/api/user/search-history', searchHistoryRoutes);

// ─── User profile & admin user management ────────
app.use('/api/user', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', adminUserRoutes);

// ─── Address ─────────────────────────────────────
app.use('/api/address', addressRoutes);

// ─── Products ────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/admin/products', adminProductRoutes);

// ─── Categories ──────────────────────────────────
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', categoryRoutes);

// ─── Brands ──────────────────────────────────────
app.use('/api/brands', publicBrandRoutes);
app.use('/api/admin/brands', brandRoutes);

// ─── Reviews ─────────────────────────────────────
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);

// ─── Cart ────────────────────────────────────────
app.use('/api/cart', cartRoutes);

// ─── Vouchers ────────────────────────────────────
app.use('/api/voucher', voucherRoutes);
app.use('/api/admin/vouchers', adminVoucherRoutes);

// ─── Orders ──────────────────────────────────────
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', adminOrderRoutes);

// ─── Payment ─────────────────────────────────────
app.use('/api/payment', paymentRoutes);

// ─── FAQs ────────────────────────────────────────
app.use('/api/faqs', faqRoutes);
app.use('/api/admin/faqs', faqRoutes);

// ─── Dashboard ───────────────────────────────────
app.use('/api/admin/dashboard', dashboardRoutes);

// ─── Wishlist ────────────────────────────────────
app.use('/api/wishlist', wishlistRoutes);

// ─── Notifications ──────────────────────────────
app.use('/api/notifications', notificationRoutes);

// ─── Search History ─────────────────────────────
app.use('/api/search-history', searchHistoryRoutes);

// ─── Support Tickets (User + Public FAQ) ────────
app.use('/api/support', supportRoutes);
app.use('/api/support-tickets', supportTicketRoutes);
app.use('/api/admin/support-tickets', supportTicketRoutes);
app.use('/api/admin/support', adminSupportRoutes);

// ─── Upload ─────────────────────────────────────
app.use('/api/upload', uploadRoutes);
app.use('/api/uploads', uploadRoutes);

// ─── Broadcasts ─────────────────────────────────
app.use('/api/admin/broadcasts', broadcastRoutes);
app.use('/api/admin/notifications/broadcasts', broadcastRoutes);

// ─── Icons ──────────────────────────────────────
app.use('/api/icons', iconRoutes);
app.use('/api/admin/icons', iconRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Thiếu biến môi trường MONGODB_URI trong file .env');
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log('MongoDB connected.');

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Lỗi khởi động server:', error.message);
  process.exit(1);
});

export { io };
export default app;


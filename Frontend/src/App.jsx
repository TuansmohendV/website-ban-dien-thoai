import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages - User
import HomePage from './pages/User/HomePage';
import ProductDetailPage from './pages/User/ProductDetailPage';
import CartPage from './pages/User/CartPage';
import CategoryPage from './pages/User/CategoryPage';
import CheckoutPage from './pages/User/CheckoutPage';
import AboutPage from './pages/User/AboutPage';
import ContactPage from './pages/User/ContactPage';
import ProfilePage from './pages/User/ProfilePage';
import OrdersPage from './pages/User/OrdersPage';
import TradeInPage from './pages/User/TradeInPage';
import WarrantyPage from './pages/User/WarrantyPage';
import PCEPowerPage from './pages/User/PCEPowerPage';
import ForgotPasswordPage from './pages/User/ForgotPasswordPage';
import SearchPage from './pages/User/SearchPage';
import ReturnRequestPage from './pages/User/ReturnRequestPage';
import ReferralPage from './pages/User/ReferralPage';
import FlashVoucherPage from './pages/User/FlashVoucherPage';
import InvoicePage from './pages/User/InvoicePage';
import StoreLocatorPage from './pages/User/StoreLocatorPage';
import CustomerSupportPage from './pages/User/CustomerSupportPage';
import ChangePasswordPage from './pages/User/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages - Auth
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import UserManagement from './pages/Admin/UserManagement';
import FeedbackManagement from './pages/Admin/FeedbackManagement';
import PromotionManagement from './pages/Admin/PromotionManagement';
import IconManagement from './pages/Admin/IconManagement';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <ScrollToTop />
            <Routes>
            {/* Các trang sử dụng MainLayout (có Navbar/Footer) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="category" element={<CategoryPage />} />
              <Route path="category/:id" element={<CategoryPage />} />
              <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="store-locator" element={<StoreLocatorPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="trade-in" element={<TradeInPage />} />
              <Route path="warranty" element={<WarrantyPage />} />
              <Route path="pc-epower" element={<PCEPowerPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="return-request" element={<ReturnRequestPage />} />
              <Route path="return-request/:orderId" element={<ReturnRequestPage />} />
              <Route path="referral" element={<ReferralPage />} />
              <Route path="flash-voucher" element={<FlashVoucherPage />} />
              <Route path="invoice/:orderId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
              <Route path="customer-support" element={<ProtectedRoute><CustomerSupportPage /></ProtectedRoute>} />
            </Route>

            {/* Các trang không dùng chung Layout (Trang đăng nhập/đăng ký/giỏ hàng) */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="feedback" element={<FeedbackManagement />} />
              <Route path="icons" element={<IconManagement />} />
            </Route>
          </Routes>
        </OrdersProvider>
      </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;


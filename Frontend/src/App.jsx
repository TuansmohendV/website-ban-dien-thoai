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
import BannerManagement from './pages/Admin/BannerManagement';
import NewsManagement from './pages/Admin/NewsManagement';
import SystemSettings from './pages/Admin/SystemSettings';
import MediaManagement from './pages/Admin/MediaManagement';
import NotificationManagement from './pages/Admin/NotificationManagement';
import HashtagManagement from './pages/Admin/HashtagManagement';

function App() {
  // Sync Brand Assets (Logo, Favicon, Title) from localStorage
  React.useEffect(() => {
    const updateGlobalBrand = () => {
      // 1. Update Favicon
      const savedFavicon = localStorage.getItem('adminFavicon');
      if (savedFavicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = savedFavicon;
      }

      // 2. Update Document Title (SEO)
      const savedTitle = localStorage.getItem('websiteName');
      if (savedTitle && !window.location.pathname.startsWith('/admin')) {
        document.title = savedTitle;
      } else if (window.location.pathname.startsWith('/admin')) {
        document.title = 'PhoneSin Admin';
      }
    };

    updateGlobalBrand();
    window.addEventListener('storage', updateGlobalBrand);
    const interval = setInterval(updateGlobalBrand, 1000); 
    return () => {
      window.removeEventListener('storage', updateGlobalBrand);
      clearInterval(interval);
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <Routes>
            {/* Các trang sử dụng MainLayout (có Navbar/Footer) */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="category" element={<CategoryPage />} />
              <Route path="category/:id" element={<CategoryPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="store-locator" element={<StoreLocatorPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="trade-in" element={<TradeInPage />} />
              <Route path="warranty" element={<WarrantyPage />} />
              <Route path="pc-epower" element={<PCEPowerPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="return-request" element={<ReturnRequestPage />} />
              <Route path="return-request/:orderId" element={<ReturnRequestPage />} />
              <Route path="referral" element={<ReferralPage />} />
              <Route path="flash-voucher" element={<FlashVoucherPage />} />
              <Route path="invoice/:orderId" element={<InvoicePage />} />
              <Route path="customer-support" element={<CustomerSupportPage />} />
            </Route>

            {/* Các trang không dùng chung Layout (Trang đăng nhập/đăng ký/giỏ hàng) */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="feedback" element={<FeedbackManagement />} />
              <Route path="icons" element={<IconManagement />} />
              <Route path="banners" element={<BannerManagement />} />
              <Route path="news" element={<NewsManagement />} />
              <Route path="media" element={<MediaManagement />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="notifications" element={<NotificationManagement />} />
              <Route path="hashtags" element={<HashtagManagement />} />
            </Route>
          </Routes>
        </OrdersProvider>
      </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

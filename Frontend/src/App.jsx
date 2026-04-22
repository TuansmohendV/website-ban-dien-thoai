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
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';

// Pages - Auth
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

function App() {
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
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Routes>
        </OrdersProvider>
      </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;


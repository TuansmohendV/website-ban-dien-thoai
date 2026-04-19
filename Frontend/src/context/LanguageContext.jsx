import React, { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi'); // 'vi' or 'en'
  const [currency, setCurrency] = useState('VND'); // 'VND' or 'USD'

  const translations = {
    vi: {
      about: 'Giới thiệu',
      contact: 'Liên hệ',
      tradeIn: 'Thu cũ đổi mới',
      cart: 'Giỏ hàng',
      category: 'Danh mục',
      searchPlaceholder: 'Nhập tên điện thoại, laptop, phụ kiện... cần tìm',
      buyNow: 'Mua ngay',
      addToCart: 'Thêm vào giỏ',
      specifications: 'Thông số kỹ thuật',
      reviews: 'Đánh giá',
      relatedProducts: 'Sản phẩm liên quan',
      copyLink: 'Sao chép link',
      share: 'Chia sẻ',
      success: 'Thành công!',
      addedToCart: 'Đã thêm vào giỏ hàng.',
      viewCart: 'Xem giỏ hàng',
      home: 'Trang chủ',
      exploreCategories: 'Khám phá danh mục',
      newArrivals: 'Siêu phẩm mới về',
      trending: 'Xu hướng mua sắm',
      viewAll: 'Xem tất cả',
      filter: 'Bộ lọc',
      sort: 'Sắp xếp',
      summary: 'Tóm tắt đơn hàng',
      checkout: 'Tiến hành thanh toán',
      emptyCart: 'Giỏ hàng của bạn đang trống',
      continueShopping: 'Tiếp tục mua sắm',
      specialOffer: 'SIÊU ƯU ĐÃI KHI MUA TẠI PHONESIN'
    },
    en: {
      about: 'About Us',
      contact: 'Contact',
      tradeIn: 'Trade-in',
      cart: 'Cart',
      category: 'Category',
      searchPlaceholder: 'Search for phones, laptops, accessories...',
      buyNow: 'Buy Now',
      addToCart: 'Add to Cart',
      specifications: 'Specifications',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      copyLink: 'Copy Link',
      share: 'Share',
      success: 'Success!',
      addedToCart: 'Added to your cart.',
      viewCart: 'View Cart',
      home: 'Home',
      exploreCategories: 'Explore Categories',
      newArrivals: 'New Arrivals',
      trending: 'Trending Now',
      viewAll: 'View All',
      filter: 'Filters',
      sort: 'Sort by',
      summary: 'Order Summary',
      checkout: 'Proceed to Checkout',
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      specialOffer: 'SPECIAL OFFERS AT PHONESIN'
    }
  };

  const t = (key) => translations[language][key] || key;

  const formatPrice = (amount) => {
    if (currency === 'USD') {
      const usdAmount = amount / 25000;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdAmount);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const toggleLanguage = () => {
    if (language === 'vi') {
      setLanguage('en');
      setCurrency('USD');
    } else {
      setLanguage('vi');
      setCurrency('VND');
    }
  };

  const value = useMemo(() => ({
    language,
    currency,
    t,
    formatPrice,
    toggleLanguage
  }), [language, currency]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

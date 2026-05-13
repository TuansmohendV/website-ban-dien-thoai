/* global use, db */
// 1. Chọn Database để sử dụng
use('database_mobile');

// 2. Xóa bảng cũ (nếu có) để làm mới dữ liệu
db.getCollection('products').drop();

// 3. Thêm dữ liệu điện thoại thật vào bảng 'products'
db.getCollection('products').insertMany([
  {
    "name": "iPhone 15 Pro Max",
    "price": 29990000,
    "image": "https://vcdn-sohoa.vnecdn.net/2023/09/13/iphone-15-pro-max-natural-titanium-1-6945-1694562512.jpg",
    "category": "Apple",
    "countInStock": 10,
    "description": "Chip A17 Pro mạnh mẽ, khung Titan siêu bền.",
    "rating": 5,
    "numReviews": 12
  },
  {
    "name": "Samsung Galaxy S24 Ultra",
    "price": 26990000,
    "image": "https://vcdn-sohoa.vnecdn.net/2024/01/18/S24-Ultra-Titanium-Gray-7674-1705545452.jpg",
    "category": "Samsung",
    "countInStock": 7,
    "description": "Camera 200MP, tích hợp AI thông minh.",
    "rating": 4.5,
    "numReviews": 8
  }
]);

// 4. In ra thông báo để kiểm tra
console.log("✅ Đã nạp dữ liệu iPhone và Samsung thành công!");
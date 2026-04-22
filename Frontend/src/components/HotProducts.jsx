import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import BuyNowModal from './BuyNowModal';
import { useLanguage } from '../context/LanguageContext';

const hotProductsData = [
  // Mobile
  {
    id: 'h1', name: 'iPhone 17 256GB - Chính hãng Apple Việt Nam',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/09/22/iphone-17-ultramarine.png',
    priceNum: 24390000, oldPrice: 24990000, discount: '-2%',
    chip: 'Apple A19', screen: '2622 × 1206', battery: '3578mAh',
    member: 293000, points: 48000
  },
  {
    id: 'h2', name: 'Điện thoại Gaming REDMAGIC 11...',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/10/29/red-magic-9-pro-black.png',
    priceNum: 13990000, oldPrice: 14990000, discount: '-7%',
    chip: 'Snapdragon 8 Elite', screen: '1216 × 2688', battery: '7000mAh',
    member: 168000, points: 28000
  },
  {
    id: 'h3', name: 'iPhone 15 512GB - Chính hãng...',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/13/iphone-15-pink.png',
    priceNum: 20990000, oldPrice: 28990000, discount: '-28%',
    chip: 'Apple A16 Bionic', screen: '2556 × 1179', battery: '3349mAh',
    member: 252000, points: 41000
  },
  {
    id: 'h4', name: 'iPhone 17 Pro Max 512GB - Chính hãng...',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/09/21/iphone-17-pro-max-desert-titanium.png',
    priceNum: 42990000, oldPrice: 44490000, discount: '-3%',
    chip: 'Apple A19 Pro', screen: '2868 × 1320', battery: '4685mAh',
    member: 516000, points: 87000
  },
  {
    id: 'h5', name: 'Samsung Galaxy S26 Ultra 12GB/512GB',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/01/22/s25-ultra-titanium-black.png',
    priceNum: 33990000, oldPrice: 37990000, discount: '-11%',
    chip: 'Snapdragon 8 Elite Gen 5', screen: '3088 × 1440', battery: '5000mAh',
    member: 408000, points: 68000
  },
  {
    id: 'h6', name: 'Xiaomi 15 Ultra 16GB/512GB - Leica',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/11/15/xiaomi-15-den.png',
    priceNum: 29990000, oldPrice: 33990000, discount: '-12%',
    chip: 'Snapdragon 8 Elite', screen: '3200 × 1440', battery: '5400mAh',
    member: 360000, points: 59000
  },
  {
    id: 'h7', name: 'OPPO Find X8 Pro 5G 16GB/512GB',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/12/24/find-x8-pro-space-black.png',
    priceNum: 28990000, oldPrice: 33290000, discount: '-13%',
    chip: 'Dimensity 9400', screen: '2780 × 1264', battery: '5910mAh',
    member: 348000, points: 57000
  },
  {
    id: 'h8', name: 'Samsung Galaxy Z Fold7 5G 12GB/512GB',
    category: 'dien-thoai',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/07/10/galaxy-z-fold7-navy.png',
    priceNum: 42990000, oldPrice: 46690000, discount: '-8%',
    chip: 'Snapdragon 8 Elite Gen 5', screen: '2176 × 1812', battery: '4400mAh',
    member: 516000, points: 85000
  },
  // Laptop
  {
    id: 'l1', name: 'MacBook Air M3 13 inch (8GB/256GB SSD)',
    category: 'laptop',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/05/macbook-air-m3-midnight.png',
    priceNum: 24990000, oldPrice: 27990000, discount: '-11%',
    chip: 'Apple M3', screen: '13.6 inch', battery: '18h pin',
    member: 300000, points: 50000
  },
  // Tablet
  {
    id: 't1', name: 'iPad Pro M4 11 inch (2024) - WiFi',
    category: 'tablet',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/08/ipad-pro-m4-11-silver.png',
    priceNum: 27990000, oldPrice: 29990000, discount: '-7%',
    chip: 'Apple M4', screen: '11" OLED', battery: 'Ultra Slim',
    member: 350000, points: 60000
  },
  {
    id: 't2', name: 'Samsung Galaxy Tab S10 Ultra 5G',
    category: 'tablet',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/27/tab-s10-ultra-moon-gray.png',
    priceNum: 30990000, oldPrice: 33990000, discount: '-9%',
    chip: 'Dimensity 9300+', screen: '14.6" AMOLED', battery: '11200mAh',
    member: 380000, points: 65000
  },
  {
    id: 't3', name: 'iPad Air M2 11 inch (2024)',
    category: 'tablet',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/20/ipad-air-m2-11-blue.png',
    priceNum: 16490000, oldPrice: 18990000, discount: '-13%',
    chip: 'Apple M2', screen: '11" Liquid Retina', battery: 'Apple Pencil Pro',
    member: 200000, points: 35000
  },
  {
    id: 't4', name: 'Xiaomi Pad 7 Pro 8GB/256GB',
    category: 'tablet',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/11/05/xiaomi-pad-7-pro-xanh.png',
    priceNum: 11990000, oldPrice: 13990000, discount: '-14%',
    chip: 'Snapdragon 8s Gen 3', screen: '11.2" 144Hz', battery: '8850mAh',
    member: 150000, points: 25000
  },
  {
    id: 't5', name: 'Samsung Galaxy Tab S9 FE WiFi 128GB',
    category: 'tablet',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/10/06/tab-s9-fe-mint.png',
    priceNum: 7990000, oldPrice: 9990000, discount: '-20%',
    chip: 'Exynos 1380', screen: '10.9" IPS', battery: '8000mAh',
    member: 100000, points: 15000
  },
  // Monitor
  {
    id: 'm1', name: 'Màn hình MSI PRO MP243L E14L',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/07/man-hinh-msi-pro-mp243l-e1.png',
    priceNum: 2190000, oldPrice: 3190000, discount: '-31%',
    chip: '100Hz', screen: 'IPS', battery: '23.8 inch',
    member: 50000, points: 21000
  },
  {
    id: 'm2', name: 'Màn hình Samsung LS24D300GAEXXV',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/10/30/man-hinh-samsung-ls24d300gaexxv-1.png',
    priceNum: 2170000, oldPrice: 2890000, discount: '-25%',
    chip: '100Hz', screen: 'VA', battery: '24 inch',
    member: 45000, points: 20000
  },
  {
    id: 'm3', name: 'Màn hình ViewSonic VA2215-H',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2022/10/26/viewsonic-va2215.png',
    priceNum: 1400000, oldPrice: 1890000, discount: '-26%',
    chip: '100Hz', screen: 'VA', battery: '21.5 inch',
    member: 25000, points: 14000
  },
  {
    id: 'm4', name: 'Màn hình EDRA EGM25F18',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/07/29/man-hinh-edra-egm25f180-egm25f100-3.png',
    priceNum: 2200000, oldPrice: 2890000, discount: '-24%',
    chip: '180Hz', screen: 'IPS', battery: '24 inch',
    member: 55000, points: 22000
  },
  {
    id: 'm5', name: 'Màn hình Gigabyte G24F-2 180Hz',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/24/man-hinh-gaming-gigabyte-g24f-2.png',
    priceNum: 3590000, oldPrice: 4500000, discount: '-20%',
    chip: '180Hz', screen: 'IPS', battery: '24 inch',
    member: 70000, points: 30000
  },
  {
    id: 'm6', name: 'Màn hình Acer Nitro VG240Y S',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2022/10/26/acer-nitro-vg240y.png',
    priceNum: 2990000, oldPrice: 3800000, discount: '-21%',
    chip: '165Hz', screen: 'IPS', battery: '23.8 inch',
    member: 60000, points: 25000
  },
  {
    id: 'm7', name: 'Màn hình ASUS VY249HE-W Eye Care',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2020/11/07/asus-vy249he.png',
    priceNum: 2750000, oldPrice: 3200000, discount: '-14%',
    chip: '75Hz', screen: 'IPS', battery: '23.8 inch',
    member: 40000, points: 20000
  },
  {
    id: 'm8', name: 'Màn hình Lenovo L24i-40 IPS',
    category: 'man-hinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2020/11/07/lenovo-l24i-40.png',
    priceNum: 2450000, oldPrice: 2990000, discount: '-18%',
    chip: '100Hz', screen: 'IPS', battery: '23.8 inch',
    member: 35000, points: 18000
  },
  // Computer Components
  {
    id: 'h-pc1', name: 'Bàn phím cơ gaming MSI FORGE GK100',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/24/msi-forge-gk100-1.png',
    priceNum: 389000, oldPrice: 480000, discount: '-19%',
    chip: 'MSI', screen: 'RGB', battery: 'RUBBER',
    member: 384000, points: 3800
  },
  {
    id: 'h-pc2', name: 'Bàn phím cơ gaming MSI FORGE GK300',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/24/msi-forge-gk300-1.png',
    priceNum: 980000, oldPrice: 1180000, discount: '-17%',
    chip: 'MSI', screen: 'RGB', battery: 'BLUE SW',
    member: 968000, points: 9800
  },
  {
    id: 'h-pc3', name: 'Chuột không dây Genius Silent NX-8008S',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/11/05/chuot-khong-day-genius-silent-nx-8008s-xam-1.png',
    priceNum: 159000, oldPrice: 239000, discount: '-33%',
    chip: 'GENIUS', screen: '2.4Ghz', battery: 'SILENT',
    member: 157000, points: 1500
  },
  {
    id: 'h-pc4', name: 'Chuột máy tính không dây Thinkpad',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/lenovo-thinkpad-silent-mouse.png',
    priceNum: 290000, oldPrice: 549000, discount: '-47%',
    chip: 'LENOVO', screen: '1200 DPI', battery: 'SILENT',
    member: 287000, points: 2900
  },
  {
    id: 'h-pc5', name: 'Chuột gaming có dây MSI FORGE GM100',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/24/msi-forge-gm100.png',
    priceNum: 249000, oldPrice: 290000, discount: '-14%',
    chip: 'MSI', screen: '6400 DPI', battery: 'GAMING',
    member: 245000, points: 2400
  },
  {
    id: 'h-pc6', name: 'Chuột không dây Logitech M650',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2022/10/26/logitech-m650-den.png',
    priceNum: 650000, oldPrice: 890000, discount: '-27%',
    chip: 'LOGITECH', screen: 'BT/WIRELESS', battery: 'SMARTWHEEL',
    member: 640000, points: 6500
  },
  {
    id: 'h-pc7', name: 'Ổ cứng SSD MSI SPATIUM M450 500GB',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/msi-m450-500gb.png',
    priceNum: 1490000, oldPrice: 1980000, discount: '-25%',
    chip: 'MSI', screen: 'PCIe 4.0', battery: '3600MB/s',
    member: 1470000, points: 14900
  },
  {
    id: 'h-pc8', name: 'Ổ cứng SSD MSI SPATIUM M450 1TB',
    category: 'linh-kien-may-tinh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/msi-m450-1tb.png',
    priceNum: 2290000, oldPrice: 2830000, discount: '-19%',
    chip: 'MSI', screen: 'PCIe 4.0', battery: '3600MB/s',
    member: 2260000, points: 22900
  },
  // Âm thanh
  {
    id: 'h-a1', name: 'Tai nghe chống ồn Sony WH-1000XM6',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/10/11/wh-1000xm6-den.png',
    priceNum: 9880000, oldPrice: 11990000, discount: '-18%',
    chip: 'ANC', screen: 'Driver 30mm', battery: '40 giờ',
    member: 9761000, points: 99000
  },
  {
    id: 'h-a2', name: 'Tai nghe Sony WF-1000XM6',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2026/03/23/wf-1000xm6-black.png',
    priceNum: 7890000, oldPrice: 8490000, discount: '-7%',
    chip: 'ANC', screen: 'Driver Dynamic', battery: '24 giờ',
    member: 7795000, points: 79000
  },
  {
    id: 'h-a3', name: 'Apple AirPods Pro 3 (MagSafe)',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/10/10/airpod-pro3.png',
    priceNum: 5490000, oldPrice: 6990000, discount: '-21%',
    chip: 'H3 Chip', screen: 'Spatial Audio', battery: '30 giờ',
    member: 5390000, points: 55000
  },
  {
    id: 'h-a4', name: 'Tai nghe Sony WF-C710N',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/05/18/wf-c710n-den.png',
    priceNum: 1950000, oldPrice: 2490000, discount: '-22%',
    chip: 'ANC', screen: 'Driver 05mm', battery: '8 giờ',
    member: 1927000, points: 20000
  },
  {
    id: 'h-a5', name: 'Loa Marshall Emberton II - Chính hãng',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2022/10/26/emberton-2-black-and-brass.png',
    priceNum: 3990000, oldPrice: 4990000, discount: '-20%',
    chip: 'IP67', screen: 'True Stereophonic', battery: '30+ giờ',
    member: 3890000, points: 40000
  },
  {
    id: 'h-a6', name: 'Tai nghe Redmi Buds 8 Pro',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2026/03/18/redmi-buds-8-pro-trang.png',
    priceNum: 2190000, oldPrice: 2490000, discount: '-12%',
    chip: 'ANC', screen: 'Driver Dual', battery: '30 giờ',
    member: 2164000, points: 22000
  },
  {
    id: 'h-a7', name: 'Tai nghe HUAWEI FreeBuds SE 4',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/11/18/huawei-freebuds-se-4-den.png',
    priceNum: 790000, oldPrice: 990000, discount: '-20%',
    chip: 'ANC', screen: 'Driver 10mm', battery: '24 giờ',
    member: 781000, points: 7900
  },
  {
    id: 'h-a8', name: 'Loa Harman Kardon Aura Studio 4',
    category: 'am-thanh',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/aura-studio-4.png',
    priceNum: 6290000, oldPrice: 6990000, discount: '-10%',
    chip: 'Lighting', screen: '360 Sound', battery: 'Điện trực tiếp',
    member: 6190000, points: 63000
  },
  // Smart Home
  {
    id: 'sh-h1', name: 'Camera IP Wifi UNV quay quét 360° Uho-S3',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/10/camera-unv-s3.png',
    priceNum: 1130000, oldPrice: 1290000, discount: '-12%',
    chip: '2K/3MP', screen: 'Wifi 2.4G', battery: 'Xoay 360',
    member: 1116000, points: 11300
  },
  {
    id: 'sh-h2', name: 'Camera UNV giám sát ngoài trời Uho-P2C',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/10/camera-unv-p2c.png',
    priceNum: 1177000, oldPrice: 1390000, discount: '-15%',
    chip: '2K+/4MP', screen: 'Wifi/LAN', battery: 'IP66',
    member: 1163000, points: 11800
  },
  {
    id: 'sh-h3', name: 'Máy massage cầm tay PHILIPS PPM7319',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/03/18/may-massage-cam-tay-philips-ppm7319.png',
    priceNum: 690000, oldPrice: 790000, discount: '-13%',
    chip: '3 Mode', screen: 'Pin sạc', battery: 'Gọn nhẹ',
    member: 682000, points: 6900
  },
  {
    id: 'sh-h4', name: 'Máy massage vai PHILIPS PPM3325',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/10/philips-ppm3325.png',
    priceNum: 1690000, oldPrice: 1790000, discount: '-6%',
    chip: 'Massage vai', screen: 'Hồng ngoại', battery: 'Chườm ấm',
    member: 1670000, points: 16900
  },
  {
    id: 'sh-h5', name: 'Máy massage cổ PHILIPS PPM3308',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/11/philips-ppm3308.png',
    priceNum: 1590000, oldPrice: 1690000, discount: '-6%',
    chip: 'Sóng rung', screen: 'Chườm nóng', battery: 'Memory Foam',
    member: 1571000, points: 15900
  },
  {
    id: 'sh-h6', name: 'Máy massage chân Philips PPM6502',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/11/philips-ppm6502.png',
    priceNum: 1290000, oldPrice: 1490000, discount: '-13%',
    chip: 'Massage túi khí', screen: 'Ấm lòng bàn chân', battery: '3 cấp độ',
    member: 1275000, points: 12900
  },
  {
    id: 'sh-h7', name: 'Máy massage chân Philips PPM6504',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/09/20/massage-chan-philips-ppm6504.png',
    priceNum: 1890000, oldPrice: 2290000, discount: '-17%',
    chip: 'Con lăn 3D', screen: 'Nhiệt hồng ngoại', battery: 'Xóa nhức mỏi',
    member: 1867000, points: 18900
  },
  {
    id: 'sh-h8', name: 'Camera kỹ thuật số dùng để ghi hình ngoài trời UNV Uho-P2G',
    category: 'smart-home',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2025/11/10/camera-unv-p2g.png',
    priceNum: 2713000, oldPrice: 3000000, discount: '-9%',
    chip: 'Quay đêm có màu', screen: 'Đàm thoại 2 chiều', battery: 'Pin năng lượng mặt trời',
    member: 2680000, points: 27100
  },
  // Dong ho
  {
    id: 'dh-h1', name: 'Đồng hồ thông minh Huawei GT 4 41mm',
    category: 'dong-ho',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/20/huawei-watch-gt-4-41mm-xanh.png',
    priceNum: 4690000, oldPrice: 5990000, discount: '-22%',
    chip: 'PPI 317', screen: '466×466px', battery: 'Pin 7 ngày',
    member: 56000, eduDiscount: '-100.000đ', points: 9000
  },
  {
    id: 'dh-h2', name: 'Đồng hồ thông minh Huawei GT 4 46mm',
    category: 'dong-ho',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/09/20/huawei-watch-gt-4-46mm-den.png',
    priceNum: 4490000, oldPrice: 5490000, discount: '-18%',
    chip: 'PPI 317', screen: '466×466px', battery: 'Pin 14 ngày',
    member: 251000, eduDiscount: '-300.000đ', points: 8000
  },
  {
    id: 'dh-h3', name: 'Đồng hồ Garmin Forerunner 165',
    category: 'dong-ho',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2024/02/21/garmin-forerunner-165-black-1.png',
    priceNum: 3990000, oldPrice: 6690000, discount: '-40%',
    chip: 'AMOLED', screen: '390×390px', battery: 'GPS 11 ngày',
    member: 48000, eduDiscount: '-100.000đ', points: 8000
  },
  {
    id: 'dh-h4', name: 'Đồng hồ Samsung Galaxy Watch6 Classic',
    category: 'dong-ho',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/07/26/galaxy-watch6-classic-47mm-den.png',
    priceNum: 9490000, oldPrice: 16990000, discount: '-44%',
    chip: 'Sapphire', screen: '480×480px', battery: '425mAh',
    member: 114000, eduDiscount: '-100.000đ', points: 19000
  },
  // Dich vu
  {
    id: 'dv-h1', name: 'SIM MobiFone Hera 5G',
    category: 'dich-vu',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/hero-5g.png',
    priceNum: 50000, oldPrice: 70000, discount: '-28%',
    chip: 'Hera 5G', screen: 'eSIM hỗ trợ', battery: 'Tùy chọn gói',
    member: 49000, points: 500
  },
  {
    id: 'dv-h2', name: 'SIM Local A0',
    category: 'dich-vu',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/local-a0.png',
    priceNum: 89000, oldPrice: 120000, discount: '-25%',
    chip: 'Local A0', screen: 'Tốc độ cao', battery: 'Miễn phí gọi',
    member: 88000, points: 890
  },
  {
    id: 'dv-h3', name: 'SIM Vietnamobile Max Data 6M',
    category: 'dich-vu',
    image: 'https://cdn.hoanghamobile.vn/i/productlist/ts/Uploads/2023/11/18/vnm-max-data.png',
    priceNum: 0, oldPrice: 60000, discount: '-100%',
    chip: 'Max Data', screen: '6GB/ngày', battery: '6 tháng',
    member: 0, points: 0
  }
];

const HotProducts = ({ category = 'dien-thoai' }) => {
  const { formatPrice } = useLanguage();
  
  let filteredItems = hotProductsData.filter(p => p.category === category);
  if (filteredItems.length > 0 && filteredItems.length <= 4) {
    let clones = [...filteredItems];
    let cloneIndex = 1;
    while (clones.length < 8) {
      clones = [
        ...clones, 
        ...filteredItems.map(p => ({ ...p, id: `${p.id}_clone_${cloneIndex++}` }))
      ];
    }
    filteredItems = clones.slice(0, 8);
  } else if (filteredItems.length === 0) {
    filteredItems = [];
  }

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [buyModalProduct, setBuyModalProduct] = useState(null);
  
  const visibleCount = 4; // Always keep 4 visible layout for consistency when sliding
  const maxIndex = Math.max(0, filteredItems.length - visibleCount);

  const prev = () => setCurrent(c => (c <= 0 ? maxIndex : c - 1));
  const next = () => setCurrent(c => (c >= maxIndex ? 0 : c + 1));

  const titles = {
    'dien-thoai': 'CÁC SẢN PHẨM HOT NHẤT CỦA ĐIỆN THOẠI',
    'laptop': 'CÁC SẢN PHẨM HOT NHẤT CỦA LAPTOP',
    'tablet': 'CÁC SẢN PHẨM HOT NHẤT CỦA TABLET',
    'dong-ho': 'CÁC SẢN PHẨM HOT NHẤT CỦA Đồng hồ thông minh',
    'man-hinh': 'CÁC SẢN PHẨM HOT NHẤT CỦA MÀN HÌNH',
    'linh-kien-may-tinh': 'CÁC SẢN PHẨM HOT NHẤT CỦA LINH KIỆN MAY TÍNH',
    'am-thanh': 'CÁC SẢN PHẨM HOT NHẤT CỦA THIẾT BỊ ÂM THANH',
    'dich-vu': 'CÁC SẢN PHẨM HOT NHẤT CỦA DỊCH VỤ'
  };
  const currentTitle = titles[category] || `CÁC SẢN PHẨM HOT NHẤT CỦA ${category.toUpperCase()}`;

  useEffect(() => {
    if (isPaused || filteredItems.length <= visibleCount) return;
    const timer = setInterval(() => next(), 4500); 
    return () => clearInterval(timer);
  }, [current, isPaused, filteredItems.length, visibleCount]);

  return (
    <div 
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 mt-4 overflow-hidden transition-all duration-500 hover:shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-[20px] font-black text-gray-900 uppercase tracking-tighter border-l-4 border-[#008d71] pl-4">
          {currentTitle}
        </h2>
      </div>

      <div className="overflow-hidden px-1">
        <div
          className="flex gap-4"
          style={{ 
            transform: `translateX(calc(-${current} * (${100 / visibleCount}% + ${16 / visibleCount}px)))`,
            transition: 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          {filteredItems.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 transition-all duration-500 flex-shrink-0 overflow-hidden group"
              style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 16 / visibleCount}px)` }}
            >
              <div className="relative h-[200px] flex items-center justify-center bg-gray-50 px-4 pt-4 cursor-pointer group/img">
                <img
                  src={p.image}
                  alt={p.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white/95 p-3 rounded-full shadow-2xl transform scale-50 group-hover/img:scale-100 transition-all duration-500">
                      <Eye size={22} className="text-[#008d71]" />
                   </div>
                </div>
                <div className="absolute top-2 right-2 text-[11px] font-black text-[#ee0000] bg-white/80 px-1.5 py-0.5 rounded-full shadow-sm">
                  {p.discount}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 px-3 py-2 border-t border-gray-50 bg-[#fafafa]">
                {[
                  { label: p.chip, icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
                  { label: p.screen, icon: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M20 12h-8m0 0 3-3m-3 3 3 3' },
                  { label: p.battery, icon: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={s.icon} />
                    </svg>
                    <span className="text-[9px] text-gray-500 font-bold mt-0.5 leading-tight uppercase tracking-tighter">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="px-3 pb-3 pt-2">
                <h3 className="text-[13px] font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-[#008d71] transition-colors">{p.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-0.5">
                  <span className="text-gray-400 line-through text-[11px]">{formatPrice(p.oldPrice)}</span>
                  <span className="text-[#ee0000] text-[11px] font-black">{p.discount}</span>
                </div>
                <div className="text-[#ee0000] font-black text-[18px] mb-2">{formatPrice(p.priceNum)}</div>

                <div className="bg-[#e6f7f4] text-[#008d71] text-[10px] font-bold px-2 py-1.5 rounded-md mb-2 leading-snug">
                  Hoàng Hà Member giảm thêm tới<br />
                  <span className="text-[12px] font-black">{formatPrice(p.member)}</span>
                </div>
                
                {p.eduDiscount && (
                  <div className="bg-[#e6f0ff] text-[#0055ff] text-[10px] font-bold px-2 py-1 rounded-md mb-2 leading-snug">
                    Hoàng Hà Edu giảm thêm<br />
                    <span className="text-[12px] font-black">{p.eduDiscount}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-3">
                  <span className="bg-[#f59e0b] text-white text-[9px] font-black px-1.5 py-0.5 rounded">Tích điểm</span>
                  <span className="text-[#f59e0b] text-[11px] font-black">+{p.points.toLocaleString('vi-VN')} Điểm</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setBuyModalProduct(p)} className="flex-1 bg-[#008d71] text-white text-[12px] font-black text-center py-2.5 rounded-lg hover:bg-[#006e5c] hover:shadow-lg transition-all active:scale-95 uppercase">
                    MUA NGAY
                  </button>
                  <Link to={`/product/${p.id}`} className="flex items-center gap-1 text-gray-600 text-[11px] font-bold hover:text-[#008d71] transition-colors px-1">
                    <Eye size={14} /> Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prev}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#008d71] hover:scale-110 active:scale-90 transition-all duration-300 group"
        >
          <ChevronLeft size={24} className="text-gray-400 group-hover:text-[#008d71] transition-colors" />
        </button>

        <div className="flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${current === i ? 'w-10 bg-[#008d71]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 hover:border-[#008d71] hover:scale-110 active:scale-90 transition-all duration-300 group"
        >
          <ChevronRight size={24} className="text-gray-400 group-hover:text-[#008d71] transition-colors" />
        </button>
      </div>
      {/* Buy Now Modal */}
      <BuyNowModal
        product={buyModalProduct}
        isOpen={!!buyModalProduct}
        onClose={() => setBuyModalProduct(null)}
      />
    </div>
  );
};

export default HotProducts;

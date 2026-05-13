import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryDiscovery = ({ category }) => {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = React.useState(false);
  
  const discoveryData = {
    'laptop': [
      { label: 'Laptop văn phòng - sinh viên', slug: 'van-phong', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/15/anh-icon-95.gif' },
      { label: 'Laptop đồ họa - kĩ thuật', slug: 'do-hoa', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/15/anh-icon-94.gif' },
      { label: 'Laptop mỏng nhẹ', slug: 'mong-nhe', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/15/anh-icon-94.gif' },
      { label: 'Laptop gaming', slug: 'gaming', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/15/anh-icon-83.gif' },
      { label: 'Laptop AI', slug: 'ai', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/15/anh-icon-93.gif' }
    ],
    'linh-kien-may-tinh': [
      { label: 'Ổ cứng - Lưu trữ (SSD - HDD)', slug: 'o-cung', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/08/08/icon-for-personal-computer.png' },
      { label: 'RAM - Bộ nhớ RAM', slug: 'ram', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/08/08/ram-corsair-dominator.png' },
      { label: 'Chuột & Bàn phím', slug: 'keyboard-mouse', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/17/mk240-1.png' },
      { label: 'Linh kiện khác', slug: 'khac', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/11/10/icon-linh-kien-khac.png' }
    ],
    'am-thanh': [
      { label: 'Loa', slug: 'loa', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/loa-icon.png' },
      { label: 'Tai nghe', slug: 'tai-nghe', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2024/11/21/tai-nghe_638678026137334904.png' }
    ],
    'smart-home': [
      { label: 'Máy cạo râu', slug: 'may-cao-rau', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/11/10/icon-may-cao-rau.png' },
      { label: 'Chăm sóc thú cưng', slug: 'thu-cung', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-12.png' },
      { label: 'Máy Massage', slug: 'massage', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-13.png' },
      { label: 'Máy tăm nước', slug: 'tam-nuoc', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/05/14/tam-nuoc.png' },
      { label: 'Nồi chiên không dầu', slug: 'noi-chien', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-14.png' },
      { label: 'Ổ Cắm điện', slug: 'o-cam', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-16.png' },
      { label: 'Quạt Điện', slug: 'quat', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-9.png' },
      { label: 'Máy lọc không khí', slug: 'loc-khong-khi', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/18/icon-may-loc-khong-khi.png' },
      { label: 'Robot, Máy hút bụi', slug: 'robot-hut-bui', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon.png' },
      { label: 'Máy Chiếu', slug: 'may-chieu', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-3.png' },
      { label: 'Camera', slug: 'camera', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2020/10/30/camera.png' },
      { label: 'Cân thông minh', slug: 'can', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-11.png' },
      { label: 'Bàn chải điện', slug: 'ban-chai', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/05/14/ban-chai.png' },
      { label: 'Bình giữ nhiệt', slug: 'binh-giu-nhiet', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/06/27/binh-giu-nhiet.png' }
    ],
    'hang-cu': [
      { label: 'Điện thoại', slug: 'dien-thoai', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/x7c-den-avt.png' },
      { label: 'Đồng hồ thông minh', slug: 'dong-ho', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/kieslect-ks-avt.png' },
      { label: 'Laptop', slug: 'laptop', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/83k00008vn-avt.png' },
      { label: 'Máy tính bảng', slug: 'tablet', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/honor-pad-x9-avt.png' },
      { label: 'Tai nghe', slug: 'tai-nghe', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/tai-nghe-avt.png' },
      { label: 'Màn hình máy tính', slug: 'man-hinh', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/manhinhmaytinh-avt.png' },
      { label: 'Củ Sạc', slug: 'cu-sac', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/cu-sac-avt.png' },
      { label: 'Loa', slug: 'loa', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/marshall-acton-iii-avt.png' },
      { label: 'Dây cáp', slug: 'day-cap', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/day-cap-avt.png' },
      { label: 'Sạc Dự Phòng', slug: 'sac-du-phong', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/sacduphong-avt.png' },
      { label: 'Phụ kiện', slug: 'phu-kien', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/phukien-avt.png' },
      { label: 'Bao da', slug: 'bao-da', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/bao-da-avt.png' },
      { label: 'Chuột', slug: 'chuot', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/chuot-avt.png' },
      { label: 'Thiết bị mạng', slug: 'thiet-bi-mang', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/08/27/ax53-3.png' },
      { label: 'Camera', slug: 'camera', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/camera-avt.png' },
      { label: 'Máy lọc không khí', slug: 'loc-khong-khi', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/08/27/t1c24.png' },
      { label: 'Cổng chuyển đổi', slug: 'cong-chuyen-doi', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/congchuyendoidulieu-avt.png' },
      { label: 'Robot hút bụi', slug: 'robot-hut-bui', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/robothutbui-avt.png' },
      { label: 'Mic', slug: 'mic', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/24/mic-avt.png' },
      { label: 'Tấm dán màn hình', slug: 'tam-dan-man-hinh', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/tam-dan-man-hinh-avt.png' },
      { label: 'Ốp lưng', slug: 'op-lung', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/op-lung-avt.png' },
      { label: 'Túi xách', slug: 'tui-xach', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2026/01/16/tuixach-remove.png' },
      { label: 'Máy chiếu', slug: 'may-chieu', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/03/14/anh-icon.png' },
      { label: 'PC', slug: 'pc', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/08/27/mac-mini-m4-1.png' },
      { label: 'Máy Massage', slug: 'massage', img: 'https://cdn.hoanghamobile.vn/i/logo/Uploads/2025/03/14/anh-icon-13.png' },
      { label: 'Máy hút ẩm', slug: 'may-hut-am', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/mayhutam.png' },
      { label: 'Máy in', slug: 'may-in', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2025/02/21/mayin.png' },
      { label: 'Máy tăm nước', slug: 'tam-nuoc', img: 'https://cdn.hoanghamobile.vn/i/productlist/dst/Uploads/2026/01/15/1741076132546-4.jpg' }
    ]
  };

  const discoveryItems = discoveryData[category];
  if (!discoveryItems) return null;

  // Double the items for seamless loop
  const displayItems = [...discoveryItems, ...discoveryItems];

  return (
    <div 
      className="bg-white rounded-2xl p-5 mb-8 shadow-sm relative overflow-hidden group/discovery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>
        {`
          @keyframes slideItems {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-discovery {
            animation: slideItems 40s linear infinite;
          }
          .animate-discovery:hover {
            animation-play-state: paused;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>

      <h3 className="text-[17px] font-bold text-gray-800 mb-6 px-2">
        {category === 'hang-cu' ? 'Danh mục sản phẩm cũ' : 'Khám phá danh mục'}
      </h3>
      
      {/* Container with relative position and hidden overflow */}
      <div className="relative w-full overflow-hidden">
        {/* Gradient Overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div className="flex animate-discovery gap-4 py-2 w-max">
          {displayItems.map((item, idx) => (
            <Link 
              key={`${item.slug}-${idx}`}
              to={`/${category}?filter=${item.slug}`}
              className="flex-shrink-0 w-[170px] bg-[#ffebd6] rounded-2xl p-4 flex flex-col items-center justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group no-underline"
            >
              <div className="h-[90px] w-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500">
                <img src={item.img} alt={item.label} className="max-h-full max-w-full object-contain filter drop-shadow-sm" />
              </div>
              <span className="text-[13px] font-bold text-gray-800 text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryDiscovery;

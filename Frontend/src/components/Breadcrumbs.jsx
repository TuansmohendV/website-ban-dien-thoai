import { Link, useParams, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const { id: slug } = useParams();
  const { pathname } = useLocation();

  const pathMap = {
    '/about': 'Giới thiệu',
    '/contact': 'Liên hệ',
    '/trade-in': 'Thu cũ đổi mới',
    '/pc-epower': 'PC E-Power',
    '/warranty': 'Chính sách bảo hành',
    '/category': 'Điện thoại',
    '/cart': 'Giỏ hàng',
    '/checkout': 'Thanh toán',
    '/profile': 'Trang cá nhân',
    '/orders': 'Lịch sử đơn hàng'
  };

  const currentPathName = pathMap[pathname] || (slug ? slug.replace(/-/g, ' ') : '');

  return (
    <nav className="w-full">
        <ol className="flex items-center gap-2">
          
          {/* HOME PILL */}
          <li>
            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all group">
              <Home size={14} className="text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[13px] font-bold text-gray-700 group-hover:text-black transition-colors">Trang chủ</span>
            </Link>
          </li>

          {/* SEPARATOR & CURRENT PILL */}
          {currentPathName && (
            <>
              <li className="flex items-center">
                <ChevronRight size={14} className="text-gray-400" />
              </li>
              <li>
                <div className="px-3 py-1.5 bg-[#008d71] text-white rounded-full flex items-center shadow-lg">
                  <span className="text-[13px] font-black uppercase tracking-tight">{currentPathName}</span>
                </div>
              </li>
            </>
          )}

        </ol>
    </nav>
  );
};

export default Breadcrumbs;

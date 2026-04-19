import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import BuyNowModal from './BuyNowModal';

const ProductCard = ({ product }) => {
  const { formatPrice } = useLanguage();
  const [showBuyModal, setShowBuyModal] = useState(false);
  
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col relative group border border-gray-100 hover:border-[#009981]/20 h-full">
      
      {/* Badge Rẻ Số 1 */}
      {product.isHot && (
        <div className="absolute top-0 left-0 z-20">
            <div className="bg-gradient-to-br from-[#ee0000] to-[#b30000] text-white text-[9px] font-black uppercase px-2 py-1 rounded-br-xl shadow-md border-r border-b border-[#800000]">
               Rẻ Số 1
            </div>
        </div>
      )}

      {/* Discount Badge */}
      {product.discount && (
        <div className="absolute top-2 left-2 z-10 bg-[#ee0000] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
          -{product.discount}
        </div>
      )}
      
      {/* Image + Specs */}
      <Link to={`/product/${product.id}`} className="flex items-center h-[180px] mb-3 relative">
        <div className="flex-1 h-full flex items-center justify-center p-2">
          <img 
            src={product.image || product.img} 
            alt={product.name} 
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        
        {/* Specs column (Retail Style) - Dynamic based on category */}
        <div className="w-14 flex flex-col justify-center gap-3 py-1 bg-white/80 backdrop-blur-[2px] rounded-l-lg absolute right-0">
          {(() => {
            let specItems = [];
            const iconSvg = {
              cpu: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
              ram: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect><line x1="6" y1="17" x2="6" y2="19"></line><line x1="10" y1="17" x2="10" y2="19"></line><line x1="14" y1="17" x2="14" y2="19"></line><line x1="18" y1="17" x2="18" y2="19"></line></svg>,
              phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>,
              display: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>,
              refresh: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            };

            if (product.category === 'dien-thoai') {
              specItems = [
                { label: 'Chip', value: product.specs?.chip || 'AI', svg: iconSvg.cpu },
                { label: 'RAM', value: product.specs?.ram || '12GB', svg: iconSvg.ram },
                { label: 'Size', value: product.specs?.screen || '6.73"', svg: iconSvg.phone },
                { label: 'Panel', value: product.specs?.panel || 'AMOLED', svg: iconSvg.display }
              ];
            } else if (product.category === 'smart-home') {
              specItems = []; // Hide for smart-home as per screenshot
            } else {
              // Default to monitor specs
              specItems = [
                { label: 'Hz', value: product.specs?.hz || '180Hz', svg: iconSvg.refresh },
                { label: 'Panel', value: product.specs?.panel || 'IPS', svg: iconSvg.display },
                { label: 'Size', value: product.specs?.size || '24"', svg: iconSvg.phone },
                { label: 'Res', value: product.specs?.res || 'FHD', svg: iconSvg.display }
              ];
            }
            
            return specItems.map((s, i) => (
              <div key={i} className="flex flex-col items-center opacity-70">
                {s.svg}
                <span className="text-[8px] font-bold text-gray-600 text-center leading-none mt-1 uppercase tracking-tighter">{s.value}</span>
              </div>
            ));
          })()}
        </div>
      </Link>

      {/* Product Name */}
      <Link to={`/product/${product.id}`} className="min-h-[40px] mb-3">
        <h3 className="text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 hover:text-[#008d71] transition-colors uppercase">
          {product.name}
        </h3>
      </Link>

      {/* Price Section */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[#ee0000] font-black text-[17px]">{formatPrice(product.priceNum)}</span>
          {product.oldPriceNum && (
            <span className="text-gray-400 line-through text-[12px]">{formatPrice(product.oldPriceNum)}</span>
          )}
        </div>
      </div>

      {/* Member price Block */}
      <div className="bg-[#f0faf7] rounded-lg px-2.5 py-1.5 mb-3 border border-[#d0ede7]">
        <div className="text-[10px] text-gray-600 font-bold mb-0.5">Giá Hạng Member Chỉ Từ</div>
        <div className="text-[#008d71] font-black text-[15px]">{formatPrice(product.memberPrice || (product.priceNum - 50000))}</div>
      </div>

      {/* Promotion Bar (Peach Ticket Style) */}
      <div className="mb-3">
        <div className="bg-[#ffebd6] rounded-lg px-3 py-1.5 flex items-center gap-2 border border-[#ffe0c2]">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#fd6500]" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 5l-1.761 1.761a2 2 0 000 2.828L15 11.35m-6 0l1.761-1.761a2 2 0 000-2.828L9 5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[#fd6500] text-[11px] font-bold">
            {product.extraPromos || '5'} Ưu đãi cho sản phẩm
          </span>
        </div>
      </div>

      {/* Footer Branding - Context Aware */}
      <div className="mt-auto pt-3 flex items-center justify-between">
        {product.brand === 'UNV' ? (
          <div className="flex items-center gap-1.5 text-[#008d71] cursor-pointer hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <span className="text-[12px] font-bold">Liên hệ</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-[#008d71]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="text-[12px] font-bold">Sẵn hàng</span>
            </div>
            <button onClick={() => setShowBuyModal(true)} className="flex items-center gap-1 text-[#ee0000] hover:scale-105 transition-transform">
              <div className="p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
              <span className="text-[12px] font-black uppercase">Mua ngay</span>
            </button>
          </>
        )}
      </div>

      {/* Buy Now Modal */}
      <BuyNowModal
        product={product}
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />
    </div>
  );
};

export default ProductCard;

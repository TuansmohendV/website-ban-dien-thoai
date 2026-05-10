import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders } from '../../context/OrdersContext';

// ─── Barcode-like decoration ──────────────────────────────────────────────────
const Barcode = () => (
  <div className="flex items-end gap-[2px] h-12">
    {[3,1,2,1,4,1,3,2,1,2,3,1,2,1,4,2,1,3,1,2,1,3,4,1,2,1,3,2].map((w, i) => (
      <div key={i} className="bg-slate-900 rounded-[1px]" style={{ width: w * 2 + 'px', height: (40 + (i % 3) * 6) + 'px' }} />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const InvoicePage = () => {
  const { orderId } = useParams();
  const { formatPrice } = useLanguage();
  const { orders, loading } = useOrders();
  const printRef = useRef(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Đang tải hóa đơn...</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts[0].length > 2) return dateStr; // Likely YYYY/MM/DD
        if (parseInt(parts[0]) > 12) return dateStr; // Likely DD/MM/YYYY already
    }
    try {
      const d = new Date(dateStr.split(',')[0]);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('vi-VN');
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const calculateDeliveryDate = (dateStr, city) => {
    try {
      const orderD = new Date(dateStr ? dateStr.split(',')[0] : new Date());
      if (isNaN(orderD.getTime())) return 'Đang cập nhật';
      let days = 3;
      if (['Hà Nội', 'Hồ Chí Minh', 'TP. Hồ Chí Minh'].includes(city)) days = 1;
      else if (['Đà Nẵng'].includes(city)) days = 2;
      orderD.setDate(orderD.getDate() + days);
      return orderD.toLocaleDateString('vi-VN');
    } catch {
      return 'Đang cập nhật';
    }
  };

  let realOrder = orders.find(o => o.id === orderId);

  const invoice = realOrder ? {
    invoiceNo: `INV-${realOrder.id || realOrder.orderId}`,
    issueDate: new Date().toLocaleDateString('vi-VN'),
    dueDate: new Date().toLocaleDateString('vi-VN'),
    orderId: realOrder.id || realOrder.orderId,
    orderDate: formatDate(realOrder.date),
    deliveryDate: calculateDeliveryDate(realOrder.date, realOrder.customer?.city),
    status: realOrder.status === 'pending' ? 'Chờ xác nhận' : realOrder.status === 'cancelled' ? 'Đã hủy' : 'Đã xác nhận',
    customer: {
      fullName: realOrder.customer.fullName,
      phone: realOrder.customer.phone || realOrder.customer.phoneNumber,
      email: realOrder.customer.email,
      address: realOrder.customer.address || realOrder.delivery?.store || 'Tại cửa hàng PhoneSin',
      companyName: realOrder.vatInfo?.companyName || '',
      companyAddress: realOrder.vatInfo?.companyAddress || '',
      taxCode: realOrder.vatInfo?.taxCode || '',
    },
    payment: { method: realOrder.payment?.methodLabel || realOrder.payment?.method || 'Thanh toán khi nhận hàng' },
    items: realOrder.items.map((item, idx) => ({
      no: idx + 1,
      name: item.name,
      unit: 'Cái',
      qty: item.qty,
      unitPrice: item.price,
      total: item.price * item.qty
    })),
    subtotal: realOrder.summary?.subtotal || realOrder.total,
    shipping: realOrder.summary?.shipping || 0,
    discount: realOrder.summary?.discount || 0,
    vat: realOrder.vatInfo ? (realOrder.total * 0.1) : 0,
    total: realOrder.totalAmount || realOrder.total,
    note: realOrder.note || 'Cảm ơn quý khách đã mua hàng tại PhoneSin.',
  } : null;

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-10 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Hoa don dien tu</p>
          <h1 className="text-3xl font-black text-slate-900 mb-3">Khong tim thay hoa don</h1>
          <p className="text-sm font-medium text-gray-500 mb-8">
            Don hang nay chua ton tai trong lich su don hang hien tai hoac ban chua tai lai du lieu backend.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest hover:bg-red-600 transition-all"
            >
              Ve trang don hang
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl border-2 border-gray-200 text-slate-700 font-black uppercase tracking-widest hover:border-slate-950 transition-all"
            >
              Tiep tuc mua sam
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fmt = (n) => n ? n.toLocaleString('vi-VN') + 'đ' : '0đ';

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print-area, #invoice-print-area * { visibility: visible !important; }
          #invoice-print-area { 
            position: absolute !important; 
            left: 0 !important; top: 0 !important; 
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .security-watermark { display: none !important; }
          @page { size: A4; margin: 12mm; }
        }
        
        .security-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
          opacity: 0.03;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-content: space-around;
        }
        .watermark-item {
          transform: rotate(-30deg);
          font-size: 24px;
          font-weight: 900;
          white-space: nowrap;
          color: black;
          user-select: none;
        }
      `}</style>

      <div 
        className="min-h-screen bg-gray-100 py-10 px-4 font-sans select-none relative" 
        style={{ fontFamily: "'Inter', sans-serif" }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Security Watermark for Screen (Invisible in Print) */}
        <div className="security-overlay no-print">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="watermark-item">PHONESIN - {invoice.invoiceNo}</div>
          ))}
        </div>

        <div className="no-print w-[794px] max-w-full mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link to="/orders" className="text-[11px] font-black text-gray-400 hover:text-black uppercase tracking-widest flex items-center gap-2 mb-2">
              ← Quay lại đơn hàng
            </Link>
            <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Hóa đơn điện tử</h1>
            <p className="text-sm text-gray-400 font-bold">Mã đơn: {invoice.orderId} · Số HĐ: {invoice.invoiceNo}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {realOrder.status === 'delivered' ? (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2.5 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                In / Lưu PDF
              </button>
            ) : (
              <div className="flex items-center gap-2.5 bg-gray-200 text-gray-500 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm cursor-not-allowed" title="Chỉ được xuất hóa đơn khi đã nhận hàng">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                In / Lưu PDF
              </div>
            )}
          </div>
        </div>

        {/* ── Screen wrapper ── */}
        <div className="w-full overflow-x-auto pb-8" style={{ scrollbarWidth: 'none' }}>
          <div
            id="invoice-print-area"
            ref={printRef}
            className="bg-white shadow-2xl border border-gray-200 mx-auto rounded-sm shrink-0"
            style={{ width: '794px', minHeight: '1123px' }}
          >
            <div className="bg-white px-10 py-8 flex justify-between items-start border-b-2 border-slate-900 border-dashed">
            <div>
              <div className="mb-4">
                <img src="/assets/phonesin-logo.png" alt="PhoneSin Logo" className="h-12 object-contain mix-blend-multiply" />
              </div>
              <p className="text-slate-500 text-xs font-bold leading-relaxed">
                99 Cầu Giấy, Dịch Vọng, Hà Nội · 100 Cách Mạng Tháng 8, TP.HCM<br />
                Hotline: 1800 6601 · Email: support@phonesin.vn · MST: 0123456789
              </p>
            </div>
            <div className="text-right">
              <p className="text-red-600 text-[12px] font-black uppercase tracking-[0.4em] mb-1">Hóa đơn điện tử</p>
              <p className="text-slate-900 text-3xl font-black italic tracking-tighter">{invoice.invoiceNo}</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${invoice.status === 'Đã thanh toán' || invoice.status === 'Đã xác nhận' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
            {[
              { label: 'Ngày phát hành', value: invoice.issueDate },
              { label: 'Mã đơn hàng', value: invoice.orderId },
              { label: 'Ngày đặt hàng', value: invoice.orderDate },
              { label: 'Dự kiến nhận', value: invoice.deliveryDate || 'Đang cập nhật' },
            ].map((item, i) => (
              <div key={i} className="px-6 py-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                <p className="text-[13px] font-black text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-8 px-10 py-8 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full inline-block" />
                Thông tin người nhận
              </p>
              <p className="text-xl font-black text-slate-900 mb-1">{invoice.customer.fullName}</p>
              <p className="text-sm font-bold text-slate-600 mb-1">📞 {invoice.customer.phone}</p>
              <p className="text-sm font-bold text-slate-600 mb-1">✉️ {invoice.customer.email}</p>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">📍 {invoice.customer.address}</p>
              {invoice.customer.companyName && (
                <p className="text-sm font-bold text-slate-600 mt-2">🏢 {invoice.customer.companyName}</p>
              )}
              {invoice.customer.companyAddress && (
                <p className="text-sm font-bold text-slate-600 leading-relaxed">🧾 {invoice.customer.companyAddress}</p>
              )}
              {invoice.customer.taxCode && (
                <p className="text-sm font-bold text-slate-600 mt-1">MST: {invoice.customer.taxCode}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full inline-block" />
                Hình thức thanh toán
              </p>
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 w-fit">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="text-sm font-black text-slate-900">{invoice.payment.method}</p>
                  <p className="text-[11px] text-emerald-800 font-black mt-0.5">{invoice.status}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-6">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-950 text-white">
                  <th className="text-left px-4 py-3 rounded-l-xl text-[10px] font-black uppercase tracking-widest w-8">#</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest">Tên sản phẩm</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest w-16">ĐVT</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest w-16">SL</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest w-32">Đơn giá</th>
                  <th className="text-right px-4 py-3 rounded-r-xl text-[10px] font-black uppercase tracking-widest w-32">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-4 text-xs font-black text-gray-400 text-center">{item.no}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900">{item.name}</td>
                    <td className="px-4 py-4 text-xs font-bold text-gray-500 text-center">{item.unit}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900 text-center">{item.qty}</td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-900 text-right">{fmt(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-sm font-black text-slate-900 text-right">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-10 pb-8 flex justify-end">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm font-bold text-gray-500">
                <span>Tạm tính:</span>
                <span>{fmt(invoice.subtotal)}</span>
              </div>
              {invoice.shipping > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>Phí vận chuyển:</span>
                  <span>{fmt(invoice.shipping)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm font-black text-emerald-800">
                  <span>Giảm giá:</span>
                  <span>-{fmt(invoice.discount)}</span>
                </div>
              )}
              {invoice.vat > 0 && (
                <div className="flex justify-between text-sm font-bold text-gray-500">
                  <span>VAT (10%):</span>
                  <span>{fmt(invoice.vat)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-950">
                <span className="text-base font-black text-slate-950 uppercase italic">Tổng cộng</span>
                <span className="text-2xl font-black text-red-600 tracking-tighter">{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          <div className="px-10 pb-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ghi chú & Bảo hành</p>
              <div className="text-sm text-gray-600 font-medium italic leading-relaxed border-l-2 border-red-600 pl-4 space-y-3">
                <p>{invoice.note}</p>
                <div className="text-[11px] text-gray-500 not-italic bg-gray-50 p-3 rounded-xl border border-gray-100 mt-3">
                  <strong className="text-slate-900 block mb-1">🛡️ Chính sách bảo hành chính hãng:</strong>
                  <ul className="space-y-1 ml-1 text-slate-600">
                    <li>• Đổi mới 1:1 trong 30 ngày nếu có lỗi phần cứng từ NSX.</li>
                    <li>• Bảo hành toàn diện 12 tháng tại các TTBH ủy quyền.</li>
                    <li>• Quý khách vui lòng lưu file PDF này để đối chiếu khi cần.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="relative text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Chữ ký & Dấu mộc</p>
              <div className="relative h-56 flex items-center justify-center">
                 {/* Con dấu mộc */}
                 <img 
                   src="/assets/seal.png" 
                   alt="PhoneSin Seal" 
                   className="w-64 h-64 object-contain absolute opacity-90 rotate-[-8deg] mix-blend-multiply contrast-[1.2] brightness-[1.1]"
                 />
                 {/* Chữ ký thật từ ảnh người dùng */}
                 <img 
                   src="/assets/signature.png" 
                   alt="PhoneSin Signature" 
                   className="w-52 h-auto object-contain absolute z-10 translate-x-4 -translate-y-4 rotate-[-5deg] contrast-[1.2] brightness-[1.05]"
                   style={{ mixBlendMode: 'multiply' }}
                 />
              </div>
              <p className="text-xs font-bold text-gray-400 italic mt-2">Giám đốc điều hành PhoneSin Store</p>
            </div>
          </div>

          <div className="bg-white px-10 py-8 flex justify-between items-end border-t-2 border-slate-950 border-dashed">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-2">Mã vạch hóa đơn</p>
              <Barcode />
              <p className="text-[10px] text-slate-400 font-bold mt-2 tracking-widest">{invoice.invoiceNo}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Hóa đơn này được xuất tự động bởi hệ thống PhoneSin.<br />
                Vui lòng liên hệ 1800 6601 nếu có thắc mắc.<br />
                © 2026 PhoneSin Store. All rights reserved.
              </p>
            </div>
          </div>
          </div>
        </div>
        {/* ── End Screen wrapper ── */}

        <div className="no-print w-[794px] max-w-full mx-auto mt-6 flex justify-center gap-4">
          {realOrder.status === 'delivered' ? (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2.5 bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-950 transition-all shadow-xl active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              In hóa đơn / Lưu PDF
            </button>
          ) : (
            <div className="flex items-center gap-2.5 bg-gray-200 text-gray-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed" title="Chỉ được xuất hóa đơn khi đã nhận hàng">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              In hóa đơn / Lưu PDF
            </div>
          )}
          <Link to="/orders" className="flex items-center gap-2.5 bg-white border-2 border-gray-200 text-slate-700 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-black transition-all shadow-sm active:scale-95">
            ← Quay lại đơn hàng
          </Link>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;

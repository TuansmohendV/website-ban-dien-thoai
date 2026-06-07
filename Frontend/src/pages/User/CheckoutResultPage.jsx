import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrdersContext';
import api from '../../lib/api';

const CheckoutResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { refreshOrders } = useOrders();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed'
    const [message, setMessage] = useState('Đang xác minh giao dịch...');
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        let isMounted = true;

        const inferPaymentMethod = (params, allParams) => {
            const explicitMethod = params.get('method');

            if (explicitMethod) return explicitMethod;
            if (allParams.vnp_TxnRef || allParams.vnp_ResponseCode) return 'vnpay';
            if (allParams.partnerCode || allParams.resultCode !== undefined || allParams.requestId) return 'momo';

            return 'unknown';
        };

        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const orderIdParam = params.get('orderId');
                const allParams = Object.fromEntries(params.entries());
                const method = inferPaymentMethod(params, allParams);

                if (!orderIdParam && !allParams.vnp_TxnRef) {
                    if (!isMounted) return;
                    setStatus('failed');
                    setMessage('Không tìm thấy thông tin giao dịch.');
                    return;
                }

                const finalOrderId = orderIdParam || (allParams.vnp_TxnRef ? allParams.vnp_TxnRef.split('_')[0] : null);
                if (!isMounted) return;
                setOrderId(finalOrderId);

                const response = await api.post('/api/payment/callback', {
                    ...allParams,
                    orderId: finalOrderId,
                    method,
                });

                if (!isMounted) return;

                if (response.data?.payment?.status === 'paid') {
                    setStatus('success');
                    setMessage(response.data?.message || 'Giao dịch thành công!');
                    localStorage.removeItem('phonesin_checkout_full_state');
                } else if (response.data?.payment?.status === 'pending') {
                    setStatus('failed');
                    setMessage('Giao dịch đang chờ thanh toán. Vui lòng hoàn tất thanh toán trước khi xác nhận.');
                } else {
                    setStatus('failed');
                    setMessage('Giao dịch thất bại hoặc đã bị hủy.');
                }

                await refreshOrders();
            } catch (error) {
                if (!isMounted) return;
                setStatus('failed');
                setMessage(error.response?.data?.message || 'Đã có lỗi xảy ra khi xác minh thanh toán.');
            }
        };

        verifyPayment();

        return () => {
            isMounted = false;
        };
    }, [location.search]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center">
                {status === 'loading' && (
                    <div className="py-12">
                        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-black text-gray-800 animate-pulse">{message}</h2>
                        <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt lúc này...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 animate-fadeIn">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Thanh Toán Thành Công!</h2>
                        <p className="text-gray-600 mb-8">{message}</p>
                        
                        <div className="space-y-3">
                            <Link 
                                to={`/invoice/${orderId}`}
                                className="block w-full py-4 bg-[#008d71] text-white rounded-xl font-bold uppercase hover:bg-[#00705a] transition-colors"
                            >
                                Xem Hóa Đơn
                            </Link>
                            <Link 
                                to="/"
                                className="block w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-bold uppercase hover:bg-gray-200 transition-colors"
                            >
                                Tiếp Tục Mua Sắm
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="py-8 animate-fadeIn">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">Giao Dịch Thất Bại</h2>
                        <p className="text-red-500 mb-8">{message}</p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/profile?tab=orders')}
                                className="block w-full py-4 bg-amber-500 text-white rounded-xl font-bold uppercase hover:bg-amber-600 transition-colors"
                            >
                                Xem Đơn Chưa Thanh Toán
                            </button>
                            <Link 
                                to="/orders"
                                className="block w-full py-4 bg-gray-100 text-gray-800 rounded-xl font-bold uppercase hover:bg-gray-200 transition-colors"
                            >
                                Xem Đơn Hàng Của Tôi
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutResultPage;

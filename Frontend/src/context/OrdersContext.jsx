import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../lib/api';
import { applyLocalOrderStatus, normalizeOrder } from '../lib/orders';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const replaceOrder = (nextOrder) => {
        startTransition(() => {
            setOrders((prevOrders) => {
                const remainingOrders = prevOrders.filter(
                    (order) => order.id !== nextOrder.id
                );
                return [nextOrder, ...remainingOrders];
            });
        });

        return nextOrder;
    };

    const refreshOrders = async () => {
        setLoading(true);

        try {
            if (user?.id) {
                const response = await api.get(
                    user.role === 'admin' || user.isAdmin ? '/api/admin/orders' : '/api/orders/user'
                );
                const nextOrders = Array.isArray(response.data?.data)
                    ? response.data.data.map(normalizeOrder)
                    : [];

                startTransition(() => {
                    setOrders(nextOrders);
                });
            } else {
                startTransition(() => {
                    setOrders([]);
                });
            }
        } catch {
            startTransition(() => {
                setOrders([]);
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshOrders();
    }, [user?.id]);

    const addOrder = async (payload) => {
        if (
            payload?.customerInfo ||
            payload?.shippingAddress ||
            payload?.paymentMethod ||
            payload?.items?.[0]?.productId
        ) {
            return createOrder(payload);
        }

        const nextOrder = normalizeOrder(payload);
        replaceOrder(nextOrder);

        return nextOrder;
    };

    const createOrder = async (payload) => {
        try {
            const response = await api.post('/api/orders', payload);
            const nextOrder = normalizeOrder(response.data?.order || {});

            replaceOrder(nextOrder);

            await refreshCart();
            return nextOrder;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the tao don hang luc nay.')
            );
        }
    };

    const processPayment = async (orderId, method, options = {}) => {
        try {
            const response = await api.post('/api/payment', {
                orderId,
                method,
                ...options,
            });
            
            if (response.data?.paymentUrl) {
                return response.data;
            }

            const nextOrder = normalizeOrder(response.data?.order || {});
            replaceOrder(nextOrder);
            return nextOrder;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the xu ly thanh toan luc nay.')
            );
        }
    };

    const cancelOrder = async (orderId, reason) => {
        if (user?.role === 'admin' || user?.isAdmin) {
            return updateOrderStatus(orderId, 'cancelled');
        }

        try {
            const response = await api.put(`/api/orders/cancel/${orderId}`, {
                reason,
            });
            const nextOrder = normalizeOrder(response.data?.order || {});
            replaceOrder(nextOrder);
            return nextOrder;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the huy don hang luc nay.')
            );
        }
    };

    const markDelivered = (orderId) => {
        startTransition(() => {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? applyLocalOrderStatus(order, 'delivered')
                        : order
                )
            );
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        if (user?.role === 'admin' || user?.isAdmin) {
            try {
                const response = await api.put(`/api/admin/orders/${orderId}/status`, {
                    status: newStatus,
                });
                const nextOrder = normalizeOrder(response.data?.order || {});
                replaceOrder(nextOrder);
                return nextOrder;
            } catch (error) {
                throw new Error(
                    getApiErrorMessage(error, 'Khong the cap nhat trang thai don hang.')
                );
            }
        }

        startTransition(() => {
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId
                        ? applyLocalOrderStatus(order, newStatus)
                        : order
                )
            );
        });
    };

    const clearCancelledOrders = () => {
        startTransition(() => {
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.status !== 'cancelled')
            );
        });

    };

    const clearAllOrders = () => {
        startTransition(() => {
            setOrders([]);
        });

    };

    return (
        <OrdersContext.Provider value={{
            orders,
            addOrder,
            createOrder,
            processPayment,
            cancelOrder,
            markDelivered,
            updateOrderStatus,
            clearCancelledOrders,
            clearAllOrders,
            refreshOrders,
            loading,
        }}>
            {children}
        </OrdersContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within an OrdersProvider');
    }
    return context;
};

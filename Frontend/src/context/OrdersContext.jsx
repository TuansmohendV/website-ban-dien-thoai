import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getApiMessage } from '../lib/api';
import { orderService } from '../services/shopApi';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reloadOrders = async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return [];
    }

    const nextOrders = await orderService.getMyOrders();
    setOrders(nextOrders);
    return nextOrders;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapOrders = async () => {
      if (!isAuthenticated) {
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      try {
        const nextOrders = await orderService.getMyOrders();

        if (mounted) {
          setOrders(nextOrders);
        }
      } catch {
        if (mounted) {
          setOrders([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapOrders();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const placeOrder = async (payload) => {
    setBusy(true);

    try {
      const createdOrder = await orderService.createOrder(payload);

      if (isAuthenticated) {
        setOrders((currentOrders) => [createdOrder, ...currentOrders]);
      }

      return createdOrder;
    } finally {
      setBusy(false);
    }
  };

  const cancelOrder = async (orderId, reason) => {
    setBusy(true);

    try {
      const nextOrder = await orderService.cancelOrder(orderId, reason);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === orderId ? nextOrder : order))
      );
      return nextOrder;
    } finally {
      setBusy(false);
    }
  };

  const addOrder = async (orderLike) => {
    if (orderLike?.items && orderLike?.customer && orderLike?.totalAmount) {
      setOrders((currentOrders) => [orderLike, ...currentOrders]);
      return orderLike;
    }

    return placeOrder(orderLike);
  };

  const markDelivered = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      )
    );
  };

  const clearCancelledOrders = () => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.status !== 'cancelled')
    );
  };

  const clearAllOrders = () => {
    setOrders([]);
  };

  const value = useMemo(
    () => ({
      orders,
      loading,
      busy,
      addOrder,
      placeOrder,
      cancelOrder,
      markDelivered,
      clearCancelledOrders,
      clearAllOrders,
      reloadOrders,
      getErrorMessage: getApiMessage,
    }),
    [busy, loading, orders]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }

  return context;
};

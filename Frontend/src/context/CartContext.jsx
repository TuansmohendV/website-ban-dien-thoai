import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getApiMessage } from '../lib/api';
import { cartService, voucherService } from '../services/shopApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartState, setCartState] = useState({
    items: [],
    subtotal: 0,
    discountTotal: 0,
    total: 0,
    totalItems: 0,
    voucherCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadCart = async () => {
    const nextCart = await cartService.getCart();
    setCartState(nextCart);
    return nextCart;
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapCart = async () => {
      try {
        const nextCart = await cartService.getCart();

        if (mounted) {
          setCartState(nextCart);
        }
      } catch {
        if (mounted) {
          setCartState({
            items: [],
            subtotal: 0,
            discountTotal: 0,
            total: 0,
            totalItems: 0,
            voucherCode: '',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrapCart();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const withBusy = async (handler) => {
    setBusy(true);

    try {
      const nextCart = await handler();
      setCartState(nextCart);
      return nextCart;
    } finally {
      setBusy(false);
    }
  };

  const addToCart = async (product, variant = null, color = null, quantity = 1) =>
    withBusy(() =>
      cartService.addToCart({
        productId: product.backendId || product._id || product.productId || product.id,
        variantId: variant?.id || variant?._id || '',
        quantity,
      })
    );

  const removeFromCart = async (itemId, variantId, colorName) => {
    if (itemId && String(itemId).length >= 12) {
      return withBusy(() => cartService.removeCartItem({ itemId }));
    }

    const matchedItem = cartState.items.find(
      (item) =>
        item.id === itemId &&
        item.selectedVariant?.id === variantId &&
        item.selectedColor?.name === colorName
    );

    return withBusy(() =>
      cartService.removeCartItem({
        itemId: matchedItem?.itemId,
      })
    );
  };

  const updateQuantity = async (itemId, variantId, colorName, delta) => {
    const matchedItem = cartState.items.find(
      (item) =>
        item.id === itemId &&
        item.selectedVariant?.id === variantId &&
        item.selectedColor?.name === colorName
    );

    if (!matchedItem) {
      return cartState;
    }

    return withBusy(() =>
      cartService.updateCart({
        itemId: matchedItem.itemId,
        quantity: Math.max(1, matchedItem.qty + delta),
      })
    );
  };

  const setQuantity = async (itemId, quantity) =>
    withBusy(() =>
      cartService.updateCart({
        itemId,
        quantity: Math.max(1, quantity),
      })
    );

  const clearCart = async () => withBusy(() => cartService.clearCart());

  const applyVoucher = async (code) => {
    const voucherData = await voucherService.applyVoucher({ code });
    const nextCart = await cartService.getCart();
    setCartState(nextCart);
    return voucherData;
  };

  const value = useMemo(
    () => ({
      cartItems: cartState.items,
      cartCount: cartState.totalItems,
      cartTotal: cartState.total,
      subtotal: cartState.subtotal,
      discountTotal: cartState.discountTotal,
      voucherCode: cartState.voucherCode,
      loading,
      busy,
      addToCart,
      removeFromCart,
      updateQuantity,
      setQuantity,
      clearCart,
      reloadCart: loadCart,
      applyVoucher,
      getErrorMessage: getApiMessage,
    }),
    [busy, cartState, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

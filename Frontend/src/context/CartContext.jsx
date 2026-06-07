import React, { createContext, startTransition, useContext, useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../lib/api';
import { useAuth } from './AuthContext';
import socket from '../lib/socket';

const CartContext = createContext();

const EMPTY_CART = {
    cartItems: [],
    cartCount: 0,
    cartSubtotal: 0,
    cartDiscount: 0,
    cartTotal: 0,
    voucherCode: '',
};

const normalizeCartItem = (item = {}) => {
    const productId = item.product?._id || item.product || '';
    const variantId = item.variant?._id || item.variant || '';
    const quantity = Number(item.quantity || item.qty || 1);
    const price = Number(item.unitPrice || item.price || 0);
    const originalPrice = Number(
        item.variant?.originalPrice || item.product?.originalPrice || 0
    );

    return {
        ...item,
        id: item.product?.slug || productId || item._id,
        cartItemId: item._id || '',
        backendProductId: productId,
        variantId,
        name: item.name || item.product?.name || 'San pham',
        image: item.image || item.product?.image || '',
        qty: quantity,
        quantity,
        price,
        priceNum: price,
        oldPrice: originalPrice > price ? originalPrice : price,
        selectedVariant: variantId
            ? {
                id: variantId,
                color: item.selectedColor || item.variant?.color || '',
                storage: item.selectedStorage || item.variant?.storage || '',
                price,
                stock: Number(item.variant?.stock || item.maxStock || 0),
                image: item.image || item.variant?.image || item.product?.image || '',
            }
            : null,
        selectedColor: item.selectedColor
            ? {
                name: item.selectedColor,
                image: item.image || item.variant?.image || item.product?.image || '',
            }
            : null,
        color: item.selectedColor || '',
        maxStock: Number(item.maxStock || item.variant?.stock || item.product?.countInStock || 0),
    };
};

const normalizeCartState = (cart = {}) => {
    const cartItems = Array.isArray(cart.items) ? cart.items.map(normalizeCartItem) : [];

    return {
        cartItems,
        cartCount:
            Number(cart.totalItems) ||
            cartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0),
        cartSubtotal: Number(cart.subtotal || 0),
        cartDiscount: Number(cart.discountTotal || 0),
        cartTotal:
            Number(cart.total) ||
            cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0),
        voucherCode: cart.voucherCode || '',
    };
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartState, setCartState] = useState(EMPTY_CART);
    const [loading, setLoading] = useState(true);

    const applyCartState = (payload = {}) => {
        const normalized = normalizeCartState(payload);
        startTransition(() => {
            setCartState(normalized);
        });
        return normalized;
    };

    const refreshCart = async () => {
        setLoading(true);

        try {
            const response = await api.get('/api/cart');
            applyCartState(response.data || {});
        } catch {
            applyCartState(EMPTY_CART);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [user?.id]);

    useEffect(() => {
        const handleStockUpdate = (data) => {
            setCartState(prev => {
                const updatedItems = prev.cartItems.map(item => {
                    const isTargetProduct = String(item.backendProductId) === String(data.productId);
                    const isTargetVariant = data.variantId ? String(item.variantId) === String(data.variantId) : !item.variantId;

                    if (isTargetProduct && isTargetVariant) {
                        return {
                            ...item,
                            maxStock: data.newStock,
                            // If stock is lower than quantity, we keep the quantity but the UI will show warning
                            // or we could force-adjust it. For now, let's just update maxStock.
                        };
                    }
                    return item;
                });

                return { ...prev, cartItems: updatedItems };
            });
        };

        socket.on('stock_update', handleStockUpdate);
        return () => socket.off('stock_update', handleStockUpdate);
    }, []);

    const findCartItem = (itemId, variantId, colorName) =>
        cartState.cartItems.find(
            (item) =>
                item.id === itemId &&
                String(item.variantId || item.selectedVariant?.id || '') ===
                    String(variantId || item.variantId || item.selectedVariant?.id || '') &&
                String(item.selectedColor?.name || item.color || '') ===
                    String(colorName || item.selectedColor?.name || item.color || '')
        );

    const addToCart = async (product, variant, color, quantity = 1) => {
        if (!user) {
            throw new Error('AUTH_REQUIRED');
        }

        const productId = product?.backendId || product?.backendProductId || product?._id;

        if (!productId) {
            throw new Error('Khong xac dinh duoc san pham de them vao gio hang.');
        }

        const rawVariantId = variant?.id || variant?._id || '';
        const variantId =
            rawVariantId &&
            !String(rawVariantId).startsWith('variant-') &&
            !String(rawVariantId).startsWith('color-')
                ? rawVariantId
                : undefined;

        try {
            const response = await api.post('/api/cart', {
                productId,
                variantId,
                quantity,
            });

            return applyCartState(response.data?.cart || response.data || {});
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the them san pham vao gio hang.')
            );
        }
    };

    const updateQuantity = async (itemId, variantId, colorName, delta) => {
        if (!user) {
            throw new Error('AUTH_REQUIRED');
        }
        const targetItem = findCartItem(itemId, variantId, colorName);

        if (!targetItem) {
            return null;
        }

        const nextQuantity = Math.max(0, Number(targetItem.qty || 0) + Number(delta || 0));

        try {
            const response = await api.put('/api/cart', {
                itemId: targetItem.cartItemId,
                quantity: nextQuantity,
                productId: targetItem.backendProductId,
                currentVariantId: targetItem.variantId || undefined,
            });

            return applyCartState(response.data?.cart || response.data || {});
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the cap nhat so luong san pham.')
            );
        }
    };

    const removeFromCart = async (itemId, variantId, colorName) => {
        if (!user) {
            throw new Error('AUTH_REQUIRED');
        }
        const targetItem = findCartItem(itemId, variantId, colorName);

        try {
            const response = await api.delete('/api/cart', {
                data: {
                    itemId: targetItem?.cartItemId,
                    productId: targetItem?.backendProductId || itemId,
                    variantId: targetItem?.variantId || variantId,
                },
            });

            return applyCartState(response.data?.cart || response.data || {});
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the xoa san pham khoi gio hang.')
            );
        }
    };

    const clearCart = async () => {
        if (!user) {
            throw new Error('AUTH_REQUIRED');
        }
        try {
            const response = await api.delete('/api/cart', {
                data: { clearAll: true },
            });

            return applyCartState(response.data?.cart || response.data || {});
        } catch (error) {
            throw new Error(
                getApiErrorMessage(error, 'Khong the lam trong gio hang.')
            );
        }
    };

    return (
        <CartContext.Provider value={{ 
            cartItems: cartState.cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart,
            refreshCart,
            cartCount: cartState.cartCount,
            cartSubtotal: cartState.cartSubtotal,
            cartDiscount: cartState.cartDiscount,
            cartTotal: cartState.cartTotal,
            voucherCode: cartState.voucherCode,
            loading,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

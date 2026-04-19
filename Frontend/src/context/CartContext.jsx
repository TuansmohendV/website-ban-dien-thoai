import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load initial cart from localStorage
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Save cart to localStorage whenever it changes
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, variant, color) => {
        setCartItems(prevItems => {
            // Check if item already exists in cart with same variant and color
            const existingItemIndex = prevItems.findIndex(item => 
                item.id === product.id && 
                item.selectedVariant?.id === variant?.id && 
                item.selectedColor?.name === color?.name
            );

            if (existingItemIndex > -1) {
                // Update quantity if exists
                const newItems = [...prevItems];
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    qty: newItems[existingItemIndex].qty + 1
                };
                return newItems;
            } else {
                // Add new item if not exists
                return [...prevItems, {
                    ...product,
                    selectedVariant: variant,
                    selectedColor: color,
                    qty: 1,
                    // Map product fields to what CartPage expects if they differ
                    price: variant?.price || product.priceNum,
                    oldPrice: (variant?.price || product.priceNum) * 1.2, // Dummy old price
                    image: color?.image || product.image
                }];
            }
        });
    };

    const removeFromCart = (itemId, variantId, colorName) => {
        setCartItems(prevItems => prevItems.filter(item => 
            !(item.id === itemId && 
              item.selectedVariant?.id === variantId && 
              item.selectedColor?.name === colorName)
        ));
    };

    const updateQuantity = (itemId, variantId, colorName, delta) => {
        setCartItems(prevItems => prevItems.map(item => {
            if (item.id === itemId && 
                item.selectedVariant?.id === variantId && 
                item.selectedColor?.name === colorName) {
                return { ...item, qty: Math.max(1, item.qty + delta) };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart,
            cartCount,
            cartTotal
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

import React, { createContext, useContext, useState, useEffect } from 'react';

const OrdersContext = createContext();

// ─── Cấu hình dọn rác ──────────────────────────────────────────────────────
const MAX_ORDERS       = 50;                      // Giữ tối đa 50 đơn
const CANCELLED_TTL    = 3  * 24 * 60 * 60 * 1000; // Xóa đơn HỦY sau 3 ngày
const DELIVERED_TTL    = 90 * 24 * 60 * 60 * 1000; // Xóa đơn HOÀN THÀNH sau 90 ngày
const DUMMY_IDS        = ['ORD-54321', 'ORD-12345'];

/** Chạy toàn bộ logic dọn rác, trả về mảng đã sạch */
function runGarbageCollection(rawOrders) {
    const now = Date.now();

    let cleaned = rawOrders.filter(o => {
        // 1. Xóa đơn dummy cũ
        if (DUMMY_IDS.includes(o.id)) return false;

        // 2. Xóa đơn đã hủy quá CANCELLED_TTL
        if (o.status === 'cancelled' && o.cancelledAt && (now - o.cancelledAt > CANCELLED_TTL))
            return false;

        // 3. Xóa đơn hoàn thành quá DELIVERED_TTL
        if (o.status === 'delivered' && o.deliveredAt && (now - o.deliveredAt > DELIVERED_TTL))
            return false;

        return true;
    });

    // 4. Giới hạn tối đa MAX_ORDERS (giữ đơn mới nhất)
    if (cleaned.length > MAX_ORDERS) {
        cleaned = cleaned.slice(0, MAX_ORDERS);
    }

    return cleaned;
}

export const OrdersProvider = ({ children }) => {
    const [orders, setOrders] = useState(() => {
        try {
            // Migrate từ key cũ 'orders' sang 'phonesin_orders' (chạy 1 lần)
            const legacy = localStorage.getItem('orders');
            if (legacy) {
                const legacyData = JSON.parse(legacy);
                const existing   = JSON.parse(localStorage.getItem('phonesin_orders') || '[]');
                const merged     = [...legacyData, ...existing].filter(
                    (o, i, arr) => arr.findIndex(x => x.id === o.id) === i
                );
                localStorage.setItem('phonesin_orders', JSON.stringify(merged));
                localStorage.removeItem('orders'); // Dọn key cũ
            }

            const saved = localStorage.getItem('phonesin_orders');
            const raw   = saved ? JSON.parse(saved) : [];
            // Chạy GC ngay khi load để dọn rác từ phiên trước
            return runGarbageCollection(raw);
        } catch {
            return [];
        }
    });

    // Đồng bộ xuống localStorage mỗi khi orders thay đổi
    useEffect(() => {
        localStorage.setItem('phonesin_orders', JSON.stringify(orders));
    }, [orders]);

    /** Thêm đơn mới, tự động GC sau khi thêm */
    const addOrder = (newOrder) => {
        setOrders(prev => {
            const updated = [newOrder, ...prev];
            return runGarbageCollection(updated);
        });
    };

    /** Hủy đơn — đánh dấu status + cancelledAt để GC dọn sau 3 ngày */
    const cancelOrder = (orderId) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === orderId
                    ? { ...o, status: 'cancelled', cancelledAt: Date.now() }
                    : o
            )
        );
    };

    /** Đánh dấu đơn đã giao — để GC tự dọn sau 90 ngày */
    const markDelivered = (orderId) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === orderId
                    ? { ...o, status: 'delivered', deliveredAt: Date.now() }
                    : o
            )
        );
    };

    /** Xóa ngay tất cả đơn đã hủy (dùng cho nút "Xóa đơn đã hủy") */
    const clearCancelledOrders = () => {
        setOrders(prev => prev.filter(o => o.status !== 'cancelled'));
    };

    /** Xóa toàn bộ lịch sử (reset) */
    const clearAllOrders = () => {
        setOrders([]);
        localStorage.removeItem('phonesin_orders');
    };

    /** Cập nhật trạng thái đơn hàng bất kỳ */
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders(prev =>
            prev.map(o =>
                o.id === orderId
                    ? { ...o, status: newStatus, updatedAt: Date.now() }
                    : o
            )
        );
    };

    return (
        <OrdersContext.Provider value={{
            orders,
            addOrder,
            cancelOrder,
            markDelivered,
            updateOrderStatus,
            clearCancelledOrders,
            clearAllOrders,
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

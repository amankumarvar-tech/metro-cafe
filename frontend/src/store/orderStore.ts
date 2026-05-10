import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Order {
    _id: string;
    orderNumber: string;
    customer: { name: string; phone: string };
    items: { productName: string; quantity: number; itemTotal: number }[];
    pricing: { total: number };
    status: string;
    pickupToken: string;
    createdAt: string;
}

interface OrderState {
    orders: Order[];
    newOrderAlert: Order | null;
    stats: { total: number; pending: number; preparing: number; ready: number; revenue: number };
    addOrder: (order: Order) => void;
    updateOrder: (order: Order) => void;
    setOrders: (orders: Order[]) => void;
    dismissAlert: () => void;
}

export const useOrderStore = create<OrderState>()(
    devtools((set) => ({
        orders: [],
        newOrderAlert: null,
        stats: { total: 0, pending: 0, preparing: 0, ready: 0, revenue: 0 },

        setOrders: (orders) => set({
            orders,
            stats: computeStats(orders),
        }),

        addOrder: (order) => set((state) => {
            const newOrders = [order, ...state.orders];
            return {
                orders: newOrders,
                newOrderAlert: order,
                stats: computeStats(newOrders),
            };
        }),

        updateOrder: (updated) => set((state) => {
            const newOrders = state.orders.map((o) =>
                o._id === updated._id ? updated : o
            );
            return {
                orders: newOrders,
                stats: computeStats(newOrders),
            };
        }),

        dismissAlert: () => set({ newOrderAlert: null }),
    }))
);

function computeStats(orders: Order[]) {
    return orders.reduce(
        (acc, o) => ({
            total: acc.total + 1,
            pending: acc.pending + (o.status === "pending" ? 1 : 0),
            preparing: acc.preparing + (o.status === "preparing" ? 1 : 0),
            ready: acc.ready + (o.status === "ready" ? 1 : 0),
            revenue: acc.revenue + (o.status !== "cancelled" ? o.pricing.total : 0),
        }),
        { total: 0, pending: 0, preparing: 0, ready: 0, revenue: 0 }
    );
}
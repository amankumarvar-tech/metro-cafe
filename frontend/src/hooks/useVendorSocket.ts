import { useEffect } from "react";
import { initSocket, getSocket } from "../lib/socket";
import { useAuthStore } from "../store/authStore";
import { useOrderStore } from "../store/orderStore";
import toast from "react-hot-toast";

export function useVendorSocket() {
    const { token } = useAuthStore();
    const { addOrder, updateOrder } = useOrderStore();

    useEffect(() => {
        if (!token) return;

        const socket = initSocket(token);

        // Naya order aaya!
        socket.on("order:new", (order) => {
            addOrder(order);
            toast.success(
                `🆕 New Order! #${order.orderNumber} - ₹${order.pricing.total}`,
                { duration: 8000 }
            );
            // Sound play karo
            try {
                new Audio("/sounds/new-order.mp3").play();
            } catch { }
        });

        // Order status change
        socket.on("order:status_changed", (data) => {
            updateOrder(data);
        });

        return () => {
            socket.off("order:new");
            socket.off("order:status_changed");
        };
    }, [token]);
}
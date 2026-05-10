import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";

interface SocketUser {
    userId: string;
    role: string;
    vendorId?: string;
}

declare module "socket.io" {
    interface Socket {
        user: SocketUser;
    }
}

export let io: Server;

export function initializeSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL,
            credentials: true,
        },
        transports: ["websocket", "polling"],
    });

    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Authentication required"));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SocketUser;
            socket.user = decoded;
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        console.log(`🔌 Connected: ${socket.user.userId} [${socket.user.role}]`);

        // Vendor apne room mein join kare
        if (socket.user.vendorId) {
            socket.join(`vendor:${socket.user.vendorId}`);
        }

        // Super admin global room
        if (socket.user.role === "super_admin") {
            socket.join("admin:global");
        }

        // Vendor order status update kare
        socket.on("order:update_status", async ({ orderId, status }) => {
            io.to(`vendor:${socket.user.vendorId}`).emit("order:status_changed", {
                orderId,
                status,
            });
        });

        socket.on("disconnect", () => {
            console.log(`❌ Disconnected: ${socket.user.userId}`);
        });
    });

    return io;
}

// New order emit helper
export function emitNewOrder(vendorId: string, order: any) {
    if (io) {
        io.to(`vendor:${vendorId}`).emit("order:new", order);
        io.to("admin:global").emit("order:new_global", { vendorId, order });
    }
}
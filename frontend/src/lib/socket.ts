import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initSocket = (token: string): Socket => {
    socket = io("http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
        console.warn("❌ Socket disconnected");
    });

    return socket;
};

export const getSocket = (): Socket => socket;
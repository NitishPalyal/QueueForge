import configKeys from "../config/config.keys.js";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
let io;
export function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: configKeys.FRONTEND_URL || "http://localhost:5173",
        },
    });
    return io;
}
export function getIO() {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }
    return io;
}
//# sourceMappingURL=sockets.server.js.map
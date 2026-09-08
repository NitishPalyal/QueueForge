import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../shared/logger.js";
let io;
export function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // Change for production
        },
    });
    io.on("connection", (socket) => {
        logger.info(`Client connected: ${socket.id}`, "sockets.server");
        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`, "sockets.server");
        });
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
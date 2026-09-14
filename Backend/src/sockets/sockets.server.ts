import configKeys from "../config/config.keys.ts";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "../shared/logger.ts";

let io: Server;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: configKeys.FRONTEND_URL || "http://localhost:5173",
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

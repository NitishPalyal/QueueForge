import configKeys from "../config/config.keys.ts";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export function initializeSocket(server: HttpServer) {
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

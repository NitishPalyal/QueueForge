import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*", // Change for production
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client Connected : ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client Disconnected : ${socket.id}`);
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

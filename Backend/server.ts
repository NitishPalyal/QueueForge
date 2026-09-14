import app from "./src/app.ts";
import "./src/queues/worker.ts";
import http from "http";
import { prisma } from "./src/config/config.database.ts";
import { startNotificationSubscriber } from "./src/notification/notification.server.ts";
import { initializeSocket } from "./src/sockets/sockets.server.ts";
import configKeys from "./src/config/config.keys.ts";
import "./src/queues/ai/ai.events.ts";
import "./src/queues/mail/mail.events.ts";
import "./src/queues/image/image.events.ts";

const PORT = configKeys.PORT || 3000;

const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Start Redis Subscriber
await startNotificationSubscriber();

// Start server
httpServer.listen(PORT, () => {});

// Graceful shutdown
async function gracefulShutdown() {
  await prisma.$disconnect();
  httpServer.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

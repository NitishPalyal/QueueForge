import app from "./src/app.ts";
import http from "http";
import { prisma } from "./src/config/database.ts";
import { startNotificationSubscriber } from "./src/notification/notification.server.ts";
import { initializeSocket } from "./src/sockets/sockets.server.ts";
import configKeys from "./src/config/config.ts";
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
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();

  httpServer.close(() => {
    console.log("Server closed, DB disconnected");
    process.exit(0);
  });
});

import app from "./src/app.js";
import http from "http";
import { prisma } from "./src/config/config.database.js";
import { startNotificationSubscriber } from "./src/notification/notification.server.js";
import { initializeSocket } from "./src/sockets/sockets.server.js";
import configKeys from "./src/config/config.keys.js";
import "./src/queues/ai/ai.events.js";
import "./src/queues/mail/mail.events.js";
import "./src/queues/image/image.events.js";
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
async function gracefulShutdown() {
    await prisma.$disconnect();
    httpServer.close(() => {
        console.log("Server closed, DB disconnected");
        process.exit(0);
    });
}
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
//# sourceMappingURL=server.js.map
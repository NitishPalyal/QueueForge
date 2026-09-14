import { getIO } from "../sockets/sockets.server.js";
import { subscriber } from "./notification.subscriber.js";
import { logger } from "../shared/logger.js";
export async function startNotificationSubscriber() {
    await subscriber.subscribe("job-events");
    subscriber.on("message", (_, message) => {
        const event = JSON.parse(message);
        // Broadcast to every connected client
        getIO().emit("job-update", event);
    });
}
//# sourceMappingURL=notification.server.js.map
import { getIO } from "../sockets/sockets.server.ts";
import { subscriber } from "./notification.subscriber.ts";
import { logger } from "../shared/logger.ts";

export async function startNotificationSubscriber() {
  await subscriber.subscribe("job-events");

  subscriber.on("message", (_, message) => {
    const event = JSON.parse(message);

    // Broadcast to every connected client
    getIO().emit("job-update", event);
  });
}

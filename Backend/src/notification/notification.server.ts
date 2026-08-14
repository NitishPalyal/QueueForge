import { getIO } from "../sockets/sockets.server.ts";
import { subscriber } from "./notification.subscriber.ts";
import { logger } from "../shared/logger.ts";

export async function startNotificationSubscriber() {
  await subscriber.subscribe("job-events");

  logger.info("Subscribed to job-events", "notification.server");

  subscriber.on("message", (_, message) => {
    const event = JSON.parse(message);

    logger.debug(
      `Received event: ${JSON.stringify(event)}`,
      "notification.server",
    );

    // Broadcast to every connected client
    getIO().emit("job-update", event);
  });
}

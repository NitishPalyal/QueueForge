import { getIO } from "../sockets/sockets.server.ts";
import { subscriber } from "./notification.subscriber.ts";

export async function startNotificationSubscriber() {
  await subscriber.subscribe("job-events");

  console.log("Subscribed to job-events");

  subscriber.on("message", (_, message) => {
    const event = JSON.parse(message);

    console.log("Received Event :", event);

    // Broadcast to every connected client
    getIO().emit("job-update", event);
  });
}

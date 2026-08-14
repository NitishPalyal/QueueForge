import { EventStatus } from "../shared/types.ts";
import { publisher } from "./notification.publisher.ts";
import type { TriggerEventPayload } from "./notification.types.ts";

/**
 * Publishes a queue lifecycle event to the Redis job-events channel.
 *
 * This allows Socket.IO subscribers to notify connected clients in real time
 * whenever a worker changes a job status.
 */
export async function triggerEvent({
  jobId,
  status,
  message,
  queue,
  timestamp,
  type,
}: TriggerEventPayload): Promise<void> {
  await publisher.publish(
    "job-events",
    JSON.stringify({
      jobId,
      status,
      message,
      queue,
      type,
      timestamp,
    }),
  );
}

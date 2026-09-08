import type { TriggerEventPayload } from "./notification.types.ts";
/**
 * Publishes a queue lifecycle event to the Redis job-events channel.
 *
 * This allows Socket.IO subscribers to notify connected clients in real time
 * whenever a worker changes a job status.
 */
export declare function triggerEvent({ jobId, status, message, queue, timestamp, type, }: TriggerEventPayload): Promise<void>;
//# sourceMappingURL=notification.service.d.ts.map
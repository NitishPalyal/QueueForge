import { EventStatus } from "../shared/types.js";
import { publisher } from "./notification.publisher.js";
/**
 * Publishes a queue lifecycle event to the Redis job-events channel.
 *
 * This allows Socket.IO subscribers to notify connected clients in real time
 * whenever a worker changes a job status.
 */
export async function triggerEvent({ jobId, batchId, status, message, queue, timestamp, type, }) {
    await publisher.publish("job-events", JSON.stringify({
        jobId,
        ...(batchId ? { batchId } : {}),
        status,
        message,
        queue,
        type,
        timestamp,
    }));
}
//# sourceMappingURL=notification.service.js.map
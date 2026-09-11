import { Queue, QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.js";
import { EventStatus } from "../../shared/types.js";
import { connection } from "../../shared/connection.js";
const emailEvents = new QueueEvents("mail", { connection });
const emailQueue = new Queue("mail", { connection });
async function publishEmailEvent({ jobId, status, message, }) {
    const job = await emailQueue.getJob(jobId);
    const databaseJobId = job?.data && typeof job.data.jobId === "string" ? job.data.jobId : jobId;
    await triggerEvent({
        jobId: databaseJobId,
        status,
        message,
        queue: "mailQueue",
        timestamp: Date.now(),
        type: "sending-mail",
    });
}
emailEvents.on("waiting", async ({ jobId }) => {
    await publishEmailEvent({
        jobId,
        status: EventStatus.waiting,
        message: "Preparing to send mail.",
    });
});
emailEvents.on("active", async ({ jobId }) => {
    await publishEmailEvent({
        jobId,
        status: EventStatus.active,
        message: "Sending Mail.",
    });
});
emailEvents.on("completed", async ({ jobId }) => {
    await publishEmailEvent({
        jobId,
        status: EventStatus.completed,
        message: "Mail send successfully.",
    });
});
emailEvents.on("failed", async ({ jobId }, err) => {
    await publishEmailEvent({
        jobId,
        status: EventStatus.failed,
        message: "Failed to send mail.",
    });
});
//# sourceMappingURL=mail.events.js.map
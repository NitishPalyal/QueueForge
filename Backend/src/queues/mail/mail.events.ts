import { Queue, QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";
import { connection } from "../../shared/connection.ts";

const emailEvents = new QueueEvents("mail", { connection });
const emailQueue = new Queue("mail", { connection });

async function publishEmailEvent({
  jobId,
  status,
  message,
}: {
  jobId: string;
  status: EventStatus;
  message: string;
}) {
  const job = await emailQueue.getJob(jobId);
  const databaseJobId =
    job?.data && typeof job.data.jobId === "string" ? job.data.jobId : jobId;
  const batchId =
    job?.data && typeof job.data.batchId === "string"
      ? job.data.batchId
      : undefined;

  await triggerEvent({
    jobId: databaseJobId,
    batchId,
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

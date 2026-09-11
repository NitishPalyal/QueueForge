import { Queue, QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";
import { connection } from "../../shared/connection.ts";

const aiEvents = new QueueEvents("ai", { connection });
const aiQueue = new Queue("ai", { connection });

async function publishAiEvent({
  jobId,
  status,
  message,
}: {
  jobId: string;
  status: EventStatus;
  message: string;
}) {
  const job = await aiQueue.getJob(jobId);
  const databaseJobId =
    job?.data && typeof job.data.jobId === "string" ? job.data.jobId : jobId;

  await triggerEvent({
    jobId: databaseJobId,
    status,
    message,
    queue: "aiQueue",
    timestamp: Date.now(),
    type: "ai-response",
  });
}

aiEvents.on("waiting", async ({ jobId }) => {
  await publishAiEvent({
    jobId,
    status: EventStatus.waiting,
    message: "Preparing to generate AI response.",
  });
});

aiEvents.on("active", async ({ jobId }) => {
  await publishAiEvent({
    jobId,
    status: EventStatus.active,
    message: "Generating AI response.",
  });
});

aiEvents.on("completed", async ({ jobId }) => {
  await publishAiEvent({
    jobId,
    status: EventStatus.completed,
    message: "AI response generated successfully.",
  });
});

aiEvents.on("failed", async ({ jobId }) => {
  await publishAiEvent({
    jobId,
    status: EventStatus.failed,
    message: "Failed to generate AI response.",
  });
});

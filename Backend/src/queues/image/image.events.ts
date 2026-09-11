import { Queue, QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";
import { connection } from "../../shared/connection.ts";

const imageEvents = new QueueEvents("image", { connection });
const imageQueue = new Queue("image", { connection });

async function publishImageEvent({
  jobId,
  status,
  message,
}: {
  jobId: string;
  status: EventStatus;
  message: string;
}) {
  const job = await imageQueue.getJob(jobId);
  const databaseJobId =
    job?.data && typeof job.data.jobId === "string" ? job.data.jobId : jobId;

  await triggerEvent({
    jobId: databaseJobId,
    status,
    message,
    queue: "imageQueue",
    timestamp: Date.now(),
    type: "processing-image",
  });
}

imageEvents.on("waiting", async ({ jobId }) => {
  await publishImageEvent({
    jobId,
    status: EventStatus.waiting,
    message: "Preparing to process image.",
  });
});

imageEvents.on("active", async ({ jobId }) => {
  await publishImageEvent({
    jobId,
    status: EventStatus.active,
    message: "Processing Image.",
  });
});

imageEvents.on("completed", async ({ jobId }) => {
  await publishImageEvent({
    jobId,
    status: EventStatus.completed,
    message: "Image proccessed successfully.",
  });
});

imageEvents.on("failed", async ({ jobId }) => {
  await publishImageEvent({
    jobId,
    status: EventStatus.failed,
    message: "Failed to proccess image.",
  });
});

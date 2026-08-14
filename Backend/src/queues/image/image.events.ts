import { QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";

const imageEvents = new QueueEvents("image");

imageEvents.on("waiting", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.waiting,
    message: "Preparing to process image.",
    queue: "imageQueue",
    timestamp: Date.now(),
    type: "processing-image",
  });
});

imageEvents.on("active", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.active,
    message: "Processing Image.",
    queue: "imageQueue",
    timestamp: Date.now(),
    type: "processing-image",
  });
});

imageEvents.on("completed", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.completed,
    message: "Image proccessed successfully.",
    queue: "imageQueue",
    timestamp: Date.now(),
    type: "processing-image",
  });
});

imageEvents.on("failed", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.failed,
    message: "Failed to proccess image.",
    queue: "imageQueue",
    timestamp: Date.now(),
    type: "processing-image",
  });
});

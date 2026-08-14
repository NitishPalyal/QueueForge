import { QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";

const aiEvents = new QueueEvents("ai");

aiEvents.on("waiting", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.waiting,
    message: "Preparing to generate AI response.",
    queue: "aiQueue",
    timestamp: Date.now(),
    type: "ai-response",
  });
});

aiEvents.on("active", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.active,
    message: "Generating AI response.",
    queue: "aiQueue",
    timestamp: Date.now(),
    type: "ai-response",
  });
});

aiEvents.on("completed", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.completed,
    message: "AI response generated successfully.",
    queue: "aiQueue",
    timestamp: Date.now(),
    type: "ai-response",
  });
});

aiEvents.on("failed", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.failed,
    message: "Failed to generate AI response.",
    queue: "aiQueue",
    timestamp: Date.now(),
    type: "ai-response",
  });
});

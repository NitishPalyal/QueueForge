import { QueueEvents } from "bullmq";
import { triggerEvent } from "../../notification/notification.service.ts";
import { EventStatus } from "../../shared/types.ts";

const emailEvents = new QueueEvents("mail");

emailEvents.on("waiting", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.waiting,
    message: "Preparing to send mail.",
    queue: "mailQueue",
    timestamp: Date.now(),
    type: "sending-mail",
  });
});

emailEvents.on("active", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.active,
    message: "Sending Mail.",
    queue: "mailQueue",
    timestamp: Date.now(),
    type: "sending-mail",
  });
});

emailEvents.on("completed", async ({ jobId }) => {
  await triggerEvent({
    jobId,
    status: EventStatus.completed,
    message: "Mail send successfully.",
    queue: "mailQueue",
    timestamp: Date.now(),
    type: "sending-mail",
  });
});

emailEvents.on("failed", async ({ jobId }, err) => {
  await triggerEvent({
    jobId,
    status: EventStatus.failed,
    message: "Failed to send mail.",
    queue: "mailQueue",
    timestamp: Date.now(),
    type: "sending-mail",
  });
});

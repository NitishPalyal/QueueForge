import { Queue } from "bullmq";
import { imageQueue } from "../queues/image/image.queue.js";
import { aiQueue } from "../queues/ai/ai.queue.js";
import { mailQueue } from "../queues/mail/mail.queue.js";
import { getAllJobsController } from "./job.controller.js";
/**
 * Registry of known queues used by the application.
 *
 * This central map allows service-layer logic to resolve a queue by name
 * without hardcoding the queue instances across the project.
 */
export const QUEUES = {
    imageQueue,
    aiQueue,
    mailQueue,
};
export const VALID_JOB_PRIORITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const DEFAULT_JOB_PRIORITY = 5;
export function normalizeJobPriority(value, fallback = DEFAULT_JOB_PRIORITY) {
    if (typeof value === "number" &&
        VALID_JOB_PRIORITIES.includes(value)) {
        return value;
    }
    return fallback;
}
export var JobType;
(function (JobType) {
    JobType[JobType["ai"] = 0] = "ai";
    JobType[JobType["mail"] = 1] = "mail";
    JobType[JobType["image"] = 2] = "image";
})(JobType || (JobType = {}));
//# sourceMappingURL=job.types.js.map
import { Worker } from "bullmq";
/**
 * AI Worker processes jobs from the AI queue.
 *
 * Handles two job types:
 * - Email jobs: Generate subject/HTML for a targeted recipient
 * - Response jobs: Generate AI content for a given prompt
 *
 * All jobs follow the canonical queue payload structure with jobData + metadata.
 */
export declare const aiWorker: Worker<any, any, string>;
//# sourceMappingURL=ai.worker.d.ts.map
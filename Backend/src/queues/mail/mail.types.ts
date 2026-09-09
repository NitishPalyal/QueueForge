import { Prisma } from "../../../generated/prisma/client.ts";
import type { JobPriority } from "../../job/job.types.ts";
export type SendmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface MailJobPayload extends Prisma.InputJsonObject {
  to: string;
  subject: string;
  html: string;
}

export interface MailWorkerJobData {
  jobData: {
    to: string;
    subject: string;
    html: string;
  };
  jobId: string;
  batchId?: string;
  isLastStep: boolean;
}

export interface MailQueuePayload {
  jobId: string;
  payload: MailJobPayload;
  batchId?: string;
  isLastStep: boolean;
  priority?: JobPriority;
}

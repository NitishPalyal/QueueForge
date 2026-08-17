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
  html: any;
}

export interface MailQueuePayload {
  jobId: string;
  payload: MailJobPayload;
  batchId?: string;
  isLastStep: boolean;
  priority?: JobPriority;
}

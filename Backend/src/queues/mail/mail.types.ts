import { Prisma } from "../../../generated/prisma/client.ts";
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
}

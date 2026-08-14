import type { Prisma } from "../../../generated/prisma/client.ts";

// MAIL JOB //
export interface AiMailJobPayload extends Prisma.InputJsonObject {
  to: string;
  subject: string;
  html: any;
  prompt: string;
}

// export interface AiResponseForEmailJobPayload {
//   to: string;
//   prompt: string;
// }

export interface generateMailContentParam {
  to: string;
  prompt: string;
}

export interface generateAiResponseForEmailParam {
  to: string;
  prompt: string;
  jobId: string;
  batchId: string | undefined;
  isLastStep: boolean;
}

// AI JOB //
export interface AiResponseJobPayload extends Prisma.InputJsonObject {
  prompt: string;
  response: string;
}

export interface generateAiResponseParam {
  jobId: string;
  prompt: string;
}

export interface AiQueuePayload {
  payload: object;
  jobId: string;
  isMail: Boolean;
  batchId?: string;
  isLastStep: boolean;
}

// AI PROVIDERS //
type AiModel = {
  name: string;
  generate: (prompt: string) => Promise<string>;
};

export type AiProvider = {
  name: string;
  models: AiModel[];
};

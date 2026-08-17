import type { Prisma } from "../../../generated/prisma/client.ts";
import type { JobPriority } from "../../job/job.types.ts";

export interface imageProcessingService {
  jobId: string;
  uploadedImageKey: string;
}

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type MimeType = (typeof SUPPORTED_MIME_TYPES)[number];

export function isMimeType(value: string): value is MimeType {
  return SUPPORTED_MIME_TYPES.includes(value as MimeType);
}

export const FolderName = {
  uploaded: "uploaded",
  processed: "processed",
} as const;

export type FolderName = (typeof FolderName)[keyof typeof FolderName];

export interface uploadToStorageParam {
  buffer: Buffer;
  mimeType: MimeType;
  folderName: FolderName;
}

export interface generateImageKeyParam {
  mimeType: MimeType;
  folderName: FolderName;
}

export interface imageProcessingServicePayload extends Prisma.InputJsonObject {
  uploadedImageKey: string;
  processedImageKey: string;
}

export interface addJobInImageQueueServiceParam {
  jobId: string;
  uploadedImageKey: string;
  batchId?: string;
  isLastStep: boolean;
  priority?: JobPriority;
}

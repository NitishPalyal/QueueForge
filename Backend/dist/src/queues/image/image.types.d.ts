import type { Prisma } from "../../../generated/prisma/client.ts";
import type { JobPriority } from "../../job/job.types.ts";
export interface imageProcessingService {
    jobId: string;
    uploadedImageKey: string;
}
export declare const SUPPORTED_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
export type MimeType = (typeof SUPPORTED_MIME_TYPES)[number];
export declare function isMimeType(value: string): value is MimeType;
export declare const FolderName: {
    readonly uploaded: "uploaded";
    readonly processed: "processed";
};
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
//# sourceMappingURL=image.types.d.ts.map
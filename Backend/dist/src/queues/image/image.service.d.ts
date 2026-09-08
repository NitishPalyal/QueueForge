import type { addJobInImageQueueServiceParam, imageProcessingService, uploadToStorageParam } from "./image.types.ts";
export declare function uploadToStorageService({ buffer, mimeType, folderName, }: uploadToStorageParam): Promise<string>;
export declare function downloadFromStorageService(uploadedImageKey: string): Promise<Buffer>;
export declare function deleteFromStorageService(uploadedImageKey: string): Promise<void>;
export declare function getImageUrlFromStorageService(uploadedImageKey: string): Promise<string>;
export declare function imageProcessingService({ jobId, uploadedImageKey, }: imageProcessingService): Promise<void>;
export declare function addJobInImageQueueService({ jobId, uploadedImageKey, batchId, isLastStep, priority, }: addJobInImageQueueServiceParam): Promise<void>;
//# sourceMappingURL=image.service.d.ts.map
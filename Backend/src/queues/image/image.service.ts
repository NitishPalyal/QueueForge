import b2 from "./image.b2.ts";
import sharp from "sharp";
import { logger } from "../../shared/logger.ts";
import { FolderName, SUPPORTED_MIME_TYPES } from "./image.types.ts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { generateImageKey } from "./image.utility.ts";
import { imageQueue } from "./image.queue.ts";
import * as jopRepo from "../../job/job.repository.ts";
import type {
  addJobInImageQueueServiceParam,
  imageProcessingService,
  imageProcessingServicePayload,
  uploadToStorageParam,
  MimeType,
} from "./image.types.ts";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

// UPLOAD IMAGE TO STORAGE //
export async function uploadToStorageService({
  buffer,
  mimeType,
  folderName,
}: uploadToStorageParam): Promise<string> {
  try {
    if (!SUPPORTED_MIME_TYPES.includes(mimeType as MimeType)) {
      throw new Error("Unsupported image type");
    }

    const uploadedImageKey = generateImageKey({
      mimeType: mimeType,
      folderName,
    });

    await b2.send(
      new PutObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
        Body: buffer,
        ContentType: String(mimeType),
      }),
    );

    return uploadedImageKey;
  } catch (error) {
    logger.error("Error in uploadToStorageService", "image.service", error);
    throw error;
  }
}

// DOWNLOAD IMAGE FROM STORAGR SERVICE //
export async function downloadFromStorageService(
  uploadedImageKey: string,
): Promise<Buffer> {
  try {
    logger.debug(
      `Started downloading image from service: ${uploadedImageKey}`,
      "image.service",
    );

    const response = await b2.send(
      new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
    );

    const buffer = Buffer.from(await response.Body!.transformToByteArray());

    logger.debug(
      `Image download completed successfully: ${buffer.length} bytes`,
      "image.service",
    );

    return buffer;
  } catch (error) {
    logger.error("Error in downloadFromStorageService", "image.service", error);
    throw error;
  }
}

// DELETE IMAGE FROM STORAGE SERVICE //
export async function deleteFromStorageService(uploadedImageKey: string) {
  try {
    logger.debug(
      `Started deleting image: ${uploadedImageKey}`,
      "image.service",
    );
    await b2.send(
      new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
    );
    logger.debug(
      `Image deleted successfully: ${uploadedImageKey}`,
      "image.service",
    );
  } catch (error) {
    logger.error("Error in deleteFromStorageService", "image.service", error);
    throw error;
  }
}

// GET UPLODED AND PROCESSES IMAGE URL //
export async function getImageUrlFromStorageService(
  uploadedImageKey: string,
): Promise<string> {
  try {
    const url = await getSignedUrl(
      b2,
      new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
      {
        expiresIn: 600, // 10 minutes
      },
    );
    return url;
  } catch (error) {
    logger.error(
      "Error in getImageUrlFromStorageService",
      "image.service",
      error,
    );
    throw error;
  }
}

// PROCESS/RESIZE THE IMAGE//
export async function imageProcessingService({
  jobId,
  uploadedImageKey,
}: imageProcessingService) {
  try {
    logger.debug(
      `Starting image processing for key: ${uploadedImageKey}`,
      "image.service",
    );
    const inputBuffer = await downloadFromStorageService(uploadedImageKey);
    logger.debug(
      `Image downloaded successfully, size: ${inputBuffer.length} bytes`,
      "image.service",
    );
    const outputBuffer = await sharp(inputBuffer)
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const processedImageKey = await uploadToStorageService({
      buffer: outputBuffer,
      mimeType: "image/webp",
      folderName: FolderName.processed,
    });

    const newPayload: imageProcessingServicePayload = {
      uploadedImageKey,
      processedImageKey,
    };

    await jopRepo.updateJobPayload({ id: jobId, payload: newPayload });
  } catch (error) {
    logger.error("Error in imageProcessingService", "image.service", error);
    throw error;
  }
}

// ADD JOB IN IMAGE QUEUE//
export async function addJobInImageQueueService({
  jobId,
  uploadedImageKey,
  batchId,
  isLastStep,
  priority,
}: addJobInImageQueueServiceParam) {
  try {
    imageQueue.add(
      "image",
      {
        jobData: { uploadedImageKey },
        dbJobId: jobId,
        batchId,
        isLastStep,
      },
      {
        jobId,
        backoff: { type: "exponential", delay: 3000 },
        attempts: 3,
        ...(priority !== undefined ? { priority } : {}),
      },
    );
  } catch (error) {
    logger.error("Error in addJobInImageQueueService", "image.service", error);
    throw error;
  }
}

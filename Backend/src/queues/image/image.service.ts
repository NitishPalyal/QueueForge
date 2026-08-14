import b2 from "./image.b2.ts";
import sharp from "sharp";
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
    console.error("Error in uploadToStorageService.");
    console.error(error);
    throw error;
  }
}

// DOWNLOAD IMAGE FROM STORAGR SERVICE //
export async function downloadFromStorageService(
  uploadedImageKey: string,
): Promise<Buffer> {
  try {
    console.log("Started downloding image from service :-", uploadedImageKey);

    const response = await b2.send(
      new GetObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
    );

    const buffer = Buffer.from(await response.Body!.transformToByteArray());

    console.log("Image download completed successfully :-.", buffer);

    return buffer;
  } catch (error) {
    console.error("Error in downloadFromStorageService.");
    console.error(error);
    throw error;
  }
}

// DELETE IMAGE FROM STORAGE SERVICE //
export async function deleteFromStorageService(uploadedImageKey: string) {
  try {
    console.log("Started Deleteing Image:-", uploadedImageKey);
    await b2.send(
      new DeleteObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: uploadedImageKey,
      }),
    );
    console.log("Image Deleted Successfully:-", uploadedImageKey);
  } catch (error) {
    console.error("Error in deleteFromStorageService.");
    console.error(error);
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
    console.error("Error in getImageUrlFromStorageService.");
    console.error(error);
    throw error;
  }
}

// PROCESS/RESIZE THE IMAGE//
export async function imageProcessingService({
  jobId,
  uploadedImageKey,
}: imageProcessingService) {
  try {
    console.log(
      "imageProcessingService got uploaded image key and dowloading start:-",
      uploadedImageKey,
    );
    const inputBuffer = await downloadFromStorageService(uploadedImageKey);
    console.log(
      "imageProcessingService downloaded image sucessfully:-",
      inputBuffer,
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
    console.error("Error in imageProcessingService.");
    console.error(error);
    throw error;
  }
}

// ADD JOB IN IMAGE QUEUE//
export async function addJobInImageQueueService({
  jobId,
  uploadedImageKey,
  batchId,
  isLastStep,
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
      },
    );
  } catch (error) {
    console.error("Error in addJobInImageQueueService");
    console.error(error);
    throw error;
  }
}

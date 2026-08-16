import { imageProcessingService } from "./image.service.ts";
import { ImageWorkerProcessingServiceDataSchema } from "./image.zodSchema.ts";

interface imageJob {
  id: string;
  data: object;
}

export default async function (job: imageJob) {
  const jobId = job.id;

  if (!jobId) {
    throw new Error("Missing job id in image worker");
  }
  const jobPayload = ImageWorkerProcessingServiceDataSchema.parse(job.data);
  await imageProcessingService({
    jobId: jobPayload.dbJobId || jobId,
    uploadedImageKey: jobPayload.jobData.uploadedImageKey,
  });
}

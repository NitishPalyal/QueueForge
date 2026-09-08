import { imageProcessingService } from "./image.service.js";
import { ImageWorkerProcessingServiceDataSchema } from "./image.zodSchema.js";
export default async function (job) {
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
//# sourceMappingURL=image.processor.js.map
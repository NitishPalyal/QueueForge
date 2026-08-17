import type { FlowJob } from "bullmq";
import { flowProducer } from "./batchJob.producer.ts";
import * as BatchJobRepo from "./batchJob.repository.ts";
import * as JobRepo from "../job/job.repository.ts";
import type { Batch, Job, Prisma } from "../../generated/prisma/client.ts";
import { ImageJobPayloadSchema } from "../shared/zod.schema.ts";
import { logger } from "../shared/logger.ts";
import {
  QUEUE_BY_TYPE,
  type BatchStepMeta,
  type buildFlowTreeServiceParam,
  type createBatchParam,
  type finishStepParam,
  type getAllBatchesServiceParams,
  type JobRow,
  type toFlowJobParam,
} from "./batchJob.types.ts";
import {
  createAiResponseJobService,
  createImageProcessingJobService,
  createMailJobService,
  deleteImageJobUploadedAndProcessedImageService,
  getImageJobUploadedAndProcessedImageUrlService,
} from "../job/job.service.ts";

function buildFlowTreeService({
  steps,
  jobs,
  batchId,
}: buildFlowTreeServiceParam): FlowJob {
  try {
    const toFlowJob = ({ step, job, isLastStep }: toFlowJobParam): FlowJob => {
      const meta = { dbJobId: job.id, batchId, isLastStep };

      if (step.type === "mail") {
        return {
          name: "mail",
          queueName: "ai", // enters through AI, not mail, directly
          data: {
            jobData: step.data,
            ...meta,
            isMail: true, // tells the AI worker to use email handler
          },
        };
      }

      return {
        name: step.type,
        queueName: QUEUE_BY_TYPE[step.type],
        data: {
          jobData: step.data,
          ...meta,
        },
        opts: { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      };
    };

    return steps.slice(1).reduce<FlowJob>(
      (childNode, step, i) => ({
        ...toFlowJob({
          step,
          job: jobs[i + 1]!,
          isLastStep: i + 1 === steps.length - 1,
        }),
        children: [childNode],
      }),
      toFlowJob({
        step: steps[0]!,
        job: jobs[0]!,
        isLastStep: steps.length === 1,
      }),
    );
  } catch (error) {
    logger.error("Error in buildFlowTreeService", "batchJob.service", error);
    throw error;
  }
}

export async function createBatchService({
  steps,
}: createBatchParam): Promise<Batch> {
  try {
    const data: Prisma.BatchCreateInput = {
      type: steps.map((s) => s.type).join("-then-"),
      totalSteps: steps.length,
      status: "pending",
      payload: "null",
    };
    const batch = await BatchJobRepo.create(data);

    const jobs: JobRow[] = [];
    for (let i = 0; i < steps.length; i++) {
      const idempotencyKey = `batch-${batch.id}-step-${i}`;
      const step = steps[i];
      const job =
        step!.type === "image"
          ? await createImageProcessingJobService({
              idempotency_key: idempotencyKey,
              uploadedImageKey: step!.data.uploadedImageKey,
            })
          : step!.type === "mail"
            ? await createMailJobService({
                idempotency_key: idempotencyKey,
                prompt: step!.data.prompt,
                to: step!.data.to,
              })
            : await createAiResponseJobService({
                idempotency_key: idempotencyKey,
                prompt: step!.data.prompt,
              });

      await JobRepo.setBatchIdAndStepOrder(job.id, batch.id, i);
      jobs.push(job);
    }

    await flowProducer.add(
      buildFlowTreeService({ steps, jobs, batchId: batch.id }),
    );
    return batch;
  } catch (error) {
    logger.error("Error in createBatchService", "batchJob.service", error);
    throw error;
  }
}

export async function finishStepService({
  dbJobId,
  batchId,
  isLastStep,
}: finishStepParam) {
  try {
    await JobRepo.setStatusCompleted(dbJobId);
    if (isLastStep && batchId) {
      await BatchJobRepo.setStatusCompleted(batchId);
    }
  } catch (error) {
    logger.error("Error in finishStepService", "batchJob.service", error);
    throw error;
  }
}

export async function getBatchJobsService(batchId: string): Promise<Job[]> {
  try {
    const batchJobs = await JobRepo.findByBatch(batchId);
    return await Promise.all(
      batchJobs.map(async (job) => {
        if (job.type !== "image") {
          return job;
        }

        const payload = ImageJobPayloadSchema.parse(job.payload);

        const { uploadedImageUrl, processedImageUrl } =
          await getImageJobUploadedAndProcessedImageUrlService({
            uploadedImageKey: payload.uploadedImageKey,
            processedImageKey: payload.processedImageKey ?? "",
          });

        return {
          ...job,
          uploadedImageUrl,
          processedImageUrl,
        };
      }),
    );
  } catch (error) {
    logger.error("Error in getBatchJobsService", "batchJob.service", error);
    throw error;
  }
}

export async function deleteBatchService(batchId: string): Promise<void> {
  try {
    const batchJobs = await getBatchJobsService(batchId);
    await Promise.all(
      batchJobs.map(async (job) => {
        if (job.type === "image") {
          const imagePayload = ImageJobPayloadSchema.parse(job.payload);

          await deleteImageJobUploadedAndProcessedImageService({
            uploadedImageKey: imagePayload.uploadedImageKey,
            processedImageKey: imagePayload.processedImageKey ?? "",
          });
        }
      }),
    );
    await BatchJobRepo.deleteBatch(batchId);
  } catch (error) {
    logger.error("Error in deleteBatchJobService", "batchJob.service", error);
    throw error;
  }
}

export async function getBatchService(batchId: string): Promise<boolean> {
  try {
    const batch = await BatchJobRepo.findById(batchId);
    return Boolean(batch);
  } catch (error) {
    logger.error("Error in getBatchService", "batchJob.service", error);
    throw error;
  }
}

export async function getAllBatchesService({
  limit,
  page,
}: getAllBatchesServiceParams) {
  try {
    const skip = (page - 1) * limit;
    const { batches, totalBatches } = await BatchJobRepo.findAll(limit, skip);
    const totalPages = Math.ceil(totalBatches / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return { batches, totalBatches, hasNextPage, hasPreviousPage };
  } catch (error) {
    logger.error("Error in getAllBatchesService", "batchJob.service", error);
    throw error;
  }
}

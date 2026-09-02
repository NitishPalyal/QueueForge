import { beforeEach, describe, expect, it, vi } from "vitest";
import * as batchService from "../../src/batchJob/batchJob.service.ts";
import * as BatchJobRepo from "../../src/batchJob/batchJob.repository.ts";
import * as JobRepo from "../../src/job/job.repository.ts";
import * as JobService from "../../src/job/job.service.ts";

vi.mock("../../src/batchJob/batchJob.repository.ts", () => ({
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  deleteBatch: vi.fn(),
  setStatusCompleted: vi.fn(),
}));

vi.mock("../../src/job/job.repository.ts", () => ({
  setBatchIdAndStepOrder: vi.fn(),
  findByBatch: vi.fn(),
  updateJobPayload: vi.fn(),
  setStatusCompleted: vi.fn(),
}));

vi.mock("../../src/job/job.service.ts", () => ({
  createAiResponseJobService: vi.fn(),
  createImageProcessingJobService: vi.fn(),
  createMailJobService: vi.fn(),
  deleteImageJobUploadedAndProcessedImageService: vi.fn(),
  getImageJobUploadedAndProcessedImageUrlService: vi.fn(),
}));

vi.mock("../../src/batchJob/batchJob.producer.ts", () => ({
  flowProducer: { add: vi.fn() },
}));

// BATCH JOB SERVICE TESTS //
describe("batch job service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR CREATING A BATCH AND LINKING EACH STEP JOB TO THE BATCH IN ORDER //
  it("creates a batch and links each step job to the batch in order", async () => {
    vi.mocked(BatchJobRepo.create).mockResolvedValue({
      id: "batch-123",
    } as any);

    vi.mocked(JobService.createMailJobService).mockResolvedValue({
      id: "job-step-1",
    } as any);
    vi.mocked(JobService.createAiResponseJobService).mockResolvedValue({
      id: "job-step-2",
    } as any);

    const steps = [
      {
        type: "mail",
        data: {
          to: "a@b.com",
          prompt: "Mail prompt longer than ten characters",
        },
      },
      { type: "ai", data: { prompt: "AI prompt longer than ten characters" } },
    ] as any;

    const result = await batchService.createBatchService({ steps });

    expect(BatchJobRepo.create).toHaveBeenCalledTimes(1);
    expect(JobService.createMailJobService).toHaveBeenCalledWith({
      idempotency_key: "batch-batch-123-step-0",
      prompt: "Mail prompt longer than ten characters",
      to: "a@b.com",
      priority: 5,
    });
    expect(JobRepo.setBatchIdAndStepOrder).toHaveBeenCalledWith(
      "job-step-1",
      "batch-123",
      0,
    );
    expect(JobService.createAiResponseJobService).toHaveBeenCalledWith({
      idempotency_key: "batch-batch-123-step-1",
      prompt: "AI prompt longer than ten characters",
      priority: 5,
    });
    expect(result).toEqual({ id: "batch-123" });
  });

  // TEST FOR MARKING THE BATCH COMPLETE WHEN THE FINAL STEP FINISHES //
  it("marks the batch complete when the final step finishes", async () => {
    await batchService.finishStepService({
      dbJobId: "job-1",
      batchId: "batch-2",
      isLastStep: true,
    });

    expect(JobRepo.setStatusCompleted).toHaveBeenCalledWith("job-1");
    expect(BatchJobRepo.setStatusCompleted).toHaveBeenCalledWith("batch-2");
  });
});

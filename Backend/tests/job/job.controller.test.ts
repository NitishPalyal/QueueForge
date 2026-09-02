import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEmailJobController,
  createImageProcessingJobController,
} from "../../src/job/job.controller.ts";
import {
  createImageProcessingJobService,
  createMailJobService,
} from "../../src/job/job.service.ts";
import { addJobInAiQueueService } from "../../src/queues/ai/ai.service.ts";
import {
  addJobInImageQueueService,
  uploadToStorageService,
} from "../../src/queues/image/image.service.ts";

vi.mock("../../src/job/job.service.ts", () => ({
  createMailJobService: vi.fn(),
  createAiResponseJobService: vi.fn(),
  createImageProcessingJobService: vi.fn(),
  getJobService: vi.fn(),
  getAllJobsService: vi.fn(),
  getAllQueueJobsService: vi.fn(),
  getAllStatusJobsService: vi.fn(),
  getAllQueueStatusJobsService: vi.fn(),
  retryJobService: vi.fn(),
  deleteJobService: vi.fn(),
  getImageJobUploadedAndProcessedImageUrlService: vi.fn(),
}));

vi.mock("../../src/queues/image/image.service.ts", () => ({
  uploadToStorageService: vi.fn(),
  addJobInImageQueueService: vi.fn(),
  deleteFromStorageService: vi.fn(),
  getImageUrlFromStorageService: vi.fn(),
}));

vi.mock("../../src/queues/ai/ai.service.ts", () => ({
  addJobInAiQueueService: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// CRITICAL BACKEND JOB CONTROLLER TESTS //
describe("critical backend job controllers", () => {
  // TEST FOR CREATING AN IMAGE JOB WHEN REQUIRED HEADERS AND FILE ARE PRESENT //
  it("creates an image job when required headers and file are present", async () => {
    const req = {
      get: vi.fn((header: string) => {
        if (header === "idempotency_key") return "image-job-key-123";
        if (header === "priority") return "5";
        return undefined;
      }),
      file: {
        buffer: Buffer.from("fake-image"),
        mimetype: "image/png",
        size: 1024,
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    vi.mocked(uploadToStorageService).mockResolvedValue("uploaded-image-key");
    vi.mocked(createImageProcessingJobService).mockResolvedValue({
      id: "job-123",
      status: "pending",
      createdAt: new Date(),
    } as any);

    await createImageProcessingJobController(req, res);

    expect(uploadToStorageService).toHaveBeenCalledWith({
      buffer: req.file.buffer,
      mimeType: "image/png",
      folderName: "uploaded",
    });

    expect(createImageProcessingJobService).toHaveBeenCalledWith({
      uploadedImageKey: "uploaded-image-key",
      idempotency_key: "image-job-key-123",
      priority: 5,
    });

    expect(addJobInImageQueueService).toHaveBeenCalledWith({
      jobId: "job-123",
      uploadedImageKey: "uploaded-image-key",
      isLastStep: false,
      priority: 5,
    });

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Image Processing Job created"),
      }),
    );
  });

  // TEST FOR REJECTING IMAGE JOB CREATION WHEN IDEMPOTENCY KEY IS MISSING //
  it("rejects image job creation when idempotency key is missing", async () => {
    const req = {
      get: vi.fn((header: string) => {
        if (header === "priority") return "5";
        return undefined;
      }),
      file: {
        buffer: Buffer.from("fake-image"),
        mimetype: "image/jpeg",
        size: 1024,
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await createImageProcessingJobController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Idempotency_key is required",
    });
  });

  // TEST FOR REJECTING IMAGE JOB CREATION WHEN PRIORITY IS INVALID //
  it("rejects image job creation when priority is invalid", async () => {
    const req = {
      get: vi.fn((header: string) => {
        if (header === "idempotency_key") return "image-job-key-123";
        if (header === "priority") return "11";
        return undefined;
      }),
      file: {
        buffer: Buffer.from("fake-image"),
        mimetype: "image/webp",
        size: 2048,
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    await createImageProcessingJobController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Priority header must be an integer between 1 and 10.",
    });
  });

  // TEST FOR CREATING AN EMAIL JOB AND ENQUEUING THE DOWNSTREAM AI STEP //
  it("creates an email job and enqueues the downstream AI step", async () => {
    const req = {
      body: {
        to: "user@example.com",
        prompt: "Draft a clean quarterly summary for the team.",
        idempotency_key: "mail-job-key-123",
        priority: 3,
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    vi.mocked(createMailJobService).mockResolvedValue({
      id: "mail-job-123",
      status: "pending",
      createdAt: new Date(),
    } as any);

    await createEmailJobController(req, res);

    expect(createMailJobService).toHaveBeenCalledWith({
      to: "user@example.com",
      prompt: "Draft a clean quarterly summary for the team.",
      idempotency_key: "mail-job-key-123",
      priority: 3,
    });

    expect(addJobInAiQueueService).toHaveBeenCalledWith({
      isMail: true,
      jobId: "mail-job-123",
      payload: {
        to: "user@example.com",
        prompt: "Draft a clean quarterly summary for the team.",
      },
      isLastStep: false,
      priority: 3,
    });

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.stringContaining("Email Job created"),
      }),
    );
  });
});

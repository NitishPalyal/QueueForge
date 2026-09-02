import { describe, expect, it, vi, beforeEach } from "vitest";
import * as imageService from "../../src/queues/image/image.service.ts";
import {
  FolderName,
  SUPPORTED_MIME_TYPES,
} from "../../src/queues/image/image.types.ts";

vi.mock("../../src/queues/image/image.b2.ts", () => ({
  default: { send: vi.fn() },
}));

vi.mock("../../src/queues/image/image.utility.ts", () => ({
  generateImageKey: vi.fn(() => "generated-key.webp"),
}));

vi.mock("../../src/queues/image/image.queue.ts", () => ({
  imageQueue: { add: vi.fn() },
}));

vi.mock("../../src/job/job.repository.ts", () => ({
  updateJobPayload: vi.fn(),
}));

// IMAGE QUEUE SERVICE TESTS //
describe("image queue service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR UPLOADING A VALID SUPPORTED IMAGE AND RETURNING THE STORAGE KEY //
  it("uploads a valid supported image and returns the storage key", async () => {
    const { default: b2 } = await import("../../src/queues/image/image.b2.ts");
    vi.mocked(b2.send).mockResolvedValue({} as any);

    const result = await imageService.uploadToStorageService({
      buffer: Buffer.from("image-data"),
      mimeType: "image/png",
      folderName: FolderName.uploaded,
    });

    expect(result).toBe("generated-key.webp");
    expect(SUPPORTED_MIME_TYPES).toContain("image/png");
  });

  // TEST FOR REJECTING UNSUPPORTED IMAGE MIME TYPES //
  it("rejects unsupported image mime types", async () => {
    await expect(
      imageService.uploadToStorageService({
        buffer: Buffer.from("bad-data"),
        mimeType: "image/gif" as any,
        folderName: FolderName.uploaded,
      }),
    ).rejects.toThrow("Unsupported image type");
  });

  // TEST FOR ADDING IMAGE JOBS TO THE QUEUE WITH PRIORITY WHEN PROVIDED //
  it("adds image jobs to the queue with priority when provided", async () => {
    const { imageQueue } =
      await import("../../src/queues/image/image.queue.ts");

    await imageService.addJobInImageQueueService({
      jobId: "img-job-1",
      uploadedImageKey: "upload-key",
      isLastStep: false,
      priority: 8,
    });

    expect(imageQueue.add).toHaveBeenCalledWith(
      "image",
      expect.objectContaining({
        jobData: { uploadedImageKey: "upload-key" },
        dbJobId: "img-job-1",
        isLastStep: false,
      }),
      expect.objectContaining({
        jobId: "img-job-1",
        attempts: 3,
        priority: 8,
      }),
    );
  });
});

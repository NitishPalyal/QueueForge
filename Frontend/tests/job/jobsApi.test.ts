import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../../src/shared/lib/axios";
import { jobsApi } from "../../src/features/jobs/api/jobsApi";

vi.mock("../../src/shared/lib/axios", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("jobs API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR SENDING IMAGE FILE AS MULTIPART DATA AND METADATA AS HEADERS //
  it("sends image jobs with the file in form data and metadata in headers", async () => {
    const imageFile = new File(["image-content"], "photo.png", {
      type: "image/png",
    });
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { success: true, message: "created" },
    });

    await jobsApi.createImageJob({
      imageFile,
      idempotency_key: "image-key-123",
      priority: 6,
    });

    expect(apiClient.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(url).toBe("/api/job/imageProcessing");
    expect(body).toBeInstanceOf(FormData);
    const uploadedFile = (body as FormData).get("image") as File;
    expect(uploadedFile).toMatchObject({
      name: "photo.png",
      type: "image/png",
    });
    await expect(uploadedFile.text()).resolves.toBe("image-content");
    expect(config).toEqual({
      headers: {
        idempotency_key: "image-key-123",
        priority: "6",
      },
    });
  });

  // TEST FOR RETURNING PAGINATED JOB DATA FROM A SUCCESSFUL RESPONSE //
  it("returns paginated jobs when the response contains data", async () => {
    const jobs = {
      page: 1,
      limit: 50,
      totalJobs: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      jobs: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: true, message: "ok", data: jobs },
    });

    await expect(jobsApi.getAllJobs()).resolves.toEqual(jobs);
    expect(apiClient.get).toHaveBeenCalledWith("/api/job/getAllJobs", {
      params: { page: 1, limit: 50 },
    });
  });

  // TEST FOR SURFACING THE BACKEND ERROR WHEN JOB DATA IS MISSING //
  it("throws the backend message when paginated job data is missing", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { success: false, message: "Unable to fetch jobs" },
    });

    await expect(jobsApi.getAllJobs()).rejects.toThrow("Unable to fetch jobs");
  });
});

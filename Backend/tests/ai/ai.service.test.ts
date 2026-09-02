import { beforeEach, describe, expect, it, vi } from "vitest";
import * as aiService from "../../src/queues/ai/ai.service.ts";
import * as jobRepo from "../../src/job/job.repository.ts";
import { providers } from "../../src/queues/ai/ai.providers.ts";

vi.mock("../../src/queues/ai/ai.providers.ts", () => ({
  providers: [
    {
      name: "primary",
      models: [{ name: "model-a", generate: vi.fn() }],
    },
    {
      name: "fallback",
      models: [{ name: "model-b", generate: vi.fn() }],
    },
  ],
}));

vi.mock("../../src/job/job.repository.ts", () => ({
  updateJobPayload: vi.fn(),
}));

vi.mock("../../src/queues/mail/mail.service.ts", () => ({
  addJobInMailQueueService: vi.fn(),
}));

vi.mock("../../src/queues/ai/ai.queue.ts", () => ({
  aiQueue: { add: vi.fn() },
}));

// AI QUEUE SERVICE TESTS //
describe("ai queue service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR RETURNING FIRST SUCCESSFUL AI GENERATION RESULT //
  it("returns the first successful AI generation result", async () => {
    const modelA = providers[0].models[0];
    const result = "hello from model a";
    vi.mocked(modelA.generate).mockResolvedValue(result);

    await expect(
      aiService.generateAiContentService("Tell me a secret"),
    ).resolves.toBe(result);
    expect(modelA.generate).toHaveBeenCalledWith("Tell me a secret");
  });

  // TEST FOR STORING AI RESPONSE AND UPDATING THE JOB RECORD //
  it("stores AI response payload and updates the job record", async () => {
    const modelA = providers[0].models[0];
    vi.mocked(modelA.generate).mockResolvedValue("this is a response");

    await aiService.generateAiResponseService({
      jobId: "job-123",
      prompt: "Write a summary",
    });

    expect(jobRepo.updateJobPayload).toHaveBeenCalledWith({
      id: "job-123",
      payload: {
        prompt: "Write a summary",
        response: "this is a response",
      },
    });
  });

  // TEST FOR ADDING AI JOBS TO THE QUEUE WITH PRIORITY AND WORKFLOW METADATA //
  it("adds AI jobs to the queue with priority and workflow metadata", async () => {
    const { aiQueue } = await import("../../src/queues/ai/ai.queue.ts");

    await aiService.addJobInAiQueueService({
      payload: { prompt: "Generate something" },
      isMail: false,
      isLastStep: false,
      jobId: "job-456",
      priority: 7,
    });

    expect(aiQueue.add).toHaveBeenCalledWith(
      "generate-ai-response",
      expect.objectContaining({
        jobData: { prompt: "Generate something" },
        dbJobId: "job-456",
        isLastStep: false,
        isMail: false,
      }),
      expect.objectContaining({
        jobId: "job-456",
        attempts: 3,
        priority: 7,
      }),
    );
  });
});

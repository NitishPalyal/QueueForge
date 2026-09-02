import { beforeEach, describe, expect, it, vi } from "vitest";
import * as mailService from "../../src/queues/mail/mail.service.ts";

vi.mock("../../src/queues/mail/mail.config.ts", () => ({
  default: { sendMail: vi.fn() },
}));

vi.mock("../../src/queues/mail/mail.queue.ts", () => ({
  mailQueue: { add: vi.fn() },
}));

// MAIL QUEUE SERVICE TESTS //
describe("mail queue service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST FOR SENDING EMAIL PAYLOAD VIA THE CONFIGURED TRANSPORTER //
  it("sends email payload via the configured transporter", async () => {
    const transporter = (await import("../../src/queues/mail/mail.config.ts"))
      .default;
    vi.mocked(transporter.sendMail).mockResolvedValue({
      messageId: "abc",
    } as any);

    const result = await mailService.sendEmailService({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(transporter.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@example.com",
        subject: "Hello",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    );
    expect(result).toEqual({ messageId: "abc" });
  });

  // TEST FOR ADDING MAIL JOBS TO THE QUEUE WITH PRIORITY AND METADATA //
  it("adds mail jobs to the queue with priority and metadata", async () => {
    const { mailQueue } = await import("../../src/queues/mail/mail.queue.ts");

    await mailService.addJobInMailQueueService({
      jobId: "mail-job-1",
      payload: {
        to: "user@example.com",
        subject: "Welcome",
        html: "<p>Welcome</p>",
      },
      isLastStep: true,
      priority: 4,
    });

    expect(mailQueue.add).toHaveBeenCalledWith(
      "send-email",
      expect.objectContaining({
        jobData: {
          to: "user@example.com",
          subject: "Welcome",
          html: "<p>Welcome</p>",
        },
        dbJobId: "mail-job-1",
        isLastStep: true,
      }),
      expect.objectContaining({
        jobId: "mail-job-1",
        attempts: 3,
        priority: 4,
      }),
    );
  });
});

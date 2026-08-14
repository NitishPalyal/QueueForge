import transporter from "./mail.config.ts";
import { mailQueue } from "./mail.queue.ts";
import { logger } from "../../shared/logger.ts";
import type { MailQueuePayload, SendmailOptions } from "./mail.types.ts";

// SEND EMAIL //
export async function sendEmailService({
  to,
  subject,
  html,
  text,
}: SendmailOptions) {
  try {
    const mailOptions = {
      from: process.env.GOOGLE_USER,
      to,
      subject,
      html,
      text,
    };
    const details = await transporter.sendMail(mailOptions);
    return details;
  } catch (error) {
    logger.error("Error in sendEmailService", "mail.service", error);
    throw error;
  }
}

// ADD JOB IN MAIL QUEUE//
export async function addJobInMailQueueService({
  payload,
  jobId,
  batchId,
  isLastStep,
}: MailQueuePayload) {
  try {
    mailQueue.add(
      "send-email",
      {
        jobData: {
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        },
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
    logger.error("Error in addJobInMailQueueService", "mail.service", error);
    throw error;
  }
}

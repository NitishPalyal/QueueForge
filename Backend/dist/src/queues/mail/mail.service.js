import transporter from "./mail.config.js";
import { mailQueue } from "./mail.queue.js";
import { logger } from "../../shared/logger.js";
// SEND EMAIL //
export async function sendEmailService({ to, subject, html, text, }) {
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
    }
    catch (error) {
        logger.error("Error in sendEmailService", "mail.service", error);
        throw error;
    }
}
// ADD JOB IN MAIL QUEUE//
export async function addJobInMailQueueService({ payload, jobId, batchId, isLastStep, priority, }) {
    try {
        mailQueue.add("send-email", {
            jobData: {
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                jobId,
            },
            batchId,
            isLastStep,
        }, {
            jobId,
            backoff: { type: "exponential", delay: 3000 },
            attempts: 3,
            ...(priority !== undefined ? { priority } : {}),
        });
    }
    catch (error) {
        logger.error("Error in addJobInMailQueueService", "mail.service", error);
        throw error;
    }
}
//# sourceMappingURL=mail.service.js.map
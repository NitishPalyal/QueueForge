import type { MailQueuePayload, SendmailOptions } from "./mail.types.ts";
export declare function sendEmailService({ to, subject, html, text, }: SendmailOptions): Promise<import("nodemailer/lib/smtp-transport/index.js").SentMessageInfo>;
export declare function addJobInMailQueueService({ payload, jobId, batchId, isLastStep, priority, }: MailQueuePayload): Promise<void>;
//# sourceMappingURL=mail.service.d.ts.map
import * as jobRepo from "../../job/job.repository.ts";
import { MailSchema } from "../../shared/zod.schema.ts";
import { logger } from "../../shared/logger.ts";
import { addJobInMailQueueService } from "../mail/mail.service.ts";
import { aiQueue } from "./ai.queue.ts";
import { providers } from "./ai.providers.ts";
import type {
  generateAiResponseForEmailParam,
  AiMailJobPayload,
  generateMailContentParam,
  AiQueuePayload,
  generateAiResponseParam,
  AiResponseJobPayload,
} from "./ai.types.ts";

// GENERATE AI CONTENT //
export async function generateAiContentService(
  prompt: string,
): Promise<string> {
  for (const provider of providers) {
    logger.debug(`Trying provider: ${provider.name}`, "ai.service");

    for (const model of provider.models) {
      try {
        const result = await model.generate(prompt);
        return result;
      } catch (error) {
        logger.warn(
          `Failed: ${provider.name}/${model.name}`,
          "ai.service",
          error,
        );
      }
    }
  }
  logger.error("Error in generateAiContentService", "ai.service");
  throw new Error("All AI providers and models failed");
}

// GENERATE AI SUBJECT AND BODY OF MAIL ON THE BASIS TO AND PROMPT //
export async function generateMailContentService({
  to,
  prompt,
}: generateMailContentParam): Promise<AiMailJobPayload> {
  try {
    const aiPrompt: string = `
                         You are an expert email writer and HTML email designer.
       
                         You will receive:
                         - Recipient
                         - A prompt describing the email to generate.
       
                         Recipient:
                         ${to}
       
                         Prompt:
                         ${prompt}
       
                         Your task is to:
       
                         1. Generate a professional email subject.
                         2. Generate a complete production-ready HTML email.
       
                         Return ONLY a valid JSON object.
       
                         The JSON MUST have this exact structure:
       
                         {
                           "subject": "string",
                           "html": "string"
                         }
       
                         Rules:
       
                         - Do NOT return Markdown.
                         - Do NOT wrap the JSON in code fences.
                         - Do NOT include explanations.
                         - Do NOT include additional fields.
                         - The "subject" must be concise and professional.
                         - The "html" field must contain a complete HTML document.
                         - The HTML must begin with <!DOCTYPE html> and end with </html>.
                         - Use table-based layout.
                         - Use inline CSS only.
                         - Maximum width 600px.
                         - Mobile friendly.
                         - Compatible with Gmail, Outlook, Apple Mail and Yahoo Mail.
                         - No JavaScript.
                         - No external CSS.
                         - No external fonts.
                         - No placeholders.
                         - The email must be completely ready to send.
                         - Infer all content from the provided prompt.
                         `;

    const aiResponse = await generateAiContentService(aiPrompt);

    if (!aiResponse) {
      throw new Error("No response from Gemini");
    }

    const json = JSON.parse(aiResponse);

    const mail = MailSchema.parse(json);

    const newPayload: AiMailJobPayload = {
      to,
      subject: mail.subject,
      html: mail.html,
      prompt,
    };

    return newPayload;
  } catch (error) {
    logger.error("Error in generateMailContentService", "ai.service", error);
    throw error;
  }
}

// GENERATE AI RESPONSE FOR GIVEN PROMPT //
export async function generateAiResponseService({
  prompt,
  jobId,
}: generateAiResponseParam) {
  try {
    const response = await generateAiContentService(prompt);
    const newPayload: AiResponseJobPayload = {
      prompt,
      response,
    };

    await jobRepo.updateJobPayload({ id: jobId, payload: newPayload });
  } catch (error) {
    logger.error("Error in generateAiResponseService", "ai.service", error);
    throw error;
  }
}

// CALL AI CONTENT GENRATER FUCNTION FOR MAIL AND ADD JOB IN MAIL QUEUE//
export async function generateAiResponseForEmailService({
  prompt,
  to,
  jobId,
  batchId,
  isLastStep,
}: generateAiResponseForEmailParam) {
  try {
    const newPayload = await generateMailContentService({ to, prompt });
    const promises = [
      jobRepo.updateJobPayload({ id: jobId, payload: newPayload }),
      await addJobInMailQueueService({
        jobId,
        payload: {
          to: newPayload.to,
          subject: newPayload.subject,
          html: newPayload.html,
        },
        ...(batchId ? { batchId } : {}),
        isLastStep,
      }),
    ];
    await Promise.all(promises);
  } catch (error) {
    logger.error(
      "Error in generateAiResponseForEmailService",
      "ai.service",
      error,
    );
    throw error;
  }
}

// ADD JOB IN AI QUEUE//
export async function addJobInAiQueueService({
  payload,
  isMail,
  batchId,
  isLastStep,
  jobId,
  priority,
}: AiQueuePayload) {
  try {
    aiQueue.add(
      "generate-ai-response",
      {
        jobData: payload,
        dbJobId: jobId,
        batchId,
        isLastStep,
        isMail, // Keep this for worker to determine which handler to use
      },
      {
        jobId,
        backoff: { type: "exponential", delay: 3000 },
        attempts: 3,
        ...(priority !== undefined ? { priority } : {}),
      },
    );
  } catch (error) {
    logger.error("Error in addJobInAiQueueService", "ai.service", error);
    throw error;
  }
}

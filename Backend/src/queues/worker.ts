import { mailWorker } from "./mail/mail.worker.ts";
import { aiWorker } from "./ai/ai.worker.ts";
import { imageWorker } from "./image/image.worker.ts";
import { logger } from "../shared/logger.ts";

logger.info("All workers started...", "queues.worker");

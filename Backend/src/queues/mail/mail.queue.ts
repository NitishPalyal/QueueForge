import { Queue } from "bullmq";
import { connection } from "../../shared/connection.ts";

const mailQueue = new Queue("mail", { connection });

export { connection, mailQueue };

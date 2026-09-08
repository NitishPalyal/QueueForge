import { Queue } from "bullmq";
import { connection } from "../../shared/connection.js";
const mailQueue = new Queue("mail", { connection });
export { connection, mailQueue };
//# sourceMappingURL=mail.queue.js.map
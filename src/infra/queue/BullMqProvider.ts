import { Queue } from "bullmq";
import {
  IQueueProvider,
  VerificationJobData,
} from "@core/interfaces/IQueueProvider";

export class BullMqProvider implements IQueueProvider {
  private queue: Queue;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    });
  }

  async addJob(queueName: string, data: VerificationJobData): Promise<void> {
    await this.queue.add("process-document", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });
    console.log(
      `[Queue] Job adicionado na fila ${queueName}:`,
      data.verificationId
    );
  }
}

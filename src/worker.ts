import { Worker } from "bullmq";

import { MinioStorageProvider } from "@infra/storage/MinioStorageProvider";
import { TesseractOcrProvider } from "@infra/ocr/TesseractOcrProvider";
import { InMemoryVerificationRepo } from "@infra/database/InMemoryVerificationRepo";
import { ProcessVerification } from "@core/use-cases/ProcessVerification";

console.log("worker script loaded (called in main bc shared memory)");

export const createWorker = (
  repo: InMemoryVerificationRepo,
  storage: MinioStorageProvider
) => {
  const ocrProvider = new TesseractOcrProvider();

  const config = {
    bucketName: process.env.MINIO_BUCKET_PENDING || "pending-docs",
    similarityThreshold: Number(process.env.OCR_THRESHOLD) || 0.7,
  };

  const processVerification = new ProcessVerification(
    repo,
    storage,
    ocrProvider,
    config
  );

  const worker = new Worker(
    "ocr-processing-queue",
    async (job) => {
      console.log(`[Worker] Processando job ${job.id}`);

      await processVerification.execute({
        verificationId: job.data.verificationId,
        fileKey: job.data.fileKey,
      });
    },
    {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
      concurrency: 1, // (heavy cpu-bound) - accept only one in queue
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} finalizado com sucesso!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} falhou:`, err);
  });

  return worker;
};

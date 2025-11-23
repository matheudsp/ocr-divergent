import Fastify from "fastify";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";

import { MinioStorageProvider } from "@infra/storage/MinioStorageProvider";
import { InMemoryVerificationRepo } from "@infra/database/InMemoryVerificationRepo";
import { BullMqProvider } from "@infra/queue/BullMqProvider";
import { RequestVerification } from "@core/use-cases/RequestVerification";
import { UploadController } from "@infra/http/controllers/UploadController";
import { createWorker } from "./worker";

dotenv.config({ quiet: true });

const config = {
  bucketName: process.env.MINIO_BUCKET_PENDING || "pending-docs",
  similarityThreshold: Number(process.env.OCR_THRESHOLD) || 0.7,
};

const server = Fastify({ logger: true });

server.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 },
});

const storageProvider = new MinioStorageProvider();
const repository = new InMemoryVerificationRepo();
const queueProvider = new BullMqProvider("ocr-processing-queue");

const requestVerificationUseCase = new RequestVerification(
  storageProvider,
  repository,
  queueProvider,
  config.bucketName
);
const uploadController = new UploadController(requestVerificationUseCase);

server.post("/verify", (req, reply) => uploadController.handle(req, reply));

createWorker(repository, storageProvider);

const start = async () => {
  try {
    await server.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Microservice is running at 3000");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

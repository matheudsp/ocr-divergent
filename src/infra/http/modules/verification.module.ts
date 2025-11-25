import { RequestVerificationUsecase } from "@core/usecases/RequestVerificationUsecase";
import { GetVerificationUsecase } from "@core/usecases/GetVerificationUsecase";
import { UploadController } from "@infra/http/controllers/UploadController";
import { GetVerificationController } from "@infra/http/controllers/GetVerificationController";
import { PrismaVerificationRepo } from "@infra/database/PrismaVerificationRepo";
import { MinioStorageProvider } from "@infra/storage/MinioStorageProvider";
import { BullMqProvider } from "@infra/queue/BullMqProvider";
import { env } from "@infra/config/env";

export const VerificationModule = () => {
  const verificationRepo = new PrismaVerificationRepo();
  const storageProvider = new MinioStorageProvider();
  const queueProvider = new BullMqProvider("ocr-processing-queue");

  const requestVerificationUseCase = new RequestVerificationUsecase(
    storageProvider,
    verificationRepo,
    queueProvider,
    env.MINIO_BUCKET
  );

  const getVerificationUseCase = new GetVerificationUsecase(verificationRepo);

  const uploadController = new UploadController(requestVerificationUseCase);
  const getVerificationController = new GetVerificationController(
    getVerificationUseCase
  );

  return {
    uploadController,
    getVerificationController,
  };
};

import { CreateApiKeyUsecase } from "@core/usecases/CreateApiKeyUsecase";
import { ValidateAdminKeyUsecase } from "@core/usecases/ValidateAdminKeyUsecase";
import { CreateApiKeyController } from "@infra/http/controllers/CreateApiKeyController";
import { PrismaAuthRepo } from "@infra/database/PrismaAuthRepo";

export const AdminModule = () => {
  const authRepo = new PrismaAuthRepo();

  const createApiKeyUseCase = new CreateApiKeyUsecase(authRepo);
  const validateAdminKeyUseCase = new ValidateAdminKeyUsecase(authRepo);

  const createApiKeyController = new CreateApiKeyController(
    createApiKeyUseCase
  );

  return {
    createApiKeyController,
    validateAdminKeyUseCase,
  };
};

import { FastifyInstance } from "fastify";
import { AdminModule } from "../modules/admin.module";
import { adminMiddleware } from "../middlewares/AdminMiddleware";

export async function adminRoutes(app: FastifyInstance) {
  const { createApiKeyController, validateAdminKeyUseCase } = AdminModule();

  const verifyAdmin = adminMiddleware(validateAdminKeyUseCase);

  app.addHook("preHandler", verifyAdmin);

  app.post("/admin/api-keys", (req, reply) =>
    createApiKeyController.handle(req, reply)
  );
}

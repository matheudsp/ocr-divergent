// src/infra/http/routes/verification.routes.ts
import { FastifyInstance } from "fastify";
import { VerificationModule } from "../modules/verification.module";

export async function verificationRoutes(app: FastifyInstance) {
  const { uploadController, getVerificationController } = VerificationModule();

  app.post("/verification", (req, reply) =>
    uploadController.handle(req, reply)
  );

  app.get("/verification/:id", (req, reply) =>
    getVerificationController.handle(req, reply)
  );
}

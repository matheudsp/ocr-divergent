import Fastify from "fastify";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import { loggerOptions } from "@infra/config/logger";
import { verificationRoutes } from "./routes/verification.routes";
import { adminRoutes } from "./routes/admin.routes";
import { env } from "@infra/config/env";
import { Redis } from "ioredis";

export const buildApp = () => {
  const app = Fastify({
    logger: loggerOptions,
    trustProxy: true,
  });

  const redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    connectTimeout: 500,
    maxRetriesPerRequest: 1,
  });
  app.register(rateLimit, {
    timeWindow: "1 minute",
    redis: redisClient,
    max: (req, key) => {
      if (req.headers["x-api-key"]) {
        //30 req/min
        return 30;
      }

      //5 req/min
      return 5;
    },
    keyGenerator: (req) => {
      const apiKey = req.headers["x-api-key"];
      return typeof apiKey === "string" ? apiKey : req.ip;
    },

    errorResponseBuilder: (req, context) => {
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: `Limite de taxa excedido. Tente novamente em breve.`,
      };
    },
    skipOnError: true,
  });

  app.register(multipart, {
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  app.register(verificationRoutes);
  app.register(adminRoutes);

  return app;
};

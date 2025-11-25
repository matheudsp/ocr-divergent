import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "src/infra/config/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

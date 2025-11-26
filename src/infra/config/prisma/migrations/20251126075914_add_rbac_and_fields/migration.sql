-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');

-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT';

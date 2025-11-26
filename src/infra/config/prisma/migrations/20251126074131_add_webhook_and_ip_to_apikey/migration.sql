-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "allowed_ip" TEXT,
ADD COLUMN     "webhook_url" TEXT;

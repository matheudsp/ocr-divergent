/*
  Warnings:

  - The values [RG_FRENTE,RG_VERSO] on the enum `DocumentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DocumentType_new" AS ENUM ('RG', 'CPF', 'CNH', 'COMPROVANTE_RENDA');
ALTER TABLE "verification_requests" ALTER COLUMN "documentType" TYPE "DocumentType_new" USING ("documentType"::text::"DocumentType_new");
ALTER TYPE "DocumentType" RENAME TO "DocumentType_old";
ALTER TYPE "DocumentType_new" RENAME TO "DocumentType";
DROP TYPE "public"."DocumentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "verification_requests" ADD COLUMN     "failReason" TEXT;

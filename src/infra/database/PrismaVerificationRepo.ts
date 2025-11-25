import { IVerificationRepository } from "@core/ports/IVerificationRepository";
import { VerificationRequest } from "@core/domain/VerificationRequest";
import { prisma } from "../config/prisma/prisma";
import { Prisma } from "../config/prisma/generated/client";
import {
  DocumentType,
  ExpectedData,
  VerificationStatus,
  VerificationResult,
} from "@core/dtos/verification.dto";

export class PrismaVerificationRepo implements IVerificationRepository {
  async save(request: VerificationRequest): Promise<void> {
    await prisma.verificationRequest.upsert({
      where: { id: request.id },
      update: {
        status: request.status,
        result: (request.result as unknown as Prisma.InputJsonValue) ?? null,
        updatedAt: request.updatedAt,
      },
      create: {
        id: request.id,
        externalReference: request.externalReference,
        documentType: request.documentType,
        fileKey: request.fileKey,
        expectedData: request.expectedData as unknown as Prisma.InputJsonValue,
        status: request.status,
        result: (request.result as unknown as Prisma.InputJsonValue) ?? null,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<VerificationRequest | null> {
    const raw = await prisma.verificationRequest.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return VerificationRequest.restore({
      id: raw.id,
      externalReference: raw.externalReference!,
      documentType: raw.documentType as DocumentType,
      fileKey: raw.fileKey,
      expectedData: raw.expectedData as unknown as ExpectedData,
      status: raw.status as VerificationStatus,
      result: raw.result
        ? (raw.result as unknown as VerificationResult)
        : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async update(request: VerificationRequest): Promise<void> {
    await prisma.verificationRequest.update({
      where: { id: request.id },
      data: {
        status: request.status,
        result: (request.result as unknown as Prisma.InputJsonValue) ?? null,
        updatedAt: new Date(),
      },
    });
  }
}

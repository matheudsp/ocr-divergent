import {
  IAuthRepository,
  CreateApiKeyInput,
} from "@core/ports/IAuthRepository";
import { prisma } from "../config/prisma/prisma";
import { ApiKey, Role } from "@infra/config/prisma/generated/client";

export class PrismaAuthRepo implements IAuthRepository {
  async findByKey(key: string): Promise<ApiKey | null> {
    return prisma.apiKey.findUnique({
      where: { key },
    });
  }

  async create(data: CreateApiKeyInput): Promise<ApiKey> {
    return prisma.apiKey.create({
      data: {
        client: data.clientName,
        key: data.key,
        role: data.role === "ADMIN" ? Role.ADMIN : Role.CLIENT,
        webhookUrl: data.webhookUrl,
        allowedIp: data.allowedIp,
        isActive: true,
      },
    });
  }
}

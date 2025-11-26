import { env } from "@infra/config/env";
import { PrismaClient, Role } from "@infra/config/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes } from "crypto";

const connectionString = `${env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminKey = `sk_admin_${randomBytes(16).toString("hex")}`;

  console.log("Criando Chave Admin Inicial...");

  const created = await prisma.apiKey.create({
    data: {
      client: "Super Admin (Bootstrap)",
      key: adminKey,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("\n============================================");
  console.log(" ATENÇÃO: GUARDE ESTA CHAVE AGORA!");
  console.log(` KEY: ${created.key}`);
  console.log("============================================\n");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

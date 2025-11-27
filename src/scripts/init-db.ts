import { env } from "@infra/config/env";
import { Client } from "pg";
import { setTimeout } from "node:timers/promises"; // Utilizando API nativa de Promises do Node

async function main() {
  const targetDbName = env.POSTGRES_DB;

  if (!targetDbName) {
    console.error("[InitDB] Erro: POSTGRES_DB não definido.");
    process.exit(1);
  }

  const connectionString = env.DATABASE_URL;
  const dbUrl = new URL(connectionString);
  dbUrl.pathname = "/postgres";

  const MAX_RETRIES = 5;
  const WAIT_MS = 5000;

  let client: Client | null = null;
  let connected = false;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      client = new Client({
        connectionString: dbUrl.toString(),
      });

      // console.info(
      //   `[InitDB] Tentativa de conexão ${attempt}/${MAX_RETRIES} ao host ${dbUrl.hostname}...`
      // );

      await client.connect();
      connected = true;
      break;
    } catch (err: any) {
      // console.warn(
      //   `[InitDB] Falha na tentativa ${attempt}. Banco ainda indisponível. Erro: ${
      //     err.code || err.message
      //   }`
      // );

      if (client) {
        await client.end().catch(() => {});
      }

      if (attempt < MAX_RETRIES) {
        // console.info(
        //   `[InitDB] Aguardando ${WAIT_MS / 1000}s antes de tentar novamente...`
        // );
        await setTimeout(WAIT_MS);
      }
    }
  }

  if (!connected || !client) {
    console.error(
      "[InitDB] Falha crítica: Não foi possível conectar ao banco de dados após várias tentativas."
    );
    process.exit(1);
  }

  try {
    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (checkRes.rowCount === 0) {
      console.info(
        `[InitDB] Banco '${targetDbName}' não encontrado. Criando...`
      );

      if (!/^[a-zA-Z0-9_]+$/.test(targetDbName)) {
        throw new Error(
          "Nome do banco de dados inválido (apenas alfanumérico e _ permitidos)"
        );
      }
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.info(`[InitDB] Banco '${targetDbName}' criado com sucesso!`);
    }
    //  else {
    //   console.info(`[InitDB] Banco '${targetDbName}' já existe.`);
    // }
  } catch (err: any) {
    console.error(
      { err },
      "[InitDB] Falha durante a verificação/criação do banco"
    );
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

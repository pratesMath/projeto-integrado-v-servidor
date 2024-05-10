import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

// Configuração da API para uso do Neon DB (Serverless Postgres);
// WS = Web Socket
import ws from "ws";
import { env } from "../env";

neonConfig.webSocketConstructor = ws;
// Chave do conexão com DB
const connectionString = `${env.DATABASE_URL}`;
// Pool de conexão com DB
const pool = new Pool({ connectionString });
// Adaptador para trabalhar com Prisma ORM e Neon DB
const adapter = new PrismaNeon(pool);
// Exportando variável db para chamadas ao banco de dados
export const db = new PrismaClient({ adapter, log: ["query"] });

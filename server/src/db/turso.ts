import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:alicerce_local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`[Turso DB] Inicializando conexão em: ${url.startsWith('file:') ? 'Banco SQLite Local (' + url + ')' : 'Turso Edge Cloud'}`);

export const db = createClient({
  url,
  authToken,
});

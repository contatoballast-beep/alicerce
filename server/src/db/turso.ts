import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:ballast_local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(
  `[Ballast DB] Inicializando conexão: ${
    url.startsWith('file:') ? 'SQLite local (' + url + ')' : 'Turso Edge Cloud'
  }`
);

export const db = createClient({
  url,
  authToken,
});

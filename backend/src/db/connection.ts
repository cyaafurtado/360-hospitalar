import { Pool } from 'pg';
import { config } from '../config/env';

// SSL: o Postgres do Railway (rede interna) conecta SEM ssl — forçar ssl quebra a conexão.
// Provedores como Supabase/Neon/Render exigem ssl. Detectamos pela URL, e dá pra forçar
// com a env DATABASE_SSL=true|false.
function needsSSL(url: string): boolean {
  if (process.env.DATABASE_SSL === 'true') return true;
  if (process.env.DATABASE_SSL === 'false') return false;
  return /sslmode=require/.test(url) || /[?&]ssl=true/.test(url) || /\.(supabase|neon|render)\./.test(url);
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: needsSSL(config.databaseUrl) ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool PostgreSQL:', err);
});

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (config.nodeEnv === 'development') {
    console.log('query', { text: text.slice(0, 60), duration, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  return pool.connect();
}

export default pool;

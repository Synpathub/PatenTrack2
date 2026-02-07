import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { loadConfig } from '@patentrack/shared';
import * as schema from './schema';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function createPool() {
  if (pool) return pool;
  
  const config = loadConfig();
  pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_SIZE,
    idleTimeoutMillis: 30000,
  });
  
  db = drizzle(pool, { schema });
  return pool;
}

export function getDb() {
  if (!db) {
    createPool();
  }
  return db!;
}

export async function setTenantContext(tenantId: number) {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query('SET LOCAL app.current_tenant_id = $1', [tenantId]);
  } finally {
    client.release();
  }
}

export async function clearTenantContext() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query('RESET app.current_tenant_id');
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

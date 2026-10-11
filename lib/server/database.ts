import 'server-only';

import { neon } from '@neondatabase/serverless';

/**
 * Lazily create the Postgres HTTP driver so a missing DATABASE_URL does not
 * break the first build. Database-backed admin operations fail closed with a
 * clear 503 until a real database is provisioned and configured.
 */
export function getDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;
  if (!/^postgres(?:ql)?:\/\//i.test(connectionString)) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  return neon(connectionString);
}

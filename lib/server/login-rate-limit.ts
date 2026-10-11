import 'server-only';

import { getDatabase } from '@/lib/server/database';
import { DatabaseNotConfiguredError } from '@/lib/server/record-repository';

export const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60;
export const ADMIN_LOGIN_MAX_ATTEMPTS = 8;

interface AttemptRow {
  key_hash: string;
  attempts: number;
  retry_after_seconds: number;
}

export async function consumeAdminLoginAttempts(
  keyHashes: readonly [string, string],
): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  const sql = getDatabase();
  if (!sql) throw new DatabaseNotConfiguredError();

  const rows = await sql`
    WITH purged AS (
      DELETE FROM gwi_admin_login_attempts
      WHERE updated_at < NOW() - INTERVAL '1 day'
      RETURNING key_hash
    ), incoming(key_hash) AS (
      VALUES (${keyHashes[0]}), (${keyHashes[1]})
    ), attempts AS (
      INSERT INTO gwi_admin_login_attempts AS current_attempt
        (key_hash, attempts, window_started_at, updated_at)
      SELECT key_hash, 1, NOW(), NOW()
      FROM incoming
      ON CONFLICT (key_hash) DO UPDATE SET
        attempts = CASE
          WHEN current_attempt.window_started_at <= NOW() - INTERVAL '15 minutes'
            THEN 1
          ELSE current_attempt.attempts + 1
        END,
        window_started_at = CASE
          WHEN current_attempt.window_started_at <= NOW() - INTERVAL '15 minutes'
            THEN NOW()
          ELSE current_attempt.window_started_at
        END,
        updated_at = NOW()
      RETURNING key_hash, attempts, window_started_at
    )
    SELECT key_hash, attempts,
      GREATEST(
        1,
        CEIL(EXTRACT(EPOCH FROM (
          window_started_at + INTERVAL '15 minutes' - NOW()
        )))::int
      ) AS retry_after_seconds
    FROM attempts
  ` as unknown as AttemptRow[];

  const blockedRows = rows.filter((row) => row.attempts > ADMIN_LOGIN_MAX_ATTEMPTS);
  return {
    blocked: blockedRows.length > 0,
    retryAfterSeconds: Math.max(
      1,
      ...blockedRows.map((row) => Number(row.retry_after_seconds) || ADMIN_LOGIN_WINDOW_SECONDS),
    ),
  };
}

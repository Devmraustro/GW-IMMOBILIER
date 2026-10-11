import 'server-only';

import { getDatabase } from '@/lib/server/database';
import type {
  RecordPayload,
  RecordType,
} from '@/lib/server/record-validation';

type SqlClient = Exclude<ReturnType<typeof getDatabase>, null>;

interface StoredRecordRow {
  id: string;
  payload: RecordPayload;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface AdminAuditEvent {
  id: string | number;
  actorEmail: string;
  action: 'create' | 'update' | 'delete';
  entityType: RecordType;
  entityId: string;
  metadata: RecordPayload;
  createdAt: string;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('The Pro database is not configured');
    this.name = 'DatabaseNotConfiguredError';
  }
}

function databaseOrThrow(): SqlClient {
  const sql = getDatabase();
  if (!sql) throw new DatabaseNotConfiguredError();
  return sql;
}

function payloadOf(row: StoredRecordRow): RecordPayload {
  return {
    ...row.payload,
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function listAdminRecords(
  type: RecordType,
  limit = 100,
): Promise<RecordPayload[]> {
  const sql = databaseOrThrow();
  const safeLimit = Math.min(250, Math.max(1, Math.trunc(limit)));
  let rows: StoredRecordRow[];

  // Keep every table identifier literal. User input must never become a SQL
  // identifier, even after an allowlist check.
  switch (type) {
    case 'properties':
      rows = await sql`SELECT id, payload, created_at, updated_at
        FROM gwi_properties ORDER BY updated_at DESC, id ASC LIMIT ${safeLimit}` as unknown as StoredRecordRow[];
      break;
    case 'vehicles':
      rows = await sql`SELECT id, payload, created_at, updated_at
        FROM gwi_vehicles ORDER BY updated_at DESC, id ASC LIMIT ${safeLimit}` as unknown as StoredRecordRow[];
      break;
    case 'inquiries':
      rows = await sql`SELECT id, payload, created_at, updated_at
        FROM gwi_inquiries ORDER BY updated_at DESC, id ASC LIMIT ${safeLimit}` as unknown as StoredRecordRow[];
      break;
    case 'reservations':
      rows = await sql`SELECT id, payload, created_at, updated_at
        FROM gwi_reservations ORDER BY updated_at DESC, id ASC LIMIT ${safeLimit}` as unknown as StoredRecordRow[];
      break;
  }

  return rows.map(payloadOf);
}

export async function createAdminRecord(
  type: RecordType,
  record: RecordPayload,
  actorEmail: string,
): Promise<RecordPayload> {
  const sql = databaseOrThrow();
  const recordId = String(record.id);
  let rows: StoredRecordRow[];

  switch (type) {
    case 'properties':
      rows = await sql`
        WITH saved AS (
          INSERT INTO gwi_properties (id, payload)
          VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'create', ${type}, saved.id, '{}'::jsonb
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'vehicles':
      rows = await sql`
        WITH saved AS (
          INSERT INTO gwi_vehicles (id, payload)
          VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'create', ${type}, saved.id, '{}'::jsonb
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'inquiries':
      rows = await sql`
        WITH saved AS (
          INSERT INTO gwi_inquiries (id, payload)
          VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'create', ${type}, saved.id, '{}'::jsonb
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'reservations':
      rows = await sql`
        WITH saved AS (
          INSERT INTO gwi_reservations (id, payload)
          VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'create', ${type}, saved.id, '{}'::jsonb
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
  }

  if (!rows[0]) throw new Error('Record insert returned no row');
  return payloadOf(rows[0]);
}

export async function updateAdminRecord(
  type: RecordType,
  id: string,
  patch: RecordPayload,
  actorEmail: string,
): Promise<RecordPayload | null> {
  const sql = databaseOrThrow();
  const encodedPatch = JSON.stringify(patch);
  const changedFields = JSON.stringify(Object.keys(patch));
  let rows: StoredRecordRow[];

  switch (type) {
    case 'properties':
      rows = await sql`
        WITH saved AS (
          UPDATE gwi_properties
          SET payload = payload || ${encodedPatch}::jsonb, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'update', ${type}, saved.id,
            jsonb_build_object('changedFields', ${changedFields}::jsonb)
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'vehicles':
      rows = await sql`
        WITH saved AS (
          UPDATE gwi_vehicles
          SET payload = payload || ${encodedPatch}::jsonb, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'update', ${type}, saved.id,
            jsonb_build_object('changedFields', ${changedFields}::jsonb)
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'inquiries':
      rows = await sql`
        WITH saved AS (
          UPDATE gwi_inquiries
          SET payload = payload || ${encodedPatch}::jsonb, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'update', ${type}, saved.id,
            jsonb_build_object('changedFields', ${changedFields}::jsonb)
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
    case 'reservations':
      rows = await sql`
        WITH saved AS (
          UPDATE gwi_reservations
          SET payload = payload || ${encodedPatch}::jsonb, updated_at = NOW()
          WHERE id = ${id}
          RETURNING id, payload, created_at, updated_at
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'update', ${type}, saved.id,
            jsonb_build_object('changedFields', ${changedFields}::jsonb)
          FROM saved RETURNING id
        )
        SELECT id, payload, created_at, updated_at FROM saved
      ` as unknown as StoredRecordRow[];
      break;
  }

  return rows[0] ? payloadOf(rows[0]) : null;
}

export async function deleteAdminRecord(
  type: RecordType,
  id: string,
  actorEmail: string,
): Promise<boolean> {
  const sql = databaseOrThrow();
  let rows: Array<{ id: string }>;

  switch (type) {
    case 'properties':
      rows = await sql`
        WITH deleted AS (
          DELETE FROM gwi_properties WHERE id = ${id} RETURNING id
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'delete', ${type}, deleted.id, '{}'::jsonb
          FROM deleted RETURNING id
        )
        SELECT id FROM deleted
      ` as unknown as Array<{ id: string }>;
      break;
    case 'vehicles':
      rows = await sql`
        WITH deleted AS (
          DELETE FROM gwi_vehicles WHERE id = ${id} RETURNING id
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'delete', ${type}, deleted.id, '{}'::jsonb
          FROM deleted RETURNING id
        )
        SELECT id FROM deleted
      ` as unknown as Array<{ id: string }>;
      break;
    case 'inquiries':
      rows = await sql`
        WITH deleted AS (
          DELETE FROM gwi_inquiries WHERE id = ${id} RETURNING id
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'delete', ${type}, deleted.id, '{}'::jsonb
          FROM deleted RETURNING id
        )
        SELECT id FROM deleted
      ` as unknown as Array<{ id: string }>;
      break;
    case 'reservations':
      rows = await sql`
        WITH deleted AS (
          DELETE FROM gwi_reservations WHERE id = ${id} RETURNING id
        ), logged AS (
          INSERT INTO gwi_admin_audit_events
            (actor_email, action, entity_type, entity_id, metadata)
          SELECT ${actorEmail}, 'delete', ${type}, deleted.id, '{}'::jsonb
          FROM deleted RETURNING id
        )
        SELECT id FROM deleted
      ` as unknown as Array<{ id: string }>;
      break;
  }

  return rows.length > 0;
}

export async function listAdminAuditEvents(limit = 100): Promise<AdminAuditEvent[]> {
  const sql = databaseOrThrow();
  const safeLimit = Math.min(250, Math.max(1, Math.trunc(limit)));
  const rows = await sql`
    SELECT id, actor_email, action, entity_type, entity_id, metadata, created_at
    FROM gwi_admin_audit_events
    ORDER BY id DESC
    LIMIT ${safeLimit}
  ` as unknown as Array<{
    id: string | number;
    actor_email: string;
    action: 'create' | 'update' | 'delete';
    entity_type: RecordType;
    entity_id: string;
    metadata: RecordPayload;
    created_at: string | Date;
  }>;

  return rows.map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function listPublicCatalogRecords(
  type: 'properties' | 'vehicles',
  limit = 120,
): Promise<RecordPayload[]> {
  const sql = databaseOrThrow();
  const safeLimit = Math.min(250, Math.max(1, Math.trunc(limit)));
  let rows: StoredRecordRow[];

  // The public catalogue must never expose demonstration listings.
  if (type === 'properties') {
    rows = await sql`
      SELECT id, payload, created_at, updated_at
      FROM gwi_properties
      WHERE payload->>'isDemo' = 'false'
      ORDER BY updated_at DESC, id ASC
      LIMIT ${safeLimit}
    ` as unknown as StoredRecordRow[];
  } else {
    rows = await sql`
      SELECT id, payload, created_at, updated_at
      FROM gwi_vehicles
      WHERE payload->>'isDemo' = 'false'
      ORDER BY updated_at DESC, id ASC
      LIMIT ${safeLimit}
    ` as unknown as StoredRecordRow[];
  }

  return rows.map(payloadOf);
}

export async function publicListingExists(
  type: 'properties' | 'vehicles',
  id: string,
): Promise<boolean> {
  const sql = databaseOrThrow();
  const rows = type === 'properties'
    ? await sql`
        SELECT id FROM gwi_properties
        WHERE id = ${id} AND payload->>'isDemo' = 'false'
        LIMIT 1
      `
    : await sql`
        SELECT id FROM gwi_vehicles
        WHERE id = ${id} AND payload->>'isDemo' = 'false'
        LIMIT 1
      `;
  return rows.length > 0;
}

export async function createPublicInquiryRecord(
  record: RecordPayload,
): Promise<RecordPayload> {
  const sql = databaseOrThrow();
  const recordId = String(record.id);
  const rows = await sql`
    WITH saved AS (
      INSERT INTO gwi_inquiries (id, payload)
      VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
      RETURNING id, payload, created_at, updated_at
    ), logged AS (
      INSERT INTO gwi_admin_audit_events
        (actor_email, action, entity_type, entity_id, metadata)
      SELECT 'public-form', 'create', 'inquiries', saved.id, '{}'::jsonb
      FROM saved
      RETURNING id
    )
    SELECT id, payload, created_at, updated_at FROM saved
  ` as unknown as StoredRecordRow[];

  if (!rows[0]) throw new Error('Inquiry insert returned no row');
  return payloadOf(rows[0]);
}

export const PUBLIC_INQUIRY_WINDOW_SECONDS = 15 * 60;
export const PUBLIC_INQUIRY_MAX_ATTEMPTS = 5;

export async function consumePublicInquiryAttempt(
  keyHash: string,
): Promise<{ blocked: boolean; retryAfterSeconds: number }> {
  const sql = databaseOrThrow();
  const rows = await sql`
    WITH purged AS (
      DELETE FROM gwi_public_inquiry_attempts
      WHERE updated_at < NOW() - INTERVAL '1 day'
      RETURNING key_hash
    ), attempt AS (
      INSERT INTO gwi_public_inquiry_attempts AS current_attempt
        (key_hash, attempts, window_started_at, updated_at)
      VALUES (${keyHash}, 1, NOW(), NOW())
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
      RETURNING attempts, window_started_at
    )
    SELECT attempts, GREATEST(
      1,
      CEIL(EXTRACT(EPOCH FROM (
        window_started_at + INTERVAL '15 minutes' - NOW()
      )))::int
    ) AS retry_after_seconds
    FROM attempt
  ` as unknown as Array<{ attempts: number; retry_after_seconds: number }>;

  const attempt = rows[0];
  const blocked = Boolean(attempt && attempt.attempts > PUBLIC_INQUIRY_MAX_ATTEMPTS);
  return {
    blocked,
    retryAfterSeconds: Math.max(
      1,
      Number(attempt?.retry_after_seconds) || PUBLIC_INQUIRY_WINDOW_SECONDS,
    ),
  };
}

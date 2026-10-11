import 'server-only';

import { getDatabase } from '@/lib/server/database';
import {
  tableForRecordType,
  type RecordPayload,
  type RecordType,
} from '@/lib/server/record-validation';

type SqlClient = ReturnType<typeof getDatabase> extends infer T ? Exclude<T, null> : never;

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

function databaseOrThrow(): Exclude<ReturnType<typeof getDatabase>, null> {
  const sql = getDatabase();
  if (!sql) throw new DatabaseNotConfiguredError();
  return sql;
}

function trustedTable(sql: SqlClient, type: RecordType) {
  // tableForRecordType only returns a hard-coded allowlisted table name.
  return sql.unsafe(tableForRecordType(type));
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
  const table = trustedTable(sql, type);
  const safeLimit = Math.min(250, Math.max(1, Math.trunc(limit)));
  const rows = await sql`
    SELECT id, payload, created_at, updated_at
    FROM ${table}
    ORDER BY updated_at DESC, id ASC
    LIMIT ${safeLimit}
  ` as unknown as StoredRecordRow[];
  return rows.map(payloadOf);
}

export async function createAdminRecord(
  type: RecordType,
  record: RecordPayload,
  actorEmail: string,
): Promise<RecordPayload> {
  const sql = databaseOrThrow();
  const table = trustedTable(sql, type);
  const recordId = String(record.id);
  const rows = await sql`
    WITH saved AS (
      INSERT INTO ${table} (id, payload)
      VALUES (${recordId}, ${JSON.stringify(record)}::jsonb)
      RETURNING id, payload, created_at, updated_at
    ), logged AS (
      INSERT INTO gwi_admin_audit_events
        (actor_email, action, entity_type, entity_id, metadata)
      SELECT ${actorEmail}, 'create', ${type}, saved.id, '{}'::jsonb
      FROM saved
      RETURNING id
    )
    SELECT id, payload, created_at, updated_at FROM saved
  ` as unknown as StoredRecordRow[];

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
  const table = trustedTable(sql, type);
  const rows = await sql`
    WITH saved AS (
      UPDATE ${table}
      SET payload = payload || ${JSON.stringify(patch)}::jsonb,
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, payload, created_at, updated_at
    ), logged AS (
      INSERT INTO gwi_admin_audit_events
        (actor_email, action, entity_type, entity_id, metadata)
      SELECT ${actorEmail}, 'update', ${type}, saved.id,
             ${JSON.stringify(patch)}::jsonb
      FROM saved
      RETURNING id
    )
    SELECT id, payload, created_at, updated_at FROM saved
  ` as unknown as StoredRecordRow[];

  return rows[0] ? payloadOf(rows[0]) : null;
}

export async function deleteAdminRecord(
  type: RecordType,
  id: string,
  actorEmail: string,
): Promise<boolean> {
  const sql = databaseOrThrow();
  const table = trustedTable(sql, type);
  const rows = await sql`
    WITH deleted AS (
      DELETE FROM ${table}
      WHERE id = ${id}
      RETURNING id
    ), logged AS (
      INSERT INTO gwi_admin_audit_events
        (actor_email, action, entity_type, entity_id, metadata)
      SELECT ${actorEmail}, 'delete', ${type}, deleted.id, '{}'::jsonb
      FROM deleted
      RETURNING id
    )
    SELECT id FROM deleted
  ` as unknown as Array<{ id: string }>;
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

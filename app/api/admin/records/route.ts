import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from '@/lib/admin-session';
import { DatabaseNotConfiguredError } from '@/lib/server/record-repository';
import {
  createAdminRecord,
  deleteAdminRecord,
  listAdminAuditEvents,
  listAdminRecords,
  updateAdminRecord,
} from '@/lib/server/record-repository';
import {
  parseRecordType,
  prepareNewRecord,
  validateNewRecord,
  validateRecordPatch,
} from '@/lib/server/record-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 512 * 1024;
const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function jsonError(code: string, status: number) {
  return NextResponse.json({ error: code }, { status, headers: NO_STORE });
}

function sameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ??
    request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readJsonBody(request: NextRequest): Promise<unknown | null> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) return null;

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const joined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)) as unknown;
  } catch {
    return null;
  }
}

async function requireActor(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token);
  return session?.sub ?? null;
}

function handleStorageError(error: unknown) {
  if (error instanceof DatabaseNotConfiguredError) {
    return jsonError('DATABASE_NOT_CONFIGURED', 503);
  }
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  if (code === '23505') return jsonError('RECORD_ALREADY_EXISTS', 409);
  if (code === '23P01') return jsonError('RESERVATION_DATE_CONFLICT', 409);
  if (code === '22P02' || code === '22023' || code === '22007' || code === '23514') {
    return jsonError('INVALID_RECORD', 400);
  }

  // Keep database exception details (and connection strings) out of the HTTP response.
  console.error('[admin-records] storage operation failed', {
    errorCode: code || 'UNKNOWN',
  });
  return jsonError('STORAGE_OPERATION_FAILED', 500);
}

export async function GET(request: NextRequest) {
  const actor = await requireActor(request);
  if (!actor) return jsonError('UNAUTHENTICATED', 401);

  const params = request.nextUrl.searchParams;
  const typeValue = params.get('type');
  const limitParam = Number(params.get('limit') ?? '100');
  const limit = Number.isFinite(limitParam) ? Math.min(250, Math.max(1, Math.trunc(limitParam))) : 100;

  try {
    if (typeValue === 'audit') {
      const events = await listAdminAuditEvents(limit);
      return NextResponse.json({ events, limit }, { headers: NO_STORE });
    }

    const type = parseRecordType(typeValue);
    if (!type) return jsonError('INVALID_RECORD_TYPE', 400);
    const records = await listAdminRecords(type, limit);
    return NextResponse.json({ records, limit }, { headers: NO_STORE });
  } catch (error) {
    return handleStorageError(error);
  }
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) return jsonError('INVALID_ORIGIN', 403);
  const actor = await requireActor(request);
  if (!actor) return jsonError('UNAUTHENTICATED', 401);

  const body = await readJsonBody(request);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('INVALID_REQUEST', 400);
  }
  const fields = body as { type?: unknown; record?: unknown };
  const type = parseRecordType(fields.type);
  if (!type) return jsonError('INVALID_RECORD_TYPE', 400);

  const validation = validateNewRecord(type, fields.record);
  if (!validation.ok) return jsonError(validation.error, 400);
  const record = prepareNewRecord(type, validation.value);

  try {
    const saved = await createAdminRecord(type, record, actor);
    return NextResponse.json({ record: saved }, { status: 201, headers: NO_STORE });
  } catch (error) {
    return handleStorageError(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!sameOriginRequest(request)) return jsonError('INVALID_ORIGIN', 403);
  const actor = await requireActor(request);
  if (!actor) return jsonError('UNAUTHENTICATED', 401);

  const body = await readJsonBody(request);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('INVALID_REQUEST', 400);
  }
  const fields = body as { type?: unknown; id?: unknown; patch?: unknown };
  const type = parseRecordType(fields.type);
  if (!type) return jsonError('INVALID_RECORD_TYPE', 400);
  if (typeof fields.id !== 'string' || fields.id.trim().length < 1 || fields.id.length > 160) {
    return jsonError('INVALID_RECORD_ID', 400);
  }

  const validation = validateRecordPatch(type, fields.patch);
  if (!validation.ok) return jsonError(validation.error, 400);

  try {
    const saved = await updateAdminRecord(type, fields.id, validation.value, actor);
    if (!saved) return jsonError('RECORD_NOT_FOUND', 404);
    return NextResponse.json({ record: saved }, { headers: NO_STORE });
  } catch (error) {
    return handleStorageError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOriginRequest(request)) return jsonError('INVALID_ORIGIN', 403);
  const actor = await requireActor(request);
  if (!actor) return jsonError('UNAUTHENTICATED', 401);

  const body = await readJsonBody(request);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError('INVALID_REQUEST', 400);
  }
  const fields = body as { type?: unknown; id?: unknown };
  const type = parseRecordType(fields.type);
  if (!type) return jsonError('INVALID_RECORD_TYPE', 400);
  if (typeof fields.id !== 'string' || fields.id.trim().length < 1 || fields.id.length > 160) {
    return jsonError('INVALID_RECORD_ID', 400);
  }

  try {
    const deleted = await deleteAdminRecord(type, fields.id, actor);
    if (!deleted) return jsonError('RECORD_NOT_FOUND', 404);
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    return handleStorageError(error);
  }
}

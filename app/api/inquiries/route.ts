import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { isValidEmail, isValidPhone } from '@/lib/validation';
import { DatabaseNotConfiguredError } from '@/lib/server/record-repository';
import {
  consumePublicInquiryAttempt,
  createPublicInquiryRecord,
  publicListingExists,
} from '@/lib/server/record-repository';
import {
  prepareNewRecord,
  validateNewRecord,
  type RecordPayload,
} from '@/lib/server/record-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function errorResponse(code: string, status: number, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(
    { error: code },
    { status, headers: { ...NO_STORE, ...extraHeaders } },
  );
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
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) return errorResponse('INVALID_ORIGIN', 403);
  const body = await readJsonBody(request);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return errorResponse('INVALID_REQUEST', 400);
  }

  const fields = body as Record<string, unknown>;
  const acceptedFields = new Set([
    'type', 'fullName', 'phone', 'email', 'message',
    'propertyId', 'vehicleId', 'startDate', 'endDate',
  ]);
  if (Object.keys(fields).some((key) => !acceptedFields.has(key))) {
    return errorResponse('UNSUPPORTED_FIELD', 400);
  }
  const type = fields.type;
  if (type !== 'property' && type !== 'vehicle' && type !== 'general') {
    return errorResponse('INVALID_INQUIRY_TYPE', 400);
  }

  const fullName = typeof fields.fullName === 'string' ? fields.fullName.trim() : '';
  const phone = typeof fields.phone === 'string' ? fields.phone.trim() : '';
  const message = typeof fields.message === 'string' ? fields.message.trim() : '';
  if (fields.email !== undefined && typeof fields.email !== 'string') {
    return errorResponse('INVALID_EMAIL', 400);
  }
  if (fields.propertyId !== undefined && typeof fields.propertyId !== 'string') {
    return errorResponse('INVALID_LISTING_REFERENCE', 400);
  }
  if (fields.vehicleId !== undefined && typeof fields.vehicleId !== 'string') {
    return errorResponse('INVALID_LISTING_REFERENCE', 400);
  }
  if (fields.startDate !== undefined && typeof fields.startDate !== 'string') {
    return errorResponse('INVALID_DATE_RANGE', 400);
  }
  if (fields.endDate !== undefined && typeof fields.endDate !== 'string') {
    return errorResponse('INVALID_DATE_RANGE', 400);
  }

  const email = typeof fields.email === 'string' ? fields.email.trim() || undefined : undefined;
  const propertyId = typeof fields.propertyId === 'string' ? fields.propertyId.trim() : undefined;
  const vehicleId = typeof fields.vehicleId === 'string' ? fields.vehicleId.trim() : undefined;
  const startDate = typeof fields.startDate === 'string' && fields.startDate.trim()
    ? fields.startDate.trim()
    : undefined;
  const endDate = typeof fields.endDate === 'string' && fields.endDate.trim()
    ? fields.endDate.trim()
    : undefined;
  if (
    fullName.length < 2 ||
    fullName.length > 160 ||
    phone.length > 80 ||
    message.length < 10 ||
    message.length > 5000 ||
    (email !== undefined && email.length > 320) ||
    (email !== undefined && !isValidEmail(email)) ||
    !isValidPhone(phone) ||
    (propertyId !== undefined && propertyId.length > 160) ||
    (vehicleId !== undefined && vehicleId.length > 160)
  ) return errorResponse('INVALID_CONTACT_DETAILS', 400);

  const todayUtc = new Date().toISOString().slice(0, 10);
  if (startDate && startDate < todayUtc) {
    return errorResponse('DATE_IN_PAST', 400);
  }

  if (
    (type === 'property' && (!propertyId || vehicleId !== undefined)) ||
    (type === 'vehicle' && (!vehicleId || propertyId !== undefined)) ||
    (type === 'general' && (propertyId !== undefined || vehicleId !== undefined))
  ) return errorResponse('INVALID_LISTING_REFERENCE', 400);

  const clientIp =
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    'unknown';
  const ipHash = createHash('sha256').update('public-inquiry:' + clientIp, 'utf8').digest('hex');

  try {
    const rate = await consumePublicInquiryAttempt(ipHash);
    if (rate.blocked) {
      return errorResponse('TOO_MANY_REQUESTS', 429, {
        'Retry-After': String(rate.retryAfterSeconds),
      });
    }

    if (type === 'property' && propertyId &&
        !(await publicListingExists('properties', propertyId))) {
      return errorResponse('LISTING_NOT_FOUND', 404);
    }
    if (type === 'vehicle' && vehicleId &&
        !(await publicListingExists('vehicles', vehicleId))) {
      return errorResponse('LISTING_NOT_FOUND', 404);
    }

    const candidate: RecordPayload = {
      type,
      status: 'new',
      channel: 'form',
      fullName,
      phone,
      message,
      ...(email ? { email } : {}),
      ...(propertyId ? { propertyId } : {}),
      ...(vehicleId ? { vehicleId } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
    };
    const validation = validateNewRecord('inquiries', candidate);
    if (!validation.ok) return errorResponse(validation.error, 400);

    const record = prepareNewRecord('inquiries', validation.value);
    const saved = await createPublicInquiryRecord(record);
    return NextResponse.json({ inquiry: saved }, { status: 201, headers: NO_STORE });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return errorResponse('DATABASE_NOT_CONFIGURED', 503);
    }
    console.error('[public-inquiry] submission failed', {
      errorCode: error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: unknown }).code)
        : 'UNKNOWN',
    });
    return errorResponse('SUBMISSION_UNAVAILABLE', 503);
  }
}

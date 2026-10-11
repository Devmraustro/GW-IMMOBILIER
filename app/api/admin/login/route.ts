import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-session';
import { DatabaseNotConfiguredError } from '@/lib/server/record-repository';
import { consumeAdminLoginAttempts } from '@/lib/server/login-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function constantTimeTextEqual(left: string, right: string): boolean {
  const leftDigest = createHash('sha256').update(left, 'utf8').digest();
  const rightDigest = createHash('sha256').update(right, 'utf8').digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function responseError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: NO_STORE },
  );
}

async function readBoundedJson(request: NextRequest, maxBytes: number): Promise<unknown | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
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
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
    ?? request.headers.get('host');
  if (!origin || !host) return responseError('INVALID_ORIGIN', 403);
  try {
    if (new URL(origin).host !== host) return responseError('INVALID_ORIGIN', 403);
  } catch {
    return responseError('INVALID_ORIGIN', 403);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return responseError('UNSUPPORTED_MEDIA_TYPE', 415);
  }
  const body = await readBoundedJson(request, 8192);
  if (!body) return responseError('INVALID_REQUEST', 400);
  if (!body || typeof body !== 'object') return responseError('INVALID_REQUEST', 400);
  const fields = body as { email?: unknown; password?: unknown };
  if (typeof fields.email !== 'string' || typeof fields.password !== 'string') {
    return responseError('INVALID_REQUEST', 400);
  }
  if (fields.email.length > 320 || fields.password.length > 1024) {
    return responseError('INVALID_REQUEST', 400);
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (
    !configuredEmail ||
    !configuredPassword ||
    configuredPassword.length < 16 ||
    !sessionSecret ||
    sessionSecret.length < 32
  ) return responseError('ADMIN_AUTH_NOT_CONFIGURED', 503);

  const clientIp =
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    'unknown';
  const normalizedSubmittedEmail = fields.email.trim().toLowerCase();
  const ipKeyHash = createHash('sha256').update('ip:' + clientIp, 'utf8').digest('hex');
  const accountKeyHash = createHash('sha256')
    .update('account:' + clientIp + ':' + normalizedSubmittedEmail, 'utf8')
    .digest('hex');

  try {
    const rateLimit = await consumeAdminLoginAttempts([ipKeyHash, accountKeyHash]);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: 'TOO_MANY_ATTEMPTS' },
        {
          status: 429,
          headers: { ...NO_STORE, 'Retry-After': String(rateLimit.retryAfterSeconds) },
        },
      );
    }
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return responseError('DATABASE_NOT_CONFIGURED', 503);
    }
    console.error('[admin-login] rate limiter unavailable');
    return responseError('ADMIN_AUTH_UNAVAILABLE', 503);
  }

  const emailMatches = constantTimeTextEqual(normalizedSubmittedEmail, configuredEmail);
  const passwordMatches = constantTimeTextEqual(fields.password, configuredPassword);
  if (!emailMatches || !passwordMatches) return responseError('INVALID_CREDENTIALS', 401);

  try {
    const token = await createAdminSessionToken(configuredEmail);
    const response = NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch {
    return responseError('ADMIN_AUTH_NOT_CONFIGURED', 503);
  }
}

export const ADMIN_SESSION_COOKIE = 'gwi_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

export interface AdminSessionClaims {
  sub: string;
  role: 'admin';
  iat: number;
  exp: number;
}

const encoder = new TextEncoder();

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid base64url value');
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function configuredSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createAdminSessionToken(email: string, now = Date.now()): Promise<string> {
  const secret = configuredSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters');

  const issuedAt = Math.floor(now / 1000);
  const payload: AdminSessionClaims = {
    sub: email.trim().toLowerCase(),
    role: 'admin',
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_SECONDS,
  };
  const encodedPayload = encodeBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await importHmacKey(secret);
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(encodedPayload)),
  );
  return encodedPayload + '.' + encodeBase64Url(signature);
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  now = Date.now(),
): Promise<AdminSessionClaims | null> {
  try {
    const secret = configuredSecret();
    const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!secret || !configuredEmail || !token || token.length > 2048) return null;

    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const encodedPayload = parts[0];
    const signature = decodeBase64Url(parts[1]);
    // Copy into an ArrayBuffer-backed view so TypeScript's Web Crypto BufferSource
    // types are satisfied even when Uint8Array is parameterized by ArrayBufferLike.
    const signatureBuffer = new ArrayBuffer(signature.byteLength);
    new Uint8Array(signatureBuffer).set(signature);
    const key = await importHmacKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(encodedPayload),
    );
    if (!valid) return null;

    const payload: unknown = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload)),
    );
    if (!payload || typeof payload !== 'object') return null;

    const claims = payload as Partial<AdminSessionClaims>;
    const nowSeconds = Math.floor(now / 1000);
    if (
      typeof claims.sub !== 'string' ||
      claims.sub.trim().toLowerCase() !== configuredEmail ||
      claims.role !== 'admin' ||
      !Number.isSafeInteger(claims.iat) ||
      !Number.isSafeInteger(claims.exp) ||
      (claims.iat as number) > nowSeconds + 60 ||
      (claims.exp as number) <= nowSeconds ||
      (claims.exp as number) <= (claims.iat as number) ||
      (claims.exp as number) - (claims.iat as number) > ADMIN_SESSION_TTL_SECONDS
    ) return null;

    return claims as AdminSessionClaims;
  } catch {
    return null;
  }
}

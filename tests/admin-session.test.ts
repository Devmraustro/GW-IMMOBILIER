import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin-session';

const previousSecret = process.env.ADMIN_SESSION_SECRET;
const previousEmail = process.env.ADMIN_EMAIL;

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-32-characters-minimum';
  process.env.ADMIN_EMAIL = 'owner@example.com';
});

afterEach(() => {
  if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
  else process.env.ADMIN_SESSION_SECRET = previousSecret;
  if (previousEmail === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = previousEmail;
});

describe('admin session tokens', () => {
  it('signs a token and verifies the configured administrator', async () => {
    const now = 1_800_000_000_000;
    const token = await createAdminSessionToken('OWNER@example.com', now);
    const claims = await verifyAdminSessionToken(token, now + 1_000);
    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe('owner@example.com');
    expect(claims?.role).toBe('admin');
    if (!claims) throw new Error('Expected a valid administrator session');
    expect(claims.exp - claims.iat).toBe(ADMIN_SESSION_TTL_SECONDS);
  });

  it('rejects a tampered signature', async () => {
    const token = await createAdminSessionToken('owner@example.com');
    const parts = token.split('.');
    const changedSignature = (parts[1][0] === 'A' ? 'B' : 'A') + parts[1].slice(1);
    await expect(verifyAdminSessionToken(parts[0] + '.' + changedSignature)).resolves.toBeNull();
  });

  it('rejects an expired token', async () => {
    const issuedAt = 1_700_000_000_000;
    const token = await createAdminSessionToken('owner@example.com', issuedAt);
    await expect(
      verifyAdminSessionToken(token, issuedAt + (ADMIN_SESSION_TTL_SECONDS + 1) * 1000),
    ).resolves.toBeNull();
  });

  it('rejects a token for a different configured administrator', async () => {
    const token = await createAdminSessionToken('owner@example.com');
    process.env.ADMIN_EMAIL = 'another-owner@example.com';
    await expect(verifyAdminSessionToken(token)).resolves.toBeNull();
  });

  it('fails closed when the session secret is missing', async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    await expect(verifyAdminSessionToken('anything')).resolves.toBeNull();
  });
});

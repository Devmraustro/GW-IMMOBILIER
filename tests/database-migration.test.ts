import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  path.resolve(process.cwd(), 'db/migrations/0001_initial.sql'),
  'utf8',
);

describe('PostgreSQL initial migration', () => {
  it('uses a valid dollar-quoted DO block', () => {
    expect(migration).toMatch(/DO \$\$[\s\S]*?END \$\$;/);
    expect(migration.match(/DO \$\$/g)).toHaveLength(1);
    expect(migration.match(/END \$\$;/g)).toHaveLength(1);
    expect(migration).not.toMatch(/DO \$\n/);
  });

  it('creates every business and security table used by the server', () => {
    for (const table of [
      'gwi_properties',
      'gwi_vehicles',
      'gwi_inquiries',
      'gwi_reservations',
      'gwi_admin_login_attempts',
      'gwi_public_inquiry_attempts',
      'gwi_admin_audit_events',
    ]) {
      expect(migration).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it('prevents overlapping non-cancelled reservations at database level', () => {
    expect(migration).toContain('CREATE EXTENSION IF NOT EXISTS btree_gist');
    expect(migration).toContain('make_date(');
    expect(migration).not.toContain("(payload->>'startDate')::date");
    expect(migration).not.toContain("(payload->>'endDate')::date");
    expect(migration).toContain('CONSTRAINT gwi_reservations_valid_range');
    expect(migration).toContain('CONSTRAINT gwi_reservations_valid_finances');
    expect(migration).toContain('CONSTRAINT gwi_reservations_no_overlap');
    expect(migration).toContain("daterange(start_date, end_date, '[)') WITH &&");
    expect(migration).toContain("WHERE (reservation_status <> 'cancelled')");
  });

  it('uses server-managed JSON record IDs and enforces unique slugs', () => {
    expect(migration).toContain('id TEXT PRIMARY KEY');
    expect(migration).toContain('gwi_properties_slug_idx');
    expect(migration).toContain('gwi_vehicles_slug_idx');
  });

  it('defines rate-limit windows and cleanup indexes', () => {
    expect(migration).toContain('gwi_admin_login_attempts_updated_idx');
    expect(migration).toContain('gwi_public_inquiry_attempts_updated_idx');
    expect(migration).toContain('window_started_at TIMESTAMPTZ');
    expect(migration).toContain('updated_at TIMESTAMPTZ');
  });
});

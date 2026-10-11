-- GW Immobilier Pro initial schema.
-- Apply once to the target PostgreSQL database before configuring DATABASE_URL.
-- Business payloads are stored as JSONB to preserve the existing domain model
-- while keeping record identity, uniqueness and audit history server-managed.

BEGIN;

CREATE TABLE IF NOT EXISTS gwi_properties (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gwi_vehicles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gwi_inquiries (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gwi_reservations (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gwi_admin_audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type TEXT NOT NULL CHECK (
    entity_type IN ('properties', 'vehicles', 'inquiries', 'reservations')
  ),
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(metadata) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gwi_properties_category_idx
  ON gwi_properties ((payload->>'category'));
CREATE INDEX IF NOT EXISTS gwi_properties_availability_idx
  ON gwi_properties ((payload #>> '{availability,status}'));
CREATE INDEX IF NOT EXISTS gwi_vehicles_available_idx
  ON gwi_vehicles ((payload->>'available'));
CREATE INDEX IF NOT EXISTS gwi_inquiries_status_idx
  ON gwi_inquiries ((payload->>'status'));
CREATE INDEX IF NOT EXISTS gwi_inquiries_created_idx
  ON gwi_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS gwi_reservations_item_dates_idx
  ON gwi_reservations (
    (payload->>'itemId'),
    (payload->>'startDate'),
    (payload->>'endDate')
  );
CREATE INDEX IF NOT EXISTS gwi_reservations_status_idx
  ON gwi_reservations ((payload->>'status'));
CREATE INDEX IF NOT EXISTS gwi_audit_entity_idx
  ON gwi_admin_audit_events (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS gwi_audit_actor_idx
  ON gwi_admin_audit_events (actor_email, created_at DESC);

COMMIT;

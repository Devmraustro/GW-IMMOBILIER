-- GW Immobilier Pro initial schema.
-- Apply once to the target PostgreSQL database before configuring DATABASE_URL.
-- Business payloads are stored as JSONB to preserve the existing domain model
-- while keeping record identity, uniqueness and audit history server-managed.

BEGIN;

CREATE TABLE IF NOT EXISTS gwi_properties (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gwi_vehicles (
  id TEXT PRIMARY KEY,
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

-- Prevent double-booking in the database itself, including concurrent API requests.
-- btree_gist supplies equality operator classes for text columns in the exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE gwi_reservations
  ADD COLUMN IF NOT EXISTS item_id TEXT
    GENERATED ALWAYS AS (payload->>'itemId') STORED,
  ADD COLUMN IF NOT EXISTS reservation_kind TEXT
    GENERATED ALWAYS AS (payload->>'kind') STORED,
  ADD COLUMN IF NOT EXISTS start_date DATE
    GENERATED ALWAYS AS (
      make_date(
        substring(payload->>'startDate' from 1 for 4)::INTEGER,
        substring(payload->>'startDate' from 6 for 2)::INTEGER,
        substring(payload->>'startDate' from 9 for 2)::INTEGER
      )
    ) STORED,
  ADD COLUMN IF NOT EXISTS end_date DATE
    GENERATED ALWAYS AS (
      make_date(
        substring(payload->>'endDate' from 1 for 4)::INTEGER,
        substring(payload->>'endDate' from 6 for 2)::INTEGER,
        substring(payload->>'endDate' from 9 for 2)::INTEGER
      )
    ) STORED,
  ADD COLUMN IF NOT EXISTS reservation_status TEXT
    GENERATED ALWAYS AS (payload->>'status') STORED;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gwi_reservations_valid_range'
      AND conrelid = 'gwi_reservations'::regclass
  ) THEN
    ALTER TABLE gwi_reservations
      ADD CONSTRAINT gwi_reservations_valid_range
      CHECK (
        item_id IS NOT NULL AND
        reservation_kind IS NOT NULL AND
        reservation_kind IN ('property', 'vehicle') AND
        reservation_status IS NOT NULL AND
        reservation_status IN ('upcoming', 'ongoing', 'completed', 'cancelled') AND
        start_date IS NOT NULL AND end_date IS NOT NULL AND
        start_date < end_date
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gwi_reservations_valid_finances'
      AND conrelid = 'gwi_reservations'::regclass
  ) THEN
    ALTER TABLE gwi_reservations
      ADD CONSTRAINT gwi_reservations_valid_finances
      CHECK (
        jsonb_typeof(payload->'amount') = 'number' AND
        jsonb_typeof(payload->'deposit') = 'number' AND
        (payload->>'amount')::numeric >= 0 AND
        (payload->>'deposit')::numeric >= 0 AND
        (payload->>'deposit')::numeric <= (payload->>'amount')::numeric
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'gwi_reservations_no_overlap'
      AND conrelid = 'gwi_reservations'::regclass
  ) THEN
    ALTER TABLE gwi_reservations
      ADD CONSTRAINT gwi_reservations_no_overlap
      EXCLUDE USING gist (
        item_id WITH =,
        reservation_kind WITH =,
        daterange(start_date, end_date, '[)') WITH &&
      )
      WHERE (reservation_status <> 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS gwi_admin_login_attempts (
  key_hash TEXT PRIMARY KEY CHECK (length(key_hash) = 64),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gwi_admin_login_attempts_updated_idx
  ON gwi_admin_login_attempts (updated_at);

CREATE TABLE IF NOT EXISTS gwi_public_inquiry_attempts (
  key_hash TEXT PRIMARY KEY CHECK (length(key_hash) = 64),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts > 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gwi_public_inquiry_attempts_updated_idx
  ON gwi_public_inquiry_attempts (updated_at);

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

CREATE UNIQUE INDEX IF NOT EXISTS gwi_properties_slug_idx
  ON gwi_properties ((payload->>'slug'));
CREATE UNIQUE INDEX IF NOT EXISTS gwi_vehicles_slug_idx
  ON gwi_vehicles ((payload->>'slug'));

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

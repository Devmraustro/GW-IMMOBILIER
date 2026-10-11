-- Run after db/migrations/0001_initial.sql against a disposable PostgreSQL database.
-- Verifies the server-enforced half-open, per-item reservation exclusion rule.

INSERT INTO gwi_reservations (id, payload)
VALUES (
  'r-smoke-base',
  '{"itemId":"asset-1","kind":"property","startDate":"2026-10-12","endDate":"2026-10-15","status":"upcoming","amount":100000,"deposit":20000}'::jsonb
);

DO $$
DECLARE
  overlap_rejected BOOLEAN := FALSE;
BEGIN
  BEGIN
    INSERT INTO gwi_reservations (id, payload)
    VALUES (
      'r-smoke-overlap',
      '{"itemId":"asset-1","kind":"property","startDate":"2026-10-14","endDate":"2026-10-18","status":"upcoming","amount":100000,"deposit":20000}'::jsonb
    );
  EXCEPTION WHEN exclusion_violation THEN
    overlap_rejected := TRUE;
  END;

  IF NOT overlap_rejected THEN
    RAISE EXCEPTION 'Overlapping active reservations were accepted';
  END IF;
END $$;

-- A reservation beginning at the previous range's end is allowed ([start, end)).
INSERT INTO gwi_reservations (id, payload)
VALUES (
  'r-smoke-adjacent',
  '{"itemId":"asset-1","kind":"property","startDate":"2026-10-15","endDate":"2026-10-17","status":"upcoming","amount":100000,"deposit":20000}'::jsonb
);

-- Cancelled reservations do not block a new booking.
INSERT INTO gwi_reservations (id, payload)
VALUES (
  'r-smoke-cancelled',
  '{"itemId":"asset-1","kind":"property","startDate":"2026-10-13","endDate":"2026-10-14","status":"cancelled","amount":100000,"deposit":0}'::jsonb
);

-- The same ID may exist in a different resource kind (property vs vehicle).
INSERT INTO gwi_reservations (id, payload)
VALUES (
  'r-smoke-vehicle',
  '{"itemId":"asset-1","kind":"vehicle","startDate":"2026-10-13","endDate":"2026-10-14","status":"upcoming","amount":100000,"deposit":20000}'::jsonb
);

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM gwi_reservations WHERE id LIKE 'r-smoke-%') <> 4 THEN
    RAISE EXCEPTION 'Unexpected smoke-test reservation count';
  END IF;
END $$;

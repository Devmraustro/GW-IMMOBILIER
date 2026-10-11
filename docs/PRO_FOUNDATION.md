# GW Immobilier Pro — implementation and release status

This document describes the current development branch, `pro/phase-1-foundation`. It is not a declaration that the hosted application is ready for customer use.

## Implemented in the branch

- Next.js 16 with the `proxy.ts` convention protecting `/admin/*` and `/api/admin/*`.
- Administrator sign-in using server-only `ADMIN_EMAIL` and `ADMIN_PASSWORD`, with HMAC-SHA-256 session tokens, an eight-hour expiry, HttpOnly/SameSite cookie settings, and Secure cookies in production.
- Database-backed login throttling: eight attempts per 15-minute window per IP and IP+account hash. Missing database/credentials fail closed.
- PostgreSQL schema for property listings, vehicles, inquiries, reservations, audit events, and admin/public rate-limit counters.
- Server-side admin CRUD at `/api/admin/records`, with collection/field allowlists, payload validation, bounded JSON bodies, same-origin mutation checks, private/no-store responses, server-generated IDs/timestamps and audit records.
- A PostgreSQL exclusion constraint prevents overlapping active reservations for the same item, including simultaneous concurrent inserts.
- Public catalog reads at `GET /api/catalog?type=properties|vehicles&limit=120`. The route returns only listings whose server-stored `isDemo` is `false`; demo/seed records are not published by this endpoint.
- Public inquiry submissions at `POST /api/inquiries`. The handler validates same-origin JSON, enforces a small body limit and accepted field list, checks published listing references, validates the inquiry domain model, rate-limits submissions by IP, and saves the lead in PostgreSQL. It does not send e-mail or SMS notifications.
- The store adapter loads public listings and admin records through those APIs when live/database mode is enabled. It fails closed: if the database cannot be reached, it shows an unavailable state and does not fall back to seed records.
- French and Arabic copy for database loading/errors and form failures.
- Unit tests for session tokens, record validation and public inquiry domain validation.

## Environment configuration

Configure secrets only in the target hosting provider's private environment settings. Never commit these values and never prefix secrets with `NEXT_PUBLIC_`.

- `DATABASE_URL`: a connection string for a Neon PostgreSQL database. This branch uses `@neondatabase/serverless`; provision/configure Neon or deliberately replace the driver before choosing a different PostgreSQL provider.
- `ADMIN_EMAIL`: the administrator's e-mail address.
- `ADMIN_PASSWORD`: a unique password of at least 16 characters.
- `ADMIN_SESSION_SECRET`: a randomly generated secret of at least 32 characters. Generate one locally with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

- `NEXT_PUBLIC_CATALOG_MODE`: optional. In development, an empty value uses demo fixtures; in production, an empty value defaults to database mode. Use `demo` only for an explicitly isolated internal prototype/preview, never on a public customer-facing deployment.

No real database connection or admin credentials have been provisioned in the hosted project yet. The migration has not been applied to a real database, so database-backed routes deliberately return a configuration/unavailable response until this is completed.

## Database setup

1. Provision a Neon PostgreSQL database after reviewing its plan and billing terms.
2. Add its connection URL as private `DATABASE_URL` in the same hosting environment that will run the application.
3. Apply `db/migrations/0001_initial.sql` using the provider's SQL editor or a secure local PostgreSQL client. Apply it before importing any data.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in private hosting variables. Do not send these secrets in chat or commit them.
5. In a protected preview, test login, unauthorized access, listing/vehicle CRUD, public inquiry submission, rate limits, audit entries and reservation conflict handling against the real database.

## API contract

Admin routes require a valid admin session.

- `GET /api/admin/records?type=properties|vehicles|inquiries|reservations&limit=100`
- `GET /api/admin/records?type=audit&limit=100`
- `POST /api/admin/records` with `{ "type": "...", "record": { ... } }`
- `PATCH /api/admin/records` with `{ "type": "...", "id": "...", "patch": { ... } }`
- `DELETE /api/admin/records` with `{ "type": "...", "id": "..." }`

Public routes:

- `GET /api/catalog?type=properties|vehicles&limit=120` returns non-demo records only.
- `POST /api/inquiries` accepts customer inquiry fields. `status` and `channel` are set by the server and cannot be supplied by the client.

All responses are private/no-store. The database uses JSONB payloads shaped like the existing UI models during this migration. Audit metadata intentionally avoids copying customer message/contact data.

## Remaining work before customer production

- The real database, private variables and migration still need to be provisioned and tested; the current hosted Vercel project remains paused/blocked.
- Latest CI must pass on the final branch head. The most recent complete baseline passed before the current public persistence and framework/security changes, so it does not validate those later changes.
- The dependency audit still reported nine vulnerabilities (seven high, two moderate) after the compatible dependency refresh. Review/remediate these before release; Tailwind v3's transitive dependency tree remains the main outstanding issue.
- Add private object storage for uploaded property/vehicle media, database backup/restore validation, and production monitoring.
- Validate public catalog rendering/detail metadata with a real database; enable customer form notifications if the business requires them.
- Replace placeholder contact information with owner-verified details.
- Staff account/role management, multi-tenant isolation and operator/admin roles are not implemented.

## Release gate

Do not merge to `main`, deploy to public customer domains or unpause Vercel until all of the following are true:

- TypeScript, ESLint, unit tests and production build pass on the exact final commit.
- The remaining dependency vulnerabilities have been remediated or explicitly accepted based on documented risk.
- Private database/admin environment variables are configured and the migration is applied.
- Real-database smoke tests pass for login, unauthorized requests, catalog publication, CRUD, audit, rate limiting, and overlapping reservation rejection.
- Contact details are verified, and no demo data or demo mode is exposed to customers.

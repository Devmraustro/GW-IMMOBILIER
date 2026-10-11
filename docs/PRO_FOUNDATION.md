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
- Unit tests for session tokens, record validation, public inquiry domain validation, PostgreSQL migration structure and reservation invariants.

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

A dedicated Neon project named `gw-immobilier-prod` has been provisioned in AWS Europe Central (Frankfurt), using PostgreSQL 17 and the `gwimmobilier` database. The initial migration has been applied successfully. Live validation confirmed all seven project tables and the three reservation integrity constraints. A live-database smoke test verified that overlapping active reservations are rejected, adjacent dates are accepted, cancelled reservations do not block booking, and property and vehicle reservations are isolated. The `DATABASE_URL` variable is configured in Vercel as a sensitive variable for Production and Preview. The private variables `ADMIN_EMAIL` and `ADMIN_PASSWORD` have now been configured as sensitive values for Production and Preview, alongside `DATABASE_URL` and a cryptographically random `ADMIN_SESSION_SECRET`. The supplied administrator password is project-identifying and predictable; replace it with a unique random password before allowing public production access. The Vercel project remains blocked, and no public release has been enabled.

## Database setup

1. **Complete:** a dedicated Neon PostgreSQL project and database have been provisioned for GW Immobilier on PostgreSQL 17 in Frankfurt.
2. **Complete:** `DATABASE_URL` is set as a sensitive Vercel environment variable for Production and Preview; its value is not stored in the repository.
3. **Complete:** `db/migrations/0001_initial.sql` has been applied, and live-database schema and reservation-constraint smoke checks passed.
4. **Configured, but strengthen before release:** `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set in Vercel as sensitive variables for Production and Preview. The currently supplied password is predictable because it uses the project context and year; replace it with a unique randomly generated password before opening public production access. `ADMIN_SESSION_SECRET` is also configured as a sensitive Vercel variable. Never send passwords or secrets in chat or commit them.
5. **Required after deployment access is authorized:** in a protected QA deployment, test login, unauthorized access, listing/vehicle CRUD, public inquiry submission, rate limits, audit entries and reservation conflict handling against the real database.

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

- Neon and its schema are provisioned, and `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are configured as sensitive variables in the original Vercel project. The current password should be replaced with a unique random password before release. The original `gw-immobilier` project remains blocked and its existing domains have not been reopened.
- A separate `gw-immobilier-qa` Vercel project has been created for testing. Vercel Authentication is enabled for all deployments, and no custom domains are attached. A deployment of the development branch reached `READY`. However, the current Vercel integration cannot authorize a protection-bypass request for this newly created project, so its live HTTP endpoints have not yet been tested. Update/reauthorize Vercel access for the QA project, or use an owner-authorized Vercel session/CLI, before the live end-to-end gate.
- Latest complete CI on the current implementation passed: TypeScript, ESLint, 130 unit tests, production build, PostgreSQL migration applied twice (idempotency), and a real PostgreSQL smoke test for overlap, adjacent dates, cancelled reservations and resource kind.
- The latest npm audit on that CI commit reported zero vulnerabilities (0 critical, 0 high, 0 moderate). The workflow now fails if `npm audit --audit-level=moderate` detects an unresolved vulnerability.
- Add private object storage for uploaded property/vehicle media, database backup/restore validation, and production monitoring.
- Validate public catalog rendering/detail metadata with a real database; enable customer form notifications if the business requires them.
- Replace placeholder contact information with owner-verified details.
- Staff account/role management, multi-tenant isolation and operator/admin roles are not implemented.

## Release gate

Do not merge to `main`, deploy to public customer domains or unpause Vercel until all of the following are true:

- TypeScript, ESLint, unit tests and production build pass on the exact final commit.
- The strict npm audit gate passes on the exact final commit.
- The sensitive `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` variables are configured for Production and Preview, and the migration is applied. Replace the predictable administrator password, ensure access to the protected QA deployment, and pass the live end-to-end tests before release.
- Real-database smoke tests pass for login, unauthorized requests, catalog publication, CRUD, audit, rate limiting, amount/deposit constraints, and overlapping reservation rejection.
- Contact details are verified, and no demo data or demo mode is exposed to customers.

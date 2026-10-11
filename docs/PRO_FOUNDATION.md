# GW Immobilier Pro — foundation status

## Delivered in this phase

- Server-side admin login using private environment credentials.
- Signed HMAC-SHA-256 sessions with an eight-hour expiry.
- HttpOnly, SameSite=Strict session cookie; Secure in production.
- Middleware protection for every `/admin/*` route and every `/api/admin/*` route, except the intentionally public login/logout endpoints.
- Logout action on desktop and mobile dashboard navigation.
- FR/AR sign-in labels and admin error messages.
- A PostgreSQL schema for properties, vehicles, inquiries, reservations and admin audit events.
- An authenticated CRUD API at `/api/admin/records` with allowlisted collection names, input validation, bounded JSON request bodies and an audit entry for each create/update/delete.
- Unit tests for session tokens and record validation.

## Required private environment variables

Configure these under Vercel → Project → Settings → Environment Variables. Never prefix credentials with `NEXT_PUBLIC_`.

- `ADMIN_EMAIL`: administrator e-mail address.
- `ADMIN_PASSWORD`: a unique password with at least 16 characters.
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters. Generate one locally with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

- `DATABASE_URL`: a PostgreSQL connection string. For serverless use, prefer the provider's pooled connection string. The project currently uses Neon's serverless SQL driver, which is intended for the hosted Neon PostgreSQL service.

All sensitive settings remain server-only. If credentials or the database are absent, sign-in fails closed or the API returns a configuration error; there are no development credentials embedded in source code.

## Set up PostgreSQL

1. Provision a PostgreSQL database through the Vercel Marketplace/Neon integration for this project, after confirming the plan and any billing implications.
2. Add the connection string as the private `DATABASE_URL` variable for the intended Vercel environment. Do not commit the URL to Git.
3. Apply `db/migrations/0001_initial.sql` to that database using the provider's SQL editor or a secure local PostgreSQL client.
4. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to the same environment.
5. Run CI and test the protected sign-in and API in a protected preview. Do not unpause the public project until all of these steps and the dependency-security review are complete.

## API contract

All record routes require an authenticated admin session. Mutation requests must be same-origin JSON requests.

- `GET /api/admin/records?type=properties|vehicles|inquiries|reservations&limit=100`
- `POST /api/admin/records` with `{ "type": "...", "record": { ... } }`
- `PATCH /api/admin/records` with `{ "type": "...", "id": "...", "patch": { ... } }`
- `DELETE /api/admin/records` with `{ "type": "...", "id": "..." }`
- `GET /api/admin/records?type=audit&limit=100` reads audit events.

The API uses strict allowlists for record types and patch fields; it does not interpolate user-provided table names. SQL mutations and audit entries are written within one PostgreSQL statement using CTEs. Listing slugs are uniquely indexed, and the API returns `503 DATABASE_NOT_CONFIGURED` until `DATABASE_URL` and the initial schema exist.

## Not yet Pro-complete

The administration store now loads records from the authenticated PostgreSQL API and sends admin create/update/delete operations to the server. If the API is unauthenticated it returns to the login page; if storage is unavailable, the UI clears the business collections and presents an unavailable state instead of showing seeded data. Public property/vehicle catalogue pages and customer inquiry forms are still backed by the prototype seed/local state and must be migrated before this becomes a full operational SaaS. The API cannot be verified against a real database until the owner provisions/configures the database connection and runs the migration.

The database currently stores domain-shaped record payloads in PostgreSQL JSONB to preserve the app's existing data models during migration. Further hardening before customer production should include role-backed staff accounts, a distributed login rate limiter, production audit retention/exports, upload storage for real property images, backup/restore testing, and a migration of public inquiry submissions to the server.

## Release gate

Do not unpause public Vercel domains until:
- CI typecheck, lint, tests and production build all pass on the latest PR commit after the most recent UI-store integration changes.
- `npm audit` high/critical findings are reviewed and remediated or explicitly accepted with documented evidence.
- Database credentials and the migration are configured successfully.
- Sign-in, CRUD, audit events, conflict handling and unauthorized access are smoke-tested against the real database.
- The user interface no longer reports successful local-only saves as business-data persistence.

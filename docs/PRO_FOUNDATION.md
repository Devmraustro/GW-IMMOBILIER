# GW Immobilier Pro — foundation status

## Delivered in this phase

- Server-side admin login using private environment credentials.
- Signed HMAC-SHA-256 sessions with an eight-hour expiry.
- HttpOnly, SameSite=Strict session cookie; Secure in production.
- Protection for every `/admin/*` route and every `/api/admin/*` route, except the intentionally public login/logout endpoints.
- Fail-closed behaviour when credentials or the session secret are not configured.
- Logout action in desktop and mobile dashboard navigation.
- French and Arabic sign-in copy.
- Unit tests for signature, expiry, account binding and missing secrets.

## Required private environment variables

Configure these under Vercel → Project → Settings → Environment Variables. Do not prefix them with `NEXT_PUBLIC_`.

- `ADMIN_EMAIL`: administrator e-mail address.
- `ADMIN_PASSWORD`: a unique password with at least 16 characters.
- `ADMIN_SESSION_SECRET`: a random secret of at least 32 characters. Generate one locally with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The example environment file intentionally leaves these values blank. If settings are absent, login returns an unavailable response and admin pages stay protected.

## Not yet Pro-complete

This is the first security milestone, not the finished SaaS backend. The existing dashboard still reads and writes records in browser `localStorage`, and the catalog is still based on seed data. There is not yet shared PostgreSQL persistence, database-backed user accounts/roles, server-side CRUD for properties/vehicles/inquiries/reservations, private image storage, durable audit logs, or cross-device data.

Do not unpause the public project for customer operations until the database/API migration is implemented, database and storage credentials are configured, and production tests pass. Existing data models and UI remain the starting point. No source code from the searched RentPro repository was copied because no permissive license file was found at the inspected path.

## Recommended next milestone

1. Provision an approved PostgreSQL service and configure its private connection URL.
2. Add schema/migrations for properties, vehicles, inquiries, reservations, admin users/roles and audit events.
3. Implement authenticated route handlers with server-side validation and role checks.
4. Migrate business records away from `localStorage`, keeping favourites client-local.
5. Add private object storage for media, backups, distributed login rate limiting and integration tests.
6. Deploy to a protected preview, verify critical flows, and only then restore public access.

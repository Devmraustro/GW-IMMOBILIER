# GW Immobilier — Premium Real Estate & Car Rental Platform

A production-quality **client prototype** for **GW Immobilier**, a real-estate and
car-rental company operating in the **Wilaya of Algiers, Algeria**.

It is a complete, interactive Next.js application: a bilingual (French / Arabic,
LTR / RTL) customer website with a searchable property catalogue, a vehicle
fleet, an **interactive Leaflet/OpenStreetMap map with marker clustering**,
Google-Maps itinerary links, WhatsApp inquiry flows, and a fully interactive
**demonstration administration dashboard**.

> ⚠️ **Demonstration mode.** Every listing, vehicle, inquiry, reservation and
> statistic is **fictional seed data**. There is no backend, no database and no
> authentication. Contact details are placeholders until the owner supplies
> verified ones. See [Demo-mode limitations](#demo-mode-limitations).

---

## Table of contents

1. [What the project does](#what-the-project-does)
2. [Technology stack](#technology-stack)
3. [Getting started](#getting-started)
4. [Available routes](#available-routes)
5. [Design system](#design-system)
6. [Internationalisation](#internationalisation)
7. [Interactive map](#interactive-map)
8. [Administration dashboard](#administration-dashboard)
9. [Demo-mode limitations](#demo-mode-limitations)
10. [Replacing the demonstration data](#replacing-the-demonstration-data)
11. [Configuring verified property coordinates](#configuring-verified-property-coordinates)
12. [Configuring WhatsApp and contact details](#configuring-whatsapp-and-contact-details)
13. [Environment variables](#environment-variables)
14. [Testing & quality assurance](#testing--quality-assurance)
15. [Deployment](#deployment)
16. [Backend integration roadmap](#backend-integration-roadmap)
17. [Project structure](#project-structure)
18. [Accessibility & performance](#accessibility--performance)

---

## What the project does

**For customers**

- Discover the brand on a premium, photography-led home page with a working
  search bar (commune, property type, duration, budget).
- Browse a filterable property catalogue: commune, type (F2 → F5, studio, villa,
  office), rental period (daily / monthly / annual), listing category
  (rent / sale / exchange), budget range, furnished status, bedrooms,
  availability date, full-text search, sorting and grid/list views.
- Open a listing detail page: gallery with lightbox, specifications, amenities,
  rental conditions, availability, an approximate-location map, an inquiry form
  and a dynamic WhatsApp message.
- Get directions: every listing has an **“Itinéraire”** action that hands the
  destination to Google Maps, optionally using the device position (only after
  explicit permission) or a manually typed starting address.
- Explore the **interactive map** of all listings across the nine service
  communes, with marker clustering, filters synchronised with the map, a
  preview card on marker selection, and a map/list split view on desktop.
- Rent a car: a separate vehicle catalogue with category, price, transmission,
  seats and availability filters, detail pages, date selection and inquiry flow.
- Save favourites (persisted locally) and contact the agency by form, phone or
  WhatsApp.
- Switch the entire interface between **French (default, LTR)** and
  **Arabic (RTL)** — the choice survives navigation and refreshes.

**For the owner (demonstration dashboard at `/admin`)**

- Overview computed **from the live data** (never hardcoded): total listings,
  active properties, available vehicles, pending inquiries, upcoming
  reservations, revenue and recent activity.
- Full CRUD on properties and vehicles, including a **map-based coordinate
  picker**, availability toggles and image management.
- Inquiry management with type/status filters, status changes
  (New → Contacted → Confirmed → Cancelled) and a WhatsApp reply action.
- A monthly **reservation calendar** with real double-booking detection
  (unit-tested) and a finance board tracking amount, deposit, balance and
  payment status.

---

## Technology stack

| Concern | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router, React Server + Client Components) |
| Language | **TypeScript** in `strict` mode (`noUnusedLocals`, `noUnusedParameters`) |
| Styling | **Tailwind CSS 3.4** with a bespoke design system |
| Components | shadcn/ui-style primitives built on **Radix UI** (dialog, select, slider, switch, label, separator) |
| Icons | **Lucide** |
| Map | **Leaflet 1.9 + react-leaflet 5**, **OpenStreetMap** tiles, **leaflet.markercluster** for clustering |
| Dates & currency | Native `Intl` (Algerian dinar `DA`, `fr-DZ` / `ar-DZ` formats) |
| Notifications | **Sonner** toasts |
| Tests | **Vitest** (95 unit tests) |
| Linting | ESLint (`next/core-web-vitals`, `next/typescript`) |

No paid API, no AI service, no server infrastructure and **no API key is
required** to run the prototype.

---

## Getting started

```bash
# 1. Clone
git clone https://github.com/Devmraustro/GW-IMMOBILIER.git
cd GW-IMMOBILIER

# 2. Install (Node.js 18.18+ required)
npm install

# 3. (Optional) configure the contact details
cp .env.example .env.local

# 4. Start the development server
npm run dev          # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (static generation of all catalogue pages) |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest suite (95 tests) |
| `npm run test:watch` | Vitest in watch mode |

---

## Available routes

### Customer website

| Route | Description |
| --- | --- |
| `/` | Home — hero, search, featured listings, featured vehicles, services, why-us, areas, process, WhatsApp CTA |
| `/properties` | Property catalogue with filters, sorting, grid/list views, URL-synced filters |
| `/properties/[slug]` | Listing detail — gallery, specs, amenities, conditions, map, inquiry form |
| `/cars` | Vehicle catalogue with category / price / transmission / seats filters |
| `/cars/[slug]` | Vehicle detail — gallery, specs, features, conditions, pickup map, inquiry form |
| `/map` | Interactive map — clustering, filters, preview card, geolocation, split view |
| `/services` | The six services, each linking to the relevant catalogue |
| `/about` | Brand story, mission, values, coverage, prototype disclaimer |
| `/contact` | Contact form (validated), phone, WhatsApp, e-mail, business hours |
| `*` | Custom `not-found` page and `error` boundary |

### Demonstration dashboard

| Route | Description |
| --- | --- |
| `/admin` | Overview: KPIs, recent activity, recent inquiries, production roadmap |
| `/admin/properties` | Property CRUD, availability toggle, coordinate picker |
| `/admin/vehicles` | Vehicle CRUD, pricing, availability, pickup location |
| `/admin/inquiries` | Inquiry board with filters, status changes, WhatsApp reply |
| `/admin/reservations` | Monthly calendar + table + double-booking detection |
| `/admin/finances` | Amount / deposit / balance / payment status with totals |

---

## Design system

- **Gold** `#E5B83F` (primary), **near-black** `#1B1B1D`, **white** `#FFFFFF`,
  warm neutral greys (`sand`, `ink` scales).
- Typography: *Playfair Display* for display headings (Georgia fallback),
  *Inter* for UI text (system fallback). Loaded with `display=swap`; the site
  degrades gracefully to a system stack if Google Fonts is unreachable.
- Refined cards with `shadow-card` → `shadow-card-hover`, 16–24 px radii,
  restrained `cubic-bezier(0.22, 1, 0.36, 1)` transitions, subtle
  translate/scale hover states.
- Entrance animations are IntersectionObserver-driven (`.reveal`) and **fully
  disabled under `prefers-reduced-motion`**.
- All layout uses **logical CSS properties** (`ps-`, `pe-`, `start-`, `end-`,
  `text-start/end`, `inset-x-`) so the RTL flip is complete.

### Images

Photography is served from the public Unsplash CDN and loaded directly by the
browser (no image-optimisation key or paid plan needed — `images.unoptimized`).
Every `<SmartImage>` falls back to **locally stored SVG artwork** in
`public/images/fallback/` if a remote file is unreachable, so a card never
renders a broken-image icon and never breaks the layout, even fully offline.

---

## Internationalisation

- Dictionaries: `lib/i18n/dictionaries/fr.ts` (source of truth for the key
  shape) and `lib/i18n/dictionaries/ar.ts`. A unit test asserts that **Arabic
  implements exactly the same keys**, that no translation is empty, and that
  `{placeholder}` tokens match between locales.
- `lib/i18n/index.tsx` exposes `useI18n()` with `t`, `pick()` (resolve a
  `{ fr, ar }` field), `tpl()` (interpolate `{tokens}`), `dir` and `setLocale`.
- The choice is persisted in `localStorage` under `gwi.locale`; the provider
  sets `<html lang>` and `<html dir>` after mount, so server and client markup
  always match (no hydration error).
- Prices use the Algerian dinar written `DA` (the local convention) with Latin
  digits; dates, numbers and relative times use the active locale.
- Enumerated values stored on the data (`type`, `category`, `priceUnit`) are
  never rendered raw: `lib/labels.ts` maps every one of them through the active
  dictionary. A unit test fails if a new enum value is added without a
  translation.

---

## Interactive map

- Leaflet + OpenStreetMap tiles (`https://tile.openstreetmap.org`), attribution
  included as required by the ODRbL licence. No token, no key.
- Markers are rendered with `L.divIcon` (no external image assets) and grouped
  with **leaflet.markercluster** so hundreds of pins never overlap; clusters
  expand on zoom.
- Selecting a marker shows a **preview card** with image, title, price, type,
  availability, an “open listing” button, a WhatsApp button and directions.
- Desktop: 380 px list panel + sticky map. Mobile: a map/list toggle; the map
  re-measures itself (`invalidateSize`) on every panel switch.
- “Me localiser” requests the device position **only on explicit click**; denial,
  timeout and unsupported browsers each have a specific, translated message.
- If tile requests fail (offline / blocked CDN) a non-blocking banner explains
  it instead of leaving a grey rectangle.

---

## Administration dashboard

- Persistent demo banner + `Démo` badge; `/admin` is excluded from
  `robots.txt` and from the sitemap.
- Every KPI is derived from the current store, never hardcoded.
- **Double-booking detection is real logic** (`lib/availability.ts`, unit
  tested): ranges are half-open — a stay ending on the 10th frees the listing
  for another starting on the 10th. Conflicting saves are blocked with a
  translated error.
- “Reset demo data” restores the seed dataset and clears `localStorage`.

---

## Demo-mode limitations

Be explicit about these when presenting the prototype:

1. **No backend, no database, no authentication.** Anyone who can reach
   `/admin` can edit it. The dashboard is a *process demonstration*, not a
   secure area.
2. **Persistence is `localStorage` only.** Changes are private to one browser
   on one device; clearing site data resets everything.
3. **Forms do not send e-mail or messages.** Form submissions are stored
   locally and appear in the dashboard. WhatsApp actions open `wa.me` with a
   pre-filled message that the customer reviews and sends themselves.
4. **No payments.** The finance board is an operational view, not accounting.
5. **No guaranteed booking.** Reservations made in the dashboard are calendar
   entries; there is no contract, payment or confirmation e-mail step.
6. **Fictional data.** Listings, vehicles, prices, availability, inquiries and
   statistics are invented for the demonstration. Business registration
   numbers, legal claims, testimonials and social links are intentionally left
   empty rather than fabricated.
7. **Placeholder contact details** until configured (see below); the UI shows a
   clearly labelled warning while they are placeholders.
8. **The first paint is always French (measured).** Pages are statically
   prerendered, so the HTML leaves the server as
   `<html lang="fr" dir="ltr">`; the saved language lives in `localStorage`,
   which the browser cannot send before the page arrives. Measured on the
   production build over three cold loads (Chromium, local machine):

   | Event | Time after navigation |
   | --- | --- |
   | First contentful paint (French, LTR) | 108–120 ms |
   | `<html dir>` becomes `rtl`, Arabic content shown | ~450–481 ms |
   | **French/LTR visible for** | **≈ 0.35 s** |

   The delay is hydration, not network: it scales with device CPU and bundle
   size, so a mid-range phone will show noticeably longer.

   Removing it entirely means the server has to know the language before it
   renders, which conflicts with keeping every route static. The two options,
   neither of which is implemented here:

   - **Dynamic rendering** — read a `gwi.locale` cookie in the root layout and
     opt the routes out of static generation. Simple, but every request becomes
     a server render.
   - **Prerender both languages + an edge middleware rewrite** — build `/` and
     `/ar/…` statically, then rewrite `/` → `/ar/` transparently when the
     cookie says Arabic. Keeps static rendering, at the cost of a locale
     segment in the route tree.

   A partial fix (an inline script that sets `dir` before paint) was rejected:
   it eliminates the LTR→RTL *jump* but leaves the same window in which French
   text is laid out right-to-left, which looks worse than the current
   behaviour.

---

## Replacing the demonstration data

All seed data lives in `data/` and is typed in `types/index.ts`.

| File | Contents |
| --- | --- |
| `data/properties.ts` | Property listings |
| `data/vehicles.ts` | Vehicle fleet |
| `data/areas.ts` | The nine service communes with geocoded centres |
| `data/services.ts` | The six services |
| `data/inquiries.ts` | Seed inquiries for the dashboard |
| `data/reservations.ts` | Seed reservations for the calendar and finance board |
| `data/company.ts` | Brand story, mission, values, process |

Steps:

1. Edit the file, keeping the TypeScript interfaces intact (the compiler will
   tell you if a field is missing or mis-typed).
2. Set `isDemo: false` on real listings — the UI hides the “données de
   démonstration” badge for them.
3. Replace the placeholder contact values (see below).
4. Run `npm test` — `tests/data.test.ts` verifies unique ids/slugs/references,
   URL-safe slugs, valid coordinates inside the Algiers bounding box, bilingual
   titles and descriptions, coverage of every commune, referential integrity of
   inquiries/reservations, and that no two reservations overlap the same item.
5. Clear `localStorage` (or use “Réinitialiser les données de démo” in the
   dashboard) to pick up the new seed.

---

## Configuring verified property coordinates

Seed coordinates are **geocoded commune centres**, optionally nudged so markers
spread out on the map. Each listing therefore declares how precise its marker
is, and the UI states it explicitly:

```ts
coordinates: { lat: 36.7196, lng: 3.1852 },
coordinatePrecision: 'approximate', // 'area' | 'approximate' | 'exact'
```

To publish a real address:

1. Obtain the surveyed latitude/longitude (WGS84) for the property.
2. Update `coordinates` and set `coordinatePrecision: 'exact'`.
3. Optionally fill `address` — it is displayed on the detail page.
4. Nothing else changes: the map, the marker, the directions link and the
   WhatsApp message all read from the same fields.

The detail page shows “Position approximative / Position au niveau de la
commune / Adresse exacte vérifiée” so a customer is never misled about an
approximate marker.

You can also pick coordinates visually: **`/admin/properties` → edit → “Choisir
sur la carte”** — clicking the map writes the exact lat/lng into the form and
sets the precision to `exact`.

---

## Configuring WhatsApp and contact details

Contact details are **not** stored in the repository data files; they come from
public environment variables (`lib/config.ts`):

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_WHATSAPP_NUMBER=213555123456   # digits only: 213 + 9 digits
NEXT_PUBLIC_PHONE_NUMBER="+213 555 12 34 56"
NEXT_PUBLIC_CONTACT_EMAIL=contact@gw-immobilier.dz
NEXT_PUBLIC_SITE_URL=https://gw-immobilier.dz
```

- The WhatsApp number is used by every `wa.me` deep link
  (`https://wa.me/<number>?text=<encoded message>`).
- While the placeholder values are in place, `IS_PLACEHOLDER_CONTACT` is `true`
  and the footer and contact page display a warning banner.
- Social links are declared in `data/company.ts` (`socialLinks`), currently
  **empty on purpose** — add real URLs and the footer renders them.
- Business address, registration numbers and legal claims are intentionally
  left blank; add them only once verified.

---

## Environment variables

All variables are optional and public (`NEXT_PUBLIC_*`). See `.env.example`.
There are **no secrets** in this project and **no key is ever required**.

---

## Testing & quality assurance

```bash
npm run typecheck   # tsc --noEmit — 0 errors
npm run lint        # ESLint — 0 warnings
npm test            # Vitest — 102 tests, 8 files
npm run build       # production build, 48 static pages
```

Covered by tests:

| File | Covers |
| --- | --- |
| `tests/filters.test.ts` | Every property/vehicle filter, AND semantics, all sort orders, determinism, filter counting |
| `tests/availability.test.ts` | Half-open range overlap, double-booking detection (including the same-day checkout case, cancelled reservations and self-edit), calendar day mapping, payment status, balances, night counts |
| `tests/validation.test.ts` | Algerian phone formats, phone normalisation, e-mail, inquiry form rules, contact form rules, coordinate validation |
| `tests/format.test.ts` | DZD currency formatting and compaction, surfaces, date arithmetic |
| `tests/whatsapp.test.ts` | Message content in both languages, dates, customer details, `wa.me` URL encoding |
| `tests/data.test.ts` | Integrity of the whole seed dataset |
| `tests/i18n.test.ts` | FR/AR key parity, no empty strings, placeholder parity, slug helpers, geo helpers |
| `tests/labels.test.ts` | Every property type, vehicle category and price unit resolves to a **translated** label in both languages, and no raw machine value is ever rendered |

### What was actually verified, and how

| Check | Method | Result |
| --- | --- | --- |
| Typecheck | `tsc --noEmit` (strict) | 0 errors |
| Lint | `next lint` | 0 warnings |
| Unit tests | `vitest run` | 102 passed / 102 |
| Production build | `next build` | 48/48 pages prerendered |
| Route availability | `curl` | 16 routes 200, unknown route 404, `sitemap.xml` + `robots.txt` 200 |
| SEO surface | HTML inspection | titles, descriptions, listing data present in the SSR HTML |
| **Responsive layout, 375 / 768 / 1440 px** | **Headless Chromium 153, 13 routes × 3 viewports** | **No horizontal overflow anywhere; 0 console errors; 0 hydration warnings** |
| **Unusable / dead controls** | **Hit-testing every visible control at its centre point** | **3 367 controls tested, 0 blocked** |
| **Arabic RTL** | **Headless Chromium, 8 routes × 2 viewports** | **`dir="rtl"` + `lang="ar"` everywhere; no overflow; no clipped text; language persists across navigation and reload** |
| **Translation coverage** | Text-diff of every visible string FR vs AR | All interface text translated; only sample customer names/messages remain French (they are demo *content*) |
| **Map** | Headless Chromium | Clustering, marker↔listing binding, filter sync, geolocation grant/deny, mobile list/map toggle, attribution, directions coordinates — all pass. **Tile images could not load (see below)** |
| **End-to-end flow** | Headless Chromium, scripted | Filters → detail → validated inquiry → WhatsApp message → dashboard → status change → add listing (visible on the public catalogue) → reservation conflict → cancel → re-book freed dates. **0 console errors** |

Two deliberate notes on the environment used for the browser pass:

- **Map tiles never loaded.** The audit sandbox has no outbound access to
  `tile.openstreetmap.org` (32 tile requests, all failed). Every other map
  behaviour was verified without tiles, and the app shows its own
  "tiles unavailable" notice. Tile rendering must be confirmed once on a
  normal network.
- **Photography fell back to the local SVGs.** `images.unsplash.com` is equally
  unreachable, so every displayed image rendered `public/images/fallback/*.svg`
  — which is exactly the designed fallback path and proves it works
  (15/15 images on the home page rendered at their correct intrinsic sizes).

Known minor deviations, accepted rather than changed: breadcrumb and footer
text links are 16 px tall (below the 24 px WCAG 2.5.8 target, but wide and
plainly legible); all buttons, inputs and selects are ≥ 44 px.

---

## Deployment

### Vercel (recommended)

1. Push the repository to GitHub.
2. Import it on [vercel.com](https://vercel.com) — the framework preset
   (Next.js) is detected automatically.
3. Add the four `NEXT_PUBLIC_*` variables in **Settings → Environment
   Variables**.
4. Deploy. `npm run build` is the build command; no output directory override is
   needed.

### Any other Node host

```bash
npm ci
npm run build
npm start          # serves on $PORT (default 3000)
```

The application is fully static-friendly: all catalogue and detail pages are
pre-rendered at build time, and the only runtime dependencies are the public
OpenStreetMap tile endpoint and the Unsplash CDN, both reached by the visitor’s
browser.

### Local Docker-style run

```bash
npm ci && npm run build && npx next start -H 0.0.0.0 -p 3000
```

---

## Backend integration roadmap

The UI is deliberately isolated from persistence so a real backend can be
swapped in without touching components. The single seam is
**`lib/demo-store.tsx`** — replace its `useState`/`localStorage` implementation
with API calls and nothing else changes.

Recommended production path:

1. **Database** — PostgreSQL with Prisma (or Drizzle). Map `types/index.ts`
   directly to tables; `Property`, `Vehicle`, `Inquiry`, `Reservation` are
   already persistence-shaped.
2. **Authentication & authorisation** — NextAuth.js or Clerk for the admin
   area, plus **server-side authorisation on every mutation** (never trust the
   client). Add middleware protecting `/admin/*` and role checks in the API
   routes.
3. **Storage** — S3 / Cloudinary / Vercel Blob for listing photos, replacing
   the “one URL per line” textarea in the admin forms.
4. **Server actions or route handlers** — `/api/properties`, `/api/vehicles`,
   `/api/inquiries`, `/api/reservations` with Zod validation reusing
   `lib/validation.ts`.
5. **Notifications** — transactional e-mail (Resend/Postmark) and the WhatsApp
   Cloud API for real outbound messages, with the current `wa.me` link kept as
   the no-credential fallback.
6. **Payments** — only if online booking is required; the finance board is an
   operational view, not a ledger.
7. **Observability** — structured logging and error reporting on the server.

Auth-related copy shown in the dashboard (`admin.futureAuthText`) documents
this to the owner in-app.

---

## Project structure

```
app/                     # App Router routes, layouts, metadata, sitemap, robots
  page.tsx               # Home
  properties/            # Catalogue + [slug] detail
  cars/                  # Fleet + [slug] detail
  map/                   # Interactive map
  services/ about/ contact/
  admin/                 # Demonstration dashboard (6 sections)
components/
  ui/                    # Radix-based primitives (button, dialog, select, …)
  layout/                # Header, mobile nav, footer, logo, language toggle
  home/                  # Hero, search bar, featured sections, CTA
  properties/            # Cards, gallery, filters, catalogue, detail
  cars/                  # Cards, catalogue, detail
  map/                   # Leaflet map, clustering, lazy loader, explorer
  dashboard/             # Shell, stat cards, property/vehicle/inquiry/reservation managers
  shared/                # SmartImage, Reveal, empty state, WhatsApp, directions, inquiry form,
                         # catalog header (translated page headings)
  pages/                 # Page-level client compositions
data/                    # Seed data (properties, vehicles, areas, services, inquiries, reservations, company)
lib/
  i18n/                  # Provider + FR/AR dictionaries
  labels.ts             # Enum -> translated label (property type, category, price unit)
  filters.ts  validation.ts  availability.ts  whatsapp.ts  geo.ts
  format.ts  slug.ts  images.ts  config.ts  utils.ts  demo-store.tsx
public/images/fallback/  # Local SVG artwork used when remote photos fail
tests/                   # Vitest suites
types/                   # Domain models
```

Data models are separated from presentation: components never hardcode listing
fields, they consume the typed models in `types/`.

---

## Accessibility & performance

- Semantic landmarks (`header`, `nav`, `main`, `footer`, `article`, `section`),
  one `h1` per page and a logical heading order.
- Skip-to-content link, visible focus rings, keyboard-operable dialogs,
  selects, sliders and menus (Radix primitives).
- `aria-label` / `aria-pressed` / `aria-current` / `aria-live` / `role="alert"`
  where they add meaning; descriptive `alt` text on every image.
- `prefers-reduced-motion` neutralises all animation (see `globals.css`).
- Images are lazy-loaded with explicit `sizes`; the map is a client-only
  dynamic import so it never blocks first paint or SSR.
- Leaflet custom markers avoid the default marker images entirely (`divIcon`),
  so no 404s and no extra requests.
- No horizontal overflow: `overflow-x: hidden` on `html`/`body` plus a
  container that caps at 1360 px with responsive padding.

---

## Licence & credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright)
  contributors, tiles served under the ODRbL licence.
- Photography: [Unsplash](https://unsplash.com) (CDN URLs, no account needed).
- Built as a client prototype for GW Immobilier, Algiers, Algeria.

# LeBarre Group — Backend API

NestJS 10 + Prisma 6 + PostgreSQL. Implements the API surface for the
LeBarre Group Phase 1 marketing site: lead capture, brand-brief workflow,
admin authoring, public read endpoints for SSR/SSG, and SEO assets
(`sitemap.xml`, `robots.txt`, JSON-LD).

The Prisma schema lives at the repository root (`../prisma/schema.prisma`)
and is shared by this service.

## Layout

```
src/
├── main.ts                  # Express bootstrap — helmet, CORS, cookies, validation
├── app.module.ts            # Wires every feature module + global metrics middleware
├── prisma/                  # PrismaService + seed.ts
├── common/                  # Sanitization, decorators, interceptors, metrics
├── auth/                    # Login/logout, JWT strategy, JwtAuthGuard, AdminGuard
├── ratelimit/               # DB-backed rate limiter (used by consultations + admin login)
├── email/                   # SMTP service + EmailQueue retry worker
├── consultations/           # POST /api/consultations
├── brief/                   # GET/POST /api/brief/:token
├── admin/                   # /api/admin/leads + /api/admin/insights (guarded)
├── public/                  # /api/services, /api/team, /api/faq, /api/insights
└── seo/                     # JsonLdService + /sitemap.xml + /robots.txt
```

## Endpoints

### Public (no auth)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/consultations` | Step 1+2 form. Rate-limited 5/60min/IP. Returns `{ briefToken, redirectTo }`. |
| GET | `/api/brief/:token` | Brief shell or 404. |
| POST | `/api/brief/:token` | Upsert brand brief; sets parent `Lead.briefStatus = COMPLETED`. |
| GET | `/api/services` | Active services + JSON-LD service catalog. |
| GET | `/api/services/:slug` | Service detail + JSON-LD (Service, FAQPage, BreadcrumbList). |
| GET | `/api/team` | Active team list. |
| GET | `/api/team/:slug` | Member detail + JSON-LD Person + Breadcrumbs. |
| GET | `/api/faq` | Categorised FAQs + page-level FAQPage JSON-LD. |
| GET | `/api/insights` | Paginated published posts. |
| GET | `/api/insights/:slug` | Article + JSON-LD Article + Breadcrumbs. |
| GET | `/sitemap.xml` | Dynamic sitemap with `lastmod`/`changefreq`. |
| GET | `/robots.txt` | Standard robots policy + Sitemap link. |
| GET | `/health` | Liveness + DB ping. |

### Admin (JWT cookie + role=ADMIN)
| Method | Path | Notes |
|---|---|---|
| POST | `/api/admin/auth/login` | bcrypt password check, generic error, brute-force lock at >10 attempts/15min. |
| POST | `/api/admin/auth/logout` | Clears the session cookie. |
| GET | `/api/admin/leads` | Paginated, filterable (`challengeCategory`, `leadStatus`, `briefStatus`, `sort`). |
| GET | `/api/admin/leads/:id` | Lead + brand brief + audit trail + notes. |
| PATCH | `/api/admin/leads/:id` | Update `leadStatus` and/or brief fields (audit row per change). |
| POST | `/api/admin/leads/:id/notes` | Append internal note. |
| POST | `/api/admin/insights` | Create post (≥1500 words required if status=PUBLISHED). |
| PATCH | `/api/admin/insights/:id` | Update post; refreshes `lastUpdatedAt`; invalidates sitemap cache. |

## Auth

Authentication uses an HTTP-only `lebarre_admin_session` JWT cookie
(`HS256`, default 12h). Login also accepts `Authorization: Bearer <token>`
for non-browser clients. The two guards stack:

- `JwtAuthGuard` validates the cookie/header → 401 on missing/invalid.
- `AdminGuard` enforces `role === 'ADMIN'` → 403 for `EDITOR`s.

`AdminGuard` is applied to every controller under `/api/admin/**` and
returns a `redirect: '/admin/login'` hint in the 401 body.

## Rate limiting

`RateLimitService` writes to `RateLimitEvent`. Keeping it DB-backed lets
multiple replicas share the counter and gives ops one timeline for both
public-form abuse and admin-login brute force.

- Consultation submit: 5 / 60 min / IP. On block, response is **429** with
  the "contact us directly" message and a `Retry-After` header.
- Admin login: every failed attempt is logged with `endpoint='admin-login'`
  and the typed email. >10 failures for the same email in 15 min →
  `User.lockUntil` is stamped, response is **429**, and a password-reset
  email is enqueued for that account.

## Email queue

`EmailService.send()` is best-effort: it tries SMTP, and on any error
enqueues a `EmailQueue` row. The visitor flow is **never** blocked by SMTP
failure (consultation acknowledgement still completes within the 1000ms
p95 budget — see "Performance" below).

`EmailQueueWorker` runs on a 1-minute `@Cron` and reprocesses pending
rows with exponential backoff (`30s, 2m, 8m, 30m, 2h, 8h`). After 6 retries
the row is marked `FAILED`.

## Sanitisation

Every free-text field on inbound DTOs (consultation, brief, lead notes,
admin insights body) is run through `sanitizeText` (sanitize-html with empty
allowlists). HTML tags / scripts are stripped before storage. The submission
itself is still accepted — per spec, malicious payloads should be sanitised,
not rejected.

## SEO

- `JsonLdService` builds JSON-LD blobs for `Organization`, `Service`,
  `FAQPage`, `Person`, `Article`, and `BreadcrumbList`. Public read
  endpoints embed the relevant blobs in their response so the SSR layer
  can drop them straight into `<script type="application/ld+json">`.
- `/sitemap.xml` is rendered dynamically with a 60-second in-process cache.
  `SitemapCacheService.invalidate()` is called on Insights publish/update
  so changes propagate within one render cycle.
- `/robots.txt` is static but sources the absolute sitemap URL from
  `PUBLIC_SITE_ORIGIN`.

## Observability

- `LoggingInterceptor` emits one structured log line per request with
  method, path, status, duration. Bodies are deliberately not logged.
- `MetricsMiddleware` records a 200-sample-per-route latency ring buffer
  and logs an `SLO breach` warning whenever a form-submission endpoint
  exceeds its p95 budget.

## Performance target

The form-submission endpoints (`POST /api/consultations` and
`POST /api/brief/:token`) **must respond within 1000ms at p95** under
normal load. The metrics middleware enforces this as a logged SLO; if you
add work to those code paths, profile first.

| Endpoint | p95 budget |
|---|---|
| `POST /api/consultations` | **1000 ms** |
| `POST /api/brief/:token` | **1000 ms** |

If you breach: check that admin email dispatch hasn't moved off the queue
(SMTP must remain async/fire-and-forget for visitors), and that the
`Lead.create` write isn't blocked by an over-broad transaction.

## Local development

```bash
# from the worktree root, with the Prisma schema at ../prisma/schema.prisma
cd backend
cp .env.example .env       # then fill DATABASE_URL etc.
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed        # creates services, FAQs, team, admin user
npm run start:dev
```

The seed script reads `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` for
the bootstrap admin (defaults: `admin@lebarregroup.com` /
`change-me-immediately`). **Override these in any non-local environment.**

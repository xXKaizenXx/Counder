# Counder Connect — Technical Architecture

**Author:** Sachin (Take-Home Assessment)  
**Status:** Pre-build architecture brief  
**Scope:** Counder Connect web app — year-round member platform for profiles, events, chat, matchmaking, and AI assistance.

---

## 1. Executive Summary

Counder Connect is the operational layer behind Counder’s invite-only network: profiles, conference scheduling, introductions, messaging, and notifications. The architecture optimises for **shipping speed**, **trust** (financial-network sensitivity), and **3,000 concurrent users** at conference peaks — without premature microservice complexity.

**Recommendation:** A **modular monolith** on **Next.js 15 (App Router)** with **PostgreSQL**, **Redis**, and **managed services** for auth, email, chat, push, and AI. Deploy on **Vercel + AWS (af-south-1)** with EU data residency for PII where required.

---

## 2. Tech Stack & Frameworks

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Web app** | Next.js 15, React 19, TypeScript | Matches counder.com (Astro + modern JS); SSR for SEO on public pages; RSC for dashboard performance |
| **Styling** | Tailwind + CSS modules | Aligns with Counder design tokens (Manrope, DM Mono, cream/black palette) |
| **API** | Next.js Route Handlers + tRPC (internal) | End-to-end types; single deploy unit; OpenAPI export for partners |
| **Database** | PostgreSQL 16 (Neon or RDS) | ACID for events, bookings, billing; JSONB for flexible profile facets |
| **Cache / pub-sub** | Redis (Upstash) | Sessions, rate limits, matchmaking score cache, WebSocket fan-out |
| **Search** | PostgreSQL FTS + pgvector | Profile/interest search; semantic similarity for matchmaking (Phase 2) |
| **Object storage** | S3-compatible (Cloudflare R2) | Avatars, documents; pre-signed URLs |
| **Auth** | Clerk or Auth0 | Magic link + email OTP out of the box; SAML for enterprise LPs later |
| **Email** | Resend + React Email | Transactional templates; deliverability; EU region |
| **Realtime chat** | Stream Chat | Battle-tested at scale; moderation, threads, presence; faster than building |
| **Push** | Firebase Cloud Messaging + web push | Cross-platform; topic subscriptions per event |
| **Chatbot** | OpenAI API + RAG (pgvector) | Conference FAQ, session discovery; grounded on approved CMS + event data |
| **Background jobs** | Inngest or Trigger.dev | Matchmaking batch runs, email digests, reminder crons |
| **Observability** | Sentry, PostHog, Grafana Cloud | Errors, product analytics (already on counder.com), infra metrics |
| **IaC** | Terraform | Reproducible AWS resources; separate staging/prod |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Clients: Web (PWA), iOS/Android wrappers (future Capacitor)    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│  Vercel Edge: CDN, WAF, rate limiting, geo routing              │
│  Next.js App Router (modular monolith)                          │
│  ├─ /app/*        Member dashboard (auth required)              │
│  ├─ /api/*        REST + webhooks                               │
│  ├─ /trpc/*       Typed internal API                            │
│  └─ Server Actions Profile, events, match actions               │
└─────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
  PostgreSQL   Redis    Stream     Resend    OpenAI
  + pgvector   cache    Chat API   email     + RAG
      │
      ▼
  Inngest workers: matchmaking, notifications, embeddings
```

### Domain modules (monolith packages)

1. **Identity & Profiles** — Clerk webhooks sync users; rich profiles (role, sector, geo, LP/GP flags, intro preferences).
2. **Events & Scheduling** — Conference sessions, unconference slots, 1:1 booking with conflict detection.
3. **Matchmaking** — Rules engine + vector re-rank (see `matchmaking-spec.md`).
4. **Messaging** — Stream channels per intro/thread; deep-link from recommendations.
5. **Notifications** — Unified notification service (in-app, email, push) with user preferences.
6. **Chatbot** — Scoped assistant; no unrestricted member PII in prompts.

---

## 4. Requirement Mapping

| Requirement | Approach |
|-------------|----------|
| **User profiles** | PostgreSQL `profiles` + S3 avatars; admin-curated visibility tiers (public to network / connections only) |
| **Transactional email** | Resend templates: welcome, magic link (via Clerk), intro requests, session reminders, digest |
| **Email + magic link auth** | Clerk primary; enforce MFA for admin roles |
| **Event management & scheduling** | `events`, `sessions`, `bookings` tables; Cal.com-style slot logic; timezone-aware (Africa/Johannesburg default) |
| **User chat** | Stream Chat; 1:1 and group channels; retention policy 24 months |
| **Matchmaking** | Hybrid rules + embeddings; nightly batch + on-demand refresh (spec in Part 2.2) |
| **Push notifications** | FCM; opt-in per category; quiet hours |
| **Chatbot** | RAG over public conference content + user’s own schedule; escalate to human concierge |
| **3,000 concurrent users** | See §5 |

---

## 5. Scale: 3,000 Concurrent Users

Conference peak assumptions: 3,000 concurrent, ~8,000 DAU during event week, p95 API &lt; 300ms.

| Concern | Strategy |
|---------|----------|
| **Web tier** | Vercel auto-scale; static shell + RSC streaming; edge cache for public assets |
| **Database** | Connection pooling (PgBouncer); read replica for match lists & search; indexes on `user_id`, `event_id`, `starts_at` |
| **Redis** | Hot recommendation caches (TTL 15 min); session store; rate limit 100 req/min/user |
| **Chat** | Stream handles connection scale; our servers only issue tokens |
| **Matchmaking** | Pre-compute top-N overnight; real-time only re-scores on profile edit |
| **Load test gate** | k6 scripts in CI; target 3.5k VUs before each conference |

**Build vs buy:** Buy auth, chat, email, push. Build matchmaking and scheduling — core differentiation.

**Monolith vs services:** Monolith until team &gt; 8 engineers or independent scaling need proven. Extract matchmaking worker first if CPU-bound.

---

## 6. Security & Compliance

- **AuthZ:** RBAC (member, partner, admin, concierge); row-level security in Postgres for profile fields.
- **Data residency:** Primary DB in `af-south-1`; EU Clerk/Resend regions for GDPR members.
- **PII:** Encrypt at rest (AES-256); audit log for profile views and intro requests.
- **Chatbot:** Retrieval-only on approved corpus; prompt injection guards; no cross-user data in context.
- **Rate limiting:** Edge + Redis; stricter on intro endpoints (anti-spam).
- **Secrets:** AWS Secrets Manager; no keys in client bundles.
- **Compliance path:** SOC 2 Type I at 12 months; POPIA (South Africa) privacy policy alignment.

---

## 7. Deployment

| Environment | Hosting | Purpose |
|-------------|---------|---------|
| **Preview** | Vercel per-PR | QA, design review |
| **Staging** | Vercel + Neon branch DB | Integration tests, load tests |
| **Production** | Vercel (web) + AWS af-south-1 (RDS, R2, workers) | Live conference traffic |

**CI/CD:** GitHub Actions → lint, typecheck, Vitest, Playwright smoke, k6 staging load → deploy on merge to `main`. Database migrations via Prisma migrate; blue/green with connection drain.

**Rollback:** Vercel instant promote; DB migrations forward-only with feature flags.

---

## 8. Phased Delivery

| Phase | Weeks | Deliverables |
|-------|-------|--------------|
| **MVP** | 1–8 | Auth, profiles, event agenda, basic chat, email notifications |
| **Connect** | 9–14 | Matchmaking v1, intro flow, push, chatbot FAQ |
| **Scale** | 15–18 | Load hardening, admin tools, analytics dashboards |

---

*This document is intentionally concise (~2 pages printed). Implementation detail for matchmaking is in `matchmaking-spec.md`.*

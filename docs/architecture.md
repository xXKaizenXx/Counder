# Counder Connect — Technical Architecture

**Author:** Sachin · Take-Home Assessment (Part 2.1)  
**Audience:** Co-founder / CTO — the doc you read before writing the first line of code  
**Companion:** [`matchmaking-spec.md`](matchmaking-spec.md) (Part 2.2 — §4 Matchmaking)  
**Status:** Pre-build architecture brief  
**Scope:** Counder Connect — year-round member platform: profiles, events, chat, matchmaking, notifications, AI assistant.

> **Page budget:** ≤ 2 printed pages. Detail for matchmaking lives in the companion spec.

---

## 1. Executive Summary

Counder Connect is the operational layer behind Counder’s invite-only network: profiles, conference scheduling, introductions, messaging, and notifications. The architecture optimises for **shipping speed**, **trust** (financial-network sensitivity), and **3,000 concurrent users** at conference peaks — without premature microservice complexity.

**Recommendation:** A **modular monolith** on **Next.js 15 (App Router)** with **PostgreSQL**, **Redis**, and **managed services** for auth, email, chat, push, and AI. Deploy on **Vercel + AWS (af-south-1)** with EU data residency for PII where required.

**Product alignment:** Public counder.com tells a story of perspectives converging (see Part 1 motion section — neural network that morphs into the Counder logo on demand). Connect is where that story becomes **durable** — curated intros, not open social graph noise.

---

## 2. Tech Stack & Frameworks

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Web app** | Next.js 15, React 19, TypeScript | Aligns with modern counder.com stack; SSR for public pages; RSC for dashboard performance |
| **Styling** | Tailwind + CSS modules | Counder tokens (Manrope, DM Mono, cream/black palette) |
| **API** | Route Handlers + tRPC (internal) | End-to-end types; single deploy; OpenAPI export for partners |
| **Database** | PostgreSQL 16 (Neon or RDS) | ACID for events, bookings; JSONB for profile facets |
| **Cache** | Redis (Upstash) | Match caches, rate limits, pub-sub |
| **Search** | PostgreSQL FTS + pgvector | Profile search; semantic match re-rank (Phase 2) |
| **Object storage** | S3-compatible (R2) | Avatars; pre-signed URLs |
| **Auth** | Clerk or Auth0 | Magic link + OTP; SAML for enterprise LPs later |
| **Email** | Resend + React Email | Transactional + digests; EU region |
| **Chat** | Stream Chat | Scale, moderation, presence — faster than building |
| **Push** | FCM + web push | Cross-platform; per-category opt-in |
| **Chatbot** | OpenAI + RAG (pgvector) | Conference FAQ; grounded on approved corpus only |
| **Jobs** | Inngest or Trigger.dev | Matchmaking batches, digests, reminders |
| **Observability** | Sentry, PostHog, Grafana | Errors, product analytics, infra |
| **IaC** | Terraform | Staging/prod parity |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Clients: Web (PWA), iOS/Android wrappers (Capacitor, future)   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────┐
│  Vercel Edge: CDN, WAF, rate limiting                           │
│  Next.js App Router (modular monolith)                          │
│  ├─ /app/*        Member dashboard (auth required)              │
│  ├─ /api/*        REST + webhooks                               │
│  ├─ /trpc/*       Typed internal API                            │
│  └─ Server Actions  Profile, events, match actions              │
└─────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
      ▼          ▼          ▼          ▼          ▼
  PostgreSQL   Redis    Stream     Resend    OpenAI + RAG
  + pgvector   cache    Chat                  (scoped)
      ▼
  Inngest workers: matchmaking, notifications, embeddings
```

**Domain modules (monolith packages):**

1. **Identity & Profiles** — Clerk webhooks; rich profiles (role, sector, geo, LP/GP, intro preferences).
2. **Events & Scheduling** — Sessions, unconference slots, 1:1 booking with conflict detection.
3. **Matchmaking** — Rules + vector re-rank ([`matchmaking-spec.md`](matchmaking-spec.md)).
4. **Messaging** — Stream channels per intro; deep-link from recommendations.
5. **Notifications** — In-app, email, push; unified preferences.
6. **Chatbot** — Scoped assistant; no cross-user PII in prompts.

---

## 4. Requirement Mapping

| Assessment requirement | Approach | Primary module |
|------------------------|----------|----------------|
| **User profiles** | Postgres `profiles` + S3 avatars; visibility tiers (`network` / `connections_only` / `hidden`) | Identity |
| **Transactional email** | Resend templates: welcome, intro requests, session reminders, weekly digest | Notifications |
| **Email + magic link auth** | Clerk primary; MFA enforced for admin/concierge | Identity |
| **Event management & scheduling** | `events`, `sessions`, `bookings`; timezone-aware (`Africa/Johannesburg` default) | Events |
| **User chat** | Stream Chat; 1:1 + group; 24-month retention policy | Messaging |
| **Matchmaking** | Hybrid rules + embeddings; nightly batch + cache ([spec §4.3](matchmaking-spec.md#43-algorithm-strategy-hybrid-rules--embeddings)) | Matchmaking |
| **Push notifications** | FCM; opt-in per category; quiet hours; max 1 high-score match push/day | Notifications |
| **Chatbot** | RAG over public conference CMS + user’s own schedule; escalate to concierge | Chatbot |
| **3,000 concurrent users** | See §5 | Platform |

---

## 5. Scale: 3,000 Concurrent Users

**Assumptions:** 3,000 concurrent during peak sessions; ~8,000 DAU event week; API p95 &lt; 300ms.

| Concern | Strategy |
|---------|----------|
| **Web** | Vercel auto-scale; RSC streaming; edge cache for static assets |
| **Database** | PgBouncer; read replica for lists/search; indexes on `user_id`, `event_id`, `starts_at` |
| **Redis** | Recommendation cache TTL 15 min; rate limit 100 req/min/user |
| **Chat** | Stream handles connections; we issue tokens only |
| **Matchmaking** | Pre-compute top-N nightly; real-time re-score only on profile edit |
| **Load gate** | k6 in CI; 3.5k VUs on staging before each conference |

**Build vs buy:** Buy auth, chat, email, push. **Build** matchmaking and scheduling — core differentiation.

**Monolith vs services:** Stay monolith until team &gt; 8 engineers or proven independent scaling need. Extract matchmaking worker first if CPU-bound.

---

## 6. Security & Compliance

| Area | Control |
|------|---------|
| **AuthZ** | RBAC (member, partner, admin, concierge); Postgres RLS on sensitive profile columns |
| **Data residency** | Primary DB `af-south-1`; EU Clerk/Resend regions for GDPR members |
| **PII** | AES-256 at rest; audit log for profile views and intro requests |
| **Intro spam** | Stricter rate limits on intro endpoints; concierge queue option for launch week |
| **Chatbot** | Retrieval-only on approved corpus; injection guards; no other members’ data in context |
| **Secrets** | AWS Secrets Manager; never in client bundles |
| **Compliance path** | SOC 2 Type I @ 12 months; POPIA alignment for South African members |

---

## 7. Deployment

| Environment | Hosting | Purpose |
|-------------|---------|---------|
| **Preview** | Vercel per-PR | Design + QA |
| **Staging** | Vercel + Neon branch DB | Integration + k6 load tests |
| **Production** | Vercel (web) + AWS af-south-1 (RDS, R2, workers) | Live conference |

**CI/CD:** GitHub Actions → lint, typecheck, Vitest, Playwright smoke, k6 staging → deploy on merge to `main`. Migrations via Prisma; feature flags for risky schema changes. **Rollback:** Vercel instant promote; forward-only DB migrations.

---

## 8. Phased Delivery

| Phase | Weeks | Deliverables |
|-------|-------|--------------|
| **MVP** | 1–8 | Auth, profiles, agenda, basic chat, email notifications |
| **Connect** | 9–14 | Matchmaking v1, intro flow, push, chatbot FAQ |
| **Scale** | 15–18 | Load hardening, admin tools, analytics |

---

## Assessment checklist (Part 2.1)

| Criterion | ✓ |
|-----------|---|
| ≤ 2 pages | Concise by design; matchmaking detail deferred |
| Tech stack included | §2 |
| Frameworks included | §2 |
| Deployment method | §7 |
| All nine functional requirements addressed | §4 |
| 3,000 concurrent strategy | §5 |
| Build vs buy / monolith vs services trade-offs | §5 |
| Security implications | §6 |
| Co-founder-ready tone | Executive summary + phased delivery |

---

*Implementation detail for matchmaking: [`matchmaking-spec.md`](matchmaking-spec.md). Part 1 motion demo: [`../part1-motion/`](../part1-motion/).*

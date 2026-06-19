# Counder Connect — System Specification (Excerpt)

## §4. Matchmaking & Connection Recommendations

**Document:** Counder Connect Full-System Specification  
**Version:** 1.0 — Take-Home Assessment (Part 2.2)  
**Author:** Sachin  
**Depends on:** §1 Identity & Profiles, §2 Events & Scheduling, §3 Messaging  
**Architecture:** [`architecture.md`](architecture.md) — modular monolith, Redis cache, Inngest workers  
**Owner:** Platform Engineering

> This section is written as an excerpt from a larger spec — precise enough for a coding agent or senior engineer to implement without guesswork. It stands alone but references sibling sections where schemas are shared.

---

### 4.0 Assessment scope mapping

| Brief requirement | This section |
|-------------------|--------------|
| Matching algorithm strategy | §4.3 — hybrid rules → embeddings → RAG for conversation starters only |
| Signals and data inputs | §4.4 — structured profile, behavioural, contextual |
| How recommendations are surfaced | §4.8 — Connect home, conference tab, digests, push, chatbot |
| Nuanced business connections (investor ↔ expert, GP ↔ LP, etc.) | §4.4.4 complementarity matrix + seeking/offering tags |
| Actionable implementation detail | §4.6 schema, §4.7 APIs/jobs, §4.10 acceptance criteria |

---

### 4.1 Purpose

The matchmaking subsystem recommends **high-value introductions** between Counder members based on complementary roles, shared interests, conference context, and explicit opt-in preferences.

**Examples the system must handle:**

| Member A | Seeking | Member B | Offering |
|----------|---------|----------|----------|
| Investor | Sector expert (quantum) | Professor | `sector_insight` in quantum |
| Fund manager | Limited Partners | LP family office | `lp` + sector overlap |
| Corporate CEO | Africa market operator | Operator | `africa_exposure` |
| Mission Partner | Co-investors in thesis | GP | `co_invest` + shared sector |

Recommendations must feel **curated, not spammy** — aligned with Counder’s invite-only trust model and the brand promise of *collective understanding*.

---

### 4.2 Goals & Non-Goals

**Goals**

- Surface top 10–20 ranked recommendations per member per day/conference phase
- Support **bidirectional consent** before contact details or chat unlock
- Explain *why* two people were matched (transparency builds trust)
- Re-rank when profiles, goals, or event schedules change
- Serve 3,000 concurrent users reading recommendations from cache (p95 &lt; 120ms)

**Non-Goals (v1)**

- Automated meeting booking without user action
- LinkedIn-style open messaging to anyone
- Fully autonomous ML with no human override
- External data scraping

---

### 4.3 Algorithm Strategy: Hybrid Rules + Embeddings

| Phase | Approach | When |
|-------|----------|------|
| **1 — Launch** | Rules-based scoring (deterministic, auditable) | Conference v1 |
| **2 — Post-conference** | Embedding re-rank via pgvector | Enough profile + outcome data |
| **3 — Optional** | RAG-generated conversation starters | Never for match *selection* |

#### 4.3.1 Pipeline

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Candidate    │──▶│ Hard filters │──▶│ Score (rules)│──▶│ Re-rank     │
│ generation   │    │(eligibility)│    │ 0–100        │    │ (embedding) │
└──────────────┘    └─────────────┘    └──────────────┘    └──────┬──────┘
                                                                  │
                    ┌─────────────┐    ┌──────────────┐           ▼
                    │ Persist +   │◀──│ Diversity +  │◀─── Top 50 candidates
                    │ cache       │    │ cap rules    │
                    └─────────────┘    └──────────────┘
```

1. **Candidate generation** — For user `U`, pool `P` where:
   - `intro_opt_in = true`
   - Same `conference_edition` OR both in year-round `network` tier
   - Exclude blocks, existing connections, pending intros
   - Cap `|P|` at 2,000 via geo/sector/role pre-filter

2. **Hard filters** — Must pass all:
   - No `do_not_introduce` between pair
   - Visibility tier allows discovery (§4.5)
   - `same_org_intro = false` respected
   - Admin suppression list clear

3. **Rules score** — Weighted sum from `match_weights` table (versioned for A/B)

4. **Embedding re-rank (Phase 2)** — `final = 0.65 × rules + 0.35 × cosine_similarity(profile_embedding)`

5. **Diversity pass** — MMR on top 50 → top 10; avoid duplicate archetypes; spread sectors/geos

---

### 4.4 Signals & Data Inputs

#### 4.4.1 Profile attributes (structured)

| Signal | Source | Scoring use |
|--------|--------|-------------|
| `member_role` | Enum: `investor`, `operator`, `expert`, `lp`, `gp`, `founder`, `corporate`, `philanthropy`, `other` | Complementarity matrix |
| `sectors[]` | Taxonomy (≤5) | Jaccard × 20; cross-sector +10 if roles complement |
| `geographies[]` | ISO region | Overlap +5; complementary geo +15 |
| `investment_thesis` | Text (≤500 chars) | Embedding similarity (Phase 2) |
| `seeking[]` / `offering[]` | Multi-select tags | +20 per hit, cap 40 |
| `seniority_band` | `emerging`, `established`, `icon` | Peer-level salons +5 |
| `languages[]` | ISO 639-1 | Shared language +8 |
| `conference_attendance` | Boolean + edition | Required for conference-mode recs |
| `session_interests[]` | Agenda bookmarks | +12 per shared interest |

#### 4.4.2 Behavioural signals (v1.1+)

| Signal | Weight | Decay |
|--------|--------|-------|
| Mutual profile view | +5 | 7 days |
| Shared session check-in | +15 | Conference duration |
| Intro marked valuable | +10 to similar profiles | 90 days |
| Declined / not relevant | −20 same archetype | 30 days |
| Chat post-intro | +8 | 60 days |

#### 4.4.3 Contextual boosts

| Context | Boost |
|---------|-------|
| Same registered session (time overlap) | +18 |
| Same excursion | +15 |
| Pre-conference survey goal match | +25 |
| New member (&lt; 30 days) | +10 to concierge-seeded picks |

#### 4.4.4 Complementarity matrix (excerpt)

```
investor,expert,25      gp,lp,30
investor,operator,20    founder,investor,22
corporate,expert,18
```

Symmetric; scored once per pair. Full matrix in `role_complement` config table.

---

### 4.5 Privacy, Consent & Visibility

- **Discovery visibility:** `network` | `connections_only` | `hidden`
- **Intro preferences:** `open` | `warm_only` | `paused`
- Recommendations **never expose** private email/phone — only `public_card` projection
- **Explanation strings** use public attributes only: *"You're both focused on AI infrastructure; they're seeking Africa market operators."*
- GDPR/POPIA: export/delete via §1 data-subject endpoints; match scores = legitimate interest
- Admin/concierge can **pin** or **suppress** (audit logged)

---

### 4.6 Data Model

```sql
CREATE TABLE match_recommendations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  candidate_id  UUID NOT NULL REFERENCES users(id),
  edition_id    UUID REFERENCES conference_editions(id),
  rules_score   SMALLINT NOT NULL CHECK (rules_score BETWEEN 0 AND 100),
  semantic_score REAL,
  final_score   SMALLINT NOT NULL,
  rank          SMALLINT NOT NULL,
  reasons       JSONB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','dismissed','intro_sent','expired')),
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, candidate_id, edition_id)
);

CREATE INDEX idx_match_rec_user_rank ON match_recommendations (user_id, edition_id, rank)
  WHERE status = 'active';

CREATE TABLE intro_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id      UUID NOT NULL REFERENCES users(id),
  recipient_id      UUID NOT NULL REFERENCES users(id),
  recommendation_id UUID REFERENCES match_recommendations(id),
  message           TEXT CHECK (char_length(message) <= 500),
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','accepted','declined','expired')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at      TIMESTAMPTZ
);
```

**Phase 2 embedding:**

```sql
ALTER TABLE profiles ADD COLUMN embedding vector(1536);
CREATE INDEX ON profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Input: `concat(role, sectors, seeking, offering, investment_thesis, bio_public)` → `text-embedding-3-small`; refresh on profile save (debounced).

---

### 4.7 Jobs & APIs

#### Background jobs (Inngest)

| Job | Trigger | Action |
|-----|---------|--------|
| `matchmaking.batch` | Nightly 02:00 SAST + `profile.updated` | Top 50 per active user per edition |
| `matchmaking.expire` | Hourly | `status = expired` where past `expires_at` |
| `embeddings.refresh` | `profile.updated` | Upsert pgvector |

Batch budget: &lt; 4 min per 500 users (2 vCPU); shard by user ID.

#### REST / tRPC

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/recommendations` | Paginated; `?edition=2027` |
| `POST` | `/api/v1/recommendations/:id/dismiss` | Optional reason enum |
| `POST` | `/api/v1/intro-requests` | `{ candidateId, message?, recommendationId? }` |
| `GET` | `/api/v1/intro-requests/inbox` | Pending received |
| `PATCH` | `/api/v1/intro-requests/:id` | `accept` \| `decline` |

**`RecommendationDTO`:**

```typescript
{
  id: string
  candidate: PublicProfileCard
  finalScore: number
  reasons: { code: string; label: string }[]  // max 3 shown
  sharedContext?: { sessions: SessionSummary[] }
  cta: 'request_intro' | 'view_profile'
}
```

**Cache:** Redis `recs:{userId}:{editionId}` — TTL 15 min; invalidate on dismiss or profile change.

**On accept:** Provision Stream channel `intro-{uuid}` within 5s (AC-4).

---

### 4.8 Surfacing Recommendations (UX)

#### 4.8.1 Surfaces

| Surface | Content | Refresh |
|---------|---------|---------|
| **Connect Home** | Top 5 horizontal cards + reason chip | Nightly + on profile edit |
| **Conference tab** | "People to meet" before Day 1 | Nightly during event week |
| **Post-session prompt** | "Others interested in {session}" | Contextual subset |
| **Email digest** | Max 3 recs, weekly opt-in | Scheduled |
| **Push** | Score &gt; 75 + session overlap only | Max 1/day |
| **Concierge chatbot** | "Who should I meet about X?" | RAG + live filter on API |

#### 4.8.2 Intro request flow

1. Tap **Request introduction** → optional 500-char note → preview recipient view
2. Recipient: in-app + email notification
3. **Accept** → Stream channel + both notified
4. **Decline** → dismiss rec; down-rank similar archetype 30 days

**Dismiss reasons:** `not_relevant`, `already_know`, `wrong_timing`, `other` — feed negative signals.

#### 4.8.3 Edge states

- &lt; 5 matches → CTA: complete seeking/offering preferences
- `intro_opt_in = false` → explain consent model; no cards
- No conference ticket → year-round network recs only

---

### 4.9 Admin & Quality

- Dashboard: acceptance rate, dismiss reasons, score distribution, diversity
- Manual pin/suppress with audit trail
- A/B weight versions in `match_weights` (`version`, `effective_from`)
- Alert if acceptance &lt; 15% for a weight version

---

### 4.10 Testing & Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-1 | Investor seeking `sector_insight` + quantum sector → quantum expert in top 10 |
| AC-2 | `intro_opt_in = false` users never appear as candidates |
| AC-3 | Dismissed pair not re-shown for 30 days |
| AC-4 | Accept intro → Stream channel within 5s |
| AC-5 | GET recommendations p95 &lt; 120ms (cache hit) @ 3k concurrent |
| AC-6 | Every card shows ≥1 human-readable reason |
| AC-7 | Batch recomputes 500 users in &lt; 4 min |

---

### 4.11 Open Questions (for product sign-off)

1. Higher visibility weight for Mission Partners?
2. Cross-edition intro carry-over? *(Proposed: expire after 90 days)*
3. Concierge approval queue for first-time requesters during launch week? *(Recommended: yes)*

---

### Assessment checklist (Part 2.2)

| Criterion | ✓ |
|-----------|---|
| Algorithm strategy specified | §4.3 |
| Signals & data inputs | §4.4 |
| Surfacing recommendations | §4.8 |
| Formatted as larger spec excerpt | Header + §4.0 cross-refs |
| Actionable for implementation | §4.6–4.7, §4.10 |
| Nuanced business connection examples | §4.1, §4.4.4 |

---

*Sibling sections (not in this excerpt): §1 `PublicProfileCard` schema, §2 session/booking models, §3 Stream channel provisioning. Architecture overview: [`architecture.md`](architecture.md).*

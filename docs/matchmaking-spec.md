# Counder Connect — System Specification (Excerpt)

## §4. Matchmaking & Connection Recommendations

**Document:** Counder Connect Full-System Specification  
**Version:** 0.1-draft  
**Depends on:** §1 Identity & Profiles, §2 Events & Scheduling, §3 Messaging  
**Owner:** Platform Engineering

---

### 4.1 Purpose

The matchmaking subsystem recommends **high-value introductions** between Counder members based on complementary roles, shared interests, conference context, and explicit opt-in preferences. Examples:

- Investor seeking sector expert (e.g. quantum computing professor)
- Fund manager seeking Limited Partner
- Corporate CEO seeking Africa market operator
- Mission Partner seeking co-investors in a thesis area

Recommendations must feel **curated, not spammy** — aligned with Counder’s invite-only trust model.

---

### 4.2 Goals & Non-Goals

**Goals**

- Surface top 10–20 ranked recommendations per member per day/conference phase
- Support **bidirectional consent** before contact details or chat unlock
- Explain *why* two people were matched (transparency builds trust)
- Re-rank when profiles, goals, or event schedules change
- Handle 3,000 concurrent users reading recommendations from cache

**Non-Goals (v1)**

- Automated meeting booking without user action
- LinkedIn-style open messaging to anyone
- Fully autonomous ML with no human override
- Cross-platform scraping of external data

---

### 4.3 Algorithm Strategy: Hybrid Rules + Embeddings

**Phase 1 (launch): Rules-based scoring (deterministic, auditable)**  
**Phase 2 (post-conference data): Embedding re-rank via pgvector**  
**Phase 3 (optional): RAG-generated conversation starters only — not match selection**

#### 4.3.1 Pipeline Overview

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Candidate    │───▶│ Hard filters │───▶│ Score (rules)│───▶│ Re-rank     │
│ generation   │    │ (eligibility)│    │ 0–100        │    │ (embedding) │
└──────────────┘    └─────────────┘    └──────────────┘    └──────┬──────┘
                                                                   │
                    ┌─────────────┐    ┌──────────────┐             ▼
                    │ Persist +   │◀───│ Diversity +  │◀─── Top 50 candidates
                    │ cache       │    │ cap rules    │
                    └─────────────┘    └──────────────┘
```

1. **Candidate generation** — For user `U`, fetch pool `P` where:
   - `P` = active members with `intro_opt_in = true`
   - Same `conference_edition` OR both in `network` tier
   - Exclude blocked users, existing connections, pending intro requests
   - Cap `|P|` at 2,000 via pre-filter (geo, sector, role)

2. **Hard filters (must pass all)**
   - Neither user has `do_not_introduce` flag with the other
   - Visibility tier allows discovery (see §4.5)
   - Not same organisation if `same_org_intro = false` on either profile
   - Admin suppression list clear

3. **Rules score** — Weighted sum (configurable in `match_weights` table)

4. **Embedding re-rank (Phase 2)** — Cosine similarity between profile embedding vectors; blend: `final = 0.65 * rules + 0.35 * semantic`

5. **Diversity pass** — MMR (maximal marginal relevance) to avoid 10 identical “LP” recommendations; ensure sector/geo spread in top 10

---

### 4.4 Signals & Data Inputs

#### 4.4.1 Profile attributes (structured)

| Signal | Source | Scoring use |
|--------|--------|-------------|
| `member_role` | Profile enum: `investor`, `operator`, `expert`, `lp`, `gp`, `founder`, `corporate`, `philanthropy`, `other` | Complementarity matrix (e.g. investor ↔ expert +25) |
| `sectors[]` | Taxonomy (≤5) | Jaccard overlap × 20; cross-sector bonus +10 if roles complement |
| `geographies[]` | ISO region codes | Overlap +5; **complementary geo** (one has `seeking: africa`, other `expertise: africa`) +15 |
| `investment_thesis` | Free text (max 500 chars) | Embedding similarity (Phase 2) |
| `seeking[]` | Multi-select: `lp`, `deal_flow`, `co_invest`, `mentorship`, `sector_insight`, `africa_exposure`, … | Match against `offering[]` on candidate (+20 per hit, cap 40) |
| `offering[]` | Symmetric to seeking | As above |
| `seniority_band` | `emerging`, `established`, `icon` | Optional: prefer peer-level for salons (+5) |
| `languages[]` | ISO 639-1 | +8 if shared working language |
| `conference_attendance` | Boolean + edition year | Required for conference-mode recommendations |
| `session_interests[]` | From agenda bookmarks | +12 per shared session interest |

#### 4.4.2 Behavioural signals (implicit, v1.1+)

| Signal | Weight | Decay |
|--------|--------|-------|
| Profile view (mutual) | +5 | 7 days |
| Shared session attendance (check-in) | +15 | conference duration |
| Positive intro outcome (`met_valuable = true`) | +10 to similar profiles | 90 days |
| Declined intro / “not relevant” | −20 same archetype | 30 days |
| Chat initiated post-intro | +8 | 60 days |

#### 4.4.3 Contextual boosts (event-aware)

| Context | Boost |
|---------|-------|
| Both registered for same session (time overlap) | +18 |
| Both on same excursion | +15 |
| User stated goal in pre-conference survey | +25 if candidate matches tagged goal |
| “New to network” (&lt; 30 days) | +10 to assigned concierge picks (admin seeded) |

#### 4.4.4 Complementarity matrix (excerpt)

Rules engine loads `role_complement` CSV:

```
investor,expert,25
investor,operator,20
gp,lp,30
founder,investor,22
corporate,expert,18
```

Symmetric; score taken once per pair.

---

### 4.5 Privacy, Consent & Visibility

- **Discovery visibility:** `network` | `connections_only` | `hidden`
- **Intro preferences:** `open` | `warm_only` (existing mutual) | `paused`
- Recommendations **never expose** private email/phone; only display fields in `public_card` projection
- **Explanation strings** use only public attributes: *“You’re both focused on AI infrastructure; they’re seeking Africa market operators.”*
- GDPR/POPIA: match scores are legitimate interest; users can export/delete via §1 data subject endpoints
- Admin/concierge can **pin** or **suppress** recommendations (audit logged)

---

### 4.6 Data Model

```sql
-- Core recommendation record (pre-computed)
CREATE TABLE match_recommendations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  candidate_id  UUID NOT NULL REFERENCES users(id),
  edition_id    UUID REFERENCES conference_editions(id),  -- NULL = year-round network
  rules_score   SMALLINT NOT NULL CHECK (rules_score BETWEEN 0 AND 100),
  semantic_score REAL,                                     -- NULL in Phase 1
  final_score   SMALLINT NOT NULL,
  rank          SMALLINT NOT NULL,
  reasons       JSONB NOT NULL,  -- [{ "code": "sector_overlap", "label": "...", "weight": 20 }]
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active','dismissed','intro_sent','expired')),
  computed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, candidate_id, edition_id)
);

CREATE INDEX idx_match_rec_user_rank ON match_recommendations (user_id, edition_id, rank)
  WHERE status = 'active';

-- Intro request (consent gate)
CREATE TABLE intro_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id    UUID NOT NULL REFERENCES users(id),
  recipient_id    UUID NOT NULL REFERENCES users(id),
  recommendation_id UUID REFERENCES match_recommendations(id),
  message         TEXT CHECK (char_length(message) <= 500),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','declined','expired')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at    TIMESTAMPTZ
);
```

**Profile embedding (Phase 2)**

```sql
ALTER TABLE profiles ADD COLUMN embedding vector(1536);
CREATE INDEX ON profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

Embedding input text = concat(`role`, `sectors`, `seeking`, `offering`, `investment_thesis`, `bio_public`); model `text-embedding-3-small`; refresh on profile save (debounced job).

---

### 4.7 Jobs & APIs

#### 4.7.1 Background jobs (Inngest)

| Job | Trigger | Action |
|-----|---------|--------|
| `matchmaking.batch` | Nightly 02:00 SAST + on `profile.updated` | Recompute top 50 per active user for current edition |
| `matchmaking.expire` | Hourly | Set `status = expired` where `expires_at < now()` |
| `embeddings.refresh` | `profile.updated` | Upsert pgvector embedding |

Batch budget: &lt; 4 min per 500 users on 2 vCPU worker; parallelise by user shard.

#### 4.7.2 REST / tRPC endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/recommendations` | Paginated list; query `?edition=2027` |
| `POST` | `/api/v1/recommendations/:id/dismiss` | Reason optional enum |
| `POST` | `/api/v1/intro-requests` | Body: `{ candidateId, message?, recommendationId? }` |
| `GET` | `/api/v1/intro-requests/inbox` | Pending received |
| `PATCH` | `/api/v1/intro-requests/:id` | `accept` \| `decline` |

**Response shape (`RecommendationDTO`):**

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

Cache: Redis key `recs:{userId}:{editionId}` → JSON array, TTL 15 min; invalidate on dismiss or profile change.

---

### 4.8 Surfacing Recommendations (UX)

#### 4.8.1 Surfaces

1. **Connect Home** — “Recommended for you” horizontal cards (top 5); badge with reason chip
2. **Conference app tab** — “People to meet” before Day 1; refreshes nightly
3. **Post-session prompt** — “Others interested in {session title}” (contextual subset)
4. **Email digest** — Max 3 recommendations, weekly opt-in; deep link to profile
5. **Push** — Only high-score (&gt;75) + mutual session overlap; max 1/day
6. **Concierge chatbot** — “Who should I meet about X?” queries RAG + live filter on recommendations API

#### 4.8.2 Interaction flows

**Intro request flow**

1. User taps **Request introduction** on card
2. Optional 500-char note; preview what recipient sees
3. Recipient gets in-app + email notification
4. On **accept**: create Stream Chat channel `intro-{uuid}`; both parties notified
5. On **decline**: recommendation dismissed; similar archetype down-ranked 30 days

**Dismiss flow** — Reasons: `not_relevant`, `already_know`, `wrong_timing`, `other`; feeds negative signal.

#### 4.8.3 Empty / edge states

- &lt; 5 matches: show “Complete your seeking/offering preferences” CTA
- `intro_opt_in = false`: explain Counder’s consent model; no cards shown
- Conference mode without ticket: network-only recommendations

---

### 4.9 Admin & Quality

- **Dashboard:** acceptance rate, dismiss reasons, score distribution, diversity metrics
- **Manual overrides:** pin user A→B for VIP; global suppress
- **A/B tests:** weight configs versioned in `match_weights` (`version`, `effective_from`)
- **Quality bar:** if acceptance rate &lt; 15% for a weight version, alert #connect-team

---

### 4.10 Testing & Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-1 | Given investor with `seeking: ['sector_insight']` and sector `quantum`, expert in `quantum` ranks in top 10 |
| AC-2 | Users with `intro_opt_in = false` never appear as candidates |
| AC-3 | Dismissed pair not re-shown for 30 days |
| AC-4 | Accept intro creates chat channel within 5s |
| AC-5 | GET recommendations p95 &lt; 120ms (cache hit) at 3k concurrent |
| AC-6 | Each card shows ≥1 human-readable reason |
| AC-7 | Batch recomputes 500 users in &lt; 4 min |

---

### 4.11 Open Questions

1. Should Mission Partners receive higher visibility weight? (Product)
2. Cross-edition intro carry-over rules? (Default: expire after 90 days)
3. Concierge approval queue for first-time requesters? (Recommended for v1 launch week)

---

*End of §4 excerpt. Refer to §1 for `PublicProfileCard` schema and §3 for Stream channel provisioning.*

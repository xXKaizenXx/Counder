# Counder Full Stack Engineer — Take-Home Assessment

**Candidate:** Sachin  
**Submitted to:** robin@counder.com  
**Live demo:** https://counder-sachin.vercel.app  
**Repository:** https://github.com/xXKaizenXx/Counder

---

## Executive summary

This submission delivers three artefacts that mirror how work happens at Counder: **ship a polished experience fast**, **think architecturally before you scale**, and **use AI as a force multiplier without outsourcing judgement**.

| Part | What you get | Why it matters |
|------|----------------|----------------|
| **Part 1** | A full-screen **Interactive Connection Graph** with a **Cape Town teleport adventure**, plus a **mock counder.com homepage** showing real placement | Motion that enhances the story — perspectives converging on Cape Town — not decoration for its own sake |
| **Part 2.1** | A co-founder-ready **technical architecture** for Counder Connect | Pragmatic monolith, clear build-vs-buy, 3k concurrent path, security called out |
| **Part 2.2** | An **implementation spec** for matchmaking & connection recommendations | Actionable enough for a coding agent; consent-first for an invite-only network |

**Suggested review time:** ~8 minutes total (2 min demo, 3 min architecture, 3 min matchmaking).

---

## Two-minute demo guide (for Robin & the team)

Start on the **live URL** (or `npm run dev` locally — see [Quick start](#quick-start)).

### Path A — Section only (assessment core)

1. **Intro splash** — Counder logo reveal (~1.5s; skipped if `prefers-reduced-motion`).
2. **Interactive graph** — Drag to rotate. Hover cities (desktop) or tap (mobile).
3. **Click any node** — Light pulses travel toward the **Cape Town hub**.
4. **Click Cape Town** — Confirmation prompt appears.
5. **Enter Cape Town** — Warp transition (light or dark), then **conference atmosphere video**.
6. Toggle **Conference mode** (top-right) and repeat — dark warp uses tunnel + portal + flash handoff.

### Path B — Homepage integration (placement story)

1. Click **View homepage integration** (bottom-right).
2. Scroll through the mock homepage: hero → pinned statement → pillars → **network section**.
3. Use header nav (**Network**, **Conference**) — scroll-linked, functional.
4. Repeat the **Cape Town teleport** from within the scroll-heavy page — this is the production-realistic path (performance optimisations apply here).

### What to notice

- Palette, typography, and tone match [counder.com](https://counder.com) (cream `#f5f3ef`, Manrope, DM Mono).
- Motion is restrained and editorial — it supports “collective understanding,” not spectacle.
- `prefers-reduced-motion` is respected throughout.

---

## Assessment requirements — coverage

### Part 1 — Full-screen motion section

| Requirement | How it's addressed |
|-------------|-------------------|
| Full-screen, responsive motion section | `PerspectivesConverge` — two-column desktop, stacked mobile, `min-height: 100dvh` |
| Feels at home on counder.com | Design tokens from live site; mock header, statement, conference reveal in integration view |
| Best-suited animation tech | React Three Fiber + Three.js (graph), GSAP (choreography, scroll), CSS modules |
| Motion enhances the story | Global cities stream toward Cape Town; teleport completes the “annual gathering” narrative |
| Strongest presentation | Hosted URL + repo + this README as reviewer guide |
| Creativity beyond the brief | **Cape Town teleport adventure**, mock homepage integration, intro splash, conference mode |

### Part 2.1 — Technical architecture

| Requirement | Section in [`docs/architecture.md`](docs/architecture.md) |
|-------------|-----------------------------------------------------------|
| ≤ 2 pages | Concise doc with explicit scope note |
| Tech stack & frameworks | §2 |
| Deployment method | §7 |
| User profiles | §4 row 1, domain module 1 |
| Transactional emails | §4, stack table |
| Email + magic link auth | §4, §6 |
| Event management & scheduling | §4, domain module 2 |
| User chat | §4, domain module 4 (Stream) |
| Matchmaking | §4, domain module 3 → Part 2.2 |
| Push notifications | §4, stack table |
| Chatbot | §4, domain module 6 |
| 3,000 concurrent users | §5 |
| Trade-off reasoning | §5 build vs buy, monolith vs services |
| Security implications | §6 |

### Part 2.2 — Matchmaking specification

| Requirement | Section in [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md) |
|-------------|-------------------------------------------------------------------|
| Algorithm strategy | §4.3 (hybrid rules → embeddings → RAG for starters only) |
| Signals & data inputs | §4.4 |
| Surfacing to users | §4.8 |
| Stands alone as spec excerpt | §4 header, cross-refs to §1–§3 |
| Actionable for implementation | §4.6 data model, §4.7 APIs & jobs, §4.10 acceptance criteria |

---

## Quick start

### Part 1 — Motion section

```bash
cd part1-motion
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). The **section-only view loads first**. Use **View homepage integration** (bottom-right) for the mock homepage.

**Production build:**

```bash
npm run build
npm run preview
```

**Deploy:** `part1-motion/` is a static Vite app. Deployed to Vercel with **Root Directory** = `part1-motion`, **Output** = `dist`.

### Part 2 — Documents

- [`docs/architecture.md`](docs/architecture.md) — read in any Markdown viewer or on GitHub
- [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md) — same

---

## Part 1 — Design decisions

### Concept: *Perspectives Converge*

An abstract **3D connection graph** — nodes represent global cities and member archetypes; edges carry **light pulses** toward the **Cape Town hub** (Counder Conference 2027). The story: remarkable perspectives streaming toward one place, once a year, where understanding begins.

### Cape Town teleport adventure

Clicking the Cape Town hub opens a **three-act micro-journey**:

1. **Prompt** — “Ready to explore Counder Cape Town?” (confirm or dismiss; Escape to close).
2. **Warp** — Full-viewport transition portaled to `document.body`:
   - **Light mode** — canvas scale + curtain fade.
   - **Conference mode** — tunnel rings, warp lines, portal expansion, white→black flash.
3. **Arrival** — Full-screen conference atmosphere video with caption overlay.

**Integration-page performance:** On the mock homepage, warp uses a **WebGL canvas snapshot** (freeze frame before animation), **scroll position lock**, and deferred ScrollTrigger suspension so the scroll-heavy page does not lag or jump during the effect.

### Why this fits counder.com

- **Palette:** Cream (`#f5f3ef`), black, grey body — from counder.com CSS variables.
- **Typography:** Manrope + DM Mono (same Google Fonts pairing as the live site).
- **Logo:** Counder dual-ring mark with subtle pulse.
- **Tone:** Restrained, editorial — motion supports narrative; teleport earns the emotional payoff of the conference.

### Technology

| Tool | Role |
|------|------|
| **React Three Fiber + Three.js** | 3D graph, pulse particles, hub ripples, bloom |
| **GSAP + ScrollTrigger** | Text entrance, scroll parallax, pinned statement, integration-page choreography |
| **Vite + React 19** | Fast dev/build; static deploy to Vercel |

### Responsive & accessible

- Two-column desktop → stacked mobile; touch drag + haptic feedback on supported devices.
- `prefers-reduced-motion`: skips intro splash loops, particle travel, warp animation (direct to video).
- Semantic HTML, ARIA labels on sections and dialogs, lazy-loaded 3D canvas.
- Teleport UI portaled to `document.body` — not clipped by section `overflow`.

### Placement on counder.com

Delivered as a **mock integration page**: fixed Counder header, hero, pinned statement (“Most try… / We decided to do it together”), three pillars, the interactive network section, friends note, Conference 2027 hero, join/partners strips, footer. Mirrors where this section would sit on the live homepage — between the global network narrative and the annual Cape Town gathering.

Detailed file map and interaction notes: [`part1-motion/README.md`](part1-motion/README.md).

---

## Part 2 — Architecture highlights

- **Modular monolith** (Next.js 15) — ship fast; extract workers when metrics justify it.
- **Buy** auth (Clerk), chat (Stream), email (Resend), push (FCM) — commodity at scale.
- **Build** matchmaking, scheduling, intro consent — core differentiation for an invite-only network.
- **Scale path** for 3,000 concurrent: edge caching, Redis recommendation cache, pre-computed match batches, Stream for chat connections, read replicas for lists.

Full document: [`docs/architecture.md`](docs/architecture.md).

---

## Part 2.2 — Matchmaking spec highlights

- **Hybrid algorithm:** Rules-based scoring (auditable, launch-ready) → pgvector embedding re-rank (Phase 2).
- **Signals:** Role complementarity, seeking/offering tags, sector overlap, session context, behavioural feedback.
- **Consent-first:** Recommendations → intro request → accept → Stream chat channel. No open LinkedIn-style messaging.
- **Explainability:** Every card shows human-readable “why” reasons from public profile fields only.
- **Surfacing:** Connect home, conference tab, post-session prompts, email digest, concierge chatbot.

Full spec: [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md).

---

## AI tools used

Built with **Cursor** (AI-assisted IDE) and Claude for:

- Analysing counder.com HTML/CSS for design tokens and placement
- Implementing Three.js graph geometry, GSAP choreography, and scroll integration
- Drafting architecture trade-offs and matchmaking spec structure
- Iterative performance work on the embedded teleport flow

**Human judgement applied to:** creative direction (graph vs globe, teleport narrative), technology choices, brand tone, scoping (monolith vs services, build vs buy), and every decision about when motion serves vs distracts.

---

## Repository structure

```
counder_assessment/
├── README.md                      ← Submission guide (you are here)
├── part1-motion/                  ← Part 1: Vite + React + R3F demo
│   ├── public/                    ← Conference image, atmosphere video, assets
│   ├── src/
│   │   ├── components/            ← Network scene, teleport, mock homepage
│   │   ├── hooks/                 ← Integration scroll, scroll lock, header
│   │   └── utils/                 ← Graph layout, canvas snapshot, themes
│   └── README.md                  ← Part 1 technical deep-dive
└── docs/
    ├── architecture.md            ← Part 2.1 (≤2 pages)
    └── matchmaking-spec.md        ← Part 2.2 (§4 excerpt)
```

---

## Submission

| Link | URL |
|------|-----|
| **Live demo** | https://counder-sachin.vercel.app |
| **Repository** | https://github.com/xXKaizenXx/Counder |
| **Architecture** | [`docs/architecture.md`](docs/architecture.md) |
| **Matchmaking spec** | [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md) |

**Email to:** robin@counder.com

**Suggested message:**

> Hi Robin,
>
> Here's my Counder take-home assessment.
>
> **Live demo:** https://counder-sachin.vercel.app — click **View homepage integration**, scroll to the network section, then click **Cape Town** for the full teleport experience.
>
> **Repository:** https://github.com/xXKaizenXx/Counder — Part 1 is in `part1-motion/`; architecture and matchmaking spec are in `/docs`.
>
> I focused on story-driven motion with production-realistic homepage placement, and a consent-first matchmaking design for an invite-only network. Happy to walk through any of it with the team.
>
> Best,  
> Sachin


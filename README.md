# Counder Full Stack Engineer — Take-Home Assessment

**Candidate:** Sachin  
**Submitted to:** robin@counder.com

This repository contains all deliverables for the Counder take-home assessment: a full-screen motion section, a technical architecture document, and a matchmaking implementation specification.

---

## Quick Start

### Part 1 — Motion Section (live demo)

```bash
cd part1-motion
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — the **Perspectives Converge** section is full-screen at the top.

**Production build:**

```bash
npm run build
npm run preview
```

**Deploy:** Push `part1-motion/` to Vercel or Netlify (Vite static build). The `dist/` folder is deploy-ready.

---

## Deliverables

| Part | Location | Description |
|------|----------|-------------|
| **Part 1** | [`part1-motion/`](part1-motion/) | Full-screen responsive motion section |
| **Part 2.1** | [`docs/architecture.md`](docs/architecture.md) | Technical architecture (≤2 pages) |
| **Part 2.2** | [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md) | Matchmaking subsystem specification |

---

## Part 1 — Design Decisions

### Concept: *Interactive Connection Graph*

An abstract **3D neural network** — nodes represent founders, investors, experts, and operators floating organically in space. On hover or tap, **light pulses** trace paths through the graph and converge on a central **Cape Town Conference** hub with a glowing ripple effect. GSAP drives smooth camera transitions; Three.js + R3F keeps it performant.

### Why this fits counder.com

- **Palette:** Cream (`#f5f3ef`), black, grey body text — extracted from counder.com CSS variables
- **Typography:** Manrope + DM Mono (same Google Fonts pairing as the live site)
- **Logo:** Counder's dual-ring mark pulses at Cape Town convergence point
- **Tone:** Restrained, editorial — motion supports the story rather than dominating it

### Technology

| Tool | Role |
|------|------|
| **React Three Fiber + Three.js** | 3D connection graph, travelling pulse particles, hub ripples |
| **GSAP** | Camera focus transitions, text entrance, scroll parallax |
| **Vite** | Fast dev/build; easy static deploy |

### Responsive & accessible

- Two-column desktop → stacked mobile layout
- `prefers-reduced-motion`: disables particle animation and GSAP loops
- Semantic HTML, ARIA labels, lazy-loaded 3D canvas

### Placement on counder.com

Designed to slot **between the Network/Conference/Friends telescope section and the Conference 2027 card reveal** — a narrative bridge from "global network" to "gathering in Cape Town."

---

## Part 2 — Architecture Highlights

- **Modular monolith** (Next.js) — ship fast, extract workers later
- **Buy** auth (Clerk), chat (Stream), email (Resend), push (FCM)
- **Build** matchmaking, scheduling, intro consent flows — core differentiation
- **Scale path** for 3,000 concurrent: edge caching, Redis recommendation cache, pre-computed match batches, Stream for chat connections

See [`docs/architecture.md`](docs/architecture.md) for full detail.

---

## Part 2.2 — Matchmaking Spec Highlights

- **Hybrid algorithm:** Rules-based scoring (auditable, launch-ready) + pgvector embedding re-rank (Phase 2)
- **Signals:** Role complementarity, seeking/offering tags, sector overlap, session context, behavioural feedback
- **Consent-first:** Recommendations → intro request → accept → Stream chat channel
- **Surfacing:** Connect home, conference tab, email digest, contextual post-session prompts

See [`docs/matchmaking-spec.md`](docs/matchmaking-spec.md) for schemas, APIs, acceptance criteria.

---

## AI Tools Used

This assessment was built with **Cursor** (AI-assisted IDE) using Claude for:

- Analysing counder.com HTML/CSS for design tokens
- Implementing Three.js arc geometry and GSAP choreography
- Drafting architecture trade-off reasoning and matchmaking spec structure
- Iterative refinement against assessment requirements

Human judgement applied to: creative direction, technology choices, tone alignment with Counder brand, and scoping decisions (monolith vs services, build vs buy).

---

## Repository Structure

```
counder_assessment/
├── README.md                 ← You are here
├── part1-motion/             ← Part 1: Vite + React + Three.js demo
│   ├── src/components/       ← PerspectivesConverge, GlobeScene
│   └── README.md
└── docs/
    ├── architecture.md       ← Part 2.1
    └── matchmaking-spec.md   ← Part 2.2
```

---

## Suggested Submission Format

1. **GitHub repo link** (this repository)
2. **Hosted demo URL** (Vercel deploy of `part1-motion`)
3. **Email to robin@counder.com** with 2–3 sentence summary and links

Optional: 60-second screen recording of the motion section scrolling on desktop + mobile.

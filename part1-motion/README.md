# Part 1 — Perspectives Converge

**Live demo:** https://counder-sachin.vercel.app

Full-screen motion section for the Counder homepage, delivered two ways:

1. **Section only** — the assessment core, isolated for focused review.
2. **Homepage integration** — the same section embedded in a mock [counder.com](https://counder.com) page with header, scroll narrative, and conference reveal.

---

## Live interaction guide

| Action | Result |
|--------|--------|
| **Drag canvas** | Rotate the 3D connection graph |
| **Hover / tap a city node** | Camera eases toward node; label appears; pulse on click |
| **Click Cape Town hub** | Opens teleport prompt |
| **Enter Cape Town** (or click hub again) | Warp transition → conference video |
| **Conference mode toggle** | Switches light ↔ dark scene + warp variant |
| **View homepage integration** | Toggles mock full homepage (bottom-right control) |
| **Escape** | Dismiss prompt or close video |

### Cape Town teleport — flow detail

```
idle → prompt → warp → video → idle
```

- **Prompt** — Modal portaled to `document.body`; scroll position locked; solid scrim (no expensive backdrop blur).
- **Warp (light)** — Canvas scale + black curtain fade (~2s).
- **Warp (Conference / dark)** — Tunnel rotation, radial warp lines, portal expansion, white→black flash into video.
- **Video** — `/conference-atmo.mp4` with GSAP entrance; close button or Escape returns to graph.
- **Reduced motion** — Skips warp; goes prompt → video directly.

### Integration-page optimisations

When `variant="embedded"`, the homepage runs many simultaneous ScrollTriggers. Teleport therefore:

1. **Snapshots** the WebGL canvas to a static image before warp (`utils/canvasSnapshot.ts`).
2. **Suspends** Three.js rendering during warp and video (`frameloop: 'demand'`).
3. **Portals** overlay UI to `document.body` (avoids `overflow: hidden` clipping on the section).
4. **Locks scroll** during prompt/warp/video (`hooks/useScrollLock.ts`).
5. **Defers** `ScrollTrigger.disable()` until warp/video only — prevents pinned statement section from jumping the page on first Cape Town click.

---

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

---

## Architecture

```
App.tsx
├── PerspectivesConverge (variant="standalone")     ← default view
├── MockIntegrationPage
│   ├── CounderHeader                             ← scroll-aware nav
│   ├── MockHomeSlice                             ← hero, statement, conference, footer
│   └── PerspectivesConverge (variant="embedded")
└── IntroSplash                                   ← on load + view switch
```

### 3D scene

| File | Responsibility |
|------|----------------|
| `NetworkCanvas.tsx` | R3F `Canvas`, camera rig, `preserveDrawingBuffer` when embedded |
| `NetworkScene.tsx` | Graph state, hub click → teleport, pulse triggers |
| `NetworkNode.tsx` | Floating nodes, role-based sizing, pointer handlers |
| `NetworkEdges.tsx` | Dynamic edge lines between nodes |
| `PulseStreams.tsx` | Travelling light particles along edges to hub |
| `HubRipple.tsx` | Convergence ripple on Cape Town |
| `GraphRotation.tsx` | Drag-to-rotate with inertia |
| `SceneEffects.tsx` | Bloom post-processing (suspended during warp) |
| `NodeLabel.tsx` | HTML labels via drei `Html` |
| `TouchRipple.tsx` | Mobile tap ring feedback |
| `utils/networkGraph.ts` | Node positions, city list, edge topology |
| `utils/sceneTheme.ts` | Light / Conference colour tokens |

### Motion & homepage chrome

| File | Responsibility |
|------|----------------|
| `PerspectivesConverge.tsx` | Section layout, copy, GSAP entrances, teleport state |
| `CapeTownTeleport.tsx` | Prompt, warp timelines, video stage, portal to body |
| `IntroSplash.tsx` | Logo reveal on load and view switch |
| `MockHomeSlice.tsx` | Hero, pinned statement, pillars, conference hero, strips, footer |
| `MockIntegrationPage.tsx` | Page shell, `data-integration-page` attribute |
| `CounderHeader.tsx` | Fixed header with `ScrollLink` nav |
| `hooks/useIntegrationScroll.ts` | Homepage scroll choreography (GSAP + ScrollTrigger) |
| `hooks/useHeaderScroll.ts` | Header shrink on scroll |
| `hooks/useActiveSection.ts` | Active nav section tracking |
| `ScrollLink.tsx` | Smooth scroll to `#network`, `#conference`, etc. |

### Public assets

| Asset | Path | Used for |
|-------|------|----------|
| Conference atmosphere video | `public/conference-atmo.mp4` | Cape Town teleport arrival |
| Conference hero still | `public/CounderConferenceImage.jpg` | Integration page conference section |

---

## Design tokens

Aligned with counder.com:

- **Cream:** `#f5f3ef` (`--cream`)
- **Black / white / grey body** for type hierarchy
- **Manrope** — headings and UI
- **DM Mono** — eyebrows, metadata, nav accents

---

## Accessibility

- `prefers-reduced-motion`: no intro splash animation, no particle pulses, warp skipped
- Sections use `aria-label`; teleport dialogs use `role="dialog"` + `aria-modal`
- Focusable controls: theme toggle, teleport buttons, video close, view switch
- 3D canvas lazy-loaded via `React.lazy` + `Suspense` fallback

---

## Assessment mapping (Part 1 brief)

| Brief requirement | Implementation |
|-------------------|----------------|
| Full-screen responsive section | `PerspectivesConverge.module.css` grid, mobile stack |
| Match counder.com look & feel | Tokens, fonts, copy tone, mock homepage chrome |
| Animation technology of choice | R3F + GSAP + CSS |
| Motion enhances story | Graph convergence + Cape Town as narrative destination |
| Surprise us | Teleport adventure + full homepage integration |
| Deliver for strongest impression | Vercel deploy + repo + reviewer guide in root README |

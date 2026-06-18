# Part 1 — Perspectives Converge

**Live demo:** https://counder-sachin.vercel.app

Full-screen motion section built around a **transformable connection graph** — two layouts, one scene:

1. **Neural network** (default) — scattered global nodes with pulses converging on Cape Town at the centre.
2. **Logo layout** — tap **Reconstitute** and nodes reorganise into the **Counder mark**: two tangent wireframe spheres with cities on each surface and Cape Town where they meet.

Delivered two ways:

1. **Section only** — the assessment core, isolated for focused review.
2. **Homepage integration** — the same section embedded in a mock [counder.com](https://counder.com) page with header, scroll narrative, and conference reveal.

---

## Live interaction guide

| Action | Result |
|--------|--------|
| **Drag canvas** | Rotate the active graph layout |
| **Reconstitute** (top-right) | Morph neural network → logo spheres (~1.85s GSAP) |
| **Scatter** (same button, logo mode) | Morph back to scattered neural layout |
| **Hover / tap a city node** | Camera eases toward node; label appears; pulse on click |
| **Click Cape Town** | Opens teleport prompt (hub at centre in neural mode; at sphere tangency in logo mode) |
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
- **Reduced motion** — Skips warp; goes prompt → video directly. Layout morph snaps instantly (no GSAP tween).

### Dual-layout graph — how it works

Each node stores two positions (`neuralPosition`, `logoPosition`) and two edge topologies (k-nearest neural edges vs sphere-chain + hub spokes). A `layoutProgress` value (0 → 1) is tweened with GSAP when the user toggles **Reconstitute** / **Scatter**:

| `layoutProgress` | Nodes | Edges | Globes |
|------------------|-------|-------|--------|
| `0` (neural) | Scattered in 3D; hub at origin | Straight lines, k-nearest + hub spokes | Hidden |
| `1` (logo) | On sphere surfaces; hub at tangency | Great-circle arcs per sphere + lines to hub | Wireframe graticule visible |
| `0–1` (morphing) | Lerped positions; blended drift | Both sets drawn with crossfaded opacity | Globes fade in |

Key files: `utils/networkGraph.ts` (`buildDualLayoutGraph`), `NetworkScene.tsx` (GSAP progress), `NetworkNode.tsx` (position lerp), `NetworkEdges.tsx` (dual edge layers), `LogoSpheres.tsx` (opacity tied to progress), `context/networkLayout.tsx`.

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
| `NetworkScene.tsx` | Graph state, layout morph, hub click → teleport, pulse triggers |
| `NetworkNode.tsx` | Interpolated positions, role-based sizing, pointer handlers |
| `NetworkEdges.tsx` | Dual edge layers (neural straight / logo arcs) with opacity crossfade |
| `PulseStreams.tsx` | Travelling light particles; path respects active layout |
| `HubRipple.tsx` | Convergence ripple on Cape Town |
| `GraphRotation.tsx` | Drag-to-rotate with inertia |
| `SceneEffects.tsx` | Bloom post-processing (suspended during warp) |
| `NodeLabel.tsx` | HTML labels via drei `Html` |
| `TouchRipple.tsx` | Mobile tap ring feedback |
| `utils/networkGraph.ts` | Dual layouts: neural scatter + logo sphere placement, edge topologies, pulse routing |
| `LogoSpheres.tsx` | Wireframe globes (graticule + accent meridians); visible in logo layout only |
| `context/networkLayout.tsx` | `layoutProgress` context for child components |
| `utils/globeGeometry.ts` | Latitude/longitude grid, great-circle arc sampling |
| `utils/sceneTheme.ts` | Light / Conference colour tokens |

### Motion & homepage chrome

| File | Responsibility |
|------|----------------|
| `PerspectivesConverge.tsx` | Section layout, copy, GSAP entrances, layout toggle, teleport state |
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

- `prefers-reduced-motion`: no intro splash animation, no particle pulses, warp skipped, layout morph snaps instantly
- Sections use `aria-label`; teleport dialogs use `role="dialog"` + `aria-modal`
- Focusable controls: layout toggle (Reconstitute / Scatter), theme toggle, teleport buttons, video close, view switch
- Mobile interaction hints stack vertically (no horizontal overflow)
- 3D canvas lazy-loaded via `React.lazy` + `Suspense` fallback

---

## Assessment mapping (Part 1 brief)

| Brief requirement | Implementation |
|-------------------|----------------|
| Full-screen responsive section | `PerspectivesConverge.module.css` grid, mobile stack |
| Match counder.com look & feel | Tokens, fonts, copy tone, mock homepage chrome |
| Animation technology of choice | R3F + GSAP + CSS |
| Motion enhances story | Neural convergence on Cape Town; **Reconstitute** resolves network into brand mark |
| Surprise us | Dual-layout morph + teleport adventure + full homepage integration |
| Deliver for strongest impression | Vercel deploy + repo + reviewer guide in root README |

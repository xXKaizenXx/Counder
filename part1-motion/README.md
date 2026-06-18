# Part 1 — Interactive Connection Graph

Full-screen motion section embedded in a **mock counder.com homepage** — header, statement dwell, network section, Conference 2027 reveal, footer.

## Run locally

```bash
npm install
npm run dev
```

## Interaction

- **Hover Cape Town** (desktop) — zoom + label; other cities show small labels only
- **Click / tap** a node — light pulses travel to the Cape Town hub; ripple + bloom on convergence
- **Drag** the canvas — rotate the network (desktop + mobile)
- **Conference mode** toggle — dark variant matching the conference reveal below

## Build

```bash
npm run build
npm run preview
```

## Files

- `CounderHeader.tsx` — Mock site header (nav, logo, Join)
- `MockHomeSlice.tsx` — Statement + Conference reveal + footer chrome
- `PerspectivesConverge.tsx` — Section layout, copy, GSAP animations
- `NetworkCanvas.tsx` — R3F canvas + GSAP camera rig
- `NetworkScene.tsx` — Graph orchestration, interaction state
- `NetworkNode.tsx` — Floating nodes with role-based sizing
- `NetworkEdges.tsx` — Dynamic edge lines
- `PulseStreams.tsx` — Travelling light particles along paths
- `NodeLabel.tsx` — Floating HTML labels on hovered nodes (drei Html)
- `TouchRipple.tsx` — Mobile tap ring feedback
- `SceneEffects.tsx` — Bloom post-processing
- `utils/sceneTheme.ts` — Light/dark scene colour tokens

# Part 1 — Interactive Connection Graph

Full-screen motion section: an abstract 3D neural network aligned with Counder's "Network for Collective Understanding" theme.

## Run locally

```bash
npm install
npm run dev
```

## Interaction

- **Hover** a node (desktop) — floating 3D label appears, camera eases in, edges brighten
- **Click / tap** a node — light pulses travel to the Cape Town hub; ripple + bloom on convergence
- **Conference mode** toggle (top-right) — dark variant matching the conference card section
- **Mobile** — tap feedback with haptic vibration, touch ripple rings, inset flash, centred tooltip
- Auto-demo pulse on desktop ~2.4s after load

## Build

```bash
npm run build
npm run preview
```

## Files

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

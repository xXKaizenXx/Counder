export type ThemeMode = 'light' | 'dark'

export interface SceneColors {
  node: string
  nodeGlow: string
  edge: string
  edgeActive: number
  edgeIdle: number
  pulse: string
  ripple: string
  hubRing: number
  nodeIdleGlow: number
  hubIdleGlow: number
  globeGrid: string
  globeGridOpacity: number
  globeAccent: string
  globeAccentOpacity: number
  labelBg: string
  labelText: string
  labelBorder: string
  bloomIntensity: number
  bloomThreshold: number
}

export const SCENE_COLORS: Record<ThemeMode, SceneColors> = {
  light: {
    node: '#000000',
    nodeGlow: '#000000',
    edge: '#000000',
    edgeActive: 0.38,
    edgeIdle: 0.14,
    pulse: '#000000',
    ripple: '#000000',
    hubRing: 0.55,
    nodeIdleGlow: 0.11,
    hubIdleGlow: 0.28,
    globeGrid: '#000000',
    globeGridOpacity: 0.11,
    globeAccent: '#000000',
    globeAccentOpacity: 0.22,
    labelBg: 'rgba(255, 255, 255, 0.94)',
    labelText: '#000000',
    labelBorder: 'rgba(0, 0, 0, 0.1)',
    bloomIntensity: 0.55,
    bloomThreshold: 0.55,
  },
  dark: {
    node: '#ffffff',
    nodeGlow: '#ffffff',
    edge: '#ffffff',
    edgeActive: 0.48,
    edgeIdle: 0.18,
    pulse: '#ffffff',
    ripple: '#ffffff',
    hubRing: 0.72,
    nodeIdleGlow: 0.16,
    hubIdleGlow: 0.38,
    globeGrid: '#ffffff',
    globeGridOpacity: 0.14,
    globeAccent: '#ffffff',
    globeAccentOpacity: 0.3,
    labelBg: 'rgba(10, 10, 10, 0.9)',
    labelText: '#ffffff',
    labelBorder: 'rgba(255, 255, 255, 0.16)',
    bloomIntensity: 1.35,
    bloomThreshold: 0.12,
  },
}

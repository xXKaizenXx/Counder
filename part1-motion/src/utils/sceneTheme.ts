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
    edgeActive: 0.24,
    edgeIdle: 0.1,
    pulse: '#000000',
    ripple: '#000000',
    hubRing: 0.32,
    labelBg: 'rgba(255, 255, 255, 0.92)',
    labelText: '#000000',
    labelBorder: 'rgba(0, 0, 0, 0.08)',
    bloomIntensity: 0.28,
    bloomThreshold: 0.85,
  },
  dark: {
    node: '#ffffff',
    nodeGlow: '#ffffff',
    edge: '#ffffff',
    edgeActive: 0.38,
    edgeIdle: 0.14,
    pulse: '#ffffff',
    ripple: '#ffffff',
    hubRing: 0.55,
    labelBg: 'rgba(10, 10, 10, 0.88)',
    labelText: '#ffffff',
    labelBorder: 'rgba(255, 255, 255, 0.14)',
    bloomIntensity: 1.15,
    bloomThreshold: 0.18,
  },
}

import { createContext, useContext } from 'react'
import type * as THREE from 'three'

interface FocusContextValue {
  setFocus: (target: THREE.Vector3 | null, zoom?: number) => void
}

export const FocusContext = createContext<FocusContextValue | null>(null)

export function useCameraFocus() {
  const ctx = useContext(FocusContext)
  if (!ctx) throw new Error('useCameraFocus must be used within NetworkCanvas')
  return ctx
}

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'

interface TouchRippleProps {
  active: boolean
  size: number
}

export function TouchRipple({ active, size }: TouchRippleProps) {
  const ringRef = useRef<THREE.Mesh>(null)
  const startRef = useRef<number | null>(null)
  const { colors } = useSceneTheme()

  useFrame((state) => {
    if (!ringRef.current) return
    if (!active) {
      startRef.current = null
      const mat = ringRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0
      return
    }

    if (startRef.current === null) startRef.current = state.clock.elapsedTime
    const t = (state.clock.elapsedTime - startRef.current) / 0.65
    if (t > 1) {
      startRef.current = state.clock.elapsedTime
    }

    const progress = Math.min(t, 1)
    ringRef.current.scale.setScalar(size * (1.2 + progress * 3.5))
    const mat = ringRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = (1 - progress) * 0.45
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.9, 1, 32]} />
      <meshBasicMaterial
        color={colors.ripple}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

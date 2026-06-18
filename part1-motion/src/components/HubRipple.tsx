import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'

const RIPPLE_COUNT = 3

export function HubRipple() {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Mesh[]>([])
  const { nodePositions, reducedMotion } = useNetwork()
  const { colors } = useSceneTheme()
  const birthTime = useRef<number | null>(null)

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return
    if (birthTime.current === null) birthTime.current = state.clock.elapsedTime

    const hub = nodePositions.get('hub')
    if (!hub) return
    groupRef.current.position.copy(hub)

    const elapsed = state.clock.elapsedTime - birthTime.current

    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      const offset = i * 0.22
      const t = (elapsed - offset) % 1.4
      if (t < 0) return
      const scale = 0.5 + t * 2.8
      ring.scale.setScalar(scale)
      const mat = ring.material as THREE.MeshBasicMaterial
      mat.opacity = Math.max(0, 0.42 * (1 - t / 1.2))
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: RIPPLE_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) ringsRef.current[i] = el
          }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.08, 0.095, 48]} />
          <meshBasicMaterial
            color={colors.ripple}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'

interface PulseStreamsProps {
  path: string[]
}

interface PulseParticle {
  edgeIndex: number
  progress: number
  speed: number
}

export function PulseStreams({ path }: PulseStreamsProps) {
  const { nodePositions, reducedMotion } = useNetwork()
  const { colors } = useSceneTheme()
  const pulsesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particlesRef = useRef<PulseParticle[]>([])

  const segments = useMemo(() => {
    if (path.length < 2) return []
    const result: { from: string; to: string }[] = []
    for (let i = 0; i < path.length - 1; i++) {
      result.push({ from: path[i], to: path[i + 1] })
    }
    return result
  }, [path])

  const particleCount = useMemo(() => {
    if (segments.length === 0) return 0
    return segments.length * 2
  }, [segments])

  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      edgeIndex: Math.floor(i / 2),
      progress: (i % 2) * 0.35,
      speed: 0.5 + Math.floor(i / 2) * 0.06,
    }))
  }, [particleCount])

  useFrame((_, delta) => {
    if (!pulsesRef.current || reducedMotion || segments.length === 0) return

    particlesRef.current.forEach((pulse, i) => {
      pulse.progress += delta * pulse.speed
      if (pulse.progress > 1.2) pulse.progress = 0

      const seg = segments[pulse.edgeIndex]
      if (!seg) return
      const from = nodePositions.get(seg.from)
      const to = nodePositions.get(seg.to)
      if (!from || !to) return

      const t = Math.min(pulse.progress, 1)
      const pos = new THREE.Vector3().lerpVectors(from, to, t)
      const fade = t < 0.12 ? t / 0.12 : t > 0.82 ? (1 - t) / 0.18 : 1
      const scale = 0.022 + fade * 0.042

      dummy.position.copy(pos)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      pulsesRef.current!.setMatrixAt(i, dummy.matrix)
    })

    pulsesRef.current.instanceMatrix.needsUpdate = true
  })

  if (particleCount === 0) return null

  return (
    <instancedMesh ref={pulsesRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial
        color={colors.pulse}
        transparent
        opacity={0.95}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

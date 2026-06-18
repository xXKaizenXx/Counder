import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { sampleGreatCircle } from '../utils/globeGeometry'
import { getSphereById } from '../utils/networkGraph'
import { useNetwork } from './NetworkScene'

interface PulseStreamsProps {
  path: string[]
}

interface PulseParticle {
  segmentIndex: number
  progress: number
  speed: number
}

interface PathSegment {
  fromId: string
  toId: string
  arcSphereId?: 'large' | 'small'
}

export function PulseStreams({ path }: PulseStreamsProps) {
  const { nodePositions, reducedMotion, nodes, layoutProgress } = useNetwork()
  const { colors } = useSceneTheme()
  const pulsesRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particlesRef = useRef<PulseParticle[]>([])

  const nodeMeta = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const segments = useMemo((): PathSegment[] => {
    if (path.length < 2) return []
    const result: PathSegment[] = []
    for (let i = 0; i < path.length - 1; i++) {
      const fromId = path[i]
      const toId = path[i + 1]
      const fromNode = nodeMeta.get(fromId)
      const toNode = nodeMeta.get(toId)
      const arcSphereId =
        layoutProgress > 0.5 &&
        fromNode?.sphereId &&
        toNode?.sphereId &&
        fromNode.sphereId === toNode.sphereId
          ? fromNode.sphereId
          : undefined
      result.push({ fromId, toId, arcSphereId })
    }
    return result
  }, [path, nodeMeta, layoutProgress])

  const particleCount = useMemo(() => {
    if (segments.length === 0) return 0
    return segments.length * 2
  }, [segments])

  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      segmentIndex: Math.floor(i / 2),
      progress: (i % 2) * 0.35,
      speed: 0.5 + Math.floor(i / 2) * 0.06,
    }))
  }, [particleCount])

  useFrame((_, delta) => {
    if (!pulsesRef.current || reducedMotion || segments.length === 0) return

    particlesRef.current.forEach((pulse, i) => {
      pulse.progress += delta * pulse.speed
      if (pulse.progress > 1.2) pulse.progress = 0

      const seg = segments[pulse.segmentIndex]
      if (!seg) return

      const from = nodePositions.get(seg.fromId)
      const to = nodePositions.get(seg.toId)
      if (!from || !to) return

      const t = Math.min(pulse.progress, 1)
      let pos: THREE.Vector3

      if (seg.arcSphereId) {
        const sphere = getSphereById(seg.arcSphereId)
        const arc = sampleGreatCircle(from, to, sphere.center, sphere.radius * 1.018, 24)
        const sampleIndex = t * (arc.length - 1)
        const idx = Math.floor(sampleIndex)
        const frac = sampleIndex - idx
        pos = new THREE.Vector3().lerpVectors(arc[idx], arc[Math.min(idx + 1, arc.length - 1)], frac)
      } else {
        pos = new THREE.Vector3().lerpVectors(from, to, t)
      }

      const fade = t < 0.12 ? t / 0.12 : t > 0.82 ? (1 - t) / 0.18 : 1
      const scale = 0.02 + fade * 0.04

      dummy.position.copy(pos)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      pulsesRef.current!.setMatrixAt(i, dummy.matrix)
    })

    pulsesRef.current.instanceMatrix.needsUpdate = true
  })

  if (particleCount === 0) return null

  return (
    <instancedMesh ref={pulsesRef} args={[undefined, undefined, particleCount]} renderOrder={15}>
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

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'
import type { GraphEdge } from '../utils/networkGraph'

interface NetworkEdgesProps {
  edges: GraphEdge[]
}

export function NetworkEdges({ edges }: NetworkEdgesProps) {
  const { nodePositions, hoveredId, activeId, reducedMotion } = useNetwork()
  const { colors } = useSceneTheme()
  const linesRef = useRef<THREE.LineSegments>(null)

  const geometry = useMemo(() => {
    const positions: number[] = []
    edges.forEach(() => {
      positions.push(0, 0, 0, 0, 0, 0)
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [edges])

  useFrame(() => {
    if (!linesRef.current) return
    const attr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array

    edges.forEach((edge, i) => {
      const from = nodePositions.get(edge.from)
      const to = nodePositions.get(edge.to)
      const base = i * 6
      if (from && to) {
        arr[base] = from.x
        arr[base + 1] = from.y
        arr[base + 2] = from.z
        arr[base + 3] = to.x
        arr[base + 4] = to.y
        arr[base + 5] = to.z
      }
    })
    attr.needsUpdate = true

    const mat = linesRef.current.material as THREE.LineBasicMaterial
    mat.opacity =
      hoveredId || activeId ? colors.edgeActive : reducedMotion ? colors.edgeIdle + 0.04 : colors.edgeIdle
  })

  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial color={colors.edge} transparent opacity={colors.edgeIdle} toneMapped={false} />
    </lineSegments>
  )
}

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { sampleGreatCircle } from '../utils/globeGeometry'
import { getSphereById } from '../utils/networkGraph'
import { useNetwork } from './NetworkScene'
import type { GraphEdge } from '../utils/networkGraph'

interface NetworkEdgesProps {
  edges: GraphEdge[]
  edgeMode: 'neural' | 'logo'
  opacity: number
}

const ARC_SEGMENTS = 18

export function NetworkEdges({ edges, edgeMode, opacity }: NetworkEdgesProps) {
  const { nodePositions, hoveredId, activeId, reducedMotion, nodes } = useNetwork()
  const { colors } = useSceneTheme()
  const linesRef = useRef<THREE.LineSegments>(null)

  const nodeMeta = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes])

  const segmentCount = useMemo(() => {
    if (edgeMode === 'neural') return edges.length
    return edges.reduce((sum, edge) => {
      const from = nodeMeta.get(edge.from)
      const to = nodeMeta.get(edge.to)
      if (from?.sphereId && to?.sphereId && from.sphereId === to.sphereId && edge.to !== 'hub') {
        return sum + ARC_SEGMENTS
      }
      return sum + 1
    }, 0)
  }, [edges, nodeMeta, edgeMode])

  const geometry = useMemo(() => {
    const positions: number[] = []
    for (let i = 0; i < segmentCount; i++) {
      positions.push(0, 0, 0, 0, 0, 0)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [segmentCount])

  useFrame(() => {
    if (!linesRef.current) return
    const attr = linesRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = attr.array as Float32Array

    let segIndex = 0

    edges.forEach((edge) => {
      const from = nodePositions.get(edge.from)
      const to = nodePositions.get(edge.to)
      if (!from || !to) return

      const fromNode = nodeMeta.get(edge.from)
      const toNode = nodeMeta.get(edge.to)

      const useArc =
        edgeMode === 'logo' &&
        fromNode?.sphereId &&
        toNode?.sphereId &&
        fromNode.sphereId === toNode.sphereId &&
        edge.to !== 'hub'

      if (useArc) {
        const sphere = getSphereById(fromNode.sphereId!)
        const arc = sampleGreatCircle(from, to, sphere.center, sphere.radius * 1.018, ARC_SEGMENTS)
        for (let i = 0; i < arc.length - 1; i++) {
          const base = segIndex * 6
          arr[base] = arc[i].x
          arr[base + 1] = arc[i].y
          arr[base + 2] = arc[i].z
          arr[base + 3] = arc[i + 1].x
          arr[base + 4] = arc[i + 1].y
          arr[base + 5] = arc[i + 1].z
          segIndex++
        }
        return
      }

      const base = segIndex * 6
      arr[base] = from.x
      arr[base + 1] = from.y
      arr[base + 2] = from.z
      arr[base + 3] = to.x
      arr[base + 4] = to.y
      arr[base + 5] = to.z
      segIndex++
    })

    attr.needsUpdate = true

    const mat = linesRef.current.material as THREE.LineBasicMaterial
    const emphasis = hoveredId || activeId ? colors.edgeActive : colors.edgeIdle
    const baseOpacity = reducedMotion ? emphasis + 0.04 : emphasis
    mat.opacity = baseOpacity * opacity
  })

  if (opacity <= 0.01) return null

  return (
    <lineSegments ref={linesRef} geometry={geometry} renderOrder={edgeMode === 'logo' ? 6 : 5}>
      <lineBasicMaterial
        color={colors.edge}
        transparent
        opacity={colors.edgeIdle * opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGraphRotation } from '../context/graphRotation'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'
import type { GraphNode } from '../utils/networkGraph'
import { NodeLabel } from './NodeLabel'
import { TouchRipple } from './TouchRipple'

interface NetworkNodeProps {
  node: GraphNode
}

export function NetworkNode({ node }: NetworkNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const { wasDragged } = useGraphRotation()
  const {
    hoveredId,
    activeId,
    touchedId,
    setHoveredId,
    triggerPulse,
    setTouchedId,
    nodePositions,
    reducedMotion,
    isTouch,
  } = useNetwork()
  const { colors, theme } = useSceneTheme()

  const isHub = node.role === 'hub'
  const isHovered = hoveredId === node.id
  const isActive = activeId === node.id
  const isTouched = touchedId === node.id

  const handlePulse = () => {
    if (wasDragged()) return
    if (isTouch && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12)
    }
    triggerPulse(node.id)
  }

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    if (!reducedMotion) {
      const drift = isHub ? 0.04 : 0.14
      groupRef.current.position.set(
        node.position.x + Math.sin(t * node.floatSpeed + node.floatOffset) * drift,
        node.position.y + Math.cos(t * node.floatSpeed * 0.9 + node.floatOffset) * drift,
        node.position.z + Math.sin(t * node.floatSpeed * 0.7 + node.floatOffset * 1.3) * drift,
      )
    } else {
      groupRef.current.position.copy(node.position)
    }

    nodePositions.set(node.id, groupRef.current.position.clone())

    const touchBump = isTouched ? 1.18 : 1

    if (coreRef.current) {
      const scale = node.size * (isHovered ? 1.25 : 1) * (isActive ? 1.15 : 1) * touchBump
      coreRef.current.scale.setScalar(scale)
    }

    if (glowRef.current) {
      const glowScale = isHub
        ? 1.8 + Math.sin(t * 1.5) * 0.08
        : isHovered || isActive || isTouched
          ? 2.4
          : 1.6
      glowRef.current.scale.setScalar(node.size * glowScale)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      const baseGlow = theme === 'dark' ? 0.14 : 0.06
      mat.opacity = isHub
        ? colors.hubRing * 0.4 + Math.sin(t * 1.2) * 0.05
        : isHovered || isTouched
          ? baseGlow + 0.14
          : isActive
            ? baseGlow + 0.18
            : baseGlow
    }
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        if (isTouch || e.pointerType === 'touch') return
        e.stopPropagation()
        setHoveredId(node.id)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        if (isTouch || e.pointerType === 'touch') return
        e.stopPropagation()
        setHoveredId(null)
        document.body.style.cursor = 'default'
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        setTouchedId(node.id)
        window.setTimeout(() => setTouchedId(null), 650)
      }}
      onClick={(e) => {
        e.stopPropagation()
        handlePulse()
      }}
    >
      {isHub && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[node.size * 1.55, 0.006, 12, 64]} />
          <meshBasicMaterial color={colors.node} transparent opacity={colors.hubRing} />
        </mesh>
      )}
      {isHub && (
        <mesh rotation={[Math.PI / 2.2, 0.4, 0]}>
          <torusGeometry args={[node.size * 1.15, 0.005, 12, 64]} />
          <meshBasicMaterial
            color={colors.node}
            transparent
            opacity={colors.hubRing * 0.75}
          />
        </mesh>
      )}

      <TouchRipple active={isTouched} size={node.size} />

      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={colors.nodeGlow}
          transparent
          opacity={0.08}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[1, isHub ? 32 : 20, isHub ? 32 : 20]} />
        <meshBasicMaterial
          color={colors.node}
          transparent
          opacity={isHub ? 1 : 0.88}
          toneMapped={false}
        />
      </mesh>

      <NodeLabel node={node} />
    </group>
  )
}

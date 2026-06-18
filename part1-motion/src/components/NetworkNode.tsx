import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGraphRotation } from '../context/graphRotation'
import { useSceneTheme } from '../context/sceneTheme'
import { useNetwork } from './NetworkScene'
import type { GraphNode } from '../utils/networkGraph'
import {
  getSphereById,
  interpolateNodeSize,
  interpolatePosition,
} from '../utils/networkGraph'
import { NodeLabel } from './NodeLabel'
import { TouchRipple } from './TouchRipple'

interface NetworkNodeProps {
  node: GraphNode
}

export function NetworkNode({ node }: NetworkNodeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)
  const { wasDragged } = useGraphRotation()
  const {
    hoveredId,
    activeId,
    touchedId,
    layoutProgress,
    setHoveredId,
    triggerPulse,
    setTouchedId,
    nodePositions,
    reducedMotion,
    isTouch,
  } = useNetwork()
  const { colors, theme } = useSceneTheme()

  const isHub = node.role === 'hub'
  const isFiller = node.role === 'filler'
  const isHovered = hoveredId === node.id
  const isActive = activeId === node.id
  const isTouched = touchedId === node.id
  const isEmphasized = isHovered || isActive || isTouched

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
    const basePos = interpolatePosition(node, layoutProgress)
    const nodeSize = interpolateNodeSize(node, layoutProgress)
    const neuralWeight = 1 - layoutProgress
    const logoWeight = layoutProgress

    if (!reducedMotion) {
      const neuralDrift = isHub ? 0.035 : 0.052
      const logoDrift = isHub ? 0.018 : 0.04

      const ox =
        neuralWeight *
        Math.sin(t * node.floatSpeed + node.floatOffset) *
        neuralDrift
      const oy =
        neuralWeight *
        Math.sin(t * node.floatSpeed * 0.9 + node.floatOffset) *
        neuralDrift
      const oz =
        neuralWeight *
        Math.sin(t * node.floatSpeed * 0.7 + node.floatOffset * 1.3) *
        neuralDrift

      let nx = 0
      let ny = 1
      let nz = 0

      if (logoWeight > 0.001) {
        if (isHub) {
          const large = getSphereById('large')
          const normal = basePos.clone().sub(large.center).normalize()
          nx = normal.x
          ny = normal.y
          nz = normal.z
        } else if (node.sphereId) {
          const sphere = getSphereById(node.sphereId)
          const normal = basePos.clone().sub(sphere.center).normalize()
          nx = normal.x
          ny = normal.y
          nz = normal.z
        }
      }

      const lx =
        logoWeight * nx * Math.sin(t * node.floatSpeed + node.floatOffset) * logoDrift
      const ly =
        logoWeight * ny * Math.sin(t * node.floatSpeed * 0.9 + node.floatOffset) * logoDrift
      const lz =
        logoWeight * nz * Math.sin(t * node.floatSpeed * 0.7 + node.floatOffset * 1.3) * logoDrift

      groupRef.current.position.set(basePos.x + ox + lx, basePos.y + oy + ly, basePos.z + oz + lz)
    } else {
      groupRef.current.position.copy(basePos)
    }

    nodePositions.set(node.id, groupRef.current.position.clone())

    const fillerFade = isFiller ? THREE.MathUtils.lerp(1, 0.32, layoutProgress) : 1
    const touchBump = isTouched ? 1.2 : 1
    const emphasis = isEmphasized ? 1.28 : 1

    if (coreRef.current) {
      const scale = nodeSize * emphasis * touchBump * fillerFade
      coreRef.current.scale.setScalar(scale)
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = (isHub ? 1 : 0.94) * fillerFade
    }

    if (glowRef.current) {
      const glowScale = isHub
        ? 2.4 + Math.sin(t * 1.4) * 0.1 + layoutProgress * 0.35
        : isEmphasized
          ? 2.6
          : 2.0
      glowRef.current.scale.setScalar(nodeSize * glowScale)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity =
        (isHub
          ? colors.hubIdleGlow + Math.sin(t * 1.2) * 0.05 + (isEmphasized ? 0.1 : 0)
          : isEmphasized
            ? colors.nodeIdleGlow + 0.2
            : colors.nodeIdleGlow) * fillerFade
    }

    if (haloRef.current && isHub) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.05
      haloRef.current.scale.setScalar(pulse)
      haloRef.current.visible = layoutProgress > 0.08
      const mat = haloRef.current.material as THREE.MeshBasicMaterial
      mat.opacity =
        (colors.hubRing * 0.3 + Math.sin(t * 1.1) * 0.06) * layoutProgress
    }
  })

  const hubRingOpacity = layoutProgress
  const showHubTorus = layoutProgress > 0.12

  return (
    <group
      ref={groupRef}
      renderOrder={20}
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
        <>
          <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={22}>
            <ringGeometry args={[node.logoSize * 1.45, node.logoSize * 1.85, 56]} />
            <meshBasicMaterial
              color={colors.nodeGlow}
              transparent
              opacity={0}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {showHubTorus && (
            <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={21}>
              <torusGeometry args={[node.logoSize * 1.75, 0.007, 12, 64]} />
              <meshBasicMaterial
                color={colors.node}
                transparent
                opacity={(theme === 'dark' ? 0.55 : 0.42) * hubRingOpacity}
                toneMapped={false}
              />
            </mesh>
          )}
        </>
      )}

      <TouchRipple active={isTouched} size={interpolateNodeSize(node, layoutProgress)} />

      <mesh ref={glowRef} renderOrder={21}>
        <sphereGeometry args={[1, 20, 20]} />
        <meshBasicMaterial
          color={colors.nodeGlow}
          transparent
          opacity={isHub ? colors.hubIdleGlow : colors.nodeIdleGlow}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={coreRef} renderOrder={22}>
        <sphereGeometry args={[1, isHub ? 32 : 24, isHub ? 32 : 24]} />
        <meshBasicMaterial
          color={colors.node}
          transparent
          opacity={isHub ? 1 : 0.94}
          depthTest={true}
          toneMapped={false}
        />
      </mesh>

      <NodeLabel node={node} />
    </group>
  )
}

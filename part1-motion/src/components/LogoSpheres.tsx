import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneTheme } from '../context/sceneTheme'
import { buildAccentGridGeometry, buildGraticuleGeometry } from '../utils/globeGeometry'
import { LOGO_SPHERES } from '../utils/networkGraph'

interface LogoSpheresProps {
  layoutProgress: number
}

function GlobeSphere({
  sphere,
  layoutProgress,
}: {
  sphere: (typeof LOGO_SPHERES)[number]
  layoutProgress: number
}) {
  const { colors, theme } = useSceneTheme()
  const gridRef = useRef<THREE.LineSegments>(null)
  const accentRef = useRef<THREE.LineSegments>(null)
  const groupRef = useRef<THREE.Group>(null)

  const fineGrid = useMemo(
    () => buildGraticuleGeometry(sphere.radius, 16, 24),
    [sphere.radius],
  )
  const accentGrid = useMemo(
    () => buildAccentGridGeometry(sphere.radius * 1.002, 80),
    [sphere.radius],
  )

  const isDark = theme === 'dark'

  useFrame((_, delta) => {
    if (groupRef.current) {
      const reveal = THREE.MathUtils.smoothstep(layoutProgress, 0.08, 0.55)
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.88, 1, reveal))
    }

    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.028 * layoutProgress
      const mat = gridRef.current.material as THREE.LineBasicMaterial
      mat.opacity =
        (isDark ? colors.globeGridOpacity : colors.globeGridOpacity * 0.85) * layoutProgress
    }
    if (accentRef.current) {
      accentRef.current.rotation.y += delta * 0.018 * layoutProgress
      const mat = accentRef.current.material as THREE.LineBasicMaterial
      mat.opacity =
        (isDark ? colors.globeAccentOpacity : colors.globeAccentOpacity * 0.9) * layoutProgress
    }
  })

  if (layoutProgress <= 0.01) return null

  return (
    <group ref={groupRef} position={sphere.center} renderOrder={0}>
      <lineSegments ref={gridRef} geometry={fineGrid} renderOrder={0}>
        <lineBasicMaterial
          color={colors.globeGrid}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      <lineSegments ref={accentRef} geometry={accentGrid} renderOrder={1}>
        <lineBasicMaterial
          color={colors.globeAccent}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  )
}

export function LogoSpheres({ layoutProgress }: LogoSpheresProps) {
  return (
    <>
      {LOGO_SPHERES.map((sphere) => (
        <GlobeSphere key={sphere.id} sphere={sphere} layoutProgress={layoutProgress} />
      ))}
    </>
  )
}

/** @deprecated use LogoSpheres */
export const LogoRingGuides = LogoSpheres

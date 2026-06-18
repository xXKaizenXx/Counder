import { useCallback, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import type * as THREE from 'three'
import type { ThemeMode } from '../utils/sceneTheme'
import { FocusContext } from '../context/cameraFocus'
import { NetworkScene, type FocusedNodeInfo } from './NetworkScene'

const DEFAULT_CAMERA = { x: 0.4, y: 0.6, z: 5.8 }
const HUB_ZOOM = 4.15

function CameraController({
  reducedMotion,
  theme,
  isTouch,
  suspendEffects,
  onNodeFocus,
  onHubClick,
}: {
  reducedMotion: boolean
  theme: ThemeMode
  isTouch: boolean
  suspendEffects?: boolean
  onNodeFocus?: (node: FocusedNodeInfo | null) => void
  onHubClick?: () => void
}) {
  const { camera, gl } = useThree()
  const hubFocused = useRef(false)

  useEffect(() => {
    camera.position.set(DEFAULT_CAMERA.x, DEFAULT_CAMERA.y, DEFAULT_CAMERA.z)
    camera.lookAt(0, 0, 0)
  }, [camera])

  useEffect(() => {
    gl.setClearColor(theme === 'dark' ? '#0a0a0a' : '#000000', 0)
  }, [gl, theme])

  const setFocus = useCallback(
    (target: THREE.Vector3 | null, zoom = DEFAULT_CAMERA.z) => {
      const isHubFocus = target !== null

      if (!isHubFocus && !hubFocused.current) return
      if (!isHubFocus && hubFocused.current) {
        hubFocused.current = false
      } else if (isHubFocus) {
        hubFocused.current = true
      }

      if (reducedMotion) return

      gsap.killTweensOf(camera.position)

      if (isHubFocus) {
        gsap.to(camera.position, {
          x: target!.x * 0.22 + DEFAULT_CAMERA.x * 0.78,
          y: target!.y * 0.22 + DEFAULT_CAMERA.y * 0.78,
          z: zoom,
          duration: isTouch ? 1.05 : 1.35,
          ease: 'power3.inOut',
          onUpdate: () => camera.lookAt(0, 0, 0),
        })
      } else {
        gsap.to(camera.position, {
          x: DEFAULT_CAMERA.x,
          y: DEFAULT_CAMERA.y,
          z: DEFAULT_CAMERA.z,
          duration: 1.5,
          ease: 'power3.inOut',
          onUpdate: () => camera.lookAt(0, 0, 0),
        })
      }
    },
    [camera, reducedMotion, isTouch],
  )

  return (
    <FocusContext.Provider value={{ setFocus }}>
      <NetworkScene
        reducedMotion={reducedMotion}
        theme={theme}
        isTouch={isTouch}
        suspendEffects={suspendEffects}
        onNodeFocus={onNodeFocus}
        onHubClick={onHubClick}
        hubZoom={HUB_ZOOM}
      />
    </FocusContext.Provider>
  )
}

interface NetworkCanvasProps {
  reducedMotion: boolean
  theme: ThemeMode
  isTouch: boolean
  suspendRendering?: boolean
  preserveDrawingBuffer?: boolean
  onNodeFocus?: (node: FocusedNodeInfo | null) => void
  onHubClick?: () => void
}

export function NetworkCanvas({
  reducedMotion,
  theme,
  isTouch,
  suspendRendering = false,
  preserveDrawingBuffer = false,
  onNodeFocus,
  onHubClick,
}: NetworkCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0.4, 0.6, 5.8], fov: 38 }}
      dpr={suspendRendering ? 1 : [1, 2]}
      frameloop={suspendRendering ? 'demand' : 'always'}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer }}
    >
      <CameraController
        reducedMotion={reducedMotion}
        theme={theme}
        isTouch={isTouch}
        suspendEffects={suspendRendering}
        onNodeFocus={onNodeFocus}
        onHubClick={onHubClick}
      />
    </Canvas>
  )
}

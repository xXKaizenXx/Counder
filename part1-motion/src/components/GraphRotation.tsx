import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  GraphRotationContext,
  useGraphRotationState,
} from '../context/graphRotation'

const DRAG_THRESHOLD = 6
const MAX_TILT = Math.PI * 0.38

interface GraphRotationProps {
  children: ReactNode
  reducedMotion: boolean
}

export function GraphRotation({ children, reducedMotion }: GraphRotationProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { gl } = useThree()
  const { dragMoved, dragging, api } = useGraphRotationState()
  const pointer = useRef({ x: 0, y: 0, id: -1 })

  useEffect(() => {
    const el = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging.current = true
      dragMoved.current = false
      pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
      el.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current || e.pointerId !== pointer.current.id) return

      const dx = e.clientX - pointer.current.x
      const dy = e.clientY - pointer.current.y

      if (!dragMoved.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        dragMoved.current = true
      }

      if (!dragMoved.current || !groupRef.current) return

      groupRef.current.rotation.y += dx * 0.005
      groupRef.current.rotation.x += dy * 0.004
      groupRef.current.rotation.x = THREE.MathUtils.clamp(
        groupRef.current.rotation.x,
        -MAX_TILT,
        MAX_TILT,
      )

      pointer.current.x = e.clientX
      pointer.current.y = e.clientY
    }

    const endDrag = (e: PointerEvent) => {
      if (e.pointerId !== pointer.current.id) return
      dragging.current = false
      pointer.current.id = -1
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId)
      }
      window.setTimeout(() => {
        dragMoved.current = false
      }, 80)
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', endDrag)
    el.addEventListener('pointercancel', endDrag)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', endDrag)
      el.removeEventListener('pointercancel', endDrag)
    }
  }, [gl, dragMoved, dragging])

  useFrame((_, delta) => {
    if (reducedMotion || dragging.current || !groupRef.current) return
    groupRef.current.rotation.y += delta * 0.04
  })

  return (
    <GraphRotationContext.Provider value={api}>
      <group ref={groupRef}>{children}</group>
    </GraphRotationContext.Provider>
  )
}

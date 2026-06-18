import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ThemeMode } from '../utils/sceneTheme'
import { SCENE_COLORS } from '../utils/sceneTheme'
import { ThemeContext } from '../context/sceneTheme'
import {
  buildNetworkGraph,
  findPathToHub,
  getNodeById,
  type GraphNode,
} from '../utils/networkGraph'
import { useCameraFocus } from '../context/cameraFocus'
import { GraphRotation } from './GraphRotation'
import { HubRipple } from './HubRipple'
import { NetworkEdges } from './NetworkEdges'
import { NetworkNode } from './NetworkNode'
import { PulseStreams } from './PulseStreams'
import { SceneEffects } from './SceneEffects'

export interface FocusedNodeInfo {
  id: string
  label: string
  role: string
}

interface NetworkState {
  hoveredId: string | null
  activeId: string | null
  touchedId: string | null
  rippleKey: number
  setHoveredId: (id: string | null) => void
  setTouchedId: (id: string | null) => void
  triggerPulse: (id: string) => void
  nodes: GraphNode[]
  nodePositions: Map<string, THREE.Vector3>
  reducedMotion: boolean
  isTouch: boolean
}

const NetworkContext = createContext<NetworkState | null>(null)

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkScene')
  return ctx
}

interface NetworkSceneProps {
  reducedMotion: boolean
  theme: ThemeMode
  isTouch: boolean
  onNodeFocus?: (node: FocusedNodeInfo | null) => void
  hubZoom: number
}

export function NetworkScene({
  reducedMotion,
  theme,
  isTouch,
  onNodeFocus,
  hubZoom,
}: NetworkSceneProps) {
  const graph = useMemo(() => buildNetworkGraph(), [])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [touchedId, setTouchedId] = useState<string | null>(null)
  const [rippleKey, setRippleKey] = useState(0)
  const nodePositions = useRef(new Map<string, THREE.Vector3>())
  const { setFocus } = useCameraFocus()
  const demoFired = useRef(false)
  const themeColors = SCENE_COLORS[theme]

  const applyHubCamera = (id: string | null) => {
    if (id === 'hub') {
      const node = getNodeById(graph.nodes, id)
      setFocus(node?.position.clone() ?? null, hubZoom)
    } else {
      setFocus(null)
    }
  }

  const notifyFocus = (id: string | null) => {
    if (!id) {
      onNodeFocus?.(null)
      return
    }
    const node = getNodeById(graph.nodes, id)
    if (node) {
      onNodeFocus?.({ id: node.id, label: node.label, role: node.role })
    }
  }

  const triggerPulse = (id: string) => {
    if (reducedMotion) return
    setActiveId(id)
    setRippleKey((k) => k + 1)
    notifyFocus(id)
    applyHubCamera(id)
    window.setTimeout(() => setActiveId(null), 2400)
  }

  const handleHover = (id: string | null) => {
    setHoveredId(id)
    notifyFocus(id)
    applyHubCamera(id)
  }

  useEffect(() => {
    if (reducedMotion || demoFired.current || isTouch) return
    demoFired.current = true
    const timer = window.setTimeout(() => {
      const nyc = graph.nodes.find((n) => n.label === 'New York')
      if (nyc) triggerPulse(nyc.id)
    }, 2400)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, isTouch])

  const activePath = useMemo(() => {
    if (!activeId || activeId === 'hub') return []
    return findPathToHub(activeId, graph.adjacency)
  }, [activeId, graph.adjacency])

  const ctx: NetworkState = {
    hoveredId,
    activeId,
    touchedId,
    rippleKey,
    setHoveredId: handleHover,
    setTouchedId,
    triggerPulse,
    nodes: graph.nodes,
    nodePositions: nodePositions.current,
    reducedMotion,
    isTouch,
  }

  return (
    <ThemeContext.Provider value={{ theme, colors: themeColors, isTouch }}>
      <NetworkContext.Provider value={ctx}>
        <ambientLight intensity={theme === 'dark' ? 0.35 : 0.85} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={theme === 'dark' ? 0.55 : 0.35}
        />
        <directionalLight position={[-4, -2, 2]} intensity={theme === 'dark' ? 0.2 : 0.15} />

        <GraphRotation reducedMotion={reducedMotion}>
          <NetworkEdges edges={graph.edges} />
          <PulseStreams path={activePath} />

          {graph.nodes.map((node) => (
            <NetworkNode key={node.id} node={node} />
          ))}

          <HubRipple key={rippleKey} />
        </GraphRotation>

        <SceneEffects reducedMotion={reducedMotion} />
        <PositionSync />
      </NetworkContext.Provider>
    </ThemeContext.Provider>
  )
}

function PositionSync() {
  const { nodes, nodePositions } = useNetwork()

  useFrame(() => {
    nodes.forEach((node) => {
      if (!nodePositions.has(node.id)) {
        nodePositions.set(node.id, node.position.clone())
      }
    })
  })

  return null
}

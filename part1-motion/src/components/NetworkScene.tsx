import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import type { ThemeMode } from '../utils/sceneTheme'
import { SCENE_COLORS } from '../utils/sceneTheme'
import { ThemeContext } from '../context/sceneTheme'
import { NetworkLayoutProvider } from '../context/networkLayout'
import {
  buildDualLayoutGraph,
  findPathToHub,
  getAdjacencyForProgress,
  getNodeById,
  type GraphNode,
  type NetworkLayoutMode,
} from '../utils/networkGraph'
import { useCameraFocus } from '../context/cameraFocus'
import { GraphRotation } from './GraphRotation'
import { HubRipple } from './HubRipple'
import { LogoSpheres } from './LogoSpheres'
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
  layoutProgress: number
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
  networkLayout: NetworkLayoutMode
  suspendEffects?: boolean
  onNodeFocus?: (node: FocusedNodeInfo | null) => void
  onHubClick?: () => void
  hubZoom: number
}

export function NetworkScene({
  reducedMotion,
  theme,
  isTouch,
  networkLayout,
  suspendEffects = false,
  onNodeFocus,
  onHubClick,
  hubZoom,
}: NetworkSceneProps) {
  const graph = useMemo(() => buildDualLayoutGraph(), [])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [touchedId, setTouchedId] = useState<string | null>(null)
  const [rippleKey, setRippleKey] = useState(0)
  const [layoutProgress, setLayoutProgress] = useState(0)
  const layoutAnim = useRef({ progress: 0 })
  const nodePositions = useRef(new Map<string, THREE.Vector3>())
  const { setFocus } = useCameraFocus()
  const demoFired = useRef(false)
  const themeColors = SCENE_COLORS[theme]

  useEffect(() => {
    const target = networkLayout === 'logo' ? 1 : 0
    if (reducedMotion) {
      layoutAnim.current.progress = target
      setLayoutProgress(target)
      return
    }

    gsap.killTweensOf(layoutAnim.current)
    gsap.to(layoutAnim.current, {
      progress: target,
      duration: 1.85,
      ease: 'power3.inOut',
      onUpdate: () => setLayoutProgress(layoutAnim.current.progress),
    })
  }, [networkLayout, reducedMotion])

  const applyHubCamera = (id: string | null) => {
    if (id === 'hub') {
      const pos = nodePositions.current.get('hub')
      setFocus(pos?.clone() ?? null, hubZoom)
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
    if (id === 'hub') {
      onHubClick?.()
      setActiveId(id)
      setRippleKey((k) => k + 1)
      notifyFocus(id)
      applyHubCamera(id)
      window.setTimeout(() => setActiveId(null), 3200)
      return
    }

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
    const adjacency = getAdjacencyForProgress(graph, layoutProgress)
    return findPathToHub(activeId, adjacency)
  }, [activeId, graph, layoutProgress])

  const ctx: NetworkState = {
    hoveredId,
    activeId,
    touchedId,
    rippleKey,
    layoutProgress,
    setHoveredId: handleHover,
    setTouchedId,
    triggerPulse,
    nodes: graph.nodes,
    nodePositions: nodePositions.current,
    reducedMotion,
    isTouch,
  }

  const neuralEdgeOpacity = 1 - layoutProgress
  const logoEdgeOpacity = layoutProgress

  return (
    <ThemeContext.Provider value={{ theme, colors: themeColors, isTouch }}>
      <NetworkLayoutProvider value={{ layoutProgress, isLogoLayout: layoutProgress > 0.5 }}>
        <NetworkContext.Provider value={ctx}>
          <ambientLight intensity={theme === 'dark' ? 0.38 : 0.68} />
          <hemisphereLight
            args={[theme === 'dark' ? '#2a2824' : '#ffffff', theme === 'dark' ? '#080808' : '#e8e4dc', 0.5]}
          />
          <directionalLight
            position={[3.5, 4, 5]}
            intensity={theme === 'dark' ? 0.65 : 0.5}
          />
          <directionalLight position={[-4, -1, 3]} intensity={theme === 'dark' ? 0.22 : 0.18} />
          <pointLight
            position={[-1.8, 0.8, 3.2]}
            intensity={theme === 'dark' ? 0.85 + layoutProgress * 0.25 : 0.7 + layoutProgress * 0.15}
            color="#fff9f2"
          />
          <pointLight
            position={[1.6, -0.6, 2.8]}
            intensity={theme === 'dark' ? 0.35 + layoutProgress * 0.2 : 0.3 + layoutProgress * 0.15}
            color="#e8e2d8"
          />

          <GraphRotation reducedMotion={reducedMotion}>
            <LogoSpheres layoutProgress={layoutProgress} />

            {neuralEdgeOpacity > 0.01 && (
              <NetworkEdges
                edges={graph.neuralEdges}
                edgeMode="neural"
                opacity={neuralEdgeOpacity}
              />
            )}
            {logoEdgeOpacity > 0.01 && (
              <NetworkEdges edges={graph.logoEdges} edgeMode="logo" opacity={logoEdgeOpacity} />
            )}

            <PulseStreams path={activePath} />

            {graph.nodes.map((node) => (
              <NetworkNode key={node.id} node={node} />
            ))}

            <HubRipple key={rippleKey} />
          </GraphRotation>

          <SceneEffects reducedMotion={reducedMotion || suspendEffects} />
          <PositionSync />
        </NetworkContext.Provider>
      </NetworkLayoutProvider>
    </ThemeContext.Provider>
  )
}

function PositionSync() {
  const { nodes, nodePositions } = useNetwork()

  useFrame(() => {
    nodes.forEach((node) => {
      if (!nodePositions.has(node.id)) {
        nodePositions.set(node.id, node.neuralPosition.clone())
      }
    })
  })

  return null
}

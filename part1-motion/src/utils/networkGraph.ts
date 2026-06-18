import * as THREE from 'three'
import { sphericalToCartesian } from './globeGeometry'

export type NodeRole = 'city' | 'hub' | 'filler'
export type NetworkLayoutMode = 'neural' | 'logo'

export interface LogoSphere {
  id: 'large' | 'small'
  center: THREE.Vector3
  radius: number
}

export interface GraphNode {
  id: string
  role: NodeRole
  label: string
  sphereId?: LogoSphere['id']
  neuralPosition: THREE.Vector3
  logoPosition: THREE.Vector3
  floatOffset: number
  floatSpeed: number
  size: number
  logoSize: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string
}

export interface DualLayoutGraph {
  nodes: GraphNode[]
  neuralEdges: GraphEdge[]
  logoEdges: GraphEdge[]
  neuralAdjacency: Map<string, string[]>
  logoAdjacency: Map<string, string[]>
}

/** Primary cities — echoed in the section copy and node labels. */
export const NETWORK_CITIES = [
  'New York',
  'Zurich',
  'São Paulo',
  'Lagos',
  'Dubai',
  'Tokyo',
  'London',
  'Singapore',
] as const

export const LOGO_SPHERES: LogoSphere[] = [
  { id: 'large', center: new THREE.Vector3(-0.54, 0.06, 0), radius: 0.78 },
  { id: 'small', center: new THREE.Vector3(0.564, -0.547, 0), radius: 0.48 },
]

export const LOGO_RINGS = LOGO_SPHERES

const EXTENDED_CITIES = [
  ...NETWORK_CITIES,
  'Berlin',
  'Paris',
  'Mumbai',
  'Sydney',
  'Nairobi',
  'Hong Kong',
  'Toronto',
  'Mexico City',
  'Seoul',
  'Amsterdam',
  'Milan',
  'Dublin',
  'Johannesburg',
  'Riyadh',
  'Stockholm',
  'Madrid',
  'Istanbul',
  'Buenos Aires',
  'Vancouver',
  'Copenhagen',
  'Oslo',
]

const LARGE_LOGO_CITIES = new Set<string>(['New York', 'London', 'Zurich', 'Lagos', 'Tokyo'])
const SMALL_LOGO_CITIES = new Set<string>(['São Paulo', 'Dubai', 'Singapore'])

const LARGE_LOGO_SLOTS: Record<string, { theta: number; phi: number }> = {
  'New York': { theta: 0.35, phi: 1.35 },
  London: { theta: 1.05, phi: 1.55 },
  Zurich: { theta: 1.75, phi: 1.45 },
  Lagos: { theta: 2.45, phi: 1.65 },
  Tokyo: { theta: 3.15, phi: 1.5 },
}

const SMALL_LOGO_SLOTS: Record<string, { theta: number; phi: number }> = {
  'São Paulo': { theta: -0.15, phi: 1.25 },
  Dubai: { theta: 0.75, phi: 1.55 },
  Singapore: { theta: 1.65, phi: 1.35 },
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function neuralScatter(seed: number, radius: number): THREE.Vector3 {
  const u = seededRandom(seed)
  const v = seededRandom(seed + 1)
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta) * 0.65,
    radius * Math.cos(phi),
  )
}

export function getSphereById(id: LogoSphere['id']): LogoSphere {
  return LOGO_SPHERES.find((s) => s.id === id)!
}

export function pointOnSphere(
  sphere: LogoSphere,
  theta: number,
  phi: number,
  lift = 1.035,
): THREE.Vector3 {
  const local = sphericalToCartesian(sphere.radius * lift, theta, phi)
  return local.add(sphere.center)
}

export function getHubLogoPosition(): THREE.Vector3 {
  const [large, small] = LOGO_SPHERES
  const dir = small.center.clone().sub(large.center).normalize()
  return large.center.clone().add(dir.multiplyScalar(large.radius * 1.035))
}

function projectToSphereSurface(
  point: THREE.Vector3,
  sphere: LogoSphere,
  lift = 1.03,
): THREE.Vector3 {
  const offset = point.clone().sub(sphere.center)
  if (offset.lengthSq() < 0.0001) {
    return pointOnSphere(sphere, 0, Math.PI / 2, lift)
  }
  const dir = offset.normalize()
  const phi = Math.acos(THREE.MathUtils.clamp(dir.y, -1, 1))
  const theta = Math.atan2(dir.z, dir.x)
  return pointOnSphere(sphere, theta, phi, lift)
}

function nearestSphere(point: THREE.Vector3): LogoSphere {
  let best = LOGO_SPHERES[0]
  let bestDist = Infinity
  for (const sphere of LOGO_SPHERES) {
    const d = Math.abs(point.distanceTo(sphere.center) - sphere.radius)
    if (d < bestDist) {
      bestDist = d
      best = sphere
    }
  }
  return best
}

function computeLogoPosition(node: Omit<GraphNode, 'logoPosition'>): THREE.Vector3 {
  if (node.role === 'hub') return getHubLogoPosition()

  if (LARGE_LOGO_CITIES.has(node.label)) {
    const slot = LARGE_LOGO_SLOTS[node.label]
    return pointOnSphere(LOGO_SPHERES[0], slot.theta, slot.phi)
  }
  if (SMALL_LOGO_CITIES.has(node.label)) {
    const slot = SMALL_LOGO_SLOTS[node.label]
    return pointOnSphere(LOGO_SPHERES[1], slot.theta, slot.phi)
  }

  const sphere = nearestSphere(node.neuralPosition)
  return projectToSphereSurface(node.neuralPosition, sphere)
}

function buildAdjacency(edges: GraphEdge[]) {
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    adjacency.set(edge.from, [...(adjacency.get(edge.from) ?? []), edge.to])
    adjacency.set(edge.to, [...(adjacency.get(edge.to) ?? []), edge.from])
  }
  return adjacency
}

function addEdge(edges: GraphEdge[], from: string, to: string) {
  if (from === to) return
  const key = [from, to].sort().join('::')
  if (edges.some((e) => [e.from, e.to].sort().join('::') === key)) return
  edges.push({ id: key, from, to })
}

export function buildDualLayoutGraph(): DualLayoutGraph {
  const nodes: GraphNode[] = [
    {
      id: 'hub',
      role: 'hub',
      label: 'Cape Town',
      neuralPosition: new THREE.Vector3(0, 0, 0),
      logoPosition: getHubLogoPosition(),
      floatOffset: 0,
      floatSpeed: 0,
      size: 0.11,
      logoSize: 0.125,
    },
  ]

  for (let i = 0; i < 26; i++) {
    const city = EXTENDED_CITIES[i % EXTENDED_CITIES.length]
    const radius = 1.35 + seededRandom(i * 3) * 0.85
    const isFeatured = NETWORK_CITIES.includes(city as (typeof NETWORK_CITIES)[number])
    nodes.push({
      id: `node-${i}`,
      role: isFeatured ? 'city' : 'filler',
      label: city,
      sphereId: LARGE_LOGO_CITIES.has(city)
        ? 'large'
        : SMALL_LOGO_CITIES.has(city)
          ? 'small'
          : undefined,
      neuralPosition: neuralScatter(i * 3 + 7, radius),
      logoPosition: new THREE.Vector3(),
      floatOffset: seededRandom(i * 5) * Math.PI * 2,
      floatSpeed: 0.35 + seededRandom(i * 11) * 0.45,
      size: isFeatured ? 0.048 : 0.038,
      logoSize: isFeatured ? 0.05 : 0.028,
    })
  }

  nodes.forEach((node) => {
    if (node.id === 'hub') return
    node.logoPosition = computeLogoPosition(node)
    if (!node.sphereId) {
      node.sphereId = nearestSphere(node.neuralPosition).id
    }
  })

  const neuralEdges: GraphEdge[] = []
  const peripheral = nodes.filter((n) => n.id !== 'hub')

  peripheral.forEach((node, i) => {
    const distances = peripheral
      .filter((other) => other.id !== node.id)
      .map((other) => ({
        id: other.id,
        d: node.neuralPosition.distanceTo(other.neuralPosition),
      }))
      .sort((a, b) => a.d - b.d)

    addEdge(neuralEdges, node.id, distances[0].id)
    if (distances[1]) addEdge(neuralEdges, node.id, distances[1].id)
    if (i % 4 === 0) addEdge(neuralEdges, node.id, 'hub')
    else if (distances[2]) addEdge(neuralEdges, node.id, distances[2].id)
  })

  peripheral
    .sort((a, b) => a.neuralPosition.length() - b.neuralPosition.length())
    .slice(0, 12)
    .forEach((n) => addEdge(neuralEdges, n.id, 'hub'))

  const logoEdges: GraphEdge[] = []
  const largeNodes = nodes.filter((n) => LARGE_LOGO_CITIES.has(n.label))
  const smallNodes = nodes.filter((n) => SMALL_LOGO_CITIES.has(n.label))

  const sortByTheta = (list: GraphNode[]) =>
    [...list].sort((a, b) => {
      const sphere = getSphereById(
        a.sphereId ?? (LARGE_LOGO_CITIES.has(a.label) ? 'large' : 'small'),
      )
      const ta = a.logoPosition.clone().sub(sphere.center)
      const tb = b.logoPosition.clone().sub(sphere.center)
      return Math.atan2(ta.z, ta.x) - Math.atan2(tb.z, tb.x)
    })

  const chainEdges = (list: GraphNode[]) => {
    const sorted = sortByTheta(list)
    for (let i = 0; i < sorted.length - 1; i++) {
      addEdge(logoEdges, sorted[i].id, sorted[i + 1].id)
    }
  }

  chainEdges(largeNodes)
  chainEdges(smallNodes)

  nodes.filter((n) => n.id !== 'hub').forEach((n) => addEdge(logoEdges, n.id, 'hub'))

  return {
    nodes,
    neuralEdges,
    logoEdges,
    neuralAdjacency: buildAdjacency(neuralEdges),
    logoAdjacency: buildAdjacency(logoEdges),
  }
}

/** @deprecated use buildDualLayoutGraph */
export function buildNetworkGraph() {
  const graph = buildDualLayoutGraph()
  return {
    nodes: graph.nodes.map((n) => ({ ...n, position: n.neuralPosition })),
    edges: graph.neuralEdges,
    adjacency: graph.neuralAdjacency,
  }
}

export function interpolatePosition(node: GraphNode, t: number): THREE.Vector3 {
  return new THREE.Vector3().lerpVectors(node.neuralPosition, node.logoPosition, t)
}

export function interpolateNodeSize(node: GraphNode, t: number): number {
  return THREE.MathUtils.lerp(node.size, node.logoSize, t)
}

export function getAdjacencyForProgress(
  graph: DualLayoutGraph,
  progress: number,
): Map<string, string[]> {
  return progress >= 0.5 ? graph.logoAdjacency : graph.neuralAdjacency
}

export function getEdgesForProgress(graph: DualLayoutGraph, progress: number): GraphEdge[] {
  return progress >= 0.5 ? graph.logoEdges : graph.neuralEdges
}

export function findPathToHub(
  startId: string,
  adjacency: Map<string, string[]>,
): string[] {
  if (startId === 'hub') return ['hub']
  const queue: string[][] = [[startId]]
  const visited = new Set<string>([startId])

  while (queue.length > 0) {
    const path = queue.shift()!
    const current = path[path.length - 1]
    for (const next of adjacency.get(current) ?? []) {
      if (visited.has(next)) continue
      const nextPath = [...path, next]
      if (next === 'hub') return nextPath
      visited.add(next)
      queue.push(nextPath)
    }
  }

  return [startId, 'hub']
}

export function getNodeById(nodes: GraphNode[], id: string) {
  return nodes.find((n) => n.id === id)
}

export function edgeKey(a: string, b: string) {
  return [a, b].sort().join('::')
}

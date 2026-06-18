import * as THREE from 'three'

export type NodeRole = 'city' | 'hub'

export interface GraphNode {
  id: string
  role: NodeRole
  label: string
  position: THREE.Vector3
  floatOffset: number
  floatSpeed: number
  size: number
}

export interface GraphEdge {
  id: string
  from: string
  to: string
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
  'Singapore',
  'Stockholm',
  'Madrid',
  'Istanbul',
  'Buenos Aires',
  'Vancouver',
]

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453
  return x - Math.floor(x)
}

function sphericalPosition(seed: number, radius: number): THREE.Vector3 {
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

export function buildNetworkGraph(): {
  nodes: GraphNode[]
  edges: GraphEdge[]
  adjacency: Map<string, string[]>
} {
  const nodes: GraphNode[] = [
    {
      id: 'hub',
      role: 'hub',
      label: 'Cape Town',
      position: new THREE.Vector3(0, 0, 0),
      floatOffset: 0,
      floatSpeed: 0,
      size: 0.11,
    },
  ]

  for (let i = 0; i < 28; i++) {
    const city = EXTENDED_CITIES[i % EXTENDED_CITIES.length]
    const radius = 1.35 + seededRandom(i * 3) * 0.85
    nodes.push({
      id: `node-${i}`,
      role: 'city',
      label: city,
      position: sphericalPosition(i * 3 + 7, radius),
      floatOffset: seededRandom(i * 5) * Math.PI * 2,
      floatSpeed: 0.35 + seededRandom(i * 11) * 0.45,
      size: 0.044 + seededRandom(i * 13) * 0.012,
    })
  }

  const edges: GraphEdge[] = []
  const adjacency = new Map<string, string[]>()
  const addEdge = (from: string, to: string) => {
    if (from === to) return
    const key = [from, to].sort().join('::')
    if (edges.some((e) => [e.from, e.to].sort().join('::') === key)) return
    edges.push({ id: key, from, to })
    adjacency.set(from, [...(adjacency.get(from) ?? []), to])
    adjacency.set(to, [...(adjacency.get(to) ?? []), from])
  }

  const peripheral = nodes.filter((n) => n.id !== 'hub')

  peripheral.forEach((node, i) => {
    const distances = peripheral
      .filter((other) => other.id !== node.id)
      .map((other) => ({
        id: other.id,
        d: node.position.distanceTo(other.position),
      }))
      .sort((a, b) => a.d - b.d)

    addEdge(node.id, distances[0].id)
    if (distances[1]) addEdge(node.id, distances[1].id)
    if (i % 4 === 0) addEdge(node.id, 'hub')
    else if (distances[2]) addEdge(node.id, distances[2].id)
  })

  peripheral
    .sort(
      (a, b) =>
        a.position.distanceTo(new THREE.Vector3()) -
        b.position.distanceTo(new THREE.Vector3()),
    )
    .slice(0, 10)
    .forEach((n) => addEdge(n.id, 'hub'))

  return { nodes, edges, adjacency }
}

/** Shortest path (BFS) for pulse routing toward the hub. */
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
    const neighbors = adjacency.get(current) ?? []

    for (const next of neighbors) {
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

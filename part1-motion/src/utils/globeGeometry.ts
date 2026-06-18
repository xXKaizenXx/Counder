import * as THREE from 'three'

export function sphericalToCartesian(
  radius: number,
  theta: number,
  phi: number,
): THREE.Vector3 {
  const sinPhi = Math.sin(phi)
  return new THREE.Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta),
  )
}

function pushCircle(
  points: number[],
  segments: number,
  sample: (t: number) => THREE.Vector3,
) {
  for (let i = 0; i < segments; i++) {
    const t1 = (i / segments) * Math.PI * 2
    const t2 = ((i + 1) / segments) * Math.PI * 2
    const p1 = sample(t1)
    const p2 = sample(t2)
    points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
  }
}

export function buildGraticuleGeometry(
  radius: number,
  latBands = 14,
  lonBands = 22,
): THREE.BufferGeometry {
  const points: number[] = []

  for (let lat = 1; lat < latBands; lat++) {
    const phi = (lat / latBands) * Math.PI
    pushCircle(points, lonBands * 2, (t) =>
      sphericalToCartesian(radius, t, phi),
    )
  }

  for (let lon = 0; lon < lonBands; lon++) {
    const theta = (lon / lonBands) * Math.PI * 2
    for (let lat = 1; lat < latBands; lat++) {
      const p1 = sphericalToCartesian(radius, theta, (lat / latBands) * Math.PI)
      const p2 = sphericalToCartesian(radius, theta, ((lat + 1) / latBands) * Math.PI)
      points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

/** Brighter equator + meridians for structure and logo read. */
export function buildAccentGridGeometry(radius: number, segments = 72): THREE.BufferGeometry {
  const points: number[] = []

  pushCircle(points, segments, (t) => sphericalToCartesian(radius, t, Math.PI / 2))

  for (const theta of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    for (let i = 0; i < segments; i++) {
      const p1 = sphericalToCartesian(radius, theta, (i / segments) * Math.PI)
      const p2 = sphericalToCartesian(radius, theta, ((i + 1) / segments) * Math.PI)
      points.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return geometry
}

export function slerpOnSphere(
  a: THREE.Vector3,
  b: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  t: number,
): THREE.Vector3 {
  const va = a.clone().sub(center).normalize()
  const vb = b.clone().sub(center).normalize()
  const dot = THREE.MathUtils.clamp(va.dot(vb), -1, 1)
  const omega = Math.acos(dot)

  if (omega < 0.0001) {
    return a.clone().sub(center).normalize().multiplyScalar(radius).add(center)
  }

  const sinOmega = Math.sin(omega)
  const coeffA = Math.sin((1 - t) * omega) / sinOmega
  const coeffB = Math.sin(t * omega) / sinOmega
  const dir = va.multiplyScalar(coeffA).add(vb.multiplyScalar(coeffB)).normalize()
  return dir.multiplyScalar(radius).add(center)
}

export function sampleGreatCircle(
  a: THREE.Vector3,
  b: THREE.Vector3,
  center: THREE.Vector3,
  radius: number,
  segments = 20,
): THREE.Vector3[] {
  return Array.from({ length: segments + 1 }, (_, i) =>
    slerpOnSphere(a, b, center, radius, i / segments),
  )
}

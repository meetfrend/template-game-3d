import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Color, DynamicDrawUsage, type InstancedMesh, Object3D, Vector3, type Vector3Like } from 'three'
import { STYLE } from '../style'
import { gameDelta } from './time'

/**
 * Pooled particles for bursts: hits, pickups, dust, sparks. Mount <Particles /> once in the scene,
 * then call burst() from anywhere. Particles are unlit and not tone mapped, so colors brighter than
 * white (e.g. new Color(4, 2, 1)) glow when bloom is on.
 */
const CAPACITY = 600

type BurstOptions = {
  count?: number
  color?: string | Color
  /** Starting speed in units per second. */
  speed?: number
  /** Seconds. Each particle lives between half this and this. */
  life?: number
  size?: number
  /** Units per second squared, pulling down. Negative floats up. */
  gravity?: number
  /** 0 bursts in every direction, 1 sprays only upward. */
  upward?: number
}

const particles = Array.from({ length: CAPACITY }, () => ({
  position: new Vector3(),
  velocity: new Vector3(),
  color: new Color(),
  age: 0,
  life: 0,
  size: 0,
  gravity: 0,
}))
let next = 0

export function burst(at: Vector3Like, options: BurstOptions = {}): void {
  const { count = 16, color = STYLE.palette.accent, speed = 6, life = 0.6, size = 0.12, gravity = 12, upward = 0.4 } = options
  const tint = new Color(color)
  for (let i = 0; i < Math.round(count * STYLE.feel.particles); i++) {
    const p = particles[next]!
    next = (next + 1) % CAPACITY
    p.position.copy(at)
    p.velocity.randomDirection()
    p.velocity.y = Math.abs(p.velocity.y) * upward + p.velocity.y * (1 - upward)
    p.velocity.multiplyScalar(speed * (0.4 + Math.random() * 0.6))
    p.color.copy(tint)
    p.age = 0
    p.life = life * (0.5 + Math.random() * 0.5)
    p.size = size * (0.6 + Math.random() * 0.8)
    p.gravity = gravity
  }
}

const dummy = new Object3D()

export function Particles() {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    mesh.current?.instanceMatrix.setUsage(DynamicDrawUsage)
  }, [])

  useFrame((_, rawDelta) => {
    const delta = gameDelta(rawDelta)
    const instances = mesh.current
    if (!instances) return
    for (let i = 0; i < CAPACITY; i++) {
      const p = particles[i]!
      if (p.age < p.life) {
        p.age += delta
        p.velocity.y -= p.gravity * delta
        p.velocity.multiplyScalar(Math.exp(-2 * delta))
        p.position.addScaledVector(p.velocity, delta)
      }
      // Shrink to nothing over the particle's life; dead particles are scaled to 0.
      const scale = p.age < p.life ? p.size * (1 - p.age / p.life) : 0
      dummy.position.copy(p.position)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      instances.setMatrixAt(i, dummy.matrix)
      instances.setColorAt(i, p.color)
    }
    instances.instanceMatrix.needsUpdate = true
    if (instances.instanceColor) instances.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, CAPACITY]} frustumCulled={false}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

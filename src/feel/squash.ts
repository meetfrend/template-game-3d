import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Object3D } from 'three'
import { Spring } from './spring'
import { gameDelta } from './time'

/**
 * Squash and stretch on a spring. Put ref on the visual mesh (not the physics body), then call
 * squash(0.4) on landing or squash(-0.3) on a jump: positive flattens, negative stretches, and
 * volume is roughly kept.
 */
export function useSquash<T extends Object3D>(stiffness = 420, damping = 16) {
  const ref = useRef<T>(null)
  const spring = useMemo(() => new Spring(0, stiffness, damping), [stiffness, damping])

  useFrame((_, delta) => {
    const s = spring.update(gameDelta(delta))
    ref.current?.scale.set(1 + s * 0.5, 1 - s, 1 + s * 0.5)
  })

  return { ref, squash: (amount: number) => spring.punch(amount * 20) }
}

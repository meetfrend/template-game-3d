import { settings } from '../core/settings'
import { STYLE } from '../style'

/**
 * Trauma-based screen shake: shake() adds trauma, which decays over time, and the camera moves by
 * trauma squared along smooth noise. Small hits barely register and big ones really land, and the
 * motion is a shudder rather than random jitter. The follow camera applies it.
 */
let trauma = 0

/** Adds trauma: 0.15 for a bump, 0.4 for a hit, 0.8 for an explosion. */
export function shake(amount = 0.3): void {
  const scale = STYLE.feel.shake * (settings.get().reducedMotion ? 0.25 : 1)
  trauma = Math.min(1, trauma + amount * scale)
}

const offset = { x: 0, y: 0, roll: 0 }

/** Advances the shake and returns this frame's camera offset in world units and radians. */
export function shakeOffset(delta: number, elapsed: number): typeof offset {
  trauma = Math.max(0, trauma - delta * 1.4)
  const power = trauma * trauma
  offset.x = power * 0.5 * noise(elapsed * 25, 1)
  offset.y = power * 0.5 * noise(elapsed * 25, 2)
  offset.roll = power * 0.06 * noise(elapsed * 25, 3)
  return offset
}

/** Smooth noise from -1 to 1: a sum of incommensurate sines, enough for camera shake. */
function noise(t: number, seed: number): number {
  return (Math.sin(t * 1.0 + seed * 12.9) + Math.sin(t * 2.31 + seed * 78.2) * 0.5 + Math.sin(t * 4.79 + seed * 37.7) * 0.25) / 1.75
}

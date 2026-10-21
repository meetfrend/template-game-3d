/**
 * Motion that eases instead of snapping. Use damp() to chase a target smoothly (cameras, UI that
 * follows things), and a Spring when you want overshoot and wobble (squash and stretch, pickups
 * popping in, a menu item bouncing). Both are frame-rate independent.
 */

/** Moves current toward target. lambda is responsiveness: 4 is lazy, 12 is snappy, 25 is nearly instant. */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return target + (current - target) * Math.exp(-lambda * delta)
}

/** A damped spring. Low damping wobbles; damping near 2·sqrt(stiffness) settles without overshoot. */
export class Spring {
  value: number
  velocity = 0
  target: number
  stiffness: number
  damping: number

  constructor(value = 0, stiffness = 300, damping = 14) {
    this.value = value
    this.target = value
    this.stiffness = stiffness
    this.damping = damping
  }

  /** Kicks the spring: it jumps away from rest and wobbles back. */
  punch(velocity: number): void {
    this.velocity += velocity
  }

  update(delta: number): number {
    // Fixed substeps keep stiff springs stable when a frame is long.
    const steps = Math.ceil(delta / (1 / 120))
    const dt = delta / Math.max(steps, 1)
    for (let i = 0; i < steps; i++) {
      this.velocity += (-this.stiffness * (this.value - this.target) - this.damping * this.velocity) * dt
      this.value += this.velocity * dt
    }
    return this.value
  }
}

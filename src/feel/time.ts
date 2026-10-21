import { STYLE } from '../style'

/**
 * The game clock. Gameplay and effects take their delta from gameDelta(), never from R3F's raw
 * delta, so pause, hit-stop and slow motion apply to everything at once.
 */
export const time = {
  /** 1 is normal speed, 0.3 is slow motion. */
  scale: 1,
  /** Seconds of game time since the run started. */
  elapsed: 0,
  frozenUntil: 0,
}

/** Freezes the game for a moment on a big impact, so the hit reads. 40–120 ms is typical. */
export function hitstop(ms = 70): void {
  time.frozenUntil = Math.max(time.frozenUntil, performance.now() + ms * STYLE.feel.hitstop)
}

/** This frame's game time in seconds: 0 during hit-stop, scaled by time.scale, capped so a stall doesn't teleport things. */
export function gameDelta(delta: number): number {
  if (performance.now() < time.frozenUntil) return 0
  return Math.min(delta, 1 / 20) * time.scale
}

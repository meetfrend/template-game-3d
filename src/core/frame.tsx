import { useFrame } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { PHYSICS_STEP } from '../config'
import { gameDelta } from '../feel/time'
import { pollInput } from './input'
import { game } from './store'

/**
 * `?headless` (on by itself under automation) runs frames on timers, for automated browsers and hidden tabs that pause
 * requestAnimationFrame. Those also hold back ResizeObserver, and the canvas waits for its size
 * before it draws anything, so sizes are reported straight away too.
 */
export const HEADLESS = new URLSearchParams(location.search).has('headless') || navigator.webdriver

if (HEADLESS) {
  window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(performance.now()), PHYSICS_STEP * 1000)
  window.cancelAnimationFrame = (id) => window.clearTimeout(id)
  window.ResizeObserver = class {
    #callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) {
      this.#callback = callback
    }
    observe(target: Element) {
      setTimeout(() => this.#callback([{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry], this))
    }
    unobserve() {}
    disconnect() {}
  }
}

/** Reads input before any gameplay runs this frame. */
export function InputPoller() {
  useFrame(() => pollInput(), -100)
  return null
}

/**
 * Steps physics on the game clock at a fixed rate, so pause, hit-stop and slow motion stop or slow
 * the world too. Mount inside <Physics paused>.
 */
export function PhysicsStepper() {
  const { step } = useRapier()
  useFrame((_, delta) => {
    if (game.get().phase !== 'playing') return
    const dt = gameDelta(delta)
    if (dt > 0) step(dt)
  }, -50)
  return null
}

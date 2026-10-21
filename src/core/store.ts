import { useSyncExternalStore } from 'react'

/** A tiny store: read it anywhere with get(), in React with use(), and change it with set(). */
export function createStore<T extends object>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()
  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  return {
    get: () => state,
    set(patch: Partial<T> | ((state: T) => Partial<T>)) {
      state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
      listeners.forEach((listener) => listener())
    },
    subscribe,
    use<U>(select: (state: T) => U): U {
      return useSyncExternalStore(subscribe, () => select(state))
    },
  }
}

export type Phase = 'loading' | 'menu' | 'playing' | 'paused' | 'result'

/**
 * The game's session state. Add what the HUD shows (score, lives, timer) here; keep per-frame
 * state (positions, velocities) in refs inside the scene, not in the store.
 */
export const game = createStore({
  phase: 'loading' as Phase,
  /** Bumped by restart(); the play scene is keyed on it, so a restart rebuilds the world from scratch. */
  run: 0,
  score: 0,
  result: null as null | 'won' | 'lost',
})

export function startGame(): void {
  game.set((s) => ({ phase: 'playing', run: s.run + 1, score: 0, result: null }))
}

export function endGame(result: 'won' | 'lost'): void {
  game.set({ phase: 'result', result })
}

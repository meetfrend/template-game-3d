/**
 * Saved data in localStorage, under one versioned key. Bump VERSION when the shape changes; old
 * saves are then dropped instead of breaking the game. Storage can be missing (private windows,
 * blocked cookies), so reads fall back to the defaults and writes fail silently.
 */
const KEY = 'frend-game'
const VERSION = 1

type SaveData = {
  best: number
  settings?: Record<string, unknown>
}

const DEFAULTS: SaveData = { best: 0 }

export function loadSave(): SaveData {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { version?: number; data?: SaveData } | null
    return raw?.version === VERSION && raw.data ? { ...DEFAULTS, ...raw.data } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export function writeSave(patch: Partial<SaveData>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, data: { ...loadSave(), ...patch } }))
  } catch {
    // Storage is unavailable; the game still plays, it just won't remember.
  }
}

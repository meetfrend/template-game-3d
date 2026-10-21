/**
 * The game's look, sound and feel, in one place. It ships neutral: grays, flat light, no post
 * effects. Write STYLE.md from the request first, then set every value here to match it. Systems
 * read only from this file, so changing the style means editing this file, not the systems.
 */
export const STYLE = {
  /** Every color the game uses. Add names as the game needs them; don't put hex values anywhere else. */
  palette: {
    sky: '#8a8d93',
    ground: '#a3a6ab',
    prop: '#d9dadc',
    accent: '#f2f2f2',
    ink: '#f7f7f8',
    inkMuted: '#d0d2d6',
    panel: 'rgba(24, 25, 28, 0.72)',
  },
  /** Distance fog in world units, the same color as the sky so the world fades into it. Set far to 0 for none. */
  fog: { near: 30, far: 90 },
  /** A preset from render/lighting.tsx: neutral, studio, sunset, night or overcast. */
  lighting: 'neutral' as LightingPreset,
  /** Post-processing (render/post.tsx). 0 turns an effect off. Start subtle; push one effect, not all of them. */
  post: {
    /** Glow on anything brighter than the threshold. Emissive materials with toneMapped: false go above 1. */
    bloom: 0,
    bloomThreshold: 1,
    vignette: 0,
    /** Film grain. */
    grain: 0,
    chromaticAberration: 0,
    /** -1 to 1. */
    saturation: 0,
    /** -1 to 1. */
    contrast: 0,
    toneMapping: 'neutral' as 'neutral' | 'agx' | 'aces',
  },
  /** Multipliers on the feel kit: 0 turns an effect off, 2 doubles it. */
  feel: { shake: 1, hitstop: 1, particles: 1 },
  audio: {
    /** Random pitch spread on each sound effect, so repeats don't sound mechanical. 0.06 is ±6%. */
    pitchVariance: 0.06,
  },
  /** CSS font stacks for the HUD and menus. Load web fonts in index.html. */
  font: {
    display: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
}

export type LightingPreset = 'neutral' | 'studio' | 'sunset' | 'night' | 'overcast'

import { Vector3, type Vector3Like } from 'three'
import { STYLE } from '../style'
import { audio, bus, type Bus } from './mixer'

/**
 * Sound effects made in code with ZzFX: design a sound at https://killedbyapixel.github.io/ZzFX/,
 * copy its numbers here. These are neutral placeholders; tune them to the game's audio mood in
 * STYLE.md (a soft game wants low, round sounds; an arcade game bright, short ones).
 */
const SOUNDS = {
  select: [0.4, 0, 660, 0, 0.01, 0.04, 1, 1.2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.6, 0.01],
  confirm: [0.5, 0, 520, 0.01, 0.04, 0.12, 1, 1.4, 0, 0, 260, 0.05, 0, 0, 0, 0, 0, 0.7, 0.02],
  jump: [0.6, 0, 260, 0.01, 0.04, 0.12, 0, 1.6, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0.7, 0.03],
  land: [0.7, 0, 90, 0, 0.02, 0.12, 4, 1.6, -4, 0, 0, 0, 0, 0.4, 0, 0.1, 0, 0.6, 0.02],
  hit: [0.8, 0, 150, 0, 0.03, 0.16, 2, 1.8, -12, 0, 0, 0, 0, 0.6, 0, 0.1, 0, 0.6, 0.04],
  pickup: [0.5, 0, 1240, 0, 0.02, 0.18, 1, 1.4, 0, 0, 420, 0.05, 0, 0, 0, 0, 0, 0.6, 0.02],
  lose: [0.7, 0, 300, 0.02, 0.1, 0.5, 2, 1.4, -2, 0, 0, 0, 0, 0.3, 0, 0, 0, 0.6, 0.1],
  win: [0.6, 0, 523, 0.01, 0.25, 0.4, 1, 1, 0, 0, 262, 0.08, 0.16, 0, 0, 0, 0.05, 0.8, 0.05],
} satisfies Record<string, number[]>

export type Sound = keyof typeof SOUNDS

/** Where the ears are; the camera keeps it up to date. Sounds played `at` a position pan and fade with it. */
export const listener = { position: new Vector3(), right: new Vector3(1, 0, 0) }
const HEARING_RANGE = 40

const buffers = new Map<Sound, AudioBuffer>()
// ZzFX makes its own AudioContext when imported, which browsers warn about before a user gesture,
// so it loads with the first gesture instead (see main.tsx).
type ZzFX = (typeof import('zzfx'))['ZZFX']
let zzfx: ZzFX | null = null

export async function loadSounds(): Promise<void> {
  zzfx ??= (await import('zzfx')).ZZFX
}
const toSound = new Vector3()

function buffer(name: Sound, zzfx: ZzFX): AudioBuffer {
  let cached = buffers.get(name)
  if (!cached) {
    // Randomness 0: variation comes from playbackRate below, so the buffer can be reused.
    const [volume = 1, , ...rest] = SOUNDS[name]
    const samples = zzfx.buildSamples(volume, 0, ...rest)
    cached = audio().createBuffer(1, samples.length, zzfx.sampleRate)
    cached.getChannelData(0).set(samples)
    buffers.set(name, cached)
  }
  return cached
}

type PlayOptions = { volume?: number; at?: Vector3Like; bus?: Bus; pitch?: number }

export function playSound(name: Sound, { volume = 1, at, bus: busName = 'sfx', pitch = 1 }: PlayOptions = {}): void {
  const context = audio()
  if (context.state !== 'running' || !zzfx) return
  const source = context.createBufferSource()
  source.buffer = buffer(name, zzfx)
  source.playbackRate.value = pitch * (1 + (Math.random() * 2 - 1) * STYLE.audio.pitchVariance)
  const gain = context.createGain()
  const panner = context.createStereoPanner()
  if (at) {
    toSound.copy(at).sub(listener.position)
    const distance = toSound.length()
    volume *= Math.max(0, 1 - distance / HEARING_RANGE)
    panner.pan.value = distance > 0.01 ? Math.max(-1, Math.min(1, toSound.dot(listener.right) / distance)) * 0.8 : 0
  }
  gain.gain.value = volume * 0.5
  source.connect(gain).connect(panner).connect(bus(busName))
  source.start()
}

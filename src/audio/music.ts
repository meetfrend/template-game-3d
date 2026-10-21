import { audio, bus } from './mixer'

/**
 * Layered, adaptive music. Give play() stems of one loop that share a length and tempo (drums,
 * bass, lead...), quietest layer first; setIntensity(0..1) fades layers in as the game heats up.
 * No music ships with the template; add CC0 loops under public/assets/music/ and credit them in
 * CREDITS.md.
 */
type Layer = { gain: GainNode; source: AudioBufferSourceNode }
let layers: Layer[] = []
let intensity = 0

export async function playMusic(urls: string[]): Promise<void> {
  stopMusic()
  const context = audio()
  const decoded = await Promise.all(urls.map(async (url) => context.decodeAudioData(await (await fetch(url)).arrayBuffer())))
  const start = context.currentTime + 0.05
  layers = decoded.map((buffer) => {
    const source = context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = context.createGain()
    gain.gain.value = 0
    source.connect(gain).connect(bus('music'))
    source.start(start)
    return { gain, source }
  })
  setIntensity(intensity)
}

/** 0 plays only the first layer; 1 plays them all. Layers fade over half a second. */
export function setIntensity(value: number): void {
  intensity = Math.max(0, Math.min(1, value))
  const context = audio()
  layers.forEach((layer, i) => {
    const on = i === 0 || intensity >= i / layers.length
    layer.gain.gain.setTargetAtTime(on ? 1 : 0, context.currentTime, 0.15)
  })
}

export function stopMusic(): void {
  layers.forEach((layer) => layer.source.stop())
  layers = []
}

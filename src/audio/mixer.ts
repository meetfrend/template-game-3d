import { settings } from '../core/settings'

/**
 * One AudioContext with a bus per kind of sound: music, sfx and ui feed master. Volumes follow the
 * player's settings. Browsers start audio suspended until a click or key press; unlockAudio() is
 * wired to the first one in main.tsx.
 */
export type Bus = 'music' | 'sfx' | 'ui'

let context: AudioContext | null = null
const buses = {} as Record<Bus | 'master', GainNode>

export function audio(): AudioContext {
  if (context) return context
  context = new AudioContext()
  buses.master = context.createGain()
  buses.master.connect(context.destination)
  for (const name of ['music', 'sfx', 'ui'] as const) {
    buses[name] = context.createGain()
    buses[name].connect(buses.master)
  }
  applyVolumes()
  return context
}

export function bus(name: Bus): GainNode {
  audio()
  return buses[name]
}

function applyVolumes(): void {
  if (!context) return
  const { music, sfx } = settings.get()
  buses.music.gain.value = music
  buses.sfx.gain.value = sfx
  buses.ui.gain.value = sfx
}

settings.subscribe(applyVolumes)

export function unlockAudio(): void {
  void audio().resume()
}

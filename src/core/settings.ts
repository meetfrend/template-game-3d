import { loadSave, writeSave } from './save'
import { createStore } from './store'

const prefersReducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Player settings, saved between visits. The pause menu edits them; audio and the feel kit read them. */
export const settings = createStore({
  music: 0.6,
  sfx: 0.8,
  /** Tones down screen shake and flashes. Defaults to the system setting. */
  reducedMotion: prefersReducedMotion,
  ...(loadSave().settings as object | undefined),
})

settings.subscribe(() => writeSave({ settings: settings.get() }))

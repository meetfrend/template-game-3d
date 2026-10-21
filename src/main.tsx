import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import { unlockAudio } from './audio/mixer'
import { loadSounds } from './audio/sfx'
import { input } from './core/input'
import { game } from './core/store'
import { time } from './feel/time'
import { STYLE } from './style'
import './style.css'

// The HUD reads the palette and fonts from CSS variables, so style.ts stays the one source.
const root = document.documentElement.style
for (const [name, value] of Object.entries(STYLE.palette)) root.setProperty(`--${name}`, value)
root.setProperty('--font-display', STYLE.font.display)
root.setProperty('--font-body', STYLE.font.body)

// Browsers only allow audio after a user gesture.
const unlock = () => {
  unlockAudio()
  void loadSounds()
}
addEventListener('pointerdown', unlock, { once: true })
addEventListener('keydown', unlock, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev only: lets the console and browser automation inspect the running game.
if (import.meta.env.DEV) Object.assign(window, { game, input, time })

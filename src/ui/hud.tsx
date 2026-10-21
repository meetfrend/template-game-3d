import { useEffect, useRef } from 'react'
import { playSound } from '../audio/sfx'
import { GAME } from '../config'
import { HEADLESS } from '../core/frame'
import { input, onPress, touchStick } from '../core/input'
import { settings } from '../core/settings'
import { game, startGame } from '../core/store'

/**
 * Everything drawn over the canvas: the in-game HUD and the menu, pause and result screens. The
 * screens are deliberately plain shells; style them from STYLE.md like any other part of the game.
 */
export function Hud() {
  const phase = game.use((s) => s.phase)

  useEffect(() => {
    const offPrimary = onPress('primary', () => {
      const { phase } = game.get()
      if (phase === 'menu' || phase === 'result') {
        playSound('confirm', { bus: 'ui' })
        startGame()
      }
    })
    const offPause = onPress('pause', () => {
      const { phase } = game.get()
      if (phase === 'playing') game.set({ phase: 'paused' })
      else if (phase === 'paused') game.set({ phase: 'playing' })
    })
    // Leaving the tab pauses the game (not under automation, where tabs report hidden at random).
    const onHide = () => !HEADLESS && document.hidden && game.get().phase === 'playing' && game.set({ phase: 'paused' })
    document.addEventListener('visibilitychange', onHide)
    return () => {
      offPrimary()
      offPause()
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return (
    <div className="hud">
      {phase === 'loading' && <div className="screen">Loading…</div>}
      {phase === 'menu' && <Menu />}
      {phase === 'playing' && <PlayingHud />}
      {phase === 'paused' && <Pause />}
      {phase === 'result' && <Result />}
      <TouchStick />
    </div>
  )
}

const startHint = () => (input.touch ? 'Tap to start' : 'Press Space to start')

function Menu() {
  return (
    <div className="screen" onClick={startGame}>
      <h1>{GAME.title}</h1>
      <p className="muted">{GAME.tagline}</p>
      <p className="prompt">{startHint()}</p>
    </div>
  )
}

function PlayingHud() {
  const score = game.use((s) => s.score)
  return (
    <div className="bar">
      <span>{score}</span>
      <button type="button" aria-label="Pause" onClick={() => game.set({ phase: 'paused' })}>
        ❚❚
      </button>
    </div>
  )
}

function Pause() {
  const { music, sfx, reducedMotion } = settings.use((s) => s)
  return (
    <div className="screen">
      <h2>Paused</h2>
      <label>
        Music <input type="range" min={0} max={1} step={0.05} value={music} onChange={(e) => settings.set({ music: Number(e.target.value) })} />
      </label>
      <label>
        Sound <input type="range" min={0} max={1} step={0.05} value={sfx} onChange={(e) => settings.set({ sfx: Number(e.target.value) })} />
      </label>
      <label>
        <input type="checkbox" checked={reducedMotion} onChange={(e) => settings.set({ reducedMotion: e.target.checked })} /> Reduce motion
      </label>
      <div className="actions">
        <button type="button" onClick={() => game.set({ phase: 'playing' })}>
          Resume
        </button>
        <button type="button" onClick={startGame}>
          Restart
        </button>
      </div>
    </div>
  )
}

function Result() {
  const { result, score } = game.use((s) => s)
  return (
    <div className="screen" onClick={startGame}>
      <h2>{result === 'won' ? 'You win' : 'Game over'}</h2>
      <p className="muted">Score {score}</p>
      <p className="prompt">{input.touch ? 'Tap to play again' : 'Press Space to play again'}</p>
    </div>
  )
}

/** Draws the floating touch stick while a thumb holds it. */
function TouchStick() {
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const draw = () => {
      frame = requestAnimationFrame(draw)
      if (!base.current || !knob.current) return
      base.current.hidden = !touchStick.active
      base.current.style.translate = `${touchStick.originX}px ${touchStick.originY}px`
      knob.current.style.translate = `${touchStick.x * 40}px ${-touchStick.y * 40}px`
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return (
    <div ref={base} className="stick" hidden>
      <div ref={knob} />
    </div>
  )
}

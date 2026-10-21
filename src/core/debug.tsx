import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { createStore } from './store'

/**
 * Performance overlay: frames per second, draw calls, triangles and frame time. Toggle with the
 * backquote key (`), or open with ?debug. Keep draw calls in the low hundreds and FPS at 60 on a
 * laptop; instancing and merged geometry are the usual fixes.
 */
export const debug = createStore({ visible: new URLSearchParams(location.search).has('debug') })

addEventListener('keydown', (event) => {
  if (event.code === 'Backquote') debug.set((s) => ({ visible: !s.visible }))
})

/** The overlay element; DebugStats inside the canvas writes into it. */
export function DebugOverlay() {
  const visible = debug.use((s) => s.visible)
  return <div id="debug" className="debug" hidden={!visible} />
}

export function DebugStats() {
  const gl = useThree((s) => s.gl)
  const sample = useRef({ frames: 0, time: 0, worst: 0 })

  useEffect(() => {
    // Post-processing renders several passes a frame; count them all, not just the last one.
    gl.info.autoReset = false
  }, [gl])

  // Runs first each frame, so it reads the whole of the previous frame before resetting the counters.
  useFrame((_, delta) => {
    const s = sample.current
    s.frames++
    s.time += delta
    s.worst = Math.max(s.worst, delta)
    const { calls, triangles } = gl.info.render
    gl.info.reset()
    if (s.time < 0.5) return
    const element = document.getElementById('debug')
    if (element && debug.get().visible) {
      element.textContent = `${Math.round(s.frames / s.time)} fps · worst ${(s.worst * 1000).toFixed(1)} ms · ${calls} calls · ${triangles.toLocaleString()} tris`
    }
    sample.current = { frames: 0, time: 0, worst: 0 }
  }, -200)

  return null
}

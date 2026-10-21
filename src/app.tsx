import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
import { DebugOverlay, DebugStats } from './core/debug'
import { HEADLESS, InputPoller } from './core/frame'
import { bindTouch } from './core/input'
import { Lighting } from './render/lighting'
import { Post } from './render/post'
import { Play } from './scenes/play'
import { game } from './core/store'
import { STYLE } from './style'
import { Hud } from './ui/hud'

export function App() {
  const root = useRef<HTMLDivElement>(null)
  const run = game.use((s) => s.run)

  useEffect(() => (root.current ? bindTouch(root.current) : undefined), [])

  return (
    <div ref={root} className="game">
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 200, position: [0, 7, 12] }}
        // Post-processing does anti-aliasing and tone mapping, so the canvas does neither.
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        flat
      >
        <color attach="background" args={[STYLE.palette.sky]} />
        {STYLE.fog.far > 0 && <fog attach="fog" args={[STYLE.palette.sky, STYLE.fog.near, STYLE.fog.far]} />}
        <InputPoller />
        <Lighting />
        <Suspense fallback={null}>
          <Play key={run} />
        </Suspense>
        <Post multisampling={HEADLESS ? 0 : 4} />
        <DebugStats />
      </Canvas>
      <Hud />
      <DebugOverlay />
    </div>
  )
}

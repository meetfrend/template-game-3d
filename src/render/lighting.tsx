import { Environment, Lightformer } from '@react-three/drei'
import { STYLE, type LightingPreset } from '../style'

/**
 * Lighting presets: a sky/ground fill, one shadow-casting sun, and a soft environment built from
 * light panels (no downloaded HDR) for reflections on standard materials. Pick one in style.ts,
 * then tune or add a preset here.
 */
const PRESETS: Record<LightingPreset, { sky: string; ground: string; fill: number; sun: string; sunIntensity: number; sunPosition: [number, number, number]; environment: number }> = {
  neutral: { sky: '#ffffff', ground: '#8a8a8a', fill: 1.4, sun: '#ffffff', sunIntensity: 1.6, sunPosition: [6, 12, 4], environment: 0.4 },
  studio: { sky: '#ffffff', ground: '#bfc3cc', fill: 0.8, sun: '#fff6ea', sunIntensity: 2.4, sunPosition: [4, 10, 6], environment: 1 },
  sunset: { sky: '#ffb38a', ground: '#4a3a5e', fill: 0.9, sun: '#ff9a5c', sunIntensity: 3, sunPosition: [-10, 4, -2], environment: 0.6 },
  night: { sky: '#5470b8', ground: '#0d1020', fill: 0.35, sun: '#a8c0ff', sunIntensity: 0.8, sunPosition: [-4, 10, -6], environment: 0.25 },
  overcast: { sky: '#e6ebf0', ground: '#9aa1a8', fill: 1.6, sun: '#f2f4f7', sunIntensity: 0.6, sunPosition: [2, 12, 2], environment: 0.8 },
}

/** Half the width of the area that receives sharp shadows, centered on the origin. */
const SHADOW_AREA = 24

export function Lighting() {
  const preset = PRESETS[STYLE.lighting]
  return (
    <>
      <hemisphereLight args={[preset.sky, preset.ground, preset.fill]} />
      <directionalLight
        position={preset.sunPosition}
        color={preset.sun}
        intensity={preset.sunIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-SHADOW_AREA, SHADOW_AREA, SHADOW_AREA, -SHADOW_AREA, 0.5, 60]} />
      </directionalLight>
      <Environment resolution={128} frames={1} environmentIntensity={preset.environment}>
        <Lightformer form="rect" intensity={2} color={preset.sky} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={1} color={preset.sun} position={[-6, 2, 4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} color={preset.ground} position={[6, 1, -4]} scale={[6, 3, 1]} />
      </Environment>
    </>
  )
}

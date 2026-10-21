import { Bloom, BrightnessContrast, ChromaticAberration, EffectComposer, HueSaturation, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'
import { STYLE } from '../style'

const TONE_MAPPING = { neutral: ToneMappingMode.NEUTRAL, agx: ToneMappingMode.AGX, aces: ToneMappingMode.ACES_FILMIC }

/**
 * The post-processing stack, driven by STYLE.post. Effects at 0 aren't mounted, so the neutral
 * style costs only tone mapping. Most of a game's look comes from here plus lighting and palette.
 */
export function Post({ multisampling = 4 }: { multisampling?: number }) {
  const post = STYLE.post
  const effects = [
    post.bloom > 0 && <Bloom key="bloom" mipmapBlur intensity={post.bloom} luminanceThreshold={post.bloomThreshold} luminanceSmoothing={0.2} />,
    post.saturation !== 0 && <HueSaturation key="saturation" saturation={post.saturation} />,
    post.contrast !== 0 && <BrightnessContrast key="contrast" contrast={post.contrast} />,
    post.chromaticAberration > 0 && (
      <ChromaticAberration key="chromatic" offset={new Vector2(post.chromaticAberration * 0.004, post.chromaticAberration * 0.004)} radialModulation modulationOffset={0.3} />
    ),
    <ToneMapping key="tone" mode={TONE_MAPPING[post.toneMapping]} />,
    post.vignette > 0 && <Vignette key="vignette" offset={0.3} darkness={post.vignette} />,
    post.grain > 0 && <Noise key="grain" premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={post.grain} />,
  ].filter((effect) => effect !== false)

  return <EffectComposer multisampling={multisampling}>{effects}</EffectComposer>
}

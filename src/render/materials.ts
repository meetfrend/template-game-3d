import { Color, DataTexture, MeshStandardMaterial, MeshToonMaterial, NearestFilter, RedFormat } from 'three'

/**
 * Material helpers for code-built worlds, where the look comes from shape, color and light rather
 * than textures. Pick one family for the whole game; mixing them reads as unfinished.
 */

/** Matte, faceted surfaces: low-poly and diorama looks. */
export function flatMaterial(color: string, roughness = 0.85): MeshStandardMaterial {
  return new MeshStandardMaterial({ color, roughness, metalness: 0, flatShading: true })
}

/** Cel shading in a few hard bands: cartoon and anime looks. */
export function toonMaterial(color: string, bands = 3): MeshToonMaterial {
  const data = new Uint8Array(bands)
  for (let i = 0; i < bands; i++) data[i] = Math.round((255 * (i + 1)) / bands)
  const gradientMap = new DataTexture(data, bands, 1, RedFormat)
  gradientMap.minFilter = gradientMap.magFilter = NearestFilter
  gradientMap.needsUpdate = true
  return new MeshToonMaterial({ color, gradientMap })
}

/**
 * Glows under bloom: the color is pushed past white and skips tone mapping. intensity 2–6 is a
 * good range; it needs STYLE.post.bloom above 0 to glow.
 */
export function glowMaterial(color: string, intensity = 3): MeshStandardMaterial {
  const glow = new Color(color).multiplyScalar(intensity)
  return new MeshStandardMaterial({ color: '#000000', emissive: glow, emissiveIntensity: 1, toneMapped: false })
}

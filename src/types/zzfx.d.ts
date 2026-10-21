declare module 'zzfx' {
  export const ZZFX: {
    sampleRate: number
    buildSamples(...parameters: number[]): number[]
  }
}

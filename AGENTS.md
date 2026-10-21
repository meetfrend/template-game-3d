# Project

An empty 3D browser game: React Three Fiber, Rapier physics, postprocessing, TypeScript, Vite. The
systems are finished and neutral; the game, and how it looks, sounds and feels, come from the
request. Every game built on this should look like its own game, not like this template.

## Files
- `STYLE.md`: the game's art direction. Empty until you write it.
- `src/style.ts`: the style in code: palette, fog, lighting preset, post effects, feel and audio
  multipliers, fonts. Systems read only from here.
- `src/config.ts`: title, tagline, physics step, gravity.
- `src/app.tsx`: the canvas, scene, post stack and HUD. `src/main.tsx`: entry, audio unlock.
- `src/scenes/play.tsx`: the world. Ships a floor and a PLACEHOLDER probe block; replace both.
- `src/core/`: `store.ts` (phase, run, score; `startGame`, `endGame`), `input.ts` (actions),
  `frame.ts` (input polling, fixed-step physics, `?headless`), `save.ts`, `settings.ts`, `debug.tsx`.
- `src/feel/`: `time.ts` (game clock, `hitstop`), `shake.ts`, `spring.ts` (`damp`, `Spring`),
  `squash.ts` (`useSquash`), `particles.tsx` (`burst`), `camera.tsx` (`FollowCamera`).
- `src/render/`: `lighting.tsx` (presets), `post.tsx` (effects from `STYLE.post`), `materials.ts`
  (`flatMaterial`, `toonMaterial`, `glowMaterial`).
- `src/audio/`: `mixer.ts` (buses), `sfx.ts` (`playSound`, ZzFX), `music.ts` (layered loops).
- `src/ui/hud.tsx`: HUD and the menu, pause and result screens. `src/style.css`: their styles.

These are all the files. Read the ones the change touches, in one batch.

## How to build a game here
1. **Write STYLE.md first**, from the request: pillars, palette, light, materials, camera, feel,
   sound, type. Decide; don't hedge. Then set `src/style.ts` and `src/config.ts` to match.
2. **Build the game in `scenes/`.** Split into files (`player.tsx`, `level.tsx`, ...) as it grows.
   Use the systems; don't rebuild them:
   - Read actions, not keys: `input.move`, `input.pressed('primary')`.
   - Take delta from `gameDelta(delta)` so pause, hit-stop and slow motion apply.
   - Change the session with `game.set`, `startGame()` and `endGame('won' | 'lost')`.
   - Physics only steps while the phase is `playing`.
3. **Make it feel good.** Every action gets a response: a sound (`playSound`), motion
   (`useSquash`, a `Spring`), and for big moments particles (`burst`), `shake` and `hitstop`.
4. **Style the menus and HUD** in `ui/hud.tsx` and `style.css` from STYLE.md. They ship as plain
   shells.
5. **Go through the polish checklist below**, then the checks.

## Getting a look without art
Shape, color and light do the work. Build models from primitives (boxes, capsules, cylinders,
cones, `RoundedBox` from drei), grouped and scaled; instance anything repeated.
- **Toy diorama:** rounded shapes, `flatMaterial`, `studio` or `sunset` light, soft shadows, light
  bloom (0.3), a little vignette, a high camera.
- **Neon arcade:** dark sky, `night` light, `glowMaterial` on everything that matters, bloom 1–2
  with threshold ~0.9, slight chromatic aberration.
- **Cel cartoon:** `toonMaterial` with 3 bands, saturated palette, `overcast` light, no grain.
- **Gritty noir:** near-monochrome palette with one accent, `night` light, grain 0.3, vignette 0.7,
  contrast 0.2.
- **Clean minimal:** two or three colors, `overcast` light, no post effects, generous negative space.

drei has more: `Sky`, `Stars`, `Cloud`, `Sparkles`, `Trail`, `Float`, `MeshReflectorMaterial`,
`ContactShadows`, `Outlines`. Never use image generation. Don't use drei's `Text` or environment
presets: both download files from a CDN at runtime.

## Polish checklist
- Controls answer within a frame; movement eases (acceleration, not instant top speed).
- Every action has a sound and a visible response; big moments have shake and hit-stop.
- The player and hazards stand out from the world at a glance.
- A way to win, a way to lose, and a way to play again; a clear goal on screen.
- Menus, HUD and transitions match the style; nothing looks like a default web form.
- Works on a phone: touch controls and a readable HUD.
- Steady 60 fps in `?debug` with draw calls in the low hundreds.

## Checks
- `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- In the browser: `?debug` shows FPS and draw calls; `?play` skips the menu. The loop runs on
  timers under automation, or with `?headless`. Loading can take a second or two; wait for the
  menu before pressing Space.
- One screenshot can't show motion. Press Space, then take screenshots a few hundred milliseconds
  apart while playing, and check things move, land and react.
- In dev, `window.game`, `window.input` and `window.time` are available to the console.

# 3D game starter

An empty 3D browser game with the systems a polished game needs already in place: React Three
Fiber, Rapier physics, post-processing, a feel kit (screen shake, hit-stop, springs, squash and
stretch, particles, a follow camera), a sound mixer with adaptive music, input for keyboard,
gamepad and touch, saves and settings. It ships neutral gray; the game and its look come from your
request.

```bash
pnpm install
pnpm dev
```

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Typecheck and build for production |
| `pnpm typecheck` | TypeScript only |
| `pnpm lint` | oxlint |

Controls: arrows or WASD to move, Space to act, Esc to pause; gamepads and touch work too.
Press ` (backquote) or open `?debug` for the performance overlay.

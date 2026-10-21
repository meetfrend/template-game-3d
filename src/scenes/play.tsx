import { useFrame } from '@react-three/fiber'
import { CuboidCollider, Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { type RefObject, useEffect, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { playSound } from '../audio/sfx'
import { GRAVITY } from '../config'
import { PhysicsStepper } from '../core/frame'
import { input } from '../core/input'
import { game, startGame } from '../core/store'
import { FollowCamera } from '../feel/camera'
import { burst, Particles } from '../feel/particles'
import { shake } from '../feel/shake'
import { useSquash } from '../feel/squash'
import { hitstop } from '../feel/time'
import { flatMaterial } from '../render/materials'
import { STYLE } from '../style'

const groundMaterial = flatMaterial(STYLE.palette.ground)
const probeMaterial = flatMaterial(STYLE.palette.prop, 0.6)

/**
 * The play scene: the physics world and everything in it. It starts empty: a floor and a probe
 * block that shows how the systems connect. Replace both with the game.
 */
export function Play() {
  const player = useRef<Group>(null)

  useEffect(() => {
    // Loaded: show the menu, or go straight into the game with ?play.
    if (game.get().phase !== 'loading') return
    if (new URLSearchParams(location.search).has('play')) startGame()
    else game.set({ phase: 'menu' })
  }, [])

  return (
    <Physics gravity={[0, -GRAVITY, 0]} paused>
      <PhysicsStepper />
      <Particles />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.5, 100]} position={[0, -0.5, 0]} />
        <mesh rotation-x={-Math.PI / 2} receiveShadow material={groundMaterial}>
          <planeGeometry args={[200, 200]} />
        </mesh>
      </RigidBody>

      <Probe follow={player} />
      <FollowCamera target={player} />
    </Physics>
  )
}

/**
 * PLACEHOLDER. A block that moves with the move action, jumps on primary, and lands with
 * squash, dust, a thud, shake and hit-stop: every feel system in about thirty lines. Delete it
 * once the game has its own cast.
 */
function Probe({ follow }: { follow: RefObject<Group | null> }) {
  const body = useRef<RapierRigidBody>(null)
  const { ref, squash } = useSquash<Mesh>()
  const grounded = useRef(false)
  /** Vertical speed after the last step, so a landing knows how hard it hit before physics resolved it. */
  const fall = useRef(0)

  useFrame(() => {
    const rb = body.current
    if (!rb || game.get().phase !== 'playing') return
    const velocity = rb.linvel()
    fall.current = velocity.y
    rb.setLinvel({ x: input.move.x * 6, y: velocity.y, z: -input.move.y * 6 }, true)
    if (input.pressed('primary') && grounded.current) {
      grounded.current = false
      rb.applyImpulse({ x: 0, y: 9, z: 0 }, true)
      squash(-0.35)
      playSound('jump')
    }
  })

  return (
    <RigidBody
      ref={body}
      position={[0, 4, 0]}
      colliders="cuboid"
      enabledRotations={[false, false, false]}
      onCollisionEnter={() => {
        const impact = Math.max(0, -fall.current)
        grounded.current = true
        if (impact < 2) return
        const at = body.current!.translation()
        squash(Math.min(impact / 20, 0.5))
        burst({ x: at.x, y: at.y - 0.5, z: at.z }, { count: 14, speed: impact * 0.4, upward: 1, gravity: 8, color: STYLE.palette.ground })
        playSound('land', { at, volume: Math.min(impact / 12, 1) })
        if (impact > 8) {
          shake(0.25)
          hitstop(50)
        }
      }}
    >
      <group ref={follow}>
        <mesh ref={ref} castShadow material={probeMaterial}>
          <boxGeometry />
        </mesh>
      </group>
    </RigidBody>
  )
}

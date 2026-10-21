import { useFrame, useThree } from '@react-three/fiber'
import type { RefObject } from 'react'
import { type Object3D, Vector3 } from 'three'
import { listener } from '../audio/sfx'
import { damp } from './spring'
import { shakeOffset } from './shake'
import { gameDelta, time } from './time'

type FollowCameraProps = {
  /** What to follow. Without one the camera holds still, looking at the origin. */
  target?: RefObject<Object3D | null>
  /** Camera position relative to the target. */
  offset?: [number, number, number]
  /** How far ahead of the target's motion to look, in seconds of its velocity. */
  lookAhead?: number
  /** Responsiveness: lower is floatier. */
  lambda?: number
}

const focus = new Vector3()
const view = new Vector3()
const last = new Vector3()
const velocity = new Vector3()
const moved = new Vector3()

/**
 * A camera that leads the target and eases after it, with screen shake on top. Mount one in the
 * scene. Swap it for an orbit, fixed or first-person rig when the game wants one, keeping the
 * shakeOffset() and listener lines.
 */
export function FollowCamera({ target, offset = [0, 7, 12], lookAhead = 0.35, lambda = 5 }: FollowCameraProps) {
  const camera = useThree((s) => s.camera)

  useFrame((_, rawDelta) => {
    const delta = gameDelta(rawDelta)
    time.elapsed += delta
    // Ease on real time so the camera keeps settling during hit-stop and pause.
    const real = Math.min(rawDelta, 1 / 20)
    const object = target?.current
    if (object) {
      object.getWorldPosition(focus)
      if (delta > 0) {
        moved.copy(focus).sub(last).divideScalar(delta)
        velocity.lerp(moved, 1 - Math.exp(-6 * delta))
      }
      last.copy(focus)
      focus.addScaledVector(velocity, lookAhead)
    } else {
      focus.set(0, 0, 0)
    }
    view.set(damp(view.x, focus.x, lambda, real), damp(view.y, focus.y, lambda, real), damp(view.z, focus.z, lambda, real))
    camera.position.set(view.x + offset[0], view.y + offset[1], view.z + offset[2])
    camera.lookAt(view)
    const shake = shakeOffset(real, performance.now() / 1000)
    camera.translateX(shake.x)
    camera.translateY(shake.y)
    camera.rotateZ(shake.roll)
    listener.position.copy(camera.position)
    listener.right.set(1, 0, 0).applyQuaternion(camera.quaternion)
  })

  return null
}

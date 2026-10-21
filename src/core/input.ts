/**
 * Input as named actions, so gameplay never asks about keys. Keyboard, gamepad and touch all feed
 * the same actions. Poll in useFrame: input.move, input.held('primary'), input.pressed('primary').
 * Menus and other DOM code subscribe with onPress instead.
 */

/** Keyboard bindings by KeyboardEvent.code. Rebind or add actions here. */
const KEYS = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  primary: ['Space', 'Enter', 'KeyJ'],
  secondary: ['ShiftLeft', 'ShiftRight', 'KeyK'],
  pause: ['Escape', 'KeyP'],
} as const satisfies Record<string, readonly string[]>

export type Action = keyof typeof KEYS

/** Standard gamepad buttons: A, B/X, Start. The left stick and d-pad drive movement. */
const PAD_BUTTONS: Partial<Record<Action, number[]>> = { primary: [0], secondary: [1, 2], pause: [9] }
const PAD_DEADZONE = 0.2

const ACTIONS = Object.keys(KEYS) as Action[]
const keysDown = new Set<string>()
/** Actions pressed since the last frame, so a tap shorter than a frame still counts. */
const tapped = new Set<Action>()
let now = new Set<Action>()
let before = new Set<Action>()
const listeners = new Map<Action, Set<() => void>>()

/** The on-screen stick: hold anywhere on the left half of a touch screen and drag. */
export const touchStick = { active: false, id: -1, originX: 0, originY: 0, x: 0, y: 0 }
const STICK_RADIUS = 56
let touchPrimary = false

export const input = {
  /** Movement from -1 to 1 on each axis, length at most 1. y is up/forward. */
  move: { x: 0, y: 0 },
  held: (action: Action) => now.has(action),
  /** True on the one frame the action went down. */
  pressed: (action: Action) => now.has(action) && !before.has(action),
  released: (action: Action) => !now.has(action) && before.has(action),
  /** Whether the last input came from touch, for showing touch hints instead of keys. */
  touch: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
}

/** Calls listener whenever the action goes down. Returns the unsubscribe function. */
export function onPress(action: Action, listener: () => void): () => void {
  const set = listeners.get(action) ?? new Set()
  listeners.set(action, set)
  set.add(listener)
  return () => set.delete(listener)
}

function emit(action: Action): void {
  tapped.add(action)
  listeners.get(action)?.forEach((listener) => listener())
}

function actionsFor(code: string): Action[] {
  return ACTIONS.filter((action) => (KEYS[action] as readonly string[]).includes(code))
}

/** Reads every device into this frame's actions. Called once per frame before gameplay (see InputPoller). */
export function pollInput(): void {
  before = now
  now = new Set(tapped)
  tapped.clear()
  for (const code of keysDown) for (const action of actionsFor(code)) now.add(action)

  let x = 0
  let y = 0
  if (now.has('left')) x -= 1
  if (now.has('right')) x += 1
  if (now.has('up')) y += 1
  if (now.has('down')) y -= 1

  for (const pad of navigator.getGamepads?.() ?? []) {
    if (!pad) continue
    const [sx = 0, sy = 0] = pad.axes
    if (Math.hypot(sx, sy) > PAD_DEADZONE) {
      x += sx
      y -= sy
    }
    if (pad.buttons[14]?.pressed) x -= 1
    if (pad.buttons[15]?.pressed) x += 1
    if (pad.buttons[12]?.pressed) y += 1
    if (pad.buttons[13]?.pressed) y -= 1
    for (const [action, buttons] of Object.entries(PAD_BUTTONS) as [Action, number[]][]) {
      if (buttons.some((b) => pad.buttons[b]?.pressed)) {
        if (!before.has(action)) emit(action)
        now.add(action)
      }
    }
  }

  if (touchStick.active) {
    x += touchStick.x
    y += touchStick.y
  }
  if (touchPrimary) now.add('primary')

  const length = Math.hypot(x, y)
  input.move.x = length > 1 ? x / length : x
  input.move.y = length > 1 ? y / length : y
}

addEventListener('keydown', (event) => {
  const actions = actionsFor(event.code)
  if (!actions.length) return
  // Keep arrows and Space from scrolling the page, but leave typing in form fields alone.
  if (!(event.target instanceof HTMLInputElement)) event.preventDefault()
  input.touch = false
  if (!event.repeat) {
    keysDown.add(event.code)
    actions.forEach(emit)
  }
})
addEventListener('keyup', (event) => keysDown.delete(event.code))
addEventListener('blur', () => keysDown.clear())

/** Touch: the left half is a floating stick, a tap or hold on the right half is primary. */
export function bindTouch(element: HTMLElement): () => void {
  const down = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return
    input.touch = true
    const rect = element.getBoundingClientRect()
    if (event.clientX - rect.left < rect.width / 2 && !touchStick.active) {
      Object.assign(touchStick, { active: true, id: event.pointerId, originX: event.clientX, originY: event.clientY, x: 0, y: 0 })
    } else {
      touchPrimary = true
      emit('primary')
    }
  }
  const move = (event: PointerEvent) => {
    if (event.pointerId !== touchStick.id) return
    const dx = event.clientX - touchStick.originX
    const dy = event.clientY - touchStick.originY
    const length = Math.max(STICK_RADIUS, Math.hypot(dx, dy))
    touchStick.x = dx / length
    touchStick.y = -dy / length
  }
  const up = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return
    if (event.pointerId === touchStick.id) Object.assign(touchStick, { active: false, id: -1, x: 0, y: 0 })
    else touchPrimary = false
  }
  element.addEventListener('pointerdown', down)
  element.addEventListener('pointermove', move)
  element.addEventListener('pointerup', up)
  element.addEventListener('pointercancel', up)
  return () => {
    element.removeEventListener('pointerdown', down)
    element.removeEventListener('pointermove', move)
    element.removeEventListener('pointerup', up)
    element.removeEventListener('pointercancel', up)
  }
}

---
name: web-animation-design
description: 'Design and implement web animations that feel natural and purposeful. Use this skill proactively whenever the user asks questions about animations, motion, easing, timing, duration, springs, transitions, or animation performance. This includes questions about how to animate specific UI elements, which easing to use, animation best practices, or accessibility considerations for motion. Triggers on: easing, ease-out, ease-in, ease-in-out, cubic-bezier, bounce, spring physics, keyframes, transform, opacity, fade, slide, scale, hover effects, microinteractions, Framer Motion, React Spring, GSAP, CSS transitions, entrance/exit animations, page transitions, stagger, will-change, GPU acceleration, prefers-reduced-motion, modal/dropdown/tooltip/popover/drawer animations, gesture animations, drag interactions, button press feel, feels janky, make it smooth, storyboard, stage, TIMING object.'
metadata:
  author: Quintessential
  version: '3.0.0'
  short-description: Design and implement web animations that feel natural and purposeful
---

# Web Animation Design

Quintessential's comprehensive guide for creating animations that feel right. Covers principles, easing, timing, springs, exit animations, code architecture, performance, and accessibility.

## Quick Start

Every animation decision starts with these questions:

1. **Is this element entering or exiting?** → Use `ease-out`
2. **Is an on-screen element moving?** → Use `ease-in-out`
3. **Is this a hover/color transition?** → Use `ease`
4. **Will users see this 100+ times daily?** → Don't animate it

### Motion Type Decision Framework

| Motion Type                             | Best Choice | Why                                        |
| --------------------------------------- | ----------- | ------------------------------------------ |
| User-driven (drag, flick, gesture)      | Spring      | Survives interruption, preserves velocity  |
| System-driven (state change, feedback)  | Easing      | Clear start/end, predictable timing        |
| Time representation (progress, loading) | Linear      | 1:1 relationship between time and progress |
| High-frequency (typing, fast toggles)   | None        | Animation adds noise, feels slower         |

## The Easing Blueprint

### ease-out (Most Common)

Use for **user-initiated interactions**: dropdowns, modals, tooltips, any element entering or exiting the screen.

```css
/* Sorted weak to strong */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-out-cubic: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-out-quart: cubic-bezier(0.165, 0.84, 0.44, 1);
--ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1);
--ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
--ease-out-circ: cubic-bezier(0.075, 0.82, 0.165, 1);
```

Why it works: Acceleration at the start creates an instant, responsive feeling. The element "jumps" toward its destination then settles in.

### ease-in-out (For Movement)

Use when **elements already on screen need to move or morph**. Mimics natural motion like a car accelerating then braking.

```css
/* Sorted weak to strong */
--ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
--ease-in-out-cubic: cubic-bezier(0.645, 0.045, 0.355, 1);
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1);
--ease-in-out-expo: cubic-bezier(1, 0, 0, 1);
--ease-in-out-circ: cubic-bezier(0.785, 0.135, 0.15, 0.86);
```

### ease (For Hover Effects)

Use for **hover states and color transitions**. The asymmetrical curve (faster start, slower end) feels elegant for gentle animations.

```css
transition: background-color 150ms ease;
```

### linear (Avoid in UI)

Only use for:

- Constant-speed animations (marquees, tickers)
- Time visualization (hold-to-delete progress indicators)

Linear feels robotic and unnatural for interactive elements.

### ease-in (Almost Never)

**Avoid for UI animations.** Makes interfaces feel sluggish because the slow start delays visual feedback.

### Paired Elements Rule

Elements that animate together must use the same easing and duration. Modal + overlay, tooltip + arrow, drawer + backdrop — if they move as a unit, they should feel like a unit.

```css
.modal {
  transition: transform 200ms ease-out;
}
.overlay {
  transition: opacity 200ms ease-out;
}
```

## Timing and Duration

| Element Type                      | Duration  |
| --------------------------------- | --------- |
| Micro-interactions (press, hover) | 120-180ms |
| Standard UI (tooltips, dropdowns) | 150-250ms |
| Small state changes               | 180-260ms |
| Modals, drawers                   | 200-300ms |

**Rules:**

- UI animations must stay under 300ms
- Larger elements animate slower than smaller ones
- Exit animations can be ~20% faster than entrance
- Match duration to distance — longer travel = longer duration
- If animation feels slow, **shorten the duration first** before adjusting the curve

### The Frequency Rule

Determine how often users will see the animation:

- **100+ times/day** → No animation (or drastically reduced)
- **Occasional use** → Standard animation
- **Rare/first-time** → Can be more special

## When to Animate

**Do animate:**

- Enter/exit transitions for spatial consistency
- State changes that benefit from visual continuity
- Responses to user actions (feedback)
- Rarely-used interactions where delight adds value

**Don't animate:**

- Keyboard-initiated actions (arrow keys, shortcuts, tab/focus)
- Hover effects on frequently-used elements
- Anything users interact with 100+ times daily
- When speed matters more than smoothness
- Context menu entrances (exit only — context menus should appear instantly)

**Marketing vs. Product:**

- Marketing: More elaborate, longer durations allowed
- Product: Fast, purposeful, never frivolous

## Animation Principles

### Active State Feedback

Interactive elements must have `:active` scale transforms for press feedback:

```css
.button:active {
  transform: scale(0.97);
}
```

### Subtle Deformation

Squash/stretch must stay in the 0.95-1.05 range. Anything beyond looks cartoonish in UI.

```tsx
<motion.div whileTap={{ scale: 0.98 }} />
```

### Stagger Limits

Stagger delays must not exceed 50ms per item. Excessive stagger makes lists feel slow.

```tsx
transition={{ staggerChildren: 0.03 }}
```

### Staging

- **One focal point** — Only one element should animate prominently at a time
- **Dim backgrounds** — Modal/dialog backgrounds should dim to direct focus
- **Z-index hierarchy** — Animated elements must respect z-index layers

## Spring Animations

Springs feel more natural because they don't have fixed durations — they simulate real physics.

### When to Use Springs

- Gesture-driven motion (drag, flick, swipe) — springs **must** be used
- Interruptible motion — springs **must** be used (they preserve velocity when interrupted; CSS animations restart from zero)
- Elements that should feel "alive" (Dynamic Island)
- Organic, playful interfaces
- Any motion needing overshoot-and-settle behavior

### Configuration

**Apple's approach (recommended for most cases):**

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

**Traditional physics (more control):**

```js
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

### Spring Guidelines

- **Avoid bounce** in most UI contexts
- **Use bounce** for drag-to-dismiss, playful interactions
- Keep bounce subtle (0.1-0.3) when used
- Balanced parameters: avoid excessive oscillation (e.g. `stiffness: 1000, damping: 5` is too bouncy)
- When velocity matters (drag release), pass input velocity to the spring:

```tsx
onDragEnd={(e, info) => {
  animate(target, { x: 0 }, {
    type: "spring",
    velocity: info.velocity.x,
  });
}}
```

### Quick Reference

| Interaction     | Timing | Type                          |
| --------------- | ------ | ----------------------------- |
| Drag release    | Spring | `stiffness: 500, damping: 30` |
| Button press    | 150ms  | `ease`                        |
| Modal enter     | 200ms  | `ease-out`                    |
| Modal exit      | 150ms  | `ease-out`                    |
| Page transition | 250ms  | `ease-in-out`                 |
| Progress bar    | varies | `linear`                      |
| Typing feedback | 0ms    | none                          |

## Exit Animations (AnimatePresence)

### Core Rules

- `exit-requires-wrapper` — Conditional motion elements must be wrapped in `<AnimatePresence>`
- `exit-prop-required` — Elements inside AnimatePresence need an `exit` prop
- `exit-key-required` — Dynamic lists need unique keys (`item.id`), never array index
- `exit-matches-initial` — Exit animation should mirror initial for symmetry

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    />
  )}
</AnimatePresence>
```

### Presence Hooks

- `presence-hook-in-child` — `useIsPresent` must be called from the child of AnimatePresence, not the parent
- `presence-safe-to-remove` — Call `safeToRemove` after async cleanup when using `usePresence`
- `presence-disable-interactions` — Disable interactions on exiting elements via `disabled={!isPresent}`

### Mode Selection

- `mode-wait-doubles-duration` — Mode `"wait"` nearly doubles perceived duration; halve your timing values when using it
- `mode-sync-layout-conflict` — Mode `"sync"` causes layout conflicts; use `"popLayout"` instead for lists
- `mode-pop-layout-for-lists` — Use `popLayout` mode for list reordering to prevent layout shifts

### Nested AnimatePresence

- `nested-propagate-required` — Nested AnimatePresence needs the `propagate` prop on both parent and child
- `nested-consistent-timing` — Coordinate parent-child exit durations; child must finish before parent

## Code Architecture (Storyboard Pattern)

Structure animated components for readability and tunability. Every timing value, scale, position, and spring config is extracted to named constants.

### 1. ASCII Storyboard Comment

A block comment at the top of the file that reads like a shot list:

```
/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   waiting for trigger (scroll into view / mount)
 *  300ms   card fades in, scale 0.85 → 1.0
 *  900ms   heading text highlights
 * 1500ms   detail rows slide up (staggered 200ms)
 * 2100ms   CTA button fades in
 * ───────────────────────────────────────────────────────── */
```

Rules: right-align ms values, use `→` for value transitions, note stagger intervals in parentheses.

### 2. TIMING Object

A single `const TIMING` object with every stage delay in milliseconds. This is the **only place** timing values live.

```tsx
const TIMING = {
  cardAppear: 300,
  headingGlow: 900,
  detailRows: 1500,
  ctaButton: 2100,
};
```

Keys are camelCase descriptive verb phrases. Values are ms after the animation trigger (not deltas between stages).

### 3. Element Config Objects

Each animated element gets its own named config object:

```tsx
const CARD = {
  initialScale: 0.85,
  finalScale: 1.0,
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
};

const ROWS = {
  stagger: 0.2,
  offsetY: 12,
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  items: [
    { label: 'Row 1', value: 'A' },
    { label: 'Row 2', value: 'B' },
  ],
};
```

UPPERCASE names. Group ALL values for one element together. Repeated items are arrays rendered with `.map()`.

### 4. Stage-Driven Sequencing

A single `stage` integer state drives the entire sequence — no scattered boolean flags:

```tsx
const [stage, setStage] = useState(0);

useEffect(() => {
  if (!isInView) {
    setStage(0);
    return;
  }

  setStage(0);
  const timers: NodeJS.Timeout[] = [];

  timers.push(setTimeout(() => setStage(1), TIMING.cardAppear));
  timers.push(setTimeout(() => setStage(2), TIMING.headingGlow));
  timers.push(setTimeout(() => setStage(3), TIMING.detailRows));
  timers.push(setTimeout(() => setStage(4), TIMING.ctaButton));

  return () => timers.forEach(clearTimeout);
}, [isInView, replayTrigger]);
```

### 5. JSX Pattern

Reference config objects in animate props, use `stage >= N` checks:

```tsx
<motion.div
  initial={{ opacity: 0, scale: CARD.initialScale }}
  animate={{
    opacity: stage >= 1 ? 1 : 0,
    scale: stage >= 1 ? CARD.finalScale : CARD.initialScale,
  }}
  transition={CARD.spring}
/>
```

For staggered groups:

```tsx
{
  ROWS.items.map((item, i) => (
    <motion.div
      key={item.label}
      initial={{ opacity: 0, y: ROWS.offsetY }}
      animate={{
        opacity: stage >= 3 ? 1 : 0,
        y: stage >= 3 ? 0 : ROWS.offsetY,
      }}
      transition={{ ...ROWS.spring, delay: i * ROWS.stagger }}
    >
      {item.label}
    </motion.div>
  ));
}
```

### Storyboard Checklist

- [ ] ASCII storyboard comment at top matches actual TIMING values
- [ ] Zero magic numbers in JSX or useEffect — everything references a const
- [ ] Springs defined in config objects, not inline
- [ ] Repeated elements use `.map()` over a data array
- [ ] Stage values use `>=` checks (stages are additive)
- [ ] `replayTrigger` in dependency array for dev/debug replay

## Performance

### The Golden Rule

Only animate `transform` and `opacity`. These skip layout and paint stages, running entirely on the GPU.

**Avoid animating:**

- `padding`, `margin`, `height`, `width` (trigger layout)
- `blur` filters above 20px (expensive, especially Safari)
- CSS variables in deep component trees

### Optimization Techniques

```css
.animated-element {
  will-change: transform;
}
```

**React-specific:**

- Animate outside React's render cycle when possible
- Use refs to update styles directly instead of state
- Re-renders on every frame = dropped frames

**Framer Motion:**

```jsx
// Hardware accelerated (transform as string)
<motion.div animate={{ transform: "translateX(100px)" }} />

// NOT hardware accelerated (more readable but slower)
<motion.div animate={{ x: 100 }} />
```

### CSS vs. JavaScript

- CSS animations run off main thread (smoother under load)
- JS animations (Framer Motion, React Spring) use `requestAnimationFrame`
- CSS better for simple, predetermined animations
- JS better for dynamic, interruptible animations

## Accessibility

### prefers-reduced-motion

Whenever you add an animation, also add a media query to disable it:

```css
.modal {
  animation: fadeIn 200ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .modal {
    animation: none;
  }
}
```

### Reduced Motion Guidelines

- Every animated element needs its own `prefers-reduced-motion` media query
- Set `animation: none` or `transition: none` (no `!important`)
- No exceptions for opacity or color — disable all animations
- Show play buttons instead of autoplay videos

### Framer Motion Implementation

```jsx
import { useReducedMotion } from 'framer-motion';

function Component() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    />
  );
}
```

### Touch Device Considerations

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover {
    transform: scale(1.05);
  }
}
```

Touch devices trigger hover on tap, causing false positives.

## Practical Tips

Quick reference for common scenarios. See [practical-tips.md](practical-tips.md) for detailed implementations.

| Scenario                        | Solution                                        |
| ------------------------------- | ----------------------------------------------- |
| Make buttons feel responsive    | Add `transform: scale(0.97)` on `:active`       |
| Element appears from nowhere    | Start from `scale(0.95)`, not `scale(0)`        |
| Shaky/jittery animations        | Add `will-change: transform`                    |
| Hover causes flicker            | Animate child element, not parent               |
| Popover scales from wrong point | Set `transform-origin` to trigger location      |
| Sequential tooltips feel slow   | Skip delay/animation after first tooltip        |
| Small buttons hard to tap       | Use 44px minimum hit area (pseudo-element)      |
| Something still feels off       | Add subtle blur (under 20px) to mask it         |
| Hover triggers on mobile        | Use `@media (hover: hover) and (pointer: fine)` |
| Animation feels slow            | Shorten duration first, then adjust curve       |

## Easing Decision Flowchart

Is the element entering or exiting the viewport?
├── Yes → ease-out
└── No
├── Is it moving/morphing on screen?
│ └── Yes → ease-in-out
└── Is it a hover change?
├── Yes → ease
└── Is it constant motion?
├── Yes → linear
└── Default → ease-out

## Reference Files

- [practical-tips.md](practical-tips.md) — Detailed implementations for common animation scenarios

Reference: [Motion Documentation](https://motion.dev), [Motion AnimatePresence](https://motion.dev/docs/react-animate-presence), [Apple WWDC23: Animate with Springs](https://developer.apple.com/videos/play/wwdc2023/10158)

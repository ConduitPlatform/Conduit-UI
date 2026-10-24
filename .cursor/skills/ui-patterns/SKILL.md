---
name: quintessential-ui-patterns
description: 'Advanced UI implementation patterns for CSS pseudo-elements, View Transitions, morphing icons, container animations, and predictive prefetching. Use when working with pseudo-elements, ::before/::after, View Transitions API, morphing SVG icons, animated container dimensions, or predictive prefetching. Triggers on: pseudo-element, ::before, ::after, view-transition, ::backdrop, ::placeholder, ::selection, ::marker, ::first-line, morphing, icon animation, SVG morph, container animation, ResizeObserver, useMeasure, prefetch, trajectory, hitSlop, foresight.'
metadata:
  author: Quintessential
  version: '3.0.0'
  short-description: Advanced UI patterns for pseudo-elements, morphing icons, containers, and prefetching
---

# UI Patterns

Quintessential's advanced UI implementation patterns. 37 rules across 4 categories for CSS pseudo-elements, morphing icons, container animations, and predictive prefetching.

Individual rule files with code examples are in the `rules/` subfolder.

## 1. CSS Pseudo Elements (MEDIUM)

Leveraging `::before`, `::after`, View Transitions API, and native pseudo-elements to reduce DOM nodes and improve transitions.

| Rule                               | Summary                                                            |
| ---------------------------------- | ------------------------------------------------------------------ |
| `pseudo-content-required`          | `::before`/`::after` require `content` property to render          |
| `pseudo-over-dom-node`             | Use pseudo-elements for decoration instead of extra DOM nodes      |
| `pseudo-position-relative-parent`  | Parent needs `position: relative` for absolute pseudo-elements     |
| `pseudo-z-index-layering`          | Z-index for correct pseudo-element layering                        |
| `pseudo-hit-target-expansion`      | Negative inset values expand hit targets without extra markup      |
| `pseudo-marker-styling`            | Use `::marker` for custom list bullet styles                       |
| `pseudo-first-line-styling`        | Use `::first-line` for typographic treatments                      |
| `transition-name-required`         | View transitions need `view-transition-name`                       |
| `transition-name-unique`           | Each transition name unique during transition                      |
| `transition-name-cleanup`          | Remove transition name after completion                            |
| `transition-over-js-library`       | Prefer View Transitions API over JS libraries for page transitions |
| `transition-style-pseudo-elements` | Style `::view-transition-group` for custom animations              |
| `native-backdrop-styling`          | Use `::backdrop` for dialog/popover backgrounds                    |
| `native-placeholder-styling`       | Use `::placeholder` for input styling                              |
| `native-selection-styling`         | Use `::selection` for text selection styling                       |

## 2. Morphing Icons (LOW)

Building icon components that morph between any two icons through SVG line transformation. All icons share a 3-line structure.

| Rule                           | Summary                                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `morphing-three-lines`         | Every icon uses exactly 3 SVG lines                                                                    |
| `morphing-use-collapsed`       | Unused lines use collapsed constant (`{ x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER, opacity: 0 }`) |
| `morphing-consistent-viewbox`  | All icons share same viewBox (14x14)                                                                   |
| `morphing-group-variants`      | Rotational variants share group and base lines                                                         |
| `morphing-spring-rotation`     | Spring physics for grouped icon rotation                                                               |
| `morphing-reduced-motion`      | Respect `prefers-reduced-motion`                                                                       |
| `morphing-jump-non-grouped`    | Instant rotation jump between non-grouped icons                                                        |
| `morphing-strokelinecap-round` | Round stroke line caps                                                                                 |
| `morphing-aria-hidden`         | Icon SVGs are `aria-hidden`                                                                            |

## 3. Container Animation (MEDIUM)

Animating container width and height using a measure-and-animate pattern with ResizeObserver and Motion.

| Rule                            | Summary                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `container-two-div-pattern`     | Outer animated div, inner measured div; never same element      |
| `container-guard-initial-zero`  | Guard bounds === 0 on initial render, fall back to `"auto"`     |
| `container-use-resize-observer` | Use ResizeObserver for measurement, not `getBoundingClientRect` |
| `container-overflow-hidden`     | Set `overflow: hidden` on animated container during transitions |
| `container-no-excessive-use`    | Use sparingly: buttons, accordions, interactive elements        |
| `container-callback-ref`        | Use callback ref (not `useRef`) for measurement hooks           |
| `container-transition-delay`    | Add small delay for natural catching-up feel                    |

## 4. Predictive Prefetching (MEDIUM)

Loading content before the user clicks by analyzing cursor trajectory.

| Rule                             | Summary                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `prefetch-trajectory-over-hover` | Trajectory prediction over hover; reclaims 100-200ms     |
| `prefetch-not-everything`        | Prefetch by intent, not viewport; avoid wasted bandwidth |
| `prefetch-hit-slop`              | Use hitSlop to trigger predictions earlier               |
| `prefetch-touch-fallback`        | Fall back gracefully on touch devices (no cursor)        |
| `prefetch-keyboard-tab`          | Prefetch on keyboard navigation when focus approaches    |
| `prefetch-use-selectively`       | Use predictive prefetching where latency is noticeable   |

## How to Use

Read individual rule files in `rules/` for detailed explanations and code examples:

```
rules/pseudo-content-required.md
rules/container-two-div-pattern.md
rules/prefetch-trajectory-over-hover.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation

Reference: [MDN Pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements), [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver), [ForesightJS](https://foresightjs.com), [Motion Documentation](https://motion.dev)

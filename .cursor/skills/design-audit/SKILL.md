---
name: design-audit
description: "Audit an existing codebase for design consistency, extract the current design profile, and produce a prioritized migration report against Quintessential standards. Use when the user wants to evaluate an existing project's design quality, assess UI consistency, or prepare for a design system migration. Triggers on: audit codebase, design audit, evaluate design, check consistency, design debt, review project design, assess UI quality, migrate design, design profile, what needs fixing."
argument-hint: "[project path or 'this project']"
metadata:
  author: Quintessential
  version: '3.0.0'
  short-description: Codebase design audit against Quintessential standards
---

# Design Audit

Scan an existing codebase, extract its current design profile, compare against Quintessential standards, and produce a prioritized migration report with a ready-to-use project context rule.

---

## When to Use

- User says "audit", "evaluate", "assess", "check design", "design debt", "what needs fixing"
- User wants to apply Quintessential rules to an existing project
- Before installing Quintessential rules in a project that's already in development
- When the user asks "how consistent is this codebase?"

---

## Audit Process

Follow this sequence exactly. Each step produces output the next step depends on.

### Step 1: Locate the Design Surface

Find the files that define the project's visual language:

```
Search for (in order):
1. globals.css, global.css, app.css, index.css — global styles
2. tailwind.config.js, tailwind.config.ts — Tailwind theme
3. theme.ts, theme.js, tokens.ts, tokens.js — design tokens
4. components/ui/ — shared UI component library
5. layout.tsx, layout.jsx — root layout (fonts, providers)
6. package.json — check for styling/animation dependencies
```

Read each file found. These are the source of truth for what the project considers its design system.

### Step 2: Extract the Design Profile

From the files found, extract concrete values. Be specific — count things, name things, quote values.

#### 2a. Typography

| Question                       | How to Find                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| What font families are in use? | Search for `font-family`, `--font-`, `next/font`, `@font-face`, Google Fonts imports |
| How many distinct font sizes?  | Search for `font-size`, `text-{size}` Tailwind classes, `--font-size-` variables     |
| How many font weights?         | Search for `font-weight`, `font-{weight}` classes                                    |
| Is there a type scale?         | Check if sizes follow a ratio or are arbitrary                                       |
| Is `font-display: swap` used?  | Check `@font-face` declarations and `next/font` config                               |
| Is antialiasing set?           | Search for `-webkit-font-smoothing`                                                  |

#### 2b. Colors

| Question                           | How to Find                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| How many unique color values?      | Search for hex codes (`#[0-9a-fA-F]{3,8}`), `rgb()`, `hsl()`, Tailwind color classes |
| How many are in CSS variables?     | Count `--color-` or `--{name}` variables in globals                                  |
| How many are hardcoded?            | Count hex/rgb values in component files (not in globals or config)                   |
| Is there a palette?                | Check Tailwind config `colors` or CSS variable definitions                           |
| Are alpha colors used for borders? | Search for `rgba`, `hsla`, `/0.` patterns on borders                                 |

#### 2c. Spacing

| Question                      | How to Find                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| What spacing values are used? | Search for `padding`, `margin`, `gap`, `p-`, `m-`, `gap-`                |
| Do they follow a scale?       | Check if values are multiples of 4 (4, 8, 12, 16, 24, 32, 48)            |
| Are there arbitrary values?   | Look for odd numbers or non-scale values like `13px`, `37px`, `p-[23px]` |

#### 2d. Shadows & Borders

| Question                                 | How to Find                                              |
| ---------------------------------------- | -------------------------------------------------------- |
| How many shadow definitions?             | Search for `box-shadow`, `shadow-`, `--shadow`           |
| Are shadows layered?                     | Check if any shadow uses multiple comma-separated values |
| Are shadows consistent direction?        | Compare offset-x/offset-y across shadows                 |
| Are border colors hardcoded or variable? | Search for `border-color`, `border-{color}`              |

#### 2e. Animation & Motion

| Question                               | How to Find                                                             |
| -------------------------------------- | ----------------------------------------------------------------------- |
| What animation library is used?        | Check package.json for framer-motion, motion, react-spring, gsap        |
| What durations are in use?             | Search for `duration`, `transition:`, `animation:`, timing values       |
| What easings are in use?               | Search for `ease`, `cubic-bezier`, `ease-in`, `ease-out`, `ease-in-out` |
| Is `prefers-reduced-motion` respected? | Search for `prefers-reduced-motion`, `useReducedMotion`                 |
| Are `exit` animations present?         | Search for `AnimatePresence`, `exit=`                                   |

#### 2f. Components

| Question                        | How to Find                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| Is there a shared UI library?   | Check for `components/ui/`, `@your-org/ui`, shadcn components |
| How many button variants exist? | Search for button components, count distinct styles           |
| Are inputs/forms consistent?    | Compare form components across features                       |
| Is `cn()` or `clsx` used?       | Search for the class merging utility                          |

#### 2g. Keyboard & Interaction

| Question                        | How to Find                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| Are keyboard shortcuts defined? | Search for `useHotkeys`, `addEventListener('keydown'`, `Cmd+`, `Ctrl+` |
| Does Escape close overlays?     | Search for `Escape` key handling in modals/dialogs                     |
| Is focus management handled?    | Search for `focus-visible`, `FocusTrap`, `autoFocus`                   |
| Are hover states touch-safe?    | Search for `@media (hover: hover)`, `pointer: fine`                    |

### Step 3: Compare Against Quintessential Standards

For each dimension, rate the current state:

| Rating      | Meaning                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| **Solid**   | Consistent, follows a system, matches or exceeds Quintessential standards |
| **Partial** | Has a system but inconsistently applied, or the system has gaps           |
| **Missing** | No system, arbitrary values, no consistency                               |

### Step 4: Produce the Migration Report

Structure the output as:

```
## Design Audit Report

### Project: [name]
### Date: [date]
### Overall Assessment: [1-2 sentences]

---

### Design Profile

#### Typography
- Families: [list]
- Scale: [exists/missing] — [details]
- Antialiasing: [yes/no]
- Rating: [Solid/Partial/Missing]

#### Colors
- Palette: [X] CSS variables, [Y] hardcoded values
- System: [describe]
- Rating: [Solid/Partial/Missing]

#### Spacing
- Scale: [describe what's in use]
- Consistency: [percentage estimate of on-scale vs arbitrary]
- Rating: [Solid/Partial/Missing]

#### Shadows & Borders
- [findings]
- Rating: [Solid/Partial/Missing]

#### Animation
- Library: [name or CSS-only]
- Durations: [range]
- Easings: [list what's used]
- Reduced motion: [yes/no]
- Rating: [Solid/Partial/Missing]

#### Components
- Shared library: [yes/no]
- Consistency: [assessment]
- Rating: [Solid/Partial/Missing]

#### Keyboard & Interaction
- Shortcuts: [list any found]
- Focus management: [assessment]
- Rating: [Solid/Partial/Missing]

---

### Top 5 Opportunities (by impact)

1. [Highest impact finding — what to fix first]
2. [Second]
3. [Third]
4. [Fourth]
5. [Fifth]

---

### Migration Order

1. **Typography pass** — [specific actions]
2. **Color pass** — [specific actions]
3. **Spacing pass** — [specific actions]
4. **Animation pass** — [specific actions]
5. **Interaction pass** — [specific actions]

---

### Project Context Rule

[Generate a ready-to-use .mdc rule file — see below]
```

### Step 5: Generate the Project Context Rule

Produce a `.mdc` rule file the user can drop into their project's `.cursor/rules/` directory. This rule tells the LLM what exists and what to migrate toward.

Template:

```markdown
---
description: Project design context for [project name]. Guides Quintessential rule application to this existing codebase.
globs: '**/*.{tsx,jsx,ts,js,css,scss,vue,svelte}'
alwaysApply: true
---

# Design Context — [Project Name]

This is an existing project. Apply Quintessential standards with awareness of what's already built.

## Current Design Language (preserve)

- Font: [what's in use — keep unless explicitly changing]
- Palette: [CSS variables and intentional colors — keep]
- Component library: [what exists — extend, don't replace]
- [Other intentional patterns found in audit]

## Migration Targets (improve incrementally)

- Spacing: migrate from [current state] to Quintessential 4/8/12/16/24/32/48 scale
- Colors: extract [N] hardcoded hex values to CSS variables
- Shadows: [specific migration]
- Animation: standardize to [specific targets from audit]
- [Other findings]

## Rules of Engagement

- Apply Quintessential standards to ALL new code
- When modifying existing files, improve what you touch
- Do NOT refactor untouched code unprompted
- Do NOT rewrite working components for style alone
- When you spot a major violation in code you're editing, fix it silently
- When you spot a major violation in code you're NOT editing, leave a brief comment noting the opportunity
```

---

## Voice

The audit report should be factual and direct. No hedging, no softening. Count things. Name things. Quote values. "There are 47 unique hex values across 23 component files, 12 of which are in CSS variables and 35 are hardcoded" — not "the color system could use some improvement."

Frame findings as opportunities, not failures. The project works — the goal is to make it feel considered.

---

## After the Audit

Once the user has the report and the project context rule:

1. Install the project context rule in `.cursor/rules/design-context.mdc`
2. Install Quintessential rules alongside it (the standard `.mdc` files)
3. Install relevant skills in the project's `.cursor/skills/` or at user level
4. Begin building — the rules now guide every new file and every touched file
5. Schedule targeted passes (typography first) when ready for focused migration

# Lucky Numbers — UI Specification

> Stage 1–3 · random draw · personal mode · historical weighting  
> Last updated: 2026-07-02

This document describes every region, component, state, and interaction in the current UI. Use it as the reference baseline when planning or reviewing new builds.

---

## 1. Layout shell

| Property | Value |
|---|---|
| Container class | `.app` |
| Max width | 560 px, centred with `margin: 0 auto` |
| Padding | `max(20px, env(safe-area-inset-top))` top · `20px` sides · `calc(20px + env(safe-area-inset-bottom))` bottom |
| Direction | Column flex, `min-height: 100%` |
| Stacking context | Decorative `.aurora` is `z-index: 0`; all direct children are `z-index: 1` |

### Aurora glow

- `aria-hidden="true"` decorative element, absolutely positioned behind everything.
- Radial gradient: purple (`rgba(127,119,221,0.45)`) at 30 % and pink (`rgba(212,83,126,0.32)`) at 70 %.
- `filter: blur(50px)`, 460 × 460 px circle offset 160 px above the viewport top.
- Reduced to 50 % opacity in the light theme.

---

## 2. Header (`.app-header`)

Space-between flex row, `margin-bottom: 28px`.

### 2.1 Brand

Left side — horizontal flex, gap 10 px.

| Element | Detail |
|---|---|
| `SparkIcon` | 22 × 22 px filled SVG star, `color: var(--accent)` |
| `<h1>` "Lucky Numbers" | 20 px, weight 600, `letter-spacing: -0.01em`, `color: var(--text)` |

### 2.2 Header action buttons (`.header-actions`)

Right side — flex row, gap 8 px. Three icon buttons plus the theme toggle, all 40 × 40 px circles sharing the same base style as the theme toggle.

| Button | Icon | Visible when | Active style |
|---|---|---|---|
| History | `ChartIcon` (bar chart) | Always | `background: var(--accent-soft)`, `color: var(--accent)` when `historyMode` is on |
| Breakdown | `GridIcon` (2×2 grid) | Profile is complete | — |
| Profile | `UserIcon` (person) | Always | `background: var(--accent-soft)`, `color: var(--accent)` when profile is complete |
| Theme toggle | Sun / Moon | Always | `transform: rotate(-12deg)` on hover |

### 2.3 Theme toggle (`.theme-toggle`)

40 × 40 px circular icon button.

| State | Style |
|---|---|
| Default | `background: var(--surface)`, `border: 1px solid var(--border)`, `color: var(--text-dim)` |
| Hover | `color: var(--accent)`, `border-color: var(--accent)`, `transform: rotate(-12deg)` |

Persists choice to `localStorage` via `useTheme`.

---

## 3. Controls panel (`.controls`)

Surfaced card: `background: var(--surface)`, 1 px border, `border-radius: var(--radius)`, `padding: 18px`, shadow.

### 3.0 Game selector (`.game-selector`)

Horizontal flex row of game chip buttons, `gap: 8px`, above the stepper grid. Each chip shows the game name and a short description (e.g. "6 from 45 · Saturdays").

| State | Style |
|---|---|
| Default | `background: var(--surface-2)`, `border: 1px solid var(--border)` |
| Selected (`.game-chip--selected`) | `background: var(--accent-soft)`, `border-color: var(--accent)` |

Selecting a game updates `count`, `min`, and `max` in `config` to match the game's registry entry and clears the generated lines.

### 3.1 Stepper grid (`.controls-grid`)

2-column grid, `gap: 12px`. Contains four `Stepper` instances:

| Label | Config key | Min | Max |
|---|---|---|---|
| Numbers | `count` | 1 | 50 |
| Lines | `lineCount` | 1 | 20 |
| Lowest | `min` | 0 | `config.max − 1` |
| Highest | `max` | `config.min + 1` | 999 |

Config is persisted to `localStorage` under key `ln:config` with defaults `{ count: 7, min: 1, max: 42, lineCount: 1, allowRepeats: false }`.

### 3.2 Stepper component

Each stepper has two sub-regions:

**Header (`.stepper-head`)** — baseline-aligned space-between row:
- `.stepper-label` — 13 px, weight 500, `var(--text-dim)`
- `.stepper-hint` — 11 px, `var(--text-faint)` (optional, not used in current steppers)

**Control (`.stepper-control`)** — flex row, `background: var(--surface-2)`, 1 px border, `border-radius: var(--radius-sm)`, `overflow: hidden`.

| Part | Size | Detail |
|---|---|---|
| Decrement `−` button | 40 × 44 px | Disabled when `value <= min` |
| Number `<input>` | `flex: 1`, height 44 px | 17 px, weight 600, centred; native spinners hidden |
| Increment `+` button | 40 × 44 px | Disabled when `value >= max` |

Button states:

| State | Style |
|---|---|
| Default | Transparent bg, `color: var(--text-dim)`, 20 px font |
| Hover (enabled) | `background: var(--accent-soft)`, `color: var(--accent)` |
| Disabled | `opacity: 0.35`, `cursor: not-allowed` |

### 3.3 Summary line (`.controls-summary`)

Below the grid: 13 px, `var(--text-faint)`, centred.  
Format: `{count} number(s) between {min} and {max} · {poolSize} in the pool [· {lineCount} lines]`.  
The lines clause is omitted when `lineCount === 1`.

### 3.4 Error state (`.controls-error`)

Shown when `validateConfig` returns a string (e.g. count > pool size).

- `role="alert"` for screen readers.
- 13 px, `var(--danger)`, centred.
- Pill background: `rgba(240,153,123,0.12)`, `border-radius: var(--radius-sm)`.

### 3.5 Personal lucky numbers toggle (`.personal-row`)

Below the stepper grid. Toggle row with label, sub-label, and a switch (`role="switch"`).

| State | Detail |
|---|---|
| Profile incomplete | Row dimmed (`opacity: 0.5`), toggle disabled; sub-label "Add your profile to unlock" |
| Profile complete, mode off | Sub-label "Based on your name & birth details"; toggle grey |
| Profile complete, mode on | Toggle blue (`.toggle--on`) |

### 3.6 Historical weighting toggle + bias chips

Same toggle row layout as 3.5. Toggle accent colour: red (`.toggle--on.toggle--history`).

Below the toggle, when `historyMode` is on:

**Bias chips (`.bias-chips`)** — flex row of three pill buttons:

| Chip | Value | Selected style |
|---|---|---|
| 🔥 Hot | `'hot'` | `.bias-chip--selected`: amber/red tint |
| ⚖ Balanced | `'balanced'` | `.bias-chip--selected`: neutral tint |
| ❄ Cold | `'cold'` | `.bias-chip--selected`: blue tint |

**Seasonal boost row (`.personal-row.personal-row--sub`)** — below the bias chips, no top border. Toggle accent colour: amber/orange (`.toggle--on.toggle--seasonal`). Sub-label: "Extra weight on this quarter's hot numbers".

---

## 4. Generate button (`.generate-btn`)

Full-width, below the controls card.

| Property | Value |
|---|---|
| Height | 16 px font, 16 px padding → effectively ~52 px tall |
| Margin | `18px 0 8px` |
| Background | `var(--accent-strong)` |
| Color | `#fff` |
| Font | 16 px, weight 600, `letter-spacing: 0.01em` |
| Icon | `DiceIcon` — 20 × 20 px stroke SVG, gap 10 px from label |
| Shadow | `0 14px 30px -12px rgba(83,74,183,0.7)` |

Label changes after first generation: "Generate" → "Generate again".

| State | Style |
|---|---|
| Hover (enabled) | `background: var(--accent)` |
| Active (enabled) | `transform: scale(0.98)` |
| Disabled | `opacity: 0.45`, no shadow, `cursor: not-allowed` |

Disabled whenever `error` is truthy.

---

## 5. Results section (`.results`)

Appears only when `lines.length > 0`. `margin-top: 22px`.

### 5.1 Results header (`.results-head`)

Space-between flex row, `margin-bottom: 10px`, 13 px, `var(--text-dim)`, weight 500.

- Left: singular `"Your lucky line"` / plural `"{n} lucky lines"`.
- Right: `"Copy all"` link-button (`.link-btn`) — shown only when `lines.length > 1`. Copies all lines joined by `\n` to the clipboard.

### 5.2 Results list (`.results-list`)

Unstyled `<ul>`, column flex, `gap: 12px`. Each item is a `ResultLine`.

### 5.3 Result line (`.result-line`)

Surface card identical in style to the controls panel.

| Region | Detail |
|---|---|
| `.result-line-label` | 11 px, uppercase, `letter-spacing: 0.08em`, `var(--text-faint)`. "Line" (single) or "Line {n}" (multi). |
| `.result-balls` | Flex wrap, `gap: 8px`, `margin: 10px 0 12px` |
| `.result-actions` | Flex row, `gap: 8px` |

#### Action buttons

Both buttons share the same style: `padding: 7px 12px`, `border: 1px solid var(--border)`, `border-radius: 10px`, `background: var(--surface-2)`, 13 px, weight 500, `var(--text-dim)`.

| Button | Icon | Hover |
|---|---|---|
| Copy | CopyIcon (16 px stroke SVG); switches to CheckIcon for 1.4 s after success | `color: var(--accent)`, `border-color: var(--accent)` |
| Share | ShareIcon (16 px stroke SVG); falls back to copy when `navigator.share` is unavailable | `color: var(--accent)`, `border-color: var(--accent)` |

---

## 6. Ball component (`.ball`)

44 × 44 px circle (`border-radius: 50%`), grid-centred number.

| Property | Value |
|---|---|
| Font | 16 px, weight 600 |
| Shadow | `inset 0 -3px 8px rgba(0,0,0,0.25)`, `0 4px 10px -4px rgba(0,0,0,0.4)` |
| Color | Determined by `type` prop (see §6.1) |
| Animation | `pop` keyframe, 0.4 s `cubic-bezier(0.18,0.89,0.32,1.28)`, staggered by `index × 60 ms` |
| Tooltip | `data-tooltip` shows the type label on hover when type is defined |

### 6.1 Ball colour mapping

Colour is determined by the `type` prop resolved in `ResultLine.resolveBallType`:

**CSS-class types (ghost/tinted — no inline colour):**

| Type | Class | Appearance |
|---|---|---|
| `'fill'` | `.ball--fill` | Ghost outline, no fill |
| `'hot'` | `.ball--hot` | Red tint — `rgba(239,68,68,0.14)`, `color: #EF4444` |
| `'cold'` | `.ball--cold` | Blue tint — `rgba(59,130,246,0.14)`, `color: #3B82F6` |
| `'seasonal'` | `.ball--seasonal` | Amber tint — `rgba(249,115,22,0.14)`, `color: #F97316` |

**Inline-colour types (personal jewel tones):**

| Type | Background | Text |
|---|---|---|
| `'life-path'` | `#EF9F27` amber | `#412402` |
| `'expression'` | `#1D9E75` teal | `#E1F5EE` |
| `'personal'` | `#534AB7` purple | `#EEEDFE` |

**Stage 1 (no type):** value is normalised to `[0, 1]` across `[min, max]` and mapped to one of six jewel-tone buckets via `ballColor(value, min, max)`:

| Slot | Background | Text |
|---|---|---|
| 0 (lowest ~17 %) | `#534AB7` purple | `#EEEDFE` |
| 1 | `#1D9E75` teal | `#E1F5EE` |
| 2 | `#D4537E` pink | `#FBEAF0` |
| 3 | `#378ADD` blue | `#E6F1FB` |
| 4 | `#EF9F27` amber | `#412402` |
| 5 (highest ~17 %) | `#D85A30` coral | `#FAECE7` |

**Type priority** (resolved in `resolveBallType`): personal types (`life-path`, `expression`, `personal`) always win. Fill slots in personal mode, or all slots in history-only mode, resolve to the history type (`hot`, `cold`, `seasonal`) or `'fill'` if neutral. Stage 1 (no mode) renders with range-based jewel tones.

### 6.2 Colour legend (`.personal-legend`)

Shown below the results header whenever personal mode or history mode is active.

| Condition | Legend dots shown |
|---|---|
| Personal mode on | Life Path (yellow) · Expression (teal) · Personal (purple) · Neutral (ghost) |
| History mode on, seasonal boost off | Hot (red) · Cold (blue) · Neutral (ghost) |
| History mode on, seasonal boost on | Seasonal (amber) · Hot (red) · Cold (blue) · Neutral (ghost) |
| Both modes on | All applicable dots |

### 6.3 Pop animation

```css
@keyframes pop {
  from { opacity: 0; transform: scale(0.3) translateY(8px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}
```

Suppressed entirely when `prefers-reduced-motion: reduce` is active.

---

## 7. Empty state

Shown when `lines.length === 0` (before first generation).

```
Set your numbers and range, then tap generate.
```

14 px, `var(--text-faint)`, centred. `margin: 28px 0`.

---

## 8. Footer (`.app-footer`)

Centred flex row. `margin-top: 28px`, `padding-top: 16px`, top border `1px solid var(--border)`. 12 px, `var(--text-faint)`.

The footer label reflects the active generation mode:

| Active mode | Footer text |
|---|---|
| Personal mode | `Stage 2 · personal mode · {Game name}` |
| History mode | `Stage 3 · {bias} bias · {Game name}` |
| History + seasonal boost | `Stage 3 · {bias} + seasonal bias · {Game name}` |
| Neither | `Stage 1 · random draw · {Game name}` |

---

## 9. Accessibility

- All icon-only buttons have `aria-label`.
- All decorative SVGs have `aria-hidden="true"`.
- Error messages use `role="alert"`.
- Results section uses `aria-label="Generated numbers"`.
- Controls section uses `aria-label="Generator settings"`.
- Stepper inputs use `aria-label` matching the visible label.
- Theme toggle announces the current state via its visible icon.

---

## 10. Responsive behaviour

| Breakpoint | Change |
|---|---|
| ≤ 380 px | `.footer-soon` hidden |
| All | Max-width 560 px, side padding 20 px |
| Safe-area | Top/bottom padding respect `env(safe-area-inset-*)` for notched devices |

---

## 11. Data flow summary

```
useLocalStorage('ln:config')       ──► config state ──► Controls (reads + writes)
useLocalStorage('ln:selectedGame') ──► selectedGame ──► game-aware history/generation
useLocalStorage('ln:profile')      ──► profile ──► personal mode (Stage 2)
useLocalStorage('ln:historyMode')  ──┐
useLocalStorage('ln:historyBias')  ──┼► historyStats (useMemo) ──► hotSet, coldSet,
useLocalStorage('ln:seasonalBoost')──┘                              seasonalSet, activeSets

generate() ──► generatePinnedLine (Line 1) + generateWeightedLines / generatePersonalLines (2+)
           ──► lines state ──► ResultLine[] ──► resolveBallType ──► Ball type + colour
```

Config is the single source of truth. All generation functions are stateless pure functions.

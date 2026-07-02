# Lucky Numbers — Style Guide

> Stage 1–3 · random draw · personal mode · historical weighting  
> Last updated: 2026-07-02

This guide captures every design decision in the current stylesheet. Reference it before touching `src/styles/index.css` or any component styles to keep the visual language consistent across builds.

---

## 1. Theming architecture

The app is **dark-first**. The dark theme is the default (`:root`). The light theme is applied by setting `data-theme="light"` on `<html>` (toggled by `useTheme`).

All colour values are CSS custom properties. Never hard-code colours in component styles — always use a token.

```
:root               → dark theme (default)
:root[data-theme="light"] → light theme overrides
```

Tokens that are not listed under the light theme block stay unchanged between themes.

---

## 2. Design tokens

### 2.1 Colour tokens

| Token | Dark | Light | Role |
|---|---|---|---|
| `--bg` | `#0e1020` | `#f4f4fb` | Page background |
| `--bg-soft` | `#171a2e` | `#ffffff` | Slightly elevated bg |
| `--surface` | `#1b1f38` | `#ffffff` | Card / panel surface |
| `--surface-2` | `#232845` | `#f0f0fa` | Inset surface (stepper control bg, action button bg) |
| `--border` | `#2c3157` | `#e2e2f0` | All 1 px borders |
| `--text` | `#f1f2fb` | `#1a1b2e` | Primary text |
| `--text-dim` | `#9aa0c8` | `#5a5d80` | Secondary / label text |
| `--text-faint` | `#6b6f96` | `#9295b5` | Hint / metadata text |
| `--accent` | `#7f77dd` | `#534ab7` | Accent highlights, icon colour, hover states |
| `--accent-strong` | `#534ab7` | `#443c9e` | Generate button background |
| `--accent-soft` | `#2a2a54` | `#ece9fb` | Accent tint for hover fills |
| `--danger` | `#f0997b` | `#c0432a` | Error messages |

### 2.2 Geometry tokens

| Token | Value | Usage |
|---|---|---|
| `--radius` | `16px` | Cards, generate button, results section |
| `--radius-sm` | `12px` | Stepper control row, error pill |

### 2.3 Shadow token

| Token | Dark value | Light value |
|---|---|---|
| `--shadow` | `0 18px 40px -20px rgba(0,0,0,0.7)` | `0 18px 40px -24px rgba(40,36,90,0.35)` |

Used on `.controls` and `.result-line` cards only. Do not introduce new shadow values — reuse `--shadow`.

---

## 3. Typography

### 3.1 Font stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

System fonts only. No web fonts are loaded. `font-family: inherit` is set on `button` and `input` to prevent browser overrides.

`-webkit-font-smoothing: antialiased` is set globally.

### 3.2 Type scale

| Usage | Size | Weight | Colour token | Notes |
|---|---|---|---|---|
| Page title `<h1>` | 20 px | 600 | `--text` | `letter-spacing: -0.01em` |
| Generate button label | 16 px | 600 | `#fff` | `letter-spacing: 0.01em` |
| Stepper value (input) | 17 px | 600 | `--text` | Centred |
| Ball number | 16 px | 600 | Ball-specific fg | — |
| Result action buttons | 13 px | 500 | `--text-dim` | — |
| Results header / link | 13 px | 500 | `--text-dim` / `--accent` | — |
| Stepper label | 13 px | 500 | `--text-dim` | — |
| Controls summary | 13 px | 400 | `--text-faint` | Centred |
| Controls error | 13 px | 400 | `--danger` | Centred |
| Empty hint | 14 px | 400 | `--text-faint` | Centred |
| Result line label | 11 px | 400 | `--text-faint` | Uppercase, `letter-spacing: 0.08em` |
| Stepper hint | 11 px | 400 | `--text-faint` | — |
| Footer text | 12 px | 400 | `--text-faint` | — |

---

## 4. Spacing

The layout uses explicit pixel values rather than a spacing scale token. The following values recur frequently — prefer matching them rather than introducing new ones.

| Spacing | Used for |
|---|---|
| 8 px | Ball gap, result action button gap |
| 10 px | Brand gap (icon → title), result balls bottom margin |
| 12 px | Controls grid gap, results list gap, stepper hint margin, error top margin |
| 14 px | Controls padding, result line padding (top/bottom) |
| 16 px | App side padding, result line padding (sides), footer top padding, generate button font/padding |
| 18 px | Controls padding (overall), generate button top margin, generate button bottom margin |
| 20 px | App base padding, result action button vertical padding offset |
| 22 px | Results section top margin |
| 28 px | Header bottom margin, empty hint vertical margin, footer top margin |

---

## 5. Component patterns

### 5.1 Surface card

The pattern shared by `.controls` and `.result-line`:

```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: var(--radius);
box-shadow: var(--shadow);
```

Do not create new card variants — extend this pattern.

### 5.2 Inset surface

Used inside cards for interactive controls (`.stepper-control`, result action buttons):

```css
background: var(--surface-2);
border: 1px solid var(--border);
border-radius: var(--radius-sm);
```

### 5.3 Link button (`.link-btn`)

Borderless, backgroundless text button. Used inline alongside other content.

```css
border: none;
background: none;
color: var(--accent);
font-size: 13px;
font-weight: 500;
padding: 4px 6px;
border-radius: 8px;
```

Hover: `background: var(--accent-soft)`.

### 5.4 Primary action button (`.generate-btn`)

Full-width, solid accent button. Only one per screen.

```css
background: var(--accent-strong);
color: #fff;
border: none;
border-radius: var(--radius);
box-shadow: 0 14px 30px -12px rgba(83,74,183,0.7);
```

Hover: `background: var(--accent)`. Active: `transform: scale(0.98)`. Disabled: `opacity: 0.45`, no shadow.

### 5.5 Ghost action button (result actions)

Secondary actions inside a result card.

```css
border: 1px solid var(--border);
border-radius: 10px;
background: var(--surface-2);
color: var(--text-dim);
```

Hover: `color: var(--accent)`, `border-color: var(--accent)`.

---

## 6. Icons

All icons are inline SVGs. Rules:

- Decorative icons: `aria-hidden="true"`, no title element.
- Interactive icon-only buttons: `aria-label` on the button, `aria-hidden` on the SVG.
- Stroke icons use `strokeWidth="1.8"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- Fill icons use `fill="currentColor"`.

| Icon | Type | Size | Location |
|---|---|---|---|
| SparkIcon (star) | Fill | 22 × 22 | Brand |
| ThemeToggle (sun/moon) | Stroke | 18 × 18 | Header right |
| DiceIcon | Stroke | 20 × 20 | Generate button |
| CopyIcon | Stroke | 16 × 16 | Result copy action |
| CheckIcon | Stroke | 16 × 16 | Result copy (success state) |
| ShareIcon | Stroke | 16 × 16 | Result share action |

---

## 7. Ball colour palette

Balls have two colouring modes: **inline** (background + text set directly) and **CSS-class-based** (tinted ghost styles). Never mix the two on the same ball.

### 7.1 Stage 1 — range-based jewel tones (inline)

Six buckets assigned by value position within `[min, max]`. Fixed — do not alter.

| Slot | Background | Foreground | Tone |
|---|---|---|---|
| 0 | `#534AB7` | `#EEEDFE` | Purple |
| 1 | `#1D9E75` | `#E1F5EE` | Teal |
| 2 | `#D4537E` | `#FBEAF0` | Pink |
| 3 | `#378ADD` | `#E6F1FB` | Blue |
| 4 | `#EF9F27` | `#412402` | Amber |
| 5 | `#D85A30` | `#FAECE7` | Coral |

### 7.2 Stage 2 — personal jewel tones (inline)

| Type | Background | Foreground |
|---|---|---|
| `life-path` | `#EF9F27` amber | `#412402` |
| `expression` | `#1D9E75` teal | `#E1F5EE` |
| `personal` | `#534AB7` purple | `#EEEDFE` |

### 7.3 Stage 3 — history / ghost types (CSS class)

No inline background. Each class provides a tinted ghost look.

| Type | Class | Colour |
|---|---|---|
| `fill` (neutral) | `.ball--fill` | Ghost outline only |
| `hot` | `.ball--hot` | Red — `rgba(239,68,68,0.14)` fill, `#EF4444` text |
| `cold` | `.ball--cold` | Blue — `rgba(59,130,246,0.14)` fill, `#3B82F6` text |
| `seasonal` | `.ball--seasonal` | Amber — `rgba(249,115,22,0.14)` fill, `#F97316` text |

### 7.4 Legend dots

One dot per type, in the `.personal-legend` row. Use a 10 px circle (`.legend-dot`) with background matching the ball colour:

| Class | Colour |
|---|---|
| `.legend-dot--hot` | `#EF4444` |
| `.legend-dot--cold` | `#3B82F6` |
| `.legend-dot--seasonal` | `#F97316` |
| `.legend-dot--fill` | `var(--border)` |

### 7.5 Ball anatomy

```css
width: 44px;
height: 44px;
border-radius: 50%;
font-size: 16px;
font-weight: 600;
box-shadow: inset 0 -3px 8px rgba(0,0,0,0.25), 0 4px 10px -4px rgba(0,0,0,0.4);
```

The inset shadow gives a subtle 3-D depth effect. Keep it on all ball variants.

### 7.6 Toggle variants

The toggle base (`.toggle`) is grey when off. Add a modifier class when on for accent colour:

| Modifier | Colour | Used for |
|---|---|---|
| `.toggle--on` | Blue (`var(--accent)`) | Personal mode |
| `.toggle--on.toggle--history` | Red `#EF4444` | Historical weighting |
| `.toggle--on.toggle--seasonal` | Amber `#F97316` | Seasonal boost |

---

## 8. Animation & motion

### 8.1 Ball entrance — `pop`

```css
@keyframes pop {
  from { opacity: 0; transform: scale(0.3) translateY(8px); }
  to   { opacity: 1; transform: scale(1)   translateY(0); }
}
```

- Duration: `0.4s`
- Easing: `cubic-bezier(0.18, 0.89, 0.32, 1.28)` (overshoot spring)
- Fill mode: `backwards`
- Stagger: `index × 60 ms` via inline `animation-delay`

### 8.2 Standard transition timings

| Duration | Usage |
|---|---|
| `0.12s ease` | Generate button press (`transform`) |
| `0.15s ease` | Stepper button hover, result action hover |
| `0.2s ease` | Generate button background, theme toggle hover, aurora (implicit) |
| `0.4s ease` | Body background and colour on theme switch |

### 8.3 Reduced-motion overrides

When `prefers-reduced-motion: reduce` is active:

```css
.ball { animation: none; }
* { transition: none !important; }
```

All animations and transitions are fully disabled. Do not add new motion effects without including a reduced-motion override.

---

## 9. Aurora decorative glow

```css
background:
  radial-gradient(circle at 30% 30%, rgba(127,119,221,0.45), transparent 60%),
  radial-gradient(circle at 70% 50%, rgba(212,83,126,0.32), transparent 60%);
filter: blur(50px);
```

- Size: 460 × 460 px.
- Positioned 160 px above the top of the viewport.
- Light theme: `opacity: 0.5`.
- `pointer-events: none` — never interactive.

If the colour palette evolves, update the aurora gradient to match the new accent hues.

---

## 10. Responsive & device rules

| Condition | Rule |
|---|---|
| `max-width: 380px` | Hide `.footer-soon` |
| All widths | Max-width 560 px centred layout |
| Notched devices | `env(safe-area-inset-top/bottom)` in app padding |

Do not use other breakpoints without updating this guide.

---

## 11. Do / Don't reference

| Do | Don't |
|---|---|
| Use `var(--token)` for every colour | Hard-code hex values in component styles |
| Match existing spacing values (§4) | Introduce arbitrary new spacing |
| Reuse `.surface-card` pattern for new panels | Create one-off card backgrounds |
| Keep all animations under 0.4 s | Add animations > 400 ms |
| Provide `prefers-reduced-motion` overrides | Add motion-only features |
| Keep icon stroke weight at 1.8 | Mix stroke widths across icons |
| Use `aria-label` on all icon-only buttons | Render interactive controls without accessible labels |
| Use the defined ball type classes for new types | Hard-code new ball colours outside the palette |

# Number Generation Logic

This document describes how Lucky Numbers generates each line of numbers, covering both the standard random mode and the personal (numerology-driven) mode.

---

## Overview

Number generation is implemented as pure functions in two files with no React or DOM dependencies. This keeps the logic independently testable and allows future strategies to be added by swapping the generation function without touching the UI.

| File | Purpose |
|---|---|
| `src/lib/generator.js` | Cryptographically-strong random generation + config validation |
| `src/lib/personal.js` | Pythagorean numerology engine + personal line generation |

---

## Stage 1 — Random Generation (`generator.js`)

### Randomness

All randomness is sourced from `crypto.getRandomValues()` (Web Crypto API), which provides cryptographically-strong random bytes. A rejection-sampling loop removes modulo bias so every number in `[min, max]` has an exactly equal probability of being drawn.

```
range         = max − min + 1
maxUnbiased   = floor(0xFFFFFFFF / range) × range

loop:
  draw a random Uint32
  if value < maxUnbiased → accept → result = min + (value % range)
  else → discard and redraw
```

This guarantees a perfectly uniform distribution regardless of range size.

### Single line — `generateLine(opts)`

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `count` | integer | — | How many numbers to draw |
| `min` | integer | — | Lowest possible number (inclusive) |
| `max` | integer | — | Highest possible number (inclusive) |
| `allowRepeats` | boolean | `false` | Allow the same number more than once |
| `sorted` | boolean | `true` | Return numbers in ascending order |

**Algorithm — no repeats (default)**

1. Draw a random number from `[min, max]` using rejection sampling.
2. Add it to a `Set` (duplicate rejection is O(1)).
3. Repeat until the set contains `count` elements.
4. Spread the set into an array, sort ascending if `sorted=true`.

**Algorithm — repeats allowed**

1. Draw `count` independent random numbers from `[min, max]`.
2. Sort if `sorted=true`.

### Multiple lines — `generateLines(opts, lineCount)`

Calls `generateLine` independently for each line. Each line is assigned a UUID via `crypto.randomUUID()` for stable React keying.

### Validation — `validateConfig(opts)`

Returns `null` if the configuration is valid, or a human-readable error string for any of these failure conditions:

| Condition | Error |
|---|---|
| `min` or `max` is not a whole number | `"Range must be whole numbers."` |
| `min >= max` | `"The lowest number must be below the highest."` |
| `count < 1` | `"Draw at least one number."` |
| `lineCount < 1` | `"Generate at least one line."` |
| `count > (max − min + 1)` and `allowRepeats=false` | `"Can't draw N unique numbers from a pool of P."` |

---

## Stage 2 — Personal Generation (`personal.js`)

Personal mode blends numerologically-derived numbers (calculated from the user's name and date of birth) with a crypto-random fill. The result is a line where the most meaningful personal numbers always appear — as long as they fall within the configured range — while the remaining slots stay fresh on every generate.

### Pythagorean numerology system

Lucky Numbers uses the **Pythagorean** (Western) system. Each letter of the alphabet maps to a digit 1–9:

```
A=1  B=2  C=3  D=4  E=5  F=6  G=7  H=8  I=9
J=1  K=2  L=3  M=4  N=5  O=6  P=7  Q=8  R=9
S=1  T=2  U=3  V=4  W=5  X=6  Y=7  Z=8
```

Non-letter characters (digits, punctuation, hyphens) are silently ignored.

### Digit reduction

A number is repeatedly summed digit-by-digit until it reaches a single digit or a **Master Number** (11, 22, 33), which are never reduced further.

```
Examples:
  17 → 1+7 = 8
  29 → 2+9 = 11  (Master Number — stop)
  38 → 3+8 = 11  (Master Number — stop)
 198 → 1+9+8 = 18 → 1+8 = 9
```

### Derived numbers

**Life Path** — the single most significant DOB number.

```
lifePath = reduce(reduce(month) + reduce(day) + reduce(digitSum(year)))
```

Example: born 14 March 1988
```
month  = 3   → reduce(3)  = 3
day    = 14  → reduce(14) = 5  (1+4)
year   = 1988 → digitSum = 26 → reduce(26) = 8
lifePath = reduce(3 + 5 + 8) = reduce(16) = 7
```

**Expression Number** — derived from the full birth name.

```
For each space-separated word:
  sum the Pythagorean values of all letters
  reduce the word's sum individually (preserving Master Numbers at word level)

expression = reduce(sum of all reduced word values)
```

Example: Alex Johnson
```
ALEX    → A(1)+L(3)+E(5)+X(6) = 15 → reduce(15) = 6
JOHNSON → J(1)+O(6)+H(8)+N(5)+S(1)+O(6)+N(5) = 32 → reduce(32) = 5
total   = 6+5 = 11  (Master Number — stop)
expression = 11
```

**Attitude** — month + raw day, then reduced.

```
attitude = reduce(month + day)
```

**Reduced components** — day, month, and year digit-reduced independently.

### Personal pool — `buildPersonalPool(profile)`

An ordered, deduplicated array of all derived personal numbers. The order reflects numerological significance, ensuring that if the pool is larger than the requested `count`, the most important numbers are always selected first.

```
Priority order:
  1. Life Path
  2. Expression Number
  3. Raw birthday day (1–31)
  4. Attitude
  5. Reduced day
  6. Reduced month
  7. Reduced year
  8. Raw birth month (1–12)
```

Duplicates are removed in priority order (first occurrence wins).

Example: Alex Johnson, 14 March 1988

| # | Source | Calculation | Value |
|---|---|---|---|
| 1 | Life Path | reduce(3+5+8)=reduce(16) | **7** |
| 2 | Expression | ALEX(6)+JOHNSON(5) | **11** |
| 3 | Raw birthday | — | **14** |
| 4 | Attitude | reduce(3+14)=reduce(17) | **8** |
| 5 | Reduced day | reduce(14)=reduce(5) | **5** |
| 6 | Reduced month | reduce(3) | **3** |
| 7 | Reduced year | reduce(26)=reduce(8) | ~~8~~ (dup) |
| 8 | Raw month | 3 | ~~3~~ (dup) |

Final pool: `[7, 11, 14, 8, 5, 3]`

### Line generation — `generatePersonalLine(opts)`

1. Build the personal pool for the profile.
2. Filter to numbers that fall within `[min, max]` — call these *in-range personal numbers*.
3. Take the first `count` in-range personal numbers (priority order preserved).
4. If fewer than `count` were available, build a remainder array of all integers in `[min, max]` not already chosen, then fill remaining slots using rejection-sampled crypto-random picks without replacement.
5. Sort ascending (default).

This means:
- Personal numbers always appear when they are within the configured range.
- The line is never fully deterministic — the fill keeps every draw fresh.
- Increasing the count or widening the range admits more personal numbers naturally.

### Number type classification — `getPersonalNumberType(n, profile)`

After generation, each number in the line is labelled for visual colour-coding:

| Return value | Meaning |
|---|---|
| `'life-path'` | The number equals the Life Path |
| `'expression'` | The number equals the Expression Number |
| `'personal'` | The number is in the personal pool (but not Life Path or Expression) |
| `'fill'` | The number was drawn at random (not in the pool) |

---

## Visual colour coding

Ball colours signal the numerological source of each number:

| Colour | Type | Hex |
|---|---|---|
| Amber | Life Path | `#EF9F27` |
| Teal | Expression | `#1D9E75` |
| Purple | Personal pool | `#534AB7` |
| Ghost (outline) | Fill (random) | CSS `.ball--fill` |

In standard random mode (no personal profile), ball colours are assigned by value position within the configured range across six jewel-tone buckets (purple → teal → pink → blue → amber → coral).

---

## Data flow

```
User input (profile + config)
        │
        ▼
  buildPersonalPool(profile)       ← Pythagorean derivation
        │
        ▼
  generatePersonalLine / generateLine
        │
        ▼
  getPersonalNumberType(n, profile) ← per-ball classification
        │
        ▼
  Ball component  ←  personalBallColor(type) | ballColor(value, min, max)
```

---

## Roadmap considerations

- **Stage 3 — historical pattern weighting**: `generator.js` was designed so a new strategy function can replace the `pick` step without restructuring the UI. Historical data would pre-sort or weight the fill candidates before the random draw.
- **Numerology expansion**: additional core numbers (Personality, Soul Urge) could be derived and added to the pool priority list without changing the `generatePersonalLine` algorithm.

# Number Generation Rules

How lines are generated based on the active mode combination.

## Mode combinations

| Active modes | Line 1 | Lines 2+ |
|---|---|---|
| None (Stage 1) | Pure random from full range | Same |
| Personal only | All personal numbers + random fill | Random subset of personal + random fill |
| Personal + Hot | All personal numbers + fill from hot set | Random subset of personal + weighted hot fill |
| Personal + Cold | All personal numbers + fill from cold set | Random subset of personal + weighted cold fill |
| Personal + Balanced | All personal numbers + fill from balanced set | Random subset of personal + weighted balanced fill |
| History + Hot | All slots from hot set | Weighted random (hot bias) |
| History + Cold | All slots from cold set | Weighted random (cold bias) |
| History + Balanced | All slots from balanced set | Weighted random (balanced) |

**Personal numbers** are the in-range subset of the numerological pool (Life Path → Expression → Birthday → Attitude → reduced components), in significance order.

**Hot** = top 10 most frequently drawn numbers in the selected game's history.  
**Cold** = bottom 10 least frequently drawn numbers.  
**Balanced** = all numbers that are neither hot nor cold (mid-frequency range).

If the chosen fill pool is exhausted (e.g. all hot numbers are already covered by personal numbers), remaining slots fall back to random from the full range.

## Seasonal boost (overlay)

The **🌿 Seasonal boost** toggle is a modifier that can be stacked on top of any History bias (Hot, Balanced, or Cold). It does not replace the bias — it adds extra weight to this quarter's seasonally hot numbers within it.

**Seasonal set** = the top 10 numbers drawn most often in the current calendar quarter (Q1 Jan–Mar, Q2 Apr–Jun, Q3 Jul–Sep, Q4 Oct–Dec), computed by filtering the full draw history to that quarter across all years.

| What changes when seasonal boost is on | |
|---|---|
| **Line 1** | Seasonal members of the bias fill pool are picked first (before non-seasonal members of that same pool) |
| **Lines 2+** | Weights for seasonal numbers are doubled (`w × 2`) relative to their base frequency weight |
| **Ball colour** | Balls that appear in the seasonal set are displayed in amber/orange regardless of their hot/cold status |
| **Legend** | A Seasonal dot appears alongside the Hot/Cold dots |
| **Footer** | Shows `{bias} + seasonal bias` (e.g. `hot + seasonal bias`) |

## Key source locations

| Concern | File | Export |
|---|---|---|
| Line 1 generation | `src/lib/history.js` | `generatePinnedLine` |
| Personal seed extraction | `src/lib/personal.js` | `getPersonalSeed` |
| Lines 2+ personal | `src/lib/personal.js` | `generatePersonalLines` (with `allVaried: true`) |
| Lines 2+ history | `src/lib/history.js` | `generateWeightedLines` |
| Hot / cold sets | `src/lib/history.js` | `getHotNumbers`, `getColdNumbers` |
| Balanced set | `src/lib/history.js` | `getBalancedNumbers` |
| Seasonal set + boost | `src/lib/history.js` | `getSeasonalNumbers`, `computeSeasonalFrequency`, `currentQuarter` |
| Bias + boost state | `src/App.jsx` | `historyBias`, `seasonalBoost`, `historyStats.activeSets` |
| Orchestration | `src/App.jsx` | `generate()` |

## Game registry

Games are defined in `src/data/games.json`. Each entry sets `id`, `count`, `min`, `max`. Switching game resets the count and range and changes the draw history source used for hot/cold/balanced computation.

Draw history is bundled as static JSON at build time (`src/data/{id}-history.json`). Refresh with `npm run fetch-history`.

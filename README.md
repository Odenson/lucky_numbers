# Lucky Numbers

A mobile-responsive web app that generates lucky numbers for lotto systems.
Pick how many numbers you want, the range (e.g. 7 numbers between 1 and 42), and
how many lines — then tap generate. Numbers are drawn at random with no repeats
within a line.

Personal mode blends **Pythagorean numerology** (derived from your name and date
of birth) with a crypto-random fill, so your most meaningful numbers are always
present while each draw stays fresh.

Built with React + Vite. Dark/light themes, **Cosmic** visual style. Runs
entirely in the browser — no backend or account needed.

## Prerequisites

- **Node.js 18 or newer** (LTS 20+ recommended) — check with `node --version`
- **npm 9 or newer** (ships with Node) — check with `npm --version`

If you don't have Node, install it from [nodejs.org](https://nodejs.org) or via a
version manager such as [nvm](https://github.com/nvm-sh/nvm).

## Install and run locally

```bash
# 1. From the project root, install dependencies
npm install

# 2. Start the dev server with hot reload
npm run dev
```

Then open **http://localhost:5173** in your browser. The terminal prints the
exact URL when the server starts. Stop the server with `Ctrl+C`.

For a mobile-like view, open your browser dev tools and toggle the device
toolbar — the layout is built mobile-first.

## Other scripts

```bash
npm run build        # production build into dist/
npm run preview      # serve the production build locally to verify it
npm test             # run the full test suite once (used in CI)
npm run test:watch   # run tests in watch mode during development
npm run test:coverage  # generate a coverage report in coverage/
```

To deploy, run `npm run build` and host the static `dist/` folder on any static
host (Netlify, Vercel, GitHub Pages, S3, etc.) — no server required.

## Features

### Random draw
- Configurable count, range (lowest/highest), and number of lines
- Cryptographically-strong, unbiased random draw with no repeats per line
- Generate several independent lines at once
- Copy a line, share it (native share sheet where available), or copy all lines
- Dark and light modes, remembered across visits
- Settings persisted to `localStorage`

### Personal mode (Pythagorean numerology)
- Enter your full name and date of birth via the profile panel (header icon)
- The app derives your **Life Path**, **Expression Number**, **Birthday**, **Attitude**, and reduced component numbers using the Pythagorean system
- Personal numbers within your configured range are always included in every line, in significance order
- Remaining slots are filled with a fresh crypto-random draw each time
- Each ball is colour-coded by its numerological source: amber (Life Path), teal (Expression), purple (other personal), ghost outline (random fill)
- A legend below the results explains the colour coding
- See [design/number-generation.md](design/number-generation.md) for full algorithm detail

## Project structure

```
src/
  App.jsx               app shell, wiring, generate flow
  lib/
    generator.js        pure random generation + config validation
    personal.js         Pythagorean numerology engine + personal line generation
    palette.js          jewel-tone + personal-type ball colours
  hooks/
    useLocalStorage.js  persisted state helper
    useTheme.js         dark/light mode
  components/
    Controls.jsx        settings panel (with personal mode toggle)
    Stepper.jsx         numeric +/- input (supports formatted display)
    Ball.jsx            single number ball (type-aware colouring)
    ResultLine.jsx      one line of balls with copy/share
    ProfileSheet.jsx    modal for entering name and date of birth
    ThemeToggle.jsx
  styles/index.css      Cosmic theme (CSS variables, theming)
design/
  ui-spec.md            full UI specification
  style-guide.md        visual design system and tokens
  number-generation.md  number generation algorithm detail
```

## Testing

The test suite is written with **Vitest** and **React Testing Library** and covers all core library functions and the key UI components.

```bash
npm test
```

87 tests across 5 files:

| File | What is tested |
|---|---|
| `src/lib/generator.test.js` | `validateConfig`, `generateLine`, `generateLines` |
| `src/lib/personal.test.js` | `calcExpressionNumber`, `buildPersonalPool`, `getPersonalNumberType`, `generatePersonalLine/Lines` |
| `src/lib/palette.test.js` | `ballColor`, `personalBallColor` |
| `src/components/Ball.test.jsx` | Render, type-based colouring, fill ghost style |
| `src/components/Stepper.test.jsx` | Buttons, disabled states, value clamping, `formatValue` |

Tests run automatically in CI (GitHub Actions) before every build. A failing test blocks deployment to both the production and dev preview environments.

## Roadmap

- **Stage 1 — random draw** ✓: unbiased crypto-random generation.
- **Stage 2 — personal seeding** ✓: Pythagorean numerology blended with random fill; colour-coded ball types.
- **Stage 3 — historical patterns**: read past lotto results to surface
  most/least common numbers and periodic trends, and weight selection toward
  them.

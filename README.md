# Lucky Numbers

A mobile-responsive web app that generates lucky numbers for Australian lotto systems. Pick a game, configure your draw, and tap generate. Numbers are drawn with cryptographically-strong randomness with no repeats within a line.

Three generation modes stack on top of each other:

- **Stage 1 — random draw**: pure unbiased random selection
- **Stage 2 — personal mode**: Pythagorean numerology (derived from your name and date of birth) blended with a random fill, so your most meaningful numbers are always present
- **Stage 3 — historical weighting**: real draw history from the selected game weights the random selection toward hot (frequently drawn) or cold (overdue) numbers

Built with **React 19 + Vite 8**. Dark/light themes, Cosmic visual style. Runs entirely in the browser — no backend, no account, no tracking.

## Prerequisites

- **Node.js 22 or newer** — check with `node --version`
- **npm 10 or newer** (ships with Node) — check with `npm --version`

Install Node from [nodejs.org](https://nodejs.org) or via a version manager such as [nvm](https://github.com/nvm-sh/nvm).

## Install and run locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server with hot reload
npm run dev
```

Open **http://localhost:5173**. Stop with `Ctrl+C`.

For a mobile-like view, open browser dev tools and toggle the device toolbar — the layout is built mobile-first.

## Scripts

```bash
npm run dev              # dev server with HMR
npm run build            # production build → dist/
npm run preview          # serve the production build locally
npm test                 # run the full test suite once (used in CI)
npm run test:watch       # run tests in watch mode
npm run test:coverage    # generate a coverage report in coverage/
npm run fetch-history    # fetch real draw history and update src/data/ (see below)
```

## Refreshing draw history

Historical draw data is bundled at build time as JSON. To update it with the latest real results, run:

```bash
npm run fetch-history
```

This fetches the last 5 years of draws from [australia.national-lottery.com](https://australia.national-lottery.com) for all configured games and writes them to `src/data/`. Then rebuild the app.

Options:

```bash
# Fetch a specific game or number of years
npm run fetch-history -- --games tattslotto --years 3
npm run fetch-history -- --games tattslotto,ozlotto --years 10

# Preview what would be fetched without writing files
npm run fetch-history -- --dry-run
```

Adding a new game requires one entry in [`scripts/lib/game-configs.js`](scripts/lib/game-configs.js) and a placeholder `src/data/{id}-history.json`.

## Features

### Game selection
- **TattsLotto** — 6 numbers from 1–45, drawn Saturdays
- **OZ Lotto** — 7 numbers from 1–47, drawn Tuesdays
- Selecting a game auto-sets the number count, range, and draw history source
- Settings are remembered across visits

### Random draw (Stage 1)
- Configurable count, range (lowest/highest), and number of lines
- Cryptographically-strong unbiased random draw — no repeats within a line
- Copy a line, share it via native share sheet, or copy all lines at once
- Dark and light modes, remembered across visits

### Personal mode (Stage 2)
- Enter your full name and date of birth via the profile panel (person icon in header)
- Derives your **Life Path**, **Expression**, **Birthday**, **Attitude**, and reduced component numbers via the Pythagorean system
- Personal numbers within your configured range are always included, in significance order; remaining slots are filled with crypto-random numbers
- Ball colour coding: **yellow** (Life Path) · **green** (Expression) · **purple** (other personal) · ghost outline (random fill)
- A legend below the results explains the colour coding
- Tap any ball to see its type in a tooltip

### Historical weighting (Stage 3)
- Toggle "Historical weighting" in the controls panel to activate
- Choose a bias: **Hot** (favour frequently drawn numbers) · **Balanced** · **Cold** (favour overdue numbers)
- Hot balls display in red, cold in blue, neutral in ghost outline
- Tap the chart icon in the header to open the History panel — shows draw count, date range, hot/cold ball lists, and a full frequency chart for the configured range
- Works independently or combined with personal mode (personal-typed balls keep their colour; fill slots promote to hot/cold where applicable)

## Deployment

Run `npm run build` and host the `dist/` folder on any static host — no server required.

**GitHub Pages (this repo):**

| Branch | URL | Purpose |
|---|---|---|
| `main` | `/lucky_numbers/` | Production |
| `dev` | `/lucky_numbers/dev/` | Feature preview |

CI runs on every push: tests must pass before a build is deployed.

## Project structure

```
scripts/
  fetch-history.js          CLI entry point — fetch draw history
  lib/
    game-configs.js         per-game scraper config (URL, count, range)
    scraper.js              HTTP fetch + cheerio HTML parser
    output.js               format and write src/data/ JSON files

src/
  App.jsx                   app shell — state, routing, generate flow
  data/
    games.json              game registry (id, name, count, min, max)
    tattslotto-history.json bundled TattsLotto draw history
    ozlotto-history.json    bundled OZ Lotto draw history
  lib/
    generator.js            pure random generation + config validation
    personal.js             Pythagorean numerology engine
    history.js              frequency analysis, weighted generation (game-aware)
    palette.js              ball colour system (jewel-tone + personal types)
    random.js               crypto.getRandomValues wrapper
  hooks/
    useLocalStorage.js      persisted state helper
    useTheme.js             dark/light mode
  components/
    Controls.jsx            settings panel (game selector, mode toggles, bias chips)
    Stepper.jsx             numeric +/– input
    Ball.jsx                single number ball (type-aware colour + hover tooltip)
    ResultLine.jsx          one line of balls with copy/share
    ProfileSheet.jsx        modal for name and date of birth
    NumbersBreakdown.jsx    numerology breakdown detail sheet
    HistorySheet.jsx        draw history stats modal (meta, hot/cold, frequency chart)
    ThemeToggle.jsx
  styles/index.css          Cosmic theme (CSS variables, dark/light)
```

## Testing

Written with **Vitest** and **React Testing Library**.

```bash
npm test
```

195 tests across 10 files:

| File | What is tested |
|---|---|
| `src/lib/generator.test.js` | `validateConfig`, `generateLine`, `generateLines` |
| `src/lib/personal.test.js` | Pythagorean engine, `buildPersonalPool`, `getPersonalNumberType`, line generation |
| `src/lib/palette.test.js` | `ballColor`, `personalBallColor` |
| `src/lib/history.test.js` | `computeFrequency`, hot/cold ranking, weighted generation (all bias modes) |
| `src/components/Ball.test.jsx` | Render, type-based colouring, fill ghost style, animation delay |
| `src/components/Stepper.test.jsx` | Buttons, disabled states, value clamping |
| `src/components/Controls.test.jsx` | Game selector, personal toggle, history toggle, bias chips |
| `src/components/ResultLine.test.jsx` | Ball rendering, copy/share actions |
| `src/components/ProfileSheet.test.jsx` | Form fields, save/close |
| `src/components/HistorySheet.test.jsx` | Meta display, hot/cold sections, frequency chart |

Tests run automatically in CI before every build. A failing test blocks deployment.

## Roadmap

- **Stage 1 — random draw** ✓
- **Stage 2 — personal seeding** ✓
- **Stage 3 — historical weighting** ✓
- **Stage 4 — multi-game support + real-data scraper** ✓
- **Stage 5** — automated weekly data refresh via GitHub Actions cron

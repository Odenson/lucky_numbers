# Lucky Numbers

A mobile-responsive web app that generates lucky numbers for lotto systems.
Pick how many numbers you want, the range (e.g. 7 numbers between 1 and 42), and
how many lines — then tap generate. Numbers are drawn at random with no repeats
within a line.

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
npm run build    # production build into dist/
npm run preview  # serve the production build locally to verify it
```

To deploy, run `npm run build` and host the static `dist/` folder on any static
host (Netlify, Vercel, GitHub Pages, S3, etc.) — no server required.

## Features (stage 1)

- Configurable count, range (lowest/highest), and number of lines
- Cryptographically-strong, unbiased random draw with no repeats per line
- Generate several independent lines at once
- Copy a line, share it (native share sheet where available), or copy all lines
- Dark and light modes, remembered across visits
- Settings persisted to `localStorage`

## Project structure

```
src/
  App.jsx               app shell, wiring, generate flow
  lib/
    generator.js        pure number-generation + validation logic
    palette.js          jewel-tone ball colours
  hooks/
    useLocalStorage.js  persisted state helper
    useTheme.js         dark/light mode
  components/
    Controls.jsx        settings panel
    Stepper.jsx         numeric +/- input
    Ball.jsx            single number ball
    ResultLine.jsx      one line of balls with copy/share
    ThemeToggle.jsx
  styles/index.css      Cosmic theme (CSS variables, theming)
```

## Roadmap

- **Stage 1 — random draw** (current): simple unbiased random generation.
- **Stage 2 — personal seeding**: incorporate the user's details (name, DOB,
  place of birth, etc.) to influence the draw. The generator is written as pure
  functions so a new "strategy" can plug in without touching the UI.
- **Stage 3 — historical patterns**: read past lotto results to surface
  most/least common numbers and periodic trends, and weight selection toward
  them.

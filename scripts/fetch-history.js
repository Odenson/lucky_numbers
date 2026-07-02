#!/usr/bin/env node
/**
 * Fetch real Tatts Lotto draw history and write to src/data/.
 *
 * Usage:
 *   npm run fetch-history
 *   npm run fetch-history -- --games tattslotto,ozlotto --years 5
 *
 * Options:
 *   --games   Comma-separated game IDs to fetch (default: all)
 *   --years   How many years of history to fetch (default: 5)
 *   --dry-run Print what would be fetched without writing files
 */

import { GAME_CONFIGS, ALL_GAME_IDS } from './lib/game-configs.js'
import { fetchYear } from './lib/scraper.js'
import { writeHistory } from './lib/output.js'

// ── CLI arg parsing ───────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(name) {
  const i = args.indexOf(`--${name}`)
  return i !== -1 ? args[i + 1] : null
}

const gamesArg = getArg('games')
const yearsArg = getArg('years')
const dryRun = args.includes('--dry-run')

const gameIds = gamesArg
  ? gamesArg.split(',').map((s) => s.trim()).filter((id) => {
      if (!GAME_CONFIGS[id]) {
        console.warn(`⚠ Unknown game "${id}" — skipping. Valid: ${ALL_GAME_IDS.join(', ')}`)
        return false
      }
      return true
    })
  : ALL_GAME_IDS

const years = yearsArg ? Math.max(1, parseInt(yearsArg, 10)) : 5

// ── Main ─────────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear()
const yearRange = Array.from({ length: years }, (_, i) => currentYear - i)

console.log(`\nFetching ${years} year(s) of history for: ${gameIds.join(', ')}`)
console.log(`Years: ${yearRange.join(', ')}\n`)

for (const gameId of gameIds) {
  const config = GAME_CONFIGS[gameId]
  console.log(`── ${config.name} ──────────────────────────────`)

  const allDraws = []
  let fetchErrors = 0

  for (const year of yearRange) {
    try {
      process.stdout.write(`  ${year}... `)
      const { draws } = await fetchYear(config, year)
      allDraws.push(...draws)
      console.log(`${draws.length} draws`)
    } catch (err) {
      console.log(`FAILED (${err.message})`)
      fetchErrors++
    }
  }

  // Sort newest first, de-duplicate by draw number
  const unique = allDraws
    .sort((a, b) => b.draw - a.draw)
    .filter((d, i, arr) => i === 0 || d.draw !== arr[i - 1].draw)

  console.log(`  Total: ${unique.length} unique draws, ${fetchErrors} error(s)`)

  if (unique.length === 0) {
    console.log(`  ⚠ No draws fetched — skipping file write.\n`)
    continue
  }

  if (dryRun) {
    console.log(`  [dry-run] Would write ${unique.length} draws to src/data/${gameId}-history.json\n`)
    console.log(`  Sample (first 3):`)
    unique.slice(0, 3).forEach((d) => console.log(`    Draw ${d.draw} · ${d.date} · ${d.numbers.join(',')} | ${d.supplementary.join(',')}`))
    console.log()
    continue
  }

  const outPath = writeHistory(config, unique)
  console.log(`  ✓ Written → ${outPath}\n`)
}

console.log('Done.')

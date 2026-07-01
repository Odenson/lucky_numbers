import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../')

export function writeHistory(gameConfig, allDraws) {
  const outPath = join(ROOT, `src/data/${gameConfig.id}-history.json`)
  const payload = {
    meta: {
      game: gameConfig.name,
      updated: new Date().toISOString().slice(0, 10),
    },
    draws: allDraws,
  }
  writeFileSync(outPath, JSON.stringify(payload, null, 2))
  return outPath
}

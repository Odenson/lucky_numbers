// Jewel-tone ball colours for the Cosmic theme.
// Each entry is [background, text]. Buckets a number across the configured
// range so a ball's colour is stable for a given value within a draw.

const BALL_COLORS = [
  ['#534AB7', '#EEEDFE'], // purple
  ['#1D9E75', '#E1F5EE'], // teal
  ['#D4537E', '#FBEAF0'], // pink
  ['#378ADD', '#E6F1FB'], // blue
  ['#EF9F27', '#412402'], // amber
  ['#D85A30', '#FAECE7'], // coral
]

export function ballColor(value, min, max) {
  const span = Math.max(1, max - min)
  const ratio = (value - min) / span
  const idx = Math.min(BALL_COLORS.length - 1, Math.floor(ratio * BALL_COLORS.length))
  return BALL_COLORS[idx]
}

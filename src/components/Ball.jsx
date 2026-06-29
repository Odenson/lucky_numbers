import { ballColor, personalBallColor } from '../lib/palette'

// A single lucky-number ball. `index` staggers the entrance animation so a
// line of balls cascades in.
//
// In personal mode, pass `type` to switch to type-based colouring:
//   'life-path' | 'expression' | 'personal'  → distinct jewel colours
//   'fill'                                   → ghost style via .ball--fill CSS
//   undefined (default)                      → existing range-based colour
export default function Ball({ value, min, max, index = 0, type }) {
  let bg, fg
  if (!type || type === 'fill') {
    ;[bg, fg] = ballColor(value, min, max)
  } else {
    ;[bg, fg] = personalBallColor(type)
  }

  // Fill balls in personal mode use CSS (.ball--fill) instead of inline colour.
  const isGhost = type === 'fill'
  const style = isGhost
    ? { animationDelay: `${index * 60}ms` }
    : { background: bg, color: fg, animationDelay: `${index * 60}ms` }

  return (
    <span
      className={`ball${isGhost ? ' ball--fill' : ''}`}
      style={style}
    >
      {value}
    </span>
  )
}

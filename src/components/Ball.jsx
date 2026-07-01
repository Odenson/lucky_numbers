import { ballColor, personalBallColor } from '../lib/palette'

const TYPE_LABELS = {
  'life-path':  'Life Path',
  'expression': 'Expression',
  'personal':   'Personal',
  'hot':        'Hot',
  'cold':       'Cold',
  'fill':       'Neutral',
}

// A single lucky-number ball. `index` staggers the entrance animation.
//
// `type` controls colouring:
//   'life-path' | 'expression' | 'personal'  → personal jewel colours (inline)
//   'fill'                                   → ghost outline  (.ball--fill CSS)
//   'hot'                                    → red ghost      (.ball--hot CSS)
//   'cold'                                   → blue ghost     (.ball--cold CSS)
//   undefined (default)                      → range-based colour (inline)
export default function Ball({ value, min, max, index = 0, type }) {
  const delay = { animationDelay: `${index * 60}ms` }
  const tooltip = TYPE_LABELS[type] ? { 'data-tooltip': TYPE_LABELS[type] } : {}

  // CSS-class-only types — no inline background needed
  if (type === 'fill' || type === 'hot' || type === 'cold') {
    return <span className={`ball ball--${type}`} style={delay} {...tooltip}>{value}</span>
  }

  const [bg, fg] = type ? personalBallColor(type) : ballColor(value, min, max)
  return <span className="ball" style={{ background: bg, color: fg, ...delay }} {...tooltip}>{value}</span>
}

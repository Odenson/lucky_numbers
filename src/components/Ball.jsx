import { ballColor } from '../lib/palette'

// A single lucky-number ball. `index` staggers the entrance animation so a
// line of balls cascades in.
export default function Ball({ value, min, max, index = 0 }) {
  const [bg, fg] = ballColor(value, min, max)
  return (
    <span
      className="ball"
      style={{ background: bg, color: fg, animationDelay: `${index * 60}ms` }}
    >
      {value}
    </span>
  )
}

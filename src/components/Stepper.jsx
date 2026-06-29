import { useState } from 'react'

// A compact numeric stepper: label, minus/plus buttons, and a value.
// Used for count, range bounds, and line count.
//
// Pass `formatValue` to display a formatted string (e.g. month names) while
// keeping the internal value numeric; the input becomes read-only in that case.
//
// Pass `lazyClamp` for wide-range fields (e.g. year). The input becomes a
// free-text field — the user can type any value directly. Validation and
// clamping happen only on blur, so partial typing ("198_") is not disrupted.
// The input auto-selects all text on focus so a single tap clears the field.
export default function Stepper({ label, value, min, max, onChange, hint, formatValue, lazyClamp = false }) {
  const clamp = (v) => Math.max(min, Math.min(max, v))
  const isFormatted = typeof formatValue === 'function'

  // lazyClamp: tracks the raw typed string while the input is focused.
  // null = not currently editing (show the committed value prop instead).
  const [draft, setDraft] = useState(null)

  const parseDraft = (d) => {
    const n = parseInt(d ?? '', 10)
    return Number.isNaN(n) ? value : clamp(n)
  }

  // For +/- clicks: if the user has a draft in progress, base the
  // increment/decrement on that draft value rather than the stale prop.
  const baseValue = lazyClamp && draft !== null ? parseDraft(draft) : value

  const handleDecrement = () => { setDraft(null); onChange(clamp(baseValue - 1)) }
  const handleIncrement = () => { setDraft(null); onChange(clamp(baseValue + 1)) }

  return (
    <div className="stepper">
      <div className="stepper-head">
        <span className="stepper-label">{label}</span>
        {hint && <span className="stepper-hint">{hint}</span>}
      </div>
      <div className="stepper-control">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <input
          type={isFormatted || lazyClamp ? 'text' : 'number'}
          inputMode={lazyClamp ? 'numeric' : undefined}
          value={
            isFormatted
              ? formatValue(value)
              : lazyClamp && draft !== null
              ? draft
              : String(value)
          }
          readOnly={isFormatted}
          min={!isFormatted && !lazyClamp ? min : undefined}
          max={!isFormatted && !lazyClamp ? max : undefined}
          onChange={
            isFormatted
              ? undefined
              : lazyClamp
              ? (e) => setDraft(e.target.value)
              : (e) => {
                  const n = parseInt(e.target.value, 10)
                  if (!Number.isNaN(n)) onChange(clamp(n))
                }
          }
          onFocus={lazyClamp ? (e) => { setDraft(String(value)); e.target.select() } : undefined}
          onBlur={lazyClamp ? () => { onChange(parseDraft(draft)); setDraft(null) } : undefined}
          aria-label={label}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

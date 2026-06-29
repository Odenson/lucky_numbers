// A compact numeric stepper: label, minus/plus buttons, and a value.
// Used for count, range bounds, and line count.
// Pass `formatValue` to display a formatted string (e.g. month names) while
// keeping the internal value numeric; the input becomes read-only in that case.
export default function Stepper({ label, value, min, max, onChange, hint, formatValue }) {
  const clamp = (v) => Math.max(min, Math.min(max, v))
  const isFormatted = typeof formatValue === 'function'
  return (
    <div className="stepper">
      <div className="stepper-head">
        <span className="stepper-label">{label}</span>
        {hint && <span className="stepper-hint">{hint}</span>}
      </div>
      <div className="stepper-control">
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          &minus;
        </button>
        <input
          type={isFormatted ? 'text' : 'number'}
          value={isFormatted ? formatValue(value) : value}
          readOnly={isFormatted}
          min={!isFormatted ? min : undefined}
          max={!isFormatted ? max : undefined}
          onChange={isFormatted ? undefined : (e) => {
            const n = parseInt(e.target.value, 10)
            if (!Number.isNaN(n)) onChange(clamp(n))
          }}
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

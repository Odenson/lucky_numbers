// A compact numeric stepper: label, minus/plus buttons, and a value.
// Used for count, range bounds, and line count.
export default function Stepper({ label, value, min, max, onChange, hint }) {
  const clamp = (v) => Math.max(min, Math.min(max, v))
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
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
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

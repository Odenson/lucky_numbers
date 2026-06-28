import Stepper from './Stepper'

// Configuration panel: how many numbers, the range, and how many lines.
export default function Controls({ config, onChange, error }) {
  const set = (patch) => onChange({ ...config, ...patch })
  const poolSize = config.max - config.min + 1

  return (
    <section className="controls" aria-label="Generator settings">
      <div className="controls-grid">
        <Stepper
          label="Numbers"
          value={config.count}
          min={1}
          max={50}
          onChange={(count) => set({ count })}
        />
        <Stepper
          label="Lines"
          value={config.lineCount}
          min={1}
          max={20}
          onChange={(lineCount) => set({ lineCount })}
        />
        <Stepper
          label="Lowest"
          value={config.min}
          min={0}
          max={config.max - 1}
          onChange={(min) => set({ min })}
        />
        <Stepper
          label="Highest"
          value={config.max}
          min={config.min + 1}
          max={999}
          onChange={(max) => set({ max })}
        />
      </div>

      <p className="controls-summary">
        {config.count} number{config.count === 1 ? '' : 's'} between {config.min} and {config.max}
        {' · '}
        {poolSize} in the pool
        {config.lineCount > 1 ? ` · ${config.lineCount} lines` : ''}
      </p>

      {error && <p className="controls-error" role="alert">{error}</p>}
    </section>
  )
}

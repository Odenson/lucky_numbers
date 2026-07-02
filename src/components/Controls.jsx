import GAMES from '../data/games.json'
import Stepper from './Stepper'

const BIAS_OPTIONS = [
  { value: 'hot',      label: '🔥 Hot' },
  { value: 'balanced', label: '⚖ Balanced' },
  { value: 'cold',     label: '❄ Cold' },
]

export default function Controls({
  config,
  onChange,
  error,
  selectedGame,
  onGameChange,
  personalMode,
  onPersonalModeChange,
  profileComplete,
  historyMode,
  onHistoryModeChange,
  historyBias,
  onHistoryBiasChange,
}) {
  const set = (patch) => onChange({ ...config, ...patch })
  const poolSize = config.max - config.min + 1

  return (
    <section className="controls" aria-label="Generator settings">

      <div className="game-selector" role="group" aria-label="Select lottery game">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            className={`game-chip${selectedGame === game.id ? ' game-chip--selected' : ''}`}
            onClick={() => onGameChange(game.id)}
            aria-pressed={selectedGame === game.id}
          >
            <span className="game-chip-name">{game.name}</span>
            <span className="game-chip-desc">{game.description}</span>
          </button>
        ))}
      </div>

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

      <div className={`personal-row${!profileComplete ? ' personal-row--disabled' : ''}`}>
        <div className="personal-label">
          <span className="personal-label-main">Personal lucky numbers</span>
          <span className="personal-label-sub">
            {profileComplete ? 'Based on your name & birth details' : 'Add your profile to unlock'}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={personalMode}
          className={`toggle${personalMode ? ' toggle--on' : ''}`}
          onClick={() => profileComplete && onPersonalModeChange(!personalMode)}
          disabled={!profileComplete}
          aria-label="Personal lucky numbers"
          title={!profileComplete ? 'Add your profile to unlock' : undefined}
        >
          <span className="toggle-thumb" aria-hidden="true" />
        </button>
      </div>

      <div className="personal-row">
        <div className="personal-label">
          <span className="personal-label-main">Historical weighting</span>
          <span className="personal-label-sub">Bias draw toward hot or cold numbers</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={historyMode}
          className={`toggle${historyMode ? ' toggle--on toggle--history' : ''}`}
          onClick={() => onHistoryModeChange(!historyMode)}
          aria-label="Historical weighting"
        >
          <span className="toggle-thumb" aria-hidden="true" />
        </button>
      </div>

      {historyMode && (
        <div className="bias-chips" role="group" aria-label="Weighting bias">
          {BIAS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`bias-chip bias-chip--${value}${historyBias === value ? ' bias-chip--selected' : ''}`}
              onClick={() => onHistoryBiasChange(value)}
              aria-pressed={historyBias === value}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && <p className="controls-error" role="alert">{error}</p>}
    </section>
  )
}

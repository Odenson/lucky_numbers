export default function AboutSheet({ open, onClose }) {
  if (!open) return null

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="About Lucky Numbers">
        <div className="sheet-header">
          <div className="sheet-title">
            <InfoIcon />
            About
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sheet-body">
          <p className="about-intro">
            Lucky Numbers generates lottery number suggestions for Australian draw games. Numbers
            are drawn with cryptographically-strong randomness — no patterns, no repeats within a line.
          </p>

          <div className="about-section">
            <h3 className="about-heading">
              <span className="about-heading-icon">🎲</span>
              Stage 1 — Random draw
            </h3>
            <p>
              Pick a game, set how many numbers and lines you want, and tap Generate. Every number in
              your configured range has an equal chance of being chosen.
            </p>
          </div>

          <div className="about-section">
            <h3 className="about-heading">
              <span className="about-heading-icon">✨</span>
              Stage 2 — Personal mode
            </h3>
            <p>
              Set up your profile (name and date of birth) to unlock personal mode. Lucky Numbers
              uses Pythagorean numerology to derive your Life Path, Expression, and other
              meaningful numbers. These are always included in your first line — the remaining
              slots are filled at random.
            </p>
            <div className="about-legend">
              <span className="about-legend-item"><span className="about-dot" style={{ background: '#EF9F27' }} />Life Path</span>
              <span className="about-legend-item"><span className="about-dot" style={{ background: '#1D9E75' }} />Expression</span>
              <span className="about-legend-item"><span className="about-dot" style={{ background: '#534AB7' }} />Personal</span>
            </div>
          </div>

          <div className="about-section">
            <h3 className="about-heading">
              <span className="about-heading-icon">📊</span>
              Stage 3 — Historical weighting
            </h3>
            <p>
              Enable Historical weighting to bias the draw toward numbers that have performed well
              — or are overdue — based on real draw history bundled with the app.
            </p>
            <ul className="about-list">
              <li><strong>🔥 Hot</strong> — favour the most frequently drawn numbers</li>
              <li><strong>⚖ Balanced</strong> — draw from the mid-frequency range</li>
              <li><strong>❄ Cold</strong> — favour numbers that are overdue</li>
            </ul>
            <div className="about-legend">
              <span className="about-legend-item"><span className="about-dot about-dot--hot" />Hot</span>
              <span className="about-legend-item"><span className="about-dot about-dot--cold" />Cold</span>
              <span className="about-legend-item"><span className="about-dot about-dot--fill" />Neutral</span>
            </div>
          </div>

          <div className="about-section">
            <h3 className="about-heading">
              <span className="about-heading-icon">🌿</span>
              Seasonal boost
            </h3>
            <p>
              Stack the Seasonal boost on top of any bias to give extra weight to numbers that
              have been drawn most often during the current calendar quarter across previous years.
              Seasonal numbers appear in amber.
            </p>
            <div className="about-legend">
              <span className="about-legend-item"><span className="about-dot about-dot--seasonal" />Seasonal</span>
            </div>
          </div>

          <div className="about-section">
            <h3 className="about-heading">
              <span className="about-heading-icon">🎮</span>
              Supported games
            </h3>
            <ul className="about-list">
              <li><strong>TattsLotto</strong> — 6 numbers from 1–45, drawn Saturdays</li>
              <li><strong>OZ Lotto</strong> — 7 numbers from 1–47, drawn Tuesdays</li>
            </ul>
          </div>

          <p className="about-footer-note">
            All generation happens in your browser — no data is sent anywhere. Your profile is stored
            locally on your device only.
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8.5" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  )
}

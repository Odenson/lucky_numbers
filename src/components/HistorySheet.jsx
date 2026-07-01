import { useMemo } from 'react'
import { getGameMeta, computeFrequency, getHotNumbers, getColdNumbers } from '../lib/history'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTH_SHORT[m - 1]} ${y}`
}

function fmtUpdated(iso) {
  if (!iso) return ''
  const [y, m] = iso.split('-').map(Number)
  return `${MONTH_SHORT[m - 1]} ${y}`
}

export default function HistorySheet({ open, onClose, config, gameId = 'tattslotto' }) {
  const meta = useMemo(() => getGameMeta(gameId), [gameId])

  const freq = useMemo(
    () => computeFrequency(config.min, config.max, gameId),
    [config.min, config.max, gameId]
  )

  const hot = useMemo(() => new Set(getHotNumbers(freq, 10)), [freq])
  const cold = useMemo(() => new Set(getColdNumbers(freq, 10)), [freq])

  const sortedByFreq = useMemo(
    () =>
      Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([n, count]) => ({ n: Number(n), count })),
    [freq]
  )
  const maxCount = sortedByFreq[0]?.count || 1

  if (!open) return null

  return (
    <div
      className="sheet-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Lotto History">
        <div className="sheet-header">
          <div className="sheet-title">
            <ChartIcon />
            Lotto History
          </div>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sheet-body">
          <div className="history-meta">
            <div className="history-meta-left">
              <span className="history-draw-count">{meta.drawCount.toLocaleString()}</span>
              <span className="history-draw-unit"> draws</span>
              <div className="history-meta-range">
                {fmtDate(meta.from)} – {fmtDate(meta.to)} · {meta.game}
              </div>
            </div>
            <div className="history-meta-right">
              <span className="history-bundled-badge">✓ Bundled</span>
              <span className="history-updated-date">Updated {fmtUpdated(meta.updated)}</span>
            </div>
          </div>

          <p className="history-section-label">
            <span className="hsection-dot hsection-dot--hot" />
            Hot · 10 most frequently drawn
          </p>
          <div className="history-mini-balls">
            {[...hot].sort((a, b) => a - b).map((n) => (
              <span key={n} className="mini-ball mini-ball--hot">{n}</span>
            ))}
          </div>

          <p className="history-section-label">
            <span className="hsection-dot hsection-dot--cold" />
            Cold · 10 most overdue
          </p>
          <div className="history-mini-balls">
            {[...cold].sort((a, b) => a - b).map((n) => (
              <span key={n} className="mini-ball mini-ball--cold">{n}</span>
            ))}
          </div>

          <p className="history-section-label">
            <span className="hsection-dot" />
            Frequency · {config.min}–{config.max}
          </p>
          <div className="history-freq-list">
            {sortedByFreq.map(({ n, count }) => (
              <div key={n} className="history-freq-row">
                <span className="history-freq-num">{n}</span>
                <div className="history-freq-bar-wrap">
                  <div
                    className={`history-freq-bar${
                      hot.has(n) ? ' history-freq-bar--hot' : cold.has(n) ? ' history-freq-bar--cold' : ''
                    }`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="history-freq-count">{count}</span>
              </div>
            ))}
          </div>

          <p className="history-source-note">
            Data bundled from <code>src/data/{gameId}-history.json</code>. Run <code>npm run fetch-history</code> and rebuild to refresh.
          </p>
        </div>
      </div>
    </div>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
      <line x1="2"  y1="20" x2="22" y2="20" />
    </svg>
  )
}

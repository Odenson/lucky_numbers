import { useMemo, useState } from 'react'
import Controls from './components/Controls'
import ResultLine from './components/ResultLine'
import ThemeToggle from './components/ThemeToggle'
import ProfileSheet from './components/ProfileSheet'
import { useTheme } from './hooks/useTheme'
import { useLocalStorage } from './hooks/useLocalStorage'
import { generateLines, validateConfig } from './lib/generator'
import { generatePersonalLines } from './lib/personal'

const DEFAULT_CONFIG = { count: 7, min: 1, max: 42, lineCount: 1, allowRepeats: false }

export default function App() {
  const { theme, toggle } = useTheme()
  const [config, setConfig] = useLocalStorage('ln:config', DEFAULT_CONFIG)
  const [profile, setProfile] = useLocalStorage('ln:profile', null)
  const [personalMode, setPersonalMode] = useLocalStorage('ln:personalMode', false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [lines, setLines] = useState([])

  const profileComplete = !!profile?.name?.trim()
  // Auto-disable personal mode if the profile is removed or incomplete.
  const effectivePersonalMode = personalMode && profileComplete

  const error = useMemo(() => validateConfig(config), [config])

  const generate = () => {
    if (error) return
    const { count, min, max, allowRepeats, lineCount } = config
    if (effectivePersonalMode) {
      setLines(generatePersonalLines({ count, min, max, profile }, lineCount))
    } else {
      setLines(generateLines({ count, min, max, allowRepeats }, lineCount))
    }
  }

  const copyAll = async () => {
    const text = lines.map((l) => l.numbers.join(', ')).join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="app">
      <div className="aurora" aria-hidden="true" />

      <header className="app-header">
        <div className="brand">
          <SparkIcon />
          <h1>Lucky Numbers</h1>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`profile-btn${profileComplete ? ' profile-btn--active' : ''}`}
            onClick={() => setProfileOpen(true)}
            aria-label="Edit your profile"
            title={profileComplete ? `${profile.name}'s profile` : 'Set up your profile'}
          >
            <UserIcon />
          </button>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main className="app-main">
        <Controls
          config={config}
          onChange={setConfig}
          error={error}
          personalMode={effectivePersonalMode}
          onPersonalModeChange={setPersonalMode}
          profileComplete={profileComplete}
        />

        <button type="button" className="generate-btn" onClick={generate} disabled={!!error}>
          <DiceIcon />
          {lines.length ? 'Generate again' : 'Generate'}
        </button>

        {lines.length > 0 && (
          <section className="results" aria-label="Generated numbers">
            <div className="results-head">
              <span>{lines.length === 1 ? 'Your lucky line' : `${lines.length} lucky lines`}</span>
              {lines.length > 1 && (
                <button type="button" className="link-btn" onClick={copyAll}>
                  Copy all
                </button>
              )}
            </div>
            {effectivePersonalMode && (
              <div className="personal-legend" aria-label="Colour key">
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#EF9F27' }} />
                  Life Path
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#1D9E75' }} />
                  Expression
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#534AB7' }} />
                  Personal
                </span>
                <span className="legend-item">
                  <span className="legend-dot legend-dot--fill" />
                  Fill
                </span>
              </div>
            )}
            <ul className="results-list">
              {lines.map((line, i) => (
                <ResultLine
                  key={line.id}
                  numbers={line.numbers}
                  min={config.min}
                  max={config.max}
                  label={lines.length > 1 ? `Line ${i + 1}` : 'Line'}
                  profile={profile}
                  personalMode={effectivePersonalMode}
                />
              ))}
            </ul>
          </section>
        )}

        {lines.length === 0 && (
          <p className="empty-hint">Set your numbers and range, then tap generate.</p>
        )}
      </main>

      <footer className="app-footer">
        <span>Stage 1 · random draw</span>
        <span className="footer-soon">Pattern mode coming soon</span>
      </footer>

      <ProfileSheet
        open={profileOpen}
        profile={profile}
        onSave={setProfile}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

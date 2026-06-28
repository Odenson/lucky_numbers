import { useState } from 'react'
import Ball from './Ball'

// One generated line of balls with copy / share actions.
export default function ResultLine({ numbers, min, max, label }) {
  const [copied, setCopied] = useState(false)
  const text = numbers.join(', ')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard blocked — fall back to a hidden textarea selection.
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  const share = async () => {
    const shareData = { title: 'Lucky Numbers', text: `My lucky numbers: ${text}` }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User dismissed the share sheet — nothing to do.
      }
    } else {
      copy()
    }
  }

  return (
    <li className="result-line">
      <span className="result-line-label">{label}</span>
      <div className="result-balls">
        {numbers.map((n, i) => (
          <Ball key={`${n}-${i}`} value={n} min={min} max={max} index={i} />
        ))}
      </div>
      <div className="result-actions">
        <button type="button" onClick={copy} aria-label="Copy this line">
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button type="button" onClick={share} aria-label="Share this line">
          <ShareIcon />
          <span>Share</span>
        </button>
      </div>
    </li>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}

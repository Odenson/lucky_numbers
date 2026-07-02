import * as cheerio from 'cheerio'

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

function parseDate(text) {
  // Matches "6 January 2024", "6 Jan, 2024", "January 6 2024", etc.
  const m =
    text.match(/(\d{1,2})\s+([A-Za-z]+)[,\s]+(\d{4})/) ||
    text.match(/([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/)
  if (!m) return null

  let day, monthKey, year
  if (/^\d/.test(m[0])) {
    ;[, day, monthKey, year] = m
  } else {
    ;[, monthKey, day, year] = m
  }

  const month = MONTH_MAP[monthKey.toLowerCase().slice(0, 3)]
  if (month === undefined) return null
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(Number(day)).padStart(2, '0')}`
}

/**
 * Parse a yearly archive HTML page into an array of draw objects.
 * The site renders each draw as a container holding:
 *   - an element whose text is exactly "Draw NNNN"
 *   - a date string somewhere in the container text
 *   - a <ul> of <li> ball numbers (main first, supplementary after)
 */
export function parseArchivePage(html, config) {
  const $ = cheerio.load(html)
  const draws = []
  const seen = new Set()

  // Walk every element; when we find one whose trimmed own-text is "Draw NNN",
  // we climb to the nearest ancestor that also contains <li> number elements.
  $('*').each((_i, el) => {
    const ownText = $(el).clone().children().remove().end().text().trim()
    const drawMatch = ownText.match(/^Draw\s+(\d+)$/)
    if (!drawMatch) return

    const drawNum = parseInt(drawMatch[1], 10)
    if (seen.has(drawNum)) return

    // Climb ancestors to find one that has enough <li> children
    let container = $(el).parent()
    let liNums = []
    for (let depth = 0; depth < 6 && container.length; depth++) {
      liNums = container
        .find('li')
        .map((_j, li) => parseInt($(li).text().trim(), 10))
        .get()
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 99)
      if (liNums.length >= config.mainCount) break
      container = container.parent()
    }

    if (liNums.length < config.mainCount) return

    // Prefer the href on the nearest ancestor <a> — it contains the date in
    // DD-MM-YYYY format and is unambiguous. Falling back to container.text()
    // is unreliable because <br> produces no whitespace, causing cheerio to
    // concatenate "Draw 4683" with "6 June" into "Draw 46836 June".
    const anchor = $(el).closest('a[href]')
    let date = null
    if (anchor.length) {
      const hm = (anchor.attr('href') || '').match(/(\d{2})-(\d{2})-(\d{4})$/)
      if (hm) date = `${hm[3]}-${hm[2]}-${hm[1]}`
    }
    if (!date) {
      // Fallback: strip the draw-number element then parse the remaining text
      const dateText = anchor.length
        ? anchor.clone().find('strong, b').remove().end().text().trim()
        : container.text()
      date = parseDate(dateText)
    }
    if (!date) return

    seen.add(drawNum)
    draws.push({
      draw: drawNum,
      date,
      numbers: liNums.slice(0, config.mainCount),
      supplementary: liNums.slice(config.mainCount, config.mainCount + config.supplementaryCount),
    })
  })

  // Newest draw first (consistent with existing tatts-history.json format)
  return draws.sort((a, b) => b.draw - a.draw)
}

/**
 * Fetch one year's archive page and return parsed draws.
 * Throws if the HTTP response is not OK.
 */
export async function fetchYear(gameConfig, year, { delayMs = 600 } = {}) {
  const url = `${gameConfig.archiveBaseUrl}${year}`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-AU,en;q=0.9',
    },
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)

  const html = await res.text()
  const draws = parseArchivePage(html, gameConfig)

  // Polite rate-limit between requests
  if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs))

  return { year, url, draws }
}

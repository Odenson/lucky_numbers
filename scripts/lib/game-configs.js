/**
 * Scraper configuration for each supported lottery game.
 * Adding a new game: add one entry here and create a placeholder
 * src/data/{id}-history.json — the scraper handles the rest.
 */
export const GAME_CONFIGS = {
  tattslotto: {
    id: 'tattslotto',
    name: 'TattsLotto',
    archiveBaseUrl: 'https://australia.national-lottery.com/tatts-lotto/results-archive-',
    mainCount: 6,
    supplementaryCount: 2,
    min: 1,
    max: 45,
  },
  ozlotto: {
    id: 'ozlotto',
    name: 'OZ Lotto',
    archiveBaseUrl: 'https://australia.national-lottery.com/oz-lotto/results-archive-',
    mainCount: 7,
    supplementaryCount: 2,
    min: 1,
    max: 47,
  },
}

export const ALL_GAME_IDS = Object.keys(GAME_CONFIGS)

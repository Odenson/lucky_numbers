#!/usr/bin/env bash
# refresh-deploy.sh
#
# Fetches the latest draw history, runs tests, commits the updated data,
# and pushes to both production (main) and the dev preview (dev branch).
#
# Usage:
#   ./scripts/refresh-deploy.sh
#   ./scripts/refresh-deploy.sh --dry-run   # fetch + test only, no commit/push

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
RESET='\033[0m'

ok()   { echo -e "${GREEN}✓${RESET} $*"; }
info() { echo -e "${YELLOW}→${RESET} $*"; }
fail() { echo -e "${RED}✗ $*${RESET}"; exit 1; }
hr()   { echo -e "\n${BOLD}──────────────────────────────────────────${RESET}"; }

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

hr
echo -e "${BOLD}Lucky Numbers — draw history refresh${RESET}"
$DRY_RUN && echo -e "${YELLOW}(dry-run mode — no commit or push)${RESET}"
hr

# ── Pre-flight checks ─────────────────────────────────────────────────────────

info "Checking git state..."

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
[[ "$CURRENT_BRANCH" == "main" ]] || fail "Must be on main branch (currently on '$CURRENT_BRANCH'). Run: git checkout main"

# Check for uncommitted changes outside the data files
DIRTY=$(git status --porcelain | grep -v "src/data/" | grep -v "^$" || true)
if [[ -n "$DIRTY" ]]; then
  fail "Uncommitted changes outside src/data/ — commit or stash them first:\n$DIRTY"
fi

ok "On main branch, working tree clean"

# ── Fetch latest draw history ─────────────────────────────────────────────────

hr
info "Fetching latest draw history..."
echo

npm run fetch-history
echo

# Check whether any data actually changed
CHANGED=$(git diff --name-only src/data/ || true)
if [[ -z "$CHANGED" ]]; then
  ok "Draw history is already up to date — nothing to commit."
  exit 0
fi

ok "Data files updated:"
for f in $CHANGED; do echo "    $f"; done

# ── Run tests ─────────────────────────────────────────────────────────────────

hr
info "Running test suite..."
echo

npm test

ok "All tests passed"

# ── Commit + push ─────────────────────────────────────────────────────────────

if $DRY_RUN; then
  hr
  ok "Dry run complete — skipping commit and push."
  exit 0
fi

hr
info "Committing updated draw history..."

TODAY=$(date +%Y-%m-%d)
git add src/data/tattslotto-history.json src/data/ozlotto-history.json
git commit -m "chore: refresh draw history ${TODAY}"

ok "Committed"

# ── Push to production (main) ─────────────────────────────────────────────────

hr
info "Pushing to main → triggers production deployment..."

git push origin main

ok "Pushed to main — GitHub Actions will build and deploy to /lucky_numbers/"

# ── Push to dev preview ───────────────────────────────────────────────────────

info "Pushing to dev → triggers dev preview deployment..."

git push --force origin main:dev

ok "Pushed to dev — GitHub Actions will build and deploy to /lucky_numbers/dev/"

# ── Done ──────────────────────────────────────────────────────────────────────

hr
echo -e "${GREEN}${BOLD}All done!${RESET}"
echo
echo "  Production:  https://odenson.github.io/lucky_numbers/"
echo "  Dev preview: https://odenson.github.io/lucky_numbers/dev/"
echo
echo "  GitHub Actions is building both now — check progress at:"
echo "  https://github.com/Odenson/lucky_numbers/actions"
hr

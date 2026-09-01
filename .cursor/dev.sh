#!/usr/bin/env bash
# Starts the Conduit Admin UI Next.js dev server on http://localhost:8080.
# Set CONDUIT_URL (and MASTER_KEY / CONDUIT_NAMESPACE as needed) to point the
# admin panel at a running Conduit backend.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 16 >/dev/null

exec yarn dev

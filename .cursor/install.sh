#!/usr/bin/env bash
# Idempotent dependency setup for the Conduit Admin UI (Cloud Agent environment).
# Pins Node.js 16 (matches CI in .github/workflows/test.build.yml and the runtime
# image in Dockerfile), installs workspace dependencies, and builds the packages.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

NODE_VERSION=16

# Load nvm (present in the default Cloud Agent image) so we can pin Node 16.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"

nvm install "$NODE_VERSION"
nvm alias default "$NODE_VERSION"
nvm use "$NODE_VERSION"

# Provide yarn 1.x (the package manager pinned by this repo) via corepack.
corepack enable >/dev/null 2>&1 || true
corepack prepare yarn@1.22.22 --activate >/dev/null 2>&1 || npm install -g yarn@1.22.22

echo "Using node $(node -v) and yarn $(yarn -v)"

# Install all workspace dependencies from the committed lockfile.
yarn install --frozen-lockfile

# Build the shared component library (required by the app) and the Next.js app.
# CI=false mirrors the repo's CI so Next build warnings are not treated as errors.
CI=false npx lerna run build

echo "Conduit Admin UI environment is ready."

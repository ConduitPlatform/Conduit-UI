#!/usr/bin/env bash
# Idempotent dependency setup for the Conduit Admin UI (Cloud Agent environment).
# Installs workspace dependencies and builds the shared component library and the
# Next.js app. Uses the base image's Node.js (Node 22), which builds and runs this
# repo (Next.js 12 / React 17) successfully. CI pins Node 16; if you need exact CI
# parity you can `nvm use 16` before running commands.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Ensure yarn 1.x (the package manager pinned by this repo) is available.
corepack enable >/dev/null 2>&1 || true
corepack prepare yarn@1.22.22 --activate >/dev/null 2>&1 || true

echo "Using node $(node -v) and yarn $(yarn -v)"

# Install all workspace dependencies from the committed lockfile.
yarn install --frozen-lockfile

# Build the shared component library (required by the app) and the Next.js app.
# CI=false mirrors the repo's CI so Next build warnings are not treated as errors.
CI=false npx lerna run build

echo "Conduit Admin UI environment is ready."

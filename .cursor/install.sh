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

if ! command -v yarn >/dev/null 2>&1; then
  echo "yarn is not available; enable corepack or install yarn 1.x before running this script." >&2
  exit 1
fi

echo "Using node $(node -v) and yarn $(yarn -v)"

# Install all workspace dependencies from the committed lockfile.
yarn install --frozen-lockfile

# Build the shared component library (required by the dev server) and the
# Next.js app via the repo's canonical build pipeline (turbo). Turbo caches
# task outputs, so repeat runs of this idempotent script are near-instant.
# CI=false mirrors the repo's CI so Next build warnings are not treated as errors.
CI=false yarn build

# ---------------------------------------------------------------------------
# Docker Engine (for the local Conduit backend the admin panel connects to).
#
# The admin panel is only useful against a running Conduit instance, so the
# `start` script brings up a Conduit 0.17 backend via Docker Compose. Here we
# just make sure the Docker Engine is installed and configured. This is
# best-effort: if it fails, the frontend still builds and runs (it simply
# has no backend to talk to until Docker is available).
# ---------------------------------------------------------------------------
setup_docker() {
  if ! command -v sudo >/dev/null 2>&1; then
    echo "WARNING: sudo not available; skipping Docker setup (backend will be unavailable)." >&2
    return 0
  fi

  if ! command -v docker >/dev/null 2>&1; then
    echo "Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
  fi

  # Bridge networking and the overlayfs snapshotter are unreliable inside the
  # nested Cloud Agent VM (restricted nftables/iptables; overlayfs whiteouts
  # need privileges we don't have). The vfs storage driver sidesteps the
  # overlayfs limitation; the compose file uses host networking to sidestep
  # the bridge limitation.
  sudo mkdir -p /etc/docker
  if ! grep -qs '"vfs"' /etc/docker/daemon.json; then
    echo '{ "features": { "containerd-snapshotter": false }, "storage-driver": "vfs" }' \
      | sudo tee /etc/docker/daemon.json >/dev/null
  fi
  echo "Docker $(docker --version 2>/dev/null) is configured (storage-driver: vfs)."
}

setup_docker || echo "WARNING: Docker setup failed; the Conduit backend will be unavailable." >&2

echo "Conduit Admin UI environment is ready."

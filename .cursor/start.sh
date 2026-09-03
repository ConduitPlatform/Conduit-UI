#!/usr/bin/env bash
# Per-boot startup for the Conduit Admin UI dev environment.
#
# Brings up a local Conduit 0.17 backend (via Docker Compose) and points the
# admin panel at it by writing apps/Conduit-UI/.env.local, which `yarn dev`
# (the dev-server terminal) loads automatically. Everything here is
# best-effort: a backend hiccup must not stop the container from starting, so
# the frontend dev server always comes up either way.
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_FILE=".cursor/conduit-backend/docker-compose.yml"
CONDUIT_URL="http://localhost:3030"
MASTER_KEY="M4ST3RK3Y"

# Point the admin panel at the local backend. .env.local is git-ignored and is
# loaded by Next.js at dev/build time (the API proxy reads CONDUIT_URL/MASTER_KEY).
write_env_local() {
  cat > apps/Conduit-UI/.env.local <<EOF
CONDUIT_URL=${CONDUIT_URL}
MASTER_KEY=${MASTER_KEY}
EOF
  echo "Wrote apps/Conduit-UI/.env.local (CONDUIT_URL=${CONDUIT_URL})."
}

write_env_local

if ! command -v docker >/dev/null 2>&1 || ! command -v sudo >/dev/null 2>&1; then
  echo "WARNING: docker/sudo unavailable; skipping Conduit backend startup." >&2
  exit 0
fi

# Start the Docker daemon if it is not already running (no systemd in the VM).
if ! sudo docker info >/dev/null 2>&1; then
  echo "Starting Docker daemon..."
  sudo bash -c 'nohup dockerd > /var/log/dockerd.log 2>&1 &'
  for _ in $(seq 1 30); do
    sudo docker info >/dev/null 2>&1 && break
    sleep 2
  done
fi

if ! sudo docker info >/dev/null 2>&1; then
  echo "WARNING: Docker daemon did not start; Conduit backend is unavailable." >&2
  exit 0
fi

echo "Bringing up the Conduit 0.17 backend (conduit-standalone + redis + mongo)..."
sudo docker compose -f "$COMPOSE_FILE" up -d || \
  echo "WARNING: 'docker compose up' failed; Conduit backend may be unavailable." >&2

# Best-effort readiness wait so the panel can log in immediately after boot.
for _ in $(seq 1 60); do
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${CONDUIT_URL}/ready" --max-time 3 2>/dev/null || true)"
  if [ "$code" = "200" ]; then
    echo "Conduit backend is ready at ${CONDUIT_URL} (admin login: admin / admin)."
    exit 0
  fi
  sleep 2
done

echo "NOTE: Conduit backend not confirmed ready yet; it may still be initializing." >&2
exit 0

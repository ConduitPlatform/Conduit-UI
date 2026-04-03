<p align="center">
<br>
<a href="https://getconduit.dev" target="_blank"><img src="https://getconduit.dev/conduitLogo.svg" alt="logo"/></a>
<br/>
<strong>The only Backend you'll ever need. Written in NodeJS, works with any stack</strong>
</p>

[![CodeFactor](https://www.codefactor.io/repository/github/conduitplatform/conduit-ui/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/conduitplatform/conduit-ui)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/ConduitPlatform/Conduit-UI?color=green&sort=semver&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/ConduitPlatform/Conduit-UI?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ConduitPlatform/Conduit-UI?style=for-the-badge)

# Conduit Admin Panel

This repository contains the Conduit admin panel that serves as your base of operations when
working with Conduit.

Check out our docs here: [Documentation](https://getconduit.dev/docs/overview/intro)\
Wanna see what come next: [Roadmap](https://sharing.clickup.com/1554325/b/h/1fdwn-7561/8b09d2e9aedec0b)\
Help us make Conduit great: [Contribute](https://github.com/ConduitPlatform/Conduit/blob/main/.github/CONTRIBUTING.md)\
Learn more: [Website](https://getconduit.dev)

# Features ✔️

- Create and manage users and authentication methods
- Create schemas, view and manipulate data, create custom endpoints/queries
- Manage you e-mail provider connections and templates
- 

# Requirements ⚡

- **Node.js 24+** (see `engines` in [package.json](package.json); use [.nvmrc](.nvmrc) with `nvm use`)
- A running Conduit instance
- Desire to create something awesome

# Quickstart (local)

From the repository root:

```bash
pnpm install
pnpm build
pnpm start
```

The app listens on **port 8080** by default (`pnpm start` runs `next start -p 8080`). For development with hot reload:

```bash
pnpm dev
```

Configure environment variables via `.env` / `.env.local` (see [EnvManager](src/lib/logic/EnvManager.ts) and project docs for required keys).

Open http://localhost:8080 for the admin panel (use credentials from your Conduit setup).

# Docker

Build and run the production image:

```bash
pnpm build:docker
docker run -p 3000:3000 ghcr.io/conduitplatform/conduit-ui:latest
```

The container exposes port **3000** (see [Dockerfile](Dockerfile)).

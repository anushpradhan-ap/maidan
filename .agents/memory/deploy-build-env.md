---
name: Deploy build env quirk
description: Production builds don't get [services.env] vars from artifact.toml
---

**Rule:** Artifact production builds run without the `[services.env]` vars from artifact.toml (only explicit `[services.production.build.env]` entries are injected). Any config file loaded at build time must not hard-require dev-serving env vars.

**Why:** Both web artifacts' vite.config.ts threw "PORT environment variable is required" during `vite build`, breaking publishing — PORT/BASE_PATH are only provided to the dev workflow.

**How to apply:** In vite configs, gate strict env checks on the command (`process.argv.includes('build')`) and provide per-artifact defaults (e.g. BASE_PATH defaults to the artifact's mount path). Test with a bare `pnpm --filter <pkg> run build` (no env) before suggesting publish.

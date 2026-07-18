# Memory Index

- [Prod DB schema sync](prod-db-schema-sync.md) — production schema changes only flow through the Publish diff; keep Drizzle schema + dev DB aligned, then republish. Prod is read-only for the agent.
- [Deploy build env quirk](deploy-build-env.md) — artifact production builds don't receive `[services.env]` vars; vite configs must only require PORT/BASE_PATH when serving, with safe defaults for build.

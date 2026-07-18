---
name: Prod DB schema sync
description: How schema changes (incl. FK delete rules) reach the production database in this project
---

**Rule:** Never run DDL against production. Schema changes reach prod only via the Publish flow, which introspects dev vs prod DBs and applies the SQL diff at publish time.

**Why:** FK cascade rules were once applied to the dev DB via raw SQL only — production kept `NO ACTION` and admin deletes 500'd on the live site until a republish carried the diff. Agent prod access is read-only by design.

**How to apply:** For any schema change (including constraint options like `ON DELETE CASCADE`): 1) declare it in the Drizzle schema files at `lib/db/src/schema/`, 2) apply to dev DB (`pnpm --filter` db push, or verify raw SQL matches with `drizzle-kit push` reporting "No changes detected"), 3) tell the user to republish. Verify prod afterwards with a read-only `information_schema.referential_constraints` query (`environment: "production"`).

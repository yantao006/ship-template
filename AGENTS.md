# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- `README.md` documents the local-only verification contract and replay commands.
- `migrations/` is the authoritative D1 schema; ledger writes use native D1 `prepare().bind()` and `batch()` in `src/lib/ledger.ts`.
- Run `pnpm test`, `pnpm typecheck`, `pnpm cf:build`, and `pnpm site-check` before handing off changes.
- `.open-next/worker.js` is generated; `worker.ts` wraps it for HTTP, Cron, and Queue events.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

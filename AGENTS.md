# Project agent memory

This file holds binding design constraints for future code changes, not a second implementation manual.

## Template configuration

- Treat `site/site.config.ts`, `site/auth.config.ts`, `site/database.config.ts`, `site/theme.config.ts`, and `site/messages/` as the per-site configuration boundary; components render only what configuration enables, never invented controls.
- Keep one language per file in `site/messages/` and preserve message keys across languages; the navigation has one language switch, not side-by-side language buttons.
- Changes to copy, switches, or theme in `site/` require a rebuild and publish; Worker environment values, including secrets, are read at request time and changing secrets does not require recompilation.
- `site/auth.config.ts` independently gates email, Google, GitHub, Google One Tap, invitation redemption, and desktop login; disabled flows must be absent from the UI as well as guarded on the server.
- The navigation has one Sign In action opening one card containing only enabled email, Google, and GitHub methods; One Tap and desktop handoff do not add extra navigation buttons.
- `src/lib/auth.ts` uses better-auth on this site's own D1 and rejects production login unless the request-time `SITE_URL` equals `site.url`.
- Each site must have its own Google Cloud project and Web client with callback `https://<apex>/api/auth/callback/google`; the sole reference hostname is `https://awesomejev.link`, as configured in `site/site.config.ts` and `wrangler.jsonc`.
- Keep credentials out of git and `site/`; use only this Worker's environment/secrets, with `wrangler.jsonc` and `src/lib/env.ts` as the binding contract.
- `site/site.config.ts` selects Cloudflare Email by default and can select Resend; keep the adapter boundary in `src/lib/email.ts`.

## Project structure

- Keep Next.js App Router under `src/app/`, shared UI under `src/components/`, business logic under `src/lib/`, and per-site choices under `site/` rather than cloning business modules per site.
- Build through OpenNext onto one Cloudflare Worker per site; `.open-next/worker.js` is generated and `worker.ts` wraps HTTP, Cron, and Queue events.
- Give every site its own D1 and R2 media bucket; `wrangler.jsonc` declares the reference site's bindings and sole custom hostname, not a shared database.

## AI video API

- Future video generation must be asynchronous with observable progress, a task/status flow, and R2-backed private media; prefer fal.ai as the default upstream rather than importing another provider's API contract.
- Validate identity, prompt, parameters, and credit cost on the server; reserve credits before submitting a task, refund once on upstream failure or timeout, and do not refund a user-canceled submitted task (`src/lib/ledger.ts`).
- Enable prompt keyword screening by default; use provider moderation only when a user elects public sharing, while generated media remains private by default.
- Do not treat `src/lib/mock-services.ts` as a real generator or implement video generation merely to satisfy this guidance.

## Frontend components

- Organize the eventual homepage into named navigation, hero, video tool, showcase, features, pricing, FAQ, and footer sections driven by `site/` configuration, rather than hard-coded buttons or content (`src/components/home-content.tsx`).
- Make the video tool accept copy, duration, style, and credit options as parameters and own its input, progress, and preview states without bundling provider logic into UI components.
- Route colors through `site/theme.config.ts` and `src/app/globals.css` theme variables instead of hard-coding colors per component.

## Payments

- Future checkout must use Waffo only: share a merchant and store, but create a distinct product for each site and keep its product ID in the Worker environment (`wrangler.jsonc`).
- Grant annual-plan credits monthly and idempotently rather than granting a year's allocation up front (`src/lib/ledger.ts`).
- The free tier has no watermark; discounts use coupons only, with no recommendations, affiliate program, or trial in the first version.
- `src/lib/mock-services.ts` is not a payment integration; do not implement checkout merely to satisfy this guidance.

## Database

- `migrations/` is the sole schema source for this site's D1-backed auth, tasks, and credit ledger; do not copy a shared database schema into another site.
- Ledger writes must use native D1 `prepare().bind()` and `batch()` as in `src/lib/ledger.ts`; never place drizzle `sql` objects inside a D1 batch.

## Agent handoff

- Keep this `AGENTS.md` a short, current set of project-specific rules with pointers to authoritative files, not copied vendor docs or a second README.
- Consult `README.md` for local and live Google-login verification; run `pnpm test`, `pnpm typecheck`, `pnpm cf:build`, and `pnpm site-check` before handing off changes.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

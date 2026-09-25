# Project architecture guide

This is a configurable preview of an AI video site, with site-local authentication and credit accounting plus implemented invitation and mail-adapter primitives.
Video generation and checkout are integration points represented by `src/lib/mock-services.ts`, rather than live services.
`README.md` is the operational reference for local and live verification.

## Overall tech stack

- **Application:** Next.js 15 App Router, React 19, TypeScript, and CSS variables in `src/app/globals.css`.
- **Runtime:** OpenNext packages the app for a Cloudflare Worker, with HTTP, cron, and queue entry points in `worker.ts`.
- **Data:** Site-bound Cloudflare D1 with versioned SQL in `migrations/`; R2 media and a Cloudflare Queue are declared bindings for future processing.
- **Identity:** better-auth with its Drizzle D1 adapter; email/password and Google are enabled in the reference configuration.
- **Tooling:** Node 22, pnpm 10, Wrangler, Miniflare-backed tests, and TypeScript type checking.

## Tech stack of each module

| Area | Current implementation | Responsibility |
| --- | --- | --- |
| Site choices | `site/*.config.ts`, `site/messages/`, `src/lib/config.ts` | Site identity, feature switches, deployment names, theme, and localized copy. |
| Routing and API | `src/app/` | Next.js pages, metadata, authentication callbacks, and HTTP endpoints. |
| Presentation | `src/components/`, `src/app/globals.css` | Marketing and workspace layouts, auth controls, invitation flow, and accessible client interaction. |
| Identity | `src/lib/auth.ts`, `src/lib/auth-schema.ts`, `src/lib/turnstile.ts`, `src/lib/desktop-auth.ts` | Session creation, D1-backed accounts, sign-in verification, and desktop handoff. |
| Credits and access | `src/lib/ledger.ts`, `src/lib/credit-history.ts`, `src/lib/invites.ts` | Atomic credit movements, user-scoped history, and invitation redemption. |
| Notifications | `src/lib/email.ts`, `src/lib/notifications.ts` | Cloudflare Email or Resend delivery behind one interface and application email composition. |
| Video and payments | `src/lib/mock-services.ts`, `src/lib/ledger.ts` | Preview stand-ins and reusable task/credit primitives awaiting live adapters and API flows. |
| Worker resources | `worker.ts`, `src/lib/env.ts`, `wrangler.jsonc` | OpenNext dispatch, event handlers, binding types, and deployment wiring. |

## Build, compile, and deploy commands

- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm dev` starts the Next.js development server.
- `pnpm build` compiles the Next.js app; `pnpm typecheck` checks TypeScript without emitting files.
- `pnpm cf:build` builds the OpenNext Worker and generates `.open-next/worker.js` and assets.
- `pnpm cf:preview` previews the Cloudflare build; `pnpm exec wrangler deploy --dry-run --outdir /tmp/ship-template-dryrun` checks its deployable bundle.
- `pnpm exec wrangler deploy` publishes the configured Worker after a Cloudflare build and the site's bindings, migrations, and secrets are ready.
- `pnpm exec wrangler d1 migrations apply awesomejev-db --local` applies the reference site's migrations to local D1; target the appropriate site database for other environments.
- `pnpm test`, `pnpm site-check`, and `pnpm site-check fixtures/second-site` cover logic and configuration; `pnpm site-check --strict` additionally checks required local environment names.

## Architecture

`site/` supplies per-site choices through `src/lib/config.ts`, while `wrangler.jsonc` supplies matching Cloudflare resources and `src/lib/env.ts` types their request-time bindings.
`src/app/` composes server-rendered pages and API entry points; `src/components/` handles rendering and client interaction; `src/lib/` holds shared business and integration logic.
A typical authenticated read flows from a page or API handler through `createAuth(workerEnv())` to the site D1, then returns user-scoped data to the view.
An invite-enabled signup validates a code, redeems it in D1, and triggers the idempotent welcome-credit grant; the credit view reads lots through `src/lib/credit-history.ts` and balances through `src/lib/ledger.ts`.
OpenNext builds the Next.js HTTP handler, and `worker.ts` connects it to future cron and queue work alongside `fetch`.
The reference site currently renders a homepage, dashboard, and credit history; its deployed hostname and resource names are examples in `site/site.config.ts` and `wrangler.jsonc`.

## Module system

The repository uses responsibility-based files under `src/lib/` rather than a formal plugin registry or `src/modules/` directory.
`src/app/` is the composition layer: routes validate requests and sessions, invoke the relevant library functions, and return responses or server-rendered content.
Client components such as `src/components/auth-control.tsx` call HTTP or better-auth client APIs, while server components such as `src/components/workspace-content.tsx` can use server-side services directly.
Service seams include `EmailProvider` in `src/lib/email.ts` and the future video and payment adapters; provider-specific formats belong behind these seams while UI and ledger contracts remain stable.
`src/lib/config.ts` centralizes imports of site choices so new sections and services can share the same per-site values.

## Key design patterns

- **Site-scoped configuration:** Feature switches drive visible UI and matching server checks; `scripts/site-check.ts` compares selected choices with deployed bindings and required secret names.
- **Localization:** `site/messages/en.ts` and `site/messages/zh.ts` expose matching keys through `site/messages/index.ts`, and the locale routes under `src/app/[locale]/` choose the appropriate copy.
- **Visual tokens:** `site/theme.config.ts` feeds CSS variables through `src/app/layout.tsx`; components consume those tokens in `src/app/globals.css`.
- **Authentication boundary:** `src/lib/auth.ts` creates better-auth against the Worker D1 and configured site URL; `src/app/api/auth/[...all]/route.ts` adds invitation and Turnstile checks around auth requests.
- **Atomic credit accounting:** `src/lib/ledger.ts` uses native D1 statements and batches for lot allocation, idempotent grants, reservations, and refunds.
- **Asynchronous task extension:** `video_task` and credit reservations support a submit/status/result flow, with a queue handler and media binding available for eventual processing.
- **Payment extension:** A checkout endpoint can translate a plan into a provider checkout, and a verified webhook can translate provider events into subscription periods and idempotent ledger grants.

## How to add new logic

1. Start with the per-site choices in `site/` when a feature varies by site, and connect new switches to both presentation and server behavior.
2. Add persistent state through a versioned SQL file in `migrations/`, then reflect the new shape in service types and queries under `src/lib/`.
3. Place external provider calls behind a library adapter and connect HTTP entry points under `src/app/api/` or background processing under `worker.ts`.
4. Expose the feature through `src/components/` and a page under `src/app/`, with matching keys in each `site/messages/` language and theme tokens where needed.
5. Expand `scripts/site-check.ts` for new site-to-Worker contracts and `test/` for identity, concurrency, failure, and idempotency cases.
6. Consult `README.md` for verification and run `pnpm test`, `pnpm typecheck`, `pnpm cf:build`, and `pnpm site-check` before handoff.

## Database schema

`migrations/0001_initial.sql` creates `user`, `session`, `account`, and `verification` for authentication; `src/lib/auth-schema.ts` maps those tables for better-auth.
The same migration creates `credit_lot` for balance and expiry, `credit_entry` for the auditable change log, `credit_alloc` for spend-to-lot allocation, and `video_task` for generation cost and task status.
Unique source, source ID, and idempotency keys make repeated grants and refunds observable without multiplying credit.
`migrations/0002_invite_codes.sql` adds `invite_code` with capacity and expiration plus `invite_redemption` tied to a user.
`src/lib/invites.ts` owns invitation checks and redemption, while `src/lib/ledger.ts` owns credit writes and `src/lib/credit-history.ts` exposes bounded account history.
Schema evolution travels through a new migration, corresponding TypeScript mappings or query types, and focused tests for the affected data flow.

## Configuration items

### Per-site choices

| Location | Item | Effect |
| --- | --- | --- |
| `site/site.config.ts` | `brand`, `previewOnly` | Brand metadata and preview indexing behavior. |
| `site/site.config.ts` | `apex`, `url` | Canonical host, auth callback origin, metadata, and site-check comparison. |
| `site/site.config.ts` | `locales`, `defaultLocale` | Available language routes, selector options, and default content. |
| `site/site.config.ts` | `deploy.worker`, `deploy.d1`, `deploy.r2`, `deploy.queue` | Expected per-site resource names checked against Wrangler. |
| `site/site.config.ts` | `email.provider`, `email.from` | Delivery adapter selection and notification sender address. |
| `site/site.config.ts` | `signupCredits` | Credit grant for a newly eligible account. |
| `site/auth.config.ts` | `backend`, `basePath` | Current better-auth backend and `/api/auth` route contract. |
| `site/auth.config.ts` | `email.enabled`, `google.enabled`, `github.enabled` | Independent sign-in choices rendered by the UI and configured on the server. |
| `site/auth.config.ts` | `google.oneTapEnabled` | Google One Tap UI and auth plugin when Google login is active. |
| `site/auth.config.ts` | `invite.required`, `invite.adminEmails` | Invitation gate and the administrators authorized to manage codes. |
| `site/auth.config.ts` | `desktop.schemes` | App schemes eligible for signed-in desktop handoff. |
| `site/auth.config.ts` | `turnstile.onSignIn` | Server-side sign-in token verification when the client supplies tokens. |
| `site/database.config.ts` | `binding`, `migrationsDir` | D1 binding name and SQL migration location for this site. |
| `site/theme.config.ts` | `background`, `surface`, `foreground`, `muted`, `accent`, `border`, `font` | Page, card, text, accent, line, and font tokens passed to global CSS. |
| `site/messages/en.ts`, `site/messages/zh.ts` | `nav`, `hero`, `dashboard`, `credits` | Localized labels for navigation, homepage, workspace, and credit history. |

### Worker and runtime choices

`wrangler.jsonc` declares the current reference site's deployment wiring; its individual fields serve these roles:

| Wrangler item | Effect |
| --- | --- |
| `name`, `main` | Worker identity and `worker.ts` entry point. |
| `compatibility_date`, `compatibility_flags` | Cloudflare runtime behavior and Node compatibility. |
| `assets.directory`, `assets.binding` | OpenNext static asset output and its `ASSETS` binding. |
| `d1_databases[].binding`, `database_name`, `database_id`, `migrations_dir` | D1 binding, site database identity, and migration path. |
| `r2_buckets[].binding`, `bucket_name` | Site media binding and bucket identity. |
| `queues.producers[]`, `queues.consumers[]` | `JOBS` submission and queue delivery to the Worker. |
| `send_email[].name` | Cloudflare Email binding. |
| `routes[].pattern`, `routes[].custom_domain` | Custom hostname served by this Worker. |
| `triggers.crons` | Schedule delivered to `worker.ts`'s `scheduled` handler. |
| `secrets.required`, `vars.SITE_URL` | Secret-name contract and request-time canonical auth origin. |

`next.config.ts` sets the Next.js file tracing root, `open-next.config.ts` initializes Cloudflare packaging, and `tsconfig.json` sets strict checking and `@/` and `@site/` path aliases.
The following runtime values are typed in `src/lib/env.ts` and supplied by the Worker or local test environment:

| Runtime value | Effect |
| --- | --- |
| `DB`, `MEDIA`, `JOBS`, `EMAIL` | D1 account and ledger data, media bucket, background queue, and Cloudflare Email delivery. |
| `SITE_URL`, `BETTER_AUTH_SECRET` | Canonical better-auth base URL and signing secret. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth and optional One Tap credentials. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials when enabled. |
| `TURNSTILE_SECRET` | Server-side Turnstile verification when enabled. |
| `RESEND_API_KEY` | Resend delivery when selected by the site. |
| `LOCAL_AUTH_TEST` | Explicit loopback-only local authentication test path. |

The `site/` TypeScript choices are compiled into a build, while Worker variables and secrets are read at request time.
Changing site choices calls for a new build and publication; changing request-time secrets uses the Worker environment contract.

## Critical Rules

1. **Preserve the configuration boundary:** site-specific copy and switches enter through `site/`, with matching UI, API, and `site-check` behavior.
2. **Keep service credentials server-side:** bindings and secret names live in `wrangler.jsonc` and `src/lib/env.ts`, while values come from the site's Worker environment.
3. **Keep identity and authorization at the server boundary:** account, invitation, credit, and media requests resolve the current session and user before accessing site data.
4. **Keep provider contracts behind adapters:** generation, mail, and payment integrations translate external APIs into application-level operations that can evolve independently.
5. **Keep ledger effects atomic and idempotent:** new billing or task events carry stable keys into the native D1 credit operations, with concurrency and retry coverage in tests.
6. **Evolve persisted data with migrations:** new SQL, TypeScript mappings, service operations, and tests describe one consistent schema.
7. **Treat preview stubs as preview stubs:** current mocks document integration points; live capabilities receive real routes, adapters, event handling, and end-to-end verification.
8. **Verify the delivery surface:** use the checks in `README.md` and review the relevant site bindings when changing runtime behavior.
9. **Keep this guide current:** whenever the stack, module roles, commands, architecture, patterns, extension flow, schema, or configuration contract changes, update this file in the same change.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Point to the authoritative file or command for details already visible in the codebase.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

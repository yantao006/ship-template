# Project architecture guide

This repository is a replicable AI video site template; the current reference site is one configured example.
A new site changes `site/`, provisions its own D1 and other Worker resources, supplies its own secrets, and keeps sharing the application layers in `src/`.
The current example has site-local accounts, invitation primitives, a credit ledger, and mail adapters; video generation and checkout remain placeholders in `src/lib/mock-services.ts`.
`README.md` records the reference site's live state and verification procedure.

## Design principles

- **Configuration decides what appears:** `site/` describes the site's identity, features, copy, and theme; the UI reflects enabled choices and the server enforces the same choices.
- **One language per file:** `site/messages/en.ts` and `site/messages/zh.ts` keep corresponding keys, and locale-aware pages select one message set at a time.
- **One navigation path per purpose:** the navigation has one language control and one sign-in entry; its sign-in card lists only the methods enabled in `site/auth.config.ts`.
- **Theme owns color:** `site/theme.config.ts` feeds variables through `src/app/layout.tsx` to `src/app/globals.css` and the components it styles.
- **Pages compose sections:** a full site can grow from navigation and hero into a generation tool, showcase, features, pricing, FAQ, and footer, with each section taking its content from site choices.
- **Long-running work is observable:** video generation uses an asynchronous task and progress flow, while the server validates costs and records credit movements in the ledger.

## Overall tech stack

- **Application:** Next.js 15 App Router, React 19, strict TypeScript, server components for account views, client components for interaction, and CSS variables for visual tokens.
- **Deployment:** OpenNext compiles the Next.js application into one Cloudflare Worker whose HTTP, scheduled, and queue events enter through `worker.ts`.
- **Persistence:** Cloudflare D1 stores better-auth identities, invitation records, video task state, and credit lots and entries; SQL migrations in `migrations/` define the schema.
- **Identity:** better-auth uses the Drizzle D1 adapter for its own tables, while invitation and ledger operations use native D1 statements where atomic batches matter.
- **Resources:** `wrangler.jsonc` declares this site's D1, R2 media bucket, Queue, email binding, hostname, cron, environment variable, and required secret names.
- **Tooling:** Node 22, pnpm 10, Wrangler, Miniflare-backed Node tests, and TypeScript type checking; `package.json` owns the runnable scripts.

## Tech stack of each module

| Area | Files and technology | Contract |
| --- | --- | --- |
| Site configuration | `site/*.config.ts`, `site/messages/`, `src/lib/config.ts` | Compiled site choices and typed localized copy shared by routes and components. |
| Web and HTTP | `src/app/`, Next.js App Router | Pages, metadata, better-auth handler, and request/response endpoints. |
| UI | `src/components/`, React server/client components, `src/app/globals.css` | Homepage and workspace composition, sign-in, invitation, language, and desktop interaction. |
| Authentication | `src/lib/auth.ts`, `src/lib/auth-schema.ts`, better-auth, Drizzle on D1 | Sessions and accounts from this site's DB; enabled methods from `site/auth.config.ts`. |
| Access control | `src/lib/invites.ts`, `src/lib/turnstile.ts`, `src/lib/desktop-auth.ts`, D1 and Turnstile HTTP API | Invitation eligibility, optional sign-in verification, and allow-listed app handoff. |
| Credits | `src/lib/ledger.ts`, `src/lib/credit-history.ts`, native D1 statements and batches | Atomic grants, reservations, allocation, refund, balance, and bounded account history. |
| Email | `src/lib/email.ts`, `src/lib/notifications.ts`, Cloudflare Email or Resend | One `EmailProvider` interface for message delivery and application notification copy. |
| Video and payments | `src/lib/mock-services.ts`, `src/lib/ledger.ts`, `video_task` | Preview stand-ins and durable task/credit primitives for future provider adapters. |
| Worker infrastructure | `worker.ts`, `src/lib/env.ts`, `wrangler.jsonc`, OpenNext | HTTP dispatch and scheduled/queue entry points with typed request-time bindings. |

## Build, compile, and deploy commands

- `pnpm install` installs the versions pinned in `pnpm-lock.yaml`.
- `pnpm dev` runs the Next.js development server; `pnpm build` compiles Next.js without producing the Cloudflare Worker bundle.
- `pnpm typecheck` runs `tsc --noEmit`, and `pnpm test` runs the Node test suite with Miniflare D1 for integration coverage.
- `pnpm cf:build` runs the OpenNext Cloudflare build and generates `.open-next/worker.js` and `.open-next/assets`.
- `pnpm cf:preview` previews the built Worker, and `pnpm exec wrangler deploy --dry-run --outdir /tmp/ship-template-dryrun` checks a deployable bundle without publishing it.
- `pnpm exec wrangler d1 migrations apply awesomejev-db --local` initializes the reference site's local D1; choose the target site's database and environment when applying migrations elsewhere.
- `pnpm site-check` compares the reference `site/` choices to `wrangler.jsonc`; `pnpm site-check fixtures/second-site` exercises a different site's config and bindings.
- `pnpm site-check --strict` additionally checks the caller's `SITE_URL` and required credentials by name, with deployed Worker secrets supplied separately from the local shell.
- After building and provisioning a site's bindings, migrations, and secrets, `pnpm exec wrangler deploy` publishes the configured Worker.
- `README.md` describes local-only auth tests and live Google-login verification; command success alone does not prove a production OAuth callback works.

## Architecture

The tree below describes tracked source files; `.next/`, `.open-next/`, `.wrangler/`, `node_modules/`, `next-env.d.ts`, and TypeScript build info are generated or local artifacts.

```text
.
├── AGENTS.md                         # Architecture map and change guidance
├── CLAUDE.md                         # Import pointer to AGENTS.md
├── README.md                         # Local setup, verification, and live reference state
├── .gitignore                        # Generated builds, local secrets, and dependencies
├── package.json                      # Scripts and dependency declarations
├── pnpm-lock.yaml                    # Pinned dependency graph
├── next.config.ts                    # Next.js file-tracing root
├── open-next.config.ts               # OpenNext Cloudflare build configuration
├── tsconfig.json                     # Strict TS settings and @/ / @site/ aliases
├── worker.ts                         # OpenNext fetch plus scheduled and queue event entry points
├── wrangler.jsonc                    # Site Worker, resource bindings, route, cron, vars, secret names
├── migrations/                       # Versioned SQL applied to this site's D1
│   ├── 0001_initial.sql             # Auth, credit ledger, and video task tables
│   └── 0002_invite_codes.sql        # Invitation inventory and redemption tables
├── scripts/
│   └── site-check.ts                 # Cross-checks site choices, bindings, auth switches, secrets
├── fixtures/second-site/             # Configuration-only reuse example
│   ├── site/site.config.ts           # Alternate identity, resources, and mail adapter
│   ├── site/auth.config.ts           # Alternate auth and verification switches
│   └── wrangler.jsonc                # Alternate Worker binding declarations
├── site/                              # Per-site choices compiled into the application
│   ├── site.config.ts                # Brand, URL, locales, deployment names, email, signup credits
│   ├── auth.config.ts                # Login methods, invitations, desktop schemes, Turnstile
│   ├── database.config.ts            # D1 binding and migration directory
│   ├── theme.config.ts               # Colors and font used by layout CSS tokens
│   └── messages/                     # One source file per locale with matching message keys
│       ├── en.ts                     # English navigation, hero, dashboard, credits copy
│       ├── zh.ts                     # Chinese copy with the same shape
│       └── index.ts                  # Locale-to-message map
├── src/                               # Application routes, presentation, and services
│   ├── app/                          # Next.js App Router pages and API handlers
│   │   ├── layout.tsx                # Metadata, preview indexing, and theme token injection
│   │   ├── globals.css               # Shared responsive layout and token-consuming styles
│   │   ├── page.tsx                  # Default-locale homepage
│   │   ├── robots.ts                 # Preview indexing policy and sitemap reference
│   │   ├── sitemap.ts                # Locale-aware homepage URLs and alternates
│   │   ├── [locale]/                 # Locale-aware marketing and workspace routes
│   │   │   ├── page.tsx              # Localized homepage composition
│   │   │   ├── dashboard/page.tsx    # Account summary route
│   │   │   ├── credits/page.tsx      # Credit balance and grant history route
│   │   │   └── reset-password/page.tsx # Password reset form for an emailed token
│   │   ├── admin/invites/page.tsx    # Session- and allow-list-gated invite administration
│   │   ├── auth-callback/page.tsx    # Signed-in desktop return page
│   │   └── api/                      # HTTP boundary for auth and account operations
│   │       ├── auth/[...all]/route.ts         # Better-auth handler with invite/Turnstile checks
│   │       ├── auth/desktop-handoff/route.ts # Same-origin session-token handoff
│   │       ├── credits/balance/route.ts      # Session-scoped balance endpoint
│   │       ├── invites/route.ts              # Invite admin list, create, revoke
│   │       ├── invites/validate/route.ts     # Code validity check
│   │       └── invites/redeem/route.ts       # Session-scoped redemption and signup grant
│   ├── components/                   # UI composition and client controls
│   │   ├── home-content.tsx          # Server-rendered homepage and welcome balance
│   │   ├── marketing-nav.tsx         # Navigation assembled from locale and auth choices
│   │   ├── auth-control.tsx          # Client sign-in card and email/social interactions
│   │   ├── reset-password.tsx        # Client form that submits a new password for a reset token
│   │   ├── google-one-tap.tsx        # Optional browser-side One Tap client
│   │   ├── language-control.tsx      # Locale switch preserving the current route
│   │   ├── workspace-shell.tsx       # Shared dashboard navigation and heading
│   │   ├── workspace-content.tsx     # Session-scoped dashboard/credit data and rendering
│   │   ├── invite-gate.tsx           # Client code redemption form
│   │   ├── invite-admin.tsx          # Client code inventory and actions
│   │   └── desktop-handoff.tsx       # Client app-return request and redirect
│   └── lib/                          # Business logic, config exports, and integration seams
│       ├── config.ts                 # Exports the site, auth, theme, messages, database choices
│       ├── env.ts                    # Worker binding and secret types plus context accessor
│       ├── auth-schema.ts            # Drizzle mapping for better-auth D1 tables
│       ├── auth.ts                   # Better-auth construction, origin checks, signup grant
│       ├── invites.ts                # Invite eligibility, validation, redemption, admin match
│       ├── ledger.ts                 # Atomic credit lots, entries, task transitions, refunds
│       ├── credit-history.ts         # Bounded user credit-lot query
│       ├── turnstile.ts              # Token verification and local test path
│       ├── desktop-auth.ts           # Scheme validation and token-bearing app URL
│       ├── email.ts                  # Cloudflare/Resend adapter and fake test provider
│       ├── notifications.ts          # Typed event notification messages
│       └── mock-services.ts          # Local-only video/payment placeholders
└── test/                              # Miniflare D1, auth, mail, config, and ledger tests
    ├── auth-integration.test.ts      # Local better-auth signup and idempotent credits
    ├── auth-options.test.ts          # Provider switches, invites, desktop handoff
    ├── password-reset.test.ts        # Reset switch, mailed link, and reset page
    ├── config-email-auth.test.ts     # Second-site wiring, mail adapters, Turnstile
    ├── credit-history.test.ts       # Signed-in and bounded account credit reads
    └── ledger.test.ts               # Concurrent spend, refunds, and monthly grants
```

The request path is `page or client control -> src/app page/API -> src/lib service -> this site's D1 or provider binding`.
Next.js server components such as `src/components/workspace-content.tsx` may read server services directly, while client controls such as `src/components/auth-control.tsx` use better-auth client methods or HTTP endpoints.
`worker.ts` currently delegates HTTP to OpenNext and leaves real scheduled billing and media queue processing for future integrations.

## Module system

The current code uses responsibility-based files in `src/lib/`, not a formal plugin loader or `src/modules/` directory.
`src/lib/config.ts` exports site choices; library functions take `Env`, a D1 handle, or an adapter as input, so business operations can be reused by HTTP handlers and Worker events.
App Router endpoints own request parsing, session and origin checks, HTTP status, and response serialization; library functions own reusable decisions and persistence.
`src/lib/auth.ts` composes better-auth, `src/lib/invites.ts` and `src/lib/ledger.ts` around signup eligibility, while `src/lib/email.ts` demonstrates a provider interface selected from site configuration.
Presentation composition lives in `src/components/`, and external vendor response shapes can be translated inside future video or checkout adapters before reaching those components.
A new capability can be a new `src/lib/` service called by an API endpoint, a server-rendered page, or a Worker event; the existing file layout is an example of responsibilities, not a naming restriction.

## Key design patterns

### Configuration and localization

`site/site.config.ts` supplies brand, locale, deploy, email, and signup-credit choices at build time, while `wrangler.jsonc` declares matching live resources.
`scripts/site-check.ts` compares the Worker name, D1/R2/Queue names, auth shape, email binding, callback origin, and required secret names before publication.
`site/messages/en.ts` and `site/messages/zh.ts` share keys under `nav`, `hero`, `dashboard`, and `credits`; `src/app/[locale]/` and `src/components/language-control.tsx` select copy without duplicating business logic.
`site/theme.config.ts` becomes CSS variables in `src/app/layout.tsx`, and `src/app/globals.css` applies them across marketing and workspace surfaces.

### Authentication and eligibility

`src/lib/auth.ts` constructs better-auth using request-time `SITE_URL`, the Worker D1, and the enabled email/Google/GitHub methods from `site/auth.config.ts`.
On each request, production login accepts the Worker `SITE_URL` only when it equals `site.url` from `site/site.config.ts`; a mismatch refuses login rather than creating a session on another origin.
`src/app/api/auth/[...all]/route.ts` wraps signup with invite validation and optional sign-in Turnstile verification before delegating to better-auth.
`ensureSignupCredits` checks invitation eligibility and grants a signup lot with the user ID as its stable source ID; when email verification is enabled, it waits until the emailed link marks the account verified.
`src/app/api/invites/redeem/route.ts` validates the session and request origin, redeems the code through an atomic D1 batch, and grants the eligible user credits.
`src/components/auth-control.tsx` presents only configured methods and, when `email.passwordReset` is on, one forgot-password path whose link is sent by `sendResetPassword` through `EmailProvider`; `src/components/verify-email.tsx` provides the verification waiting and resend page; `src/components/reset-password.tsx` accepts the new password; desktop handoff uses `src/lib/desktop-auth.ts` to validate a configured app scheme before `/api/auth/desktop-handoff` issues a session-bearing return URL.

### Credits, tasks, and provider seams

`src/lib/ledger.ts` writes `credit_lot`, `credit_entry`, `credit_alloc`, and `video_task` with D1's own `prepare().bind()` statements and `batch()` for multi-step writes, preserving atomic reservations under concurrent requests.
Grant source IDs, entry idempotency keys, and task state transitions make retries observable; `grantSubscriptionMonth` supplies a monthly grant primitive without a connected billing scheduler.
`src/lib/email.ts` chooses Cloudflare Email or Resend behind `EmailProvider`, and `src/lib/notifications.ts` composes messages independently of delivery.

### Current state and extension paths

The existing homepage, dashboard, and credit history are a preview; `src/lib/mock-services.ts` produces neither generated media nor a paid checkout.
For video, page parameters flow from a generation-tool component to an authenticated API that checks identity, input, options, and credit cost before `src/lib/ledger.ts` reserves the task and credits.
An upstream adapter submits the work, the queue processing in `worker.ts` observes progress and updates task status, and a status endpoint lets the client follow that progress.
On success, the service stores the result in the site's `MEDIA` binding and returns an authorized preview or download; on failure, it reconciles task state and the ledger idempotently according to the site's credit policy.
For payments, site plans flow from pricing UI through a checkout API to a checkout adapter; a verified provider callback translates payment and subscription events into stable, idempotent grants in the same `src/lib/ledger.ts`.
Vendor-specific request and callback formats stay in adapters, while the page, task, and ledger contracts describe this application's behavior.

## How to add new logic

| Change | Start here, then connect |
| --- | --- |
| Change copy or switches | Edit `site/messages/en.ts` and `site/messages/zh.ts` together for text, or `site/site.config.ts` and `site/auth.config.ts` for site choices; connect new switches to their `src/components/` view, `src/lib/` or `src/app/api/` server gate, and `scripts/site-check.ts` when bindings change. |
| Add a page section | Compose it from `src/components/home-content.tsx` or a new component under `src/components/`; supply localized content from `site/messages/`, tokens from `site/theme.config.ts` and `src/app/globals.css`, and a route under `src/app/` when it needs its own page. |
| Add a sign-in method | Extend `site/auth.config.ts`, the method selection in `src/lib/auth.ts`, the card in `src/components/auth-control.tsx`, and the callback or guard in `src/app/api/auth/[...all]/route.ts`; declare credentials in `src/lib/env.ts`, `wrangler.jsonc`, and `scripts/site-check.ts`, with auth tests under `test/`. |
| Add a table | Add the next SQL file in `migrations/`, then update `src/lib/auth-schema.ts` for better-auth tables or native D1 queries and types in the owning `src/lib/` service; expose user-scoped reads through `src/app/` and test the migration and operation. |
| Add an upstream | Put provider-specific calls and response mapping behind an adapter in `src/lib/`; connect it through a validated `src/app/api/` endpoint and, for long-running work, `worker.ts`, `src/lib/ledger.ts`, and a progress-aware component; add its Worker secret names to `src/lib/env.ts`, `wrangler.jsonc`, and `scripts/site-check.ts`. |
| Replicate a site | Use `fixtures/second-site/` as the shape example, then create the new `site/` choices and matching `wrangler.jsonc`, provision that site's D1, R2, Queue, hostname, and secrets, apply `migrations/` to its D1, and run `pnpm site-check` against the new site. |

Changes to these paths receive focused tests in `test/` and the verification commands documented in `README.md`.

## Database schema

`migrations/0001_initial.sql` defines the auth and ledger foundation, while `migrations/0002_invite_codes.sql` adds optional invitation state.

| Table | Core columns and relationships | Owner and use |
| --- | --- | --- |
| `user` | Unique `email`, identity and profile fields | better-auth account identity via `src/lib/auth-schema.ts`. |
| `session` | Unique token, expiry, `user_id` cascading to `user` | better-auth session lookup. |
| `account` | Provider/account IDs, tokens or password, `user_id` | Email and OAuth credentials. |
| `verification` | Identifier, verification value, expiry | better-auth verification state. |
| `credit_lot` | `user_id`, unique `(source, source_id)`, granted/remaining, expiry | Balance, credit provenance, and expiration. |
| `credit_entry` | `user_id`, kind, amount, requested/ref ID, unique `idem_key` | Auditable grant, consume, refund, and adjustment events. |
| `credit_alloc` | `(entry_id, lot_id)` primary key and allocated amount | Tracks which lots fund a spend or receive a refund. |
| `video_task` | `user_id`, cost, status, unique consume entry | Durable reservation and processing state. |
| `invite_code` | Code, use limit/count, expiry, soft-delete timestamp | Invitation capacity and administration. |
| `invite_redemption` | One `user_id`, referenced code, creation time | Eligibility record for signup credits and access. |

`src/lib/auth.ts` uses Drizzle's D1 adapter for the four auth tables, while `src/lib/ledger.ts` and `src/lib/invites.ts` use prepared native D1 statements and batches for write-side invariants.
`src/lib/credit-history.ts` limits history reads to 100 lots for the signed-in user, and `src/app/api/credits/balance/route.ts` validates the session and invite gate before reading a balance.
Schema changes gain a new reviewed migration and matching service/query types and tests; a site applies those migrations to its own D1 before depending on the new shape.

## Configuration items

### Site configuration compiled into the app

| Location and item | Current role |
| --- | --- |
| `site/site.config.ts`: `brand` | Site title and notification brand. |
| `previewOnly` | Controls robots metadata and `robots.txt` indexing behavior. |
| `apex`, `url` | Canonical host and absolute base URL for authentication, callbacks, links, metadata, and site-check. |
| `locales`, `defaultLocale` | Available locale routes and selector values, plus default homepage and document language. |
| `deploy.worker`, `deploy.d1`, `deploy.r2`, `deploy.queue` | Expected per-site Worker, D1, R2, and Queue names compared with Wrangler. |
| `email.provider`, `email.from` | Selects the email adapter and sender address. |
| `signupCredits` | Amount granted once to an eligible new account. |
| `site/auth.config.ts`: `backend`, `basePath` | Current better-auth selection and `/api/auth` routing contract. |
| `email.enabled`, `email.requireVerification`, `email.passwordReset`, `google.enabled`, `github.enabled` | Independently enable sign-in options; email verification delays the session and signup credits until the emailed link is opened, password reset shows one forgot-password path and sends through `EmailProvider` only when that switch is on, and OAuth options require matching Worker secrets. |
| `google.oneTapEnabled` | Adds the One Tap plugin and client prompt when Google login is enabled. |
| `invite.required`, `invite.adminEmails` | Gate account credit access and authorize invitation administration; enabling the gate uses migration `0002_invite_codes.sql`. |
| `desktop.schemes` | Allow-listed app URL schemes for signed-in desktop handoff. |
| `turnstile.onSignIn` | Applies Turnstile verification to sign-in requests supplied with a client token. |
| `site/database.config.ts`: `binding`, `migrationsDir` | Site D1 binding name and migration directory. |
| `site/theme.config.ts`: `background`, `surface`, `foreground`, `muted`, `accent`, `border`, `font` | CSS values used for page, surface, text, accent, line, and typography tokens. |
| `site/messages/en.ts`, `zh.ts`: `nav`, `hero`, `dashboard`, `credits` | Same-shape localized strings consumed by navigation and content views. |

### Worker, build, and request-time configuration

| Location and item | Role |
| --- | --- |
| `wrangler.jsonc`: `name`, `main` | Worker name and `worker.ts` entry point. |
| `compatibility_date`, `compatibility_flags` | Cloudflare runtime behavior and Node compatibility. |
| `assets.directory`, `assets.binding` | Generated OpenNext assets and their `ASSETS` binding. |
| `d1_databases[].binding`, `database_name`, `database_id`, `migrations_dir` | D1 binding, owned database identity, and migration location. |
| `r2_buckets[].binding`, `bucket_name` | Media binding and bucket identity. |
| `queues.producers[]`, `queues.consumers[]` | Job submission binding and delivery to the Worker queue handler. |
| `send_email[].name` | Cloudflare Email binding. |
| `routes[].pattern`, `routes[].custom_domain` | Site hostname and custom-domain routing. |
| `triggers.crons` | Schedule sent to `worker.ts`'s `scheduled` handler. |
| `secrets.required`, `vars.SITE_URL` | Required secret names and request-time canonical auth base URL. |
| `next.config.ts`, `open-next.config.ts` | Next.js tracing root and OpenNext's Cloudflare build settings. |
| `tsconfig.json` | Strict compilation and `@/` and `@site/` import aliases. |

`src/lib/env.ts` types the values actually available to Worker code:

| Env item | Runtime role |
| --- | --- |
| `DB`, `MEDIA`, `JOBS`, `EMAIL` | D1 account and credit data, media storage, background queue, and Cloudflare Email delivery. |
| `SITE_URL`, `BETTER_AUTH_SECRET` | Better-auth base URL and signing secret. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google login and optional One Tap credentials. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub login credentials when selected. |
| `TURNSTILE_SECRET` | Server-side verification when the sign-in gate is selected. |
| `RESEND_API_KEY` | Resend mail delivery when selected. |
| `LOCAL_AUTH_TEST` | Explicit loopback-only local authentication test mode. |

The `site/` TypeScript values are included in a build, while Worker variables and secrets are read when a request runs.
A site-choice change is published with a new build, and a runtime-secret change uses the Worker environment contract.
`fixtures/second-site/` demonstrates different names, URL, email provider, and auth choices while reusing the same application modules.

## Critical Rules

1. **Preserve the site boundary:** site-specific identity, copy, switches, theme, and resource names live in `site/`, with corresponding UI, server, and site-check behavior when the contract grows.
2. **Keep credentials on the server:** Worker bindings and secrets resolve through `src/lib/env.ts`, while committed site configuration describes choices rather than credential values.
3. **Keep authorization at entry points:** routes and Worker handlers establish identity, user scope, and request origin before invoking account, credit, invite, or media operations.
4. **Keep provider formats at adapter seams:** UI and ledger operations speak application task, email, or payment concepts so future providers and billing policies can change independently.
5. **Protect credit invariants:** use native D1 prepared statements and atomic batches for multi-statement ledger effects, stable event keys for retries, and concurrent tests for spend and refunds.
6. **Evolve storage coherently:** migrations, auth mappings or native D1 queries, API contracts, and tests describe the same schema for each site.
7. **Represent capability honestly:** mocks remain preview stand-ins; live video or checkout work includes actual endpoints, adapters, processing, and end-to-end checks.
8. **Verify before handoff:** run `pnpm test`, `pnpm typecheck`, `pnpm cf:build`, and `pnpm site-check`, then follow `README.md` for any relevant live flow.
9. **Keep this guide synchronized:** whenever the stack, module roles, commands, architecture, patterns, extension flow, schema, configuration, or these working rules change, update this file in the same change.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Point to the authoritative file or command for details already visible in the codebase.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

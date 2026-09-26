# Project architecture guide

This repository is a replicable AI video site template; the current reference site is one configured example.
A new site changes `site/`, provisions its own D1 and other Worker resources, supplies its own secrets, and keeps sharing the application layers in `src/`.
The current example has site-local accounts, invitation primitives, configurable account rewards, a credit ledger, mail adapters, and a Waffo checkout adapter; video generation remains a placeholder in `src/lib/mock-services.ts`.
`README.md` records the reference site's live state and verification procedure.

## Design principles

- **Configuration decides what appears:** `site/` describes the site's identity, features, copy, and theme; the UI reflects enabled choices and the server enforces the same choices. The landing video tool is a client-only request preview, not a generation or credit operation.
- **One language per file:** `site/messages/en.ts` and `site/messages/zh.ts` keep corresponding keys, and locale-aware pages select one message set at a time.
- **One navigation path per purpose:** the navigation has one language control and one sign-in entry; its sign-in card lists only the methods enabled in `site/auth.config.ts`.
- **Theme owns color:** `site/theme.config.ts` defines paired light/dark palettes, top-bar and account-card chrome, row tones, default modes, and account accents; `src/lib/theme-tokens.ts` generates the stylesheet in `src/app/layout.tsx`.
  The homepage defaults dark and other pages light, while the homepage control selects the mode on `<html>`; legacy CSS surfaces still await migration.
- **Pages compose sections:** `src/components/sections/HomePage.tsx` orders eight homepage sections. `Header` mounts the configurable replica-style navigation; six sections remain empty scaffolds, and the video tool renders its existing implementation.
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
| UI | `src/components/`, React server/client components, CSS, Motion, Lucide and React Icons | Homepage and workspace composition, configurable homepage navigation, signed-in account cards, sign-in, invitation, language, and desktop interaction. |
| Authentication | `src/lib/auth.ts`, `src/lib/auth-schema.ts`, better-auth, Drizzle on D1 | Sessions and accounts from this site's DB; enabled methods from `site/auth.config.ts`. |
| Access control | `src/lib/invites.ts`, `src/lib/turnstile.ts`, `src/lib/desktop-auth.ts`, D1 and Turnstile HTTP API | Invitation eligibility, optional sign-in verification, and allow-listed app handoff. |
| Credits | `src/lib/ledger.ts`, `src/lib/credit-history.ts`, native D1 statements and batches | Atomic grants, reservations, allocation, refund, balance, and bounded account history. |
| Email | `src/lib/email.ts`, `src/lib/notifications.ts`, Cloudflare Email or Resend | One `EmailProvider` interface for message delivery and application notification copy. |
| Video and payments | `src/components/video-tool/`, `src/lib/mock-services.ts`, `src/lib/waffo.ts`, `src/lib/payments.ts`, `src/lib/ledger.ts`, `video_task` | The landing tool previews a create payload from site config. Checkout calls the Waffo adapter, and a verified callback grants through the ledger. |
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
├── next.config.ts                    # Tracing root and local Cloudflare context for next dev
├── open-next.config.ts               # OpenNext Cloudflare build configuration
├── tsconfig.json                     # Strict TS settings and @/ / @site/ aliases
├── worker.ts                         # OpenNext fetch plus scheduled and queue event entry points
├── wrangler.jsonc                    # Site Worker, resource bindings, route, cron, vars, secret names
├── migrations/                       # Versioned SQL applied to this site's D1
│   ├── 0001_initial.sql             # Auth, credit ledger, and video task tables
│   ├── 0002_invite_codes.sql        # Invitation inventory and redemption tables
│   └── 0003_account_rewards.sql     # Check-ins, shares, referral codes and claims
├── scripts/
│   └── site-check.ts                 # Cross-checks site choices, bindings, auth switches, secrets
├── fixtures/second-site/             # Configuration-only reuse example
│   ├── site/site.config.ts           # Alternate identity, resources, and mail adapter
│   ├── site/auth.config.ts           # Alternate auth and verification switches
│   ├── site/video-tool.config.ts     # Alternate tool structure, without a promo
│   └── wrangler.jsonc                # Alternate Worker binding declarations
├── public/video-tool/                 # Site-local model icons, preview video, and template images
├── site/                              # Per-site choices compiled into the application
│   ├── site.config.ts                # Brand, URL, resources, email, signup and account rewards
│   ├── auth.config.ts                # Login methods, invitations, desktop schemes, Turnstile
│   ├── database.config.ts            # D1 binding and migration directory
│   ├── theme.config.ts               # Light/dark palettes, mode defaults, accent tones and font
│   ├── video-tool.config.ts          # Landing tool structure, models, references, preview assets
│   ├── video-tool-templates.config.ts # Image template ids and asset paths
│   └── messages/                     # Locale-specific copy with matching message keys
│       ├── en.ts                     # English navigation, hero, video tool, dashboard, credits copy
│       ├── zh.ts                     # Chinese copy with the same shape
│       ├── video-templates-en.ts     # English image-template titles and descriptions
│       ├── video-templates-zh.ts     # Chinese image-template titles and descriptions
│       └── index.ts                  # Locale-to-message map
├── src/                               # Application routes, presentation, and services
│   ├── app/                          # Next.js App Router pages and API handlers
│   │   ├── layout.tsx                # Metadata, preview indexing, and theme token stylesheet
│   │   ├── globals.css               # Shared responsive layout and token-consuming styles
│   │   ├── page.tsx                  # Default-locale homepage
│   │   ├── robots.ts                 # Preview indexing policy and sitemap reference
│   │   ├── sitemap.ts                # Locale-aware homepage URLs and alternates
│   │   ├── [locale]/                 # Locale-aware marketing and workspace routes
│   │   │   ├── page.tsx              # Localized homepage composition
│   │   │   ├── dashboard/page.tsx    # Account summary route
│   │   │   ├── credits/page.tsx      # Credit balance and grant history route
│   │   │   ├── pricing/page.tsx      # Plan list and checkout start
│   │   │   └── reset-password/page.tsx # Password reset form for an emailed token
│   │   ├── admin/invites/page.tsx    # Session- and allow-list-gated invite administration
│   │   ├── auth-callback/page.tsx    # Signed-in desktop return page
│   │   └── api/                      # HTTP boundary for auth and account operations
│   │       ├── auth/[...all]/route.ts         # Better-auth handler with invite/Turnstile checks
│   │       ├── auth/desktop-handoff/route.ts # Same-origin session-token handoff
│   │       ├── account/activity/route.ts     # Signed-in reward state and actions
│   │       ├── checkout/route.ts             # Signed-in checkout handoff to the Waffo adapter
│   │       ├── webhooks/payment/route.ts     # Verified payment callback
│   │       ├── credits/balance/route.ts      # Session-scoped balance endpoint
│   │       ├── invites/route.ts              # Invite admin list, create, revoke
│   │       ├── invites/validate/route.ts     # Code validity check
│   │       └── invites/redeem/route.ts       # Session-scoped redemption and signup grant
│   ├── components/                   # UI composition and client controls
│   │   ├── home-content.tsx          # Session-aware homepage entry, existing nav, and section composition
│   │   ├── blocks/replica-navigation.tsx # Configurable homepage bar, language, theme and mobile links
│   │   ├── blocks/account-popovers.tsx   # Signed-in account/credit menu data, actions and dialogs
│   │   ├── blocks/account-popover-card.tsx # Shared ordered-row popover shell and row presentation
│   │   ├── blocks/account-popover-state.ts # Pure seven-day streak presentation
│   │   ├── sections/                 # Ordered homepage sections; Header mounts navigation, tool mounts workbench
│   │   ├── video-tool/               # Bound copy, scoped presentation, interaction state, pure selectors
│   │   ├── pricing-content.tsx       # Server-rendered plan list
│   │   ├── pricing-checkout.tsx      # Client checkout request for a selected plan
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
│       ├── config.ts                 # Exports site, auth, theme, messages, database, and video-tool choices
│       ├── theme-tokens.ts           # Generated mode-aware CSS tokens from site theme
│       ├── env.ts                    # Worker binding and secret types plus context accessor
│       ├── auth-schema.ts            # Drizzle mapping for better-auth D1 tables
│       ├── auth.ts                   # Better-auth construction, origin checks, signup grant
│       ├── invites.ts                # Invite eligibility, validation, redemption, admin match
│       ├── ledger.ts                 # Atomic credit lots, entries, task transitions, refunds
│       ├── credit-history.ts         # Bounded user credit-lot query
│       ├── account-rewards.ts        # Check-in/referral grants and pending share state
│       ├── turnstile.ts              # Token verification and local test path
│       ├── desktop-auth.ts           # Scheme validation and token-bearing app URL
│       ├── email.ts                  # Cloudflare/Resend adapter and fake test provider
│       ├── notifications.ts          # Typed event notification messages
│       ├── waffo.ts                   # Waffo Pancake checkout and callback format
│       ├── payments.ts                # Plan checkout and idempotent payment grants
│       └── mock-services.ts           # Local-only video placeholder
└── test/                              # Miniflare D1, auth, mail, config, and ledger tests
    ├── account-rewards.test.ts       # Reward persistence, concurrency and user scope
    ├── account-popover-state.test.ts # Seven-day completion and next UTC claim
    ├── account-popover-card.test.ts  # Row badge, divider, box and ordered card rendering
    ├── auth-integration.test.ts      # Local better-auth signup and idempotent credits
    ├── auth-options.test.ts          # Provider switches, invites, desktop handoff
    ├── password-reset.test.ts        # Reset switch, mailed link, and reset page
    ├── config-email-auth.test.ts     # Second-site wiring, mail adapters, Turnstile
    ├── credit-history.test.ts       # Signed-in and bounded account credit reads
    ├── ledger.test.ts               # Concurrent spend, refunds, and monthly grants
    ├── home-sections.test.ts        # Homepage section scaffold order and stable ids
    ├── theme-guards.test.ts         # Palette parity, legacy literal baseline, duplicate-selector guard
    ├── payments.test.ts             # Waffo signature, one-time grant, monthly grant, and replay
    └── video-tool.test.ts           # Tool helpers and locale copy shape
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

`site/site.config.ts` supplies brand, optional logo, locale, deploy, email, and signup-credit choices at build time, while `wrangler.jsonc` declares matching live resources.
`scripts/site-check.ts` compares the Worker name, D1/R2/Queue names, auth shape, email binding, callback origin, and required secret names before publication.
`site/messages/en.ts` and `site/messages/zh.ts` share keys under `nav`, `hero`, `videoTool`, `account`, `dashboard`, and `credits`; `src/app/[locale]/` and `src/components/language-control.tsx` select copy without duplicating business logic.
`site/theme.config.ts` provides same-key light and dark palettes, paired top-bar/account-card chrome and row tones, mode defaults, and account colors; `src/lib/theme-tokens.ts` generates the CSS token stylesheet in `src/app/layout.tsx` instead of inline body styles.
The homepage header marks the dark default, while `ReplicaNavigation` selects `data-mode` on `<html>` for toggling; other pages default light.
`src/app/globals.css` applies the tokens across marketing and workspace surfaces, and `.auth-panel` sets foreground with its surface background.

### Authentication and eligibility

`src/lib/auth.ts` constructs better-auth using request-time `SITE_URL`, the Worker D1, and the enabled email/Google/GitHub methods from `site/auth.config.ts`.
On each request, production login accepts the Worker `SITE_URL` only when it equals `site.url` from `site/site.config.ts`; a mismatch refuses login rather than creating a session on another origin.
`src/app/api/auth/[...all]/route.ts` wraps signup with invite validation and optional sign-in Turnstile verification before delegating to better-auth.
`ensureSignupCredits` checks invitation eligibility and grants a signup lot with the user ID as its stable source ID; when email verification is enabled, it waits until the emailed link marks the account verified.
`src/app/api/invites/redeem/route.ts` validates the session and request origin, redeems the code through an atomic D1 batch, and grants the eligible user credits.
`src/components/auth-control.tsx` presents only configured methods and, when `email.passwordReset` is on, one forgot-password path whose link is sent by `sendResetPassword` through `EmailProvider`; `src/components/verify-email.tsx` provides the verification waiting and resend page; `src/components/reset-password.tsx` accepts the new password; desktop handoff uses `src/lib/desktop-auth.ts` to validate a configured app scheme before `/api/auth/desktop-handoff` issues a session-bearing return URL.

### Credits, tasks, and provider seams

`src/lib/ledger.ts` writes `credit_lot`, `credit_entry`, `credit_alloc`, and `video_task` with D1's own `prepare().bind()` statements and `batch()` for multi-step writes, preserving atomic reservations under concurrent requests.
Grant source IDs, entry idempotency keys, and task state transitions make retries observable. A verified annual payment calls `grantSubscriptionMonth` for the current calendar month only. There is no separate billing scheduler.
`src/lib/email.ts` chooses Cloudflare Email or Resend behind `EmailProvider`, and `src/lib/notifications.ts` composes messages independently of delivery.

### Current state and extension paths

The homepage account popovers read the signed-in balance and profile and expose configured check-ins, referral sharing and a masked real-data leaderboard, pending share submissions, support links, plans and payment receipts.
`src/components/blocks/account-popover-card.tsx` renders both menus from ordered rows with optional badges, one named tone, and per-row dividers; their distinct balance/buy and profile headers and all row actions remain in `account-popovers.tsx`.
`replica-navigation.css` owns the shared popover shell for language and account menus; `account-popovers.css` owns account-card content, while paired chrome tokens keep the light and dark surfaces synchronized.
`docs/research/account-popovers/components/source-spec.md` records source-observed desktop/mobile metrics and click-state evidence; the implementation uses local site copy and capabilities rather than the reference site's product claims.
Receipts reflect settled credit ledger grants, not tax invoices; share submissions do not award credits until reviewed.
The existing homepage, dashboard, and credit history are a preview; `src/lib/mock-services.ts` produces no generated media.
`src/components/home-content.tsx` passes the signed-in name to `src/components/sections/HomePage.tsx`, which orders Header, VideoHero, VideoToolSection, VideoShowcase, VideoFeatures, VideoPricing, VideoFAQ, and Footer.
`Header` passes localized brand, optional site logo, links, language choices, real signed-in credits and account controls to `blocks/replica-navigation.tsx`; pricing and workspace still use `MarketingNav`.
The six non-header, non-tool sections remain empty sections with stable ids.
`sections/VideoToolSection.tsx` mounts the existing `src/components/video-tool/video-tool-section.tsx` without altering its behavior.
`bind-copy.ts` localizes links and assembles asset copy, then `video-tool-section.tsx` passes props and shows the create-payload preview.
`video-generation-tool.tsx` composes the dark workbench from `composer.tsx` and `stage.tsx`.
`use-video-tool-state.ts` owns interactive state and calls pure selectors in `state.ts`; `model-menu.tsx` and `parameter-field.tsx` accept only their scoped presentation data.
Media, workflows and their reference limits, grouped models and duration-specific preview costs, and media-filtered use cases come from that config.
The image-template list lives in `site/video-tool-templates.config.ts`, localized titles in `site/messages/video-templates-*.ts`, and the referenced local media in `public/video-tool/`.
The model menu shows only the selected workflow's compatible models, and optional workflow defaults reset fields and quantities when switching.
Parameter fields stay behind a summary of the current values until the summary is opened, and a duration control only offers the selected model's numeric stops.
The site config also sets each field's presentation and order and each model's options, stops, and optional defaults; expanded controls scroll within the editor above its anchored summary and actions without covering the prompt.
Frame-pair workflows name start and end references in the preview payload.
That preview does not upload files, call a generation API, or write the ledger.
`fixtures/second-site/site/video-tool.config.ts` repeats the same structure without a promo and has no message file.
The workbench chrome stays with the component, so a shorter second-site catalog does not become a different layout.
When generation is connected, page parameters flow from that payload to an authenticated API that checks identity, input, options, and credit cost before `src/lib/ledger.ts` reserves the task and credits.
An upstream adapter submits the work, the queue processing in `worker.ts` observes progress and updates task status, and a status endpoint lets the client follow that progress.
On success, the service stores the result in the site's `MEDIA` binding and returns an authorized preview or download; on failure, it reconciles task state and the ledger idempotently according to the site's credit policy.
Site plans in `site/site.config.ts` flow from the pricing page through `POST /api/checkout` to `src/lib/waffo.ts`. That route accepts a signed-in user, then the adapter opens a Waffo Pancake checkout for the existing product id with `@waffo/pancake-ts`. `POST /api/webhooks/payment` verifies `X-Waffo-Signature` with that SDK before `src/lib/payments.ts` writes a one-time grant or the current subscription month in `src/lib/ledger.ts`. A one-time purchase grants once. Replaying the same payment or the same month does not grant again. Coupons are the only promotion. The product id, merchant id, request signing key, and callback public key are Worker secrets.
Vendor-specific request and callback formats stay in adapters, while the page, task, and ledger contracts describe this application's behavior.

## How to add new logic

| Change | Start here, then connect |
| --- | --- |
| Change copy or switches | Edit `site/messages/en.ts` and `site/messages/zh.ts` together for text, or `site/site.config.ts` and `site/auth.config.ts` for site choices; connect new switches to their `src/components/` view, `src/lib/` or `src/app/api/` server gate, and `scripts/site-check.ts` when bindings change. |
| Add a page section | Implement or extend a section in `src/components/sections/` and compose it from `HomePage.tsx`; supply localized content from `site/messages/`, tokens from `site/theme.config.ts` and `src/app/globals.css`, and a route under `src/app/` when it needs its own page. The homepage navigation is in `Header.tsx` and `src/components/blocks/replica-navigation.tsx`. |
| Add a sign-in method | Extend `site/auth.config.ts`, the method selection in `src/lib/auth.ts`, the card in `src/components/auth-control.tsx`, and the callback or guard in `src/app/api/auth/[...all]/route.ts`; declare credentials in `src/lib/env.ts`, `wrangler.jsonc`, and `scripts/site-check.ts`, with auth tests under `test/`. |
| Add a table | Add the next SQL file in `migrations/`, then update `src/lib/auth-schema.ts` for better-auth tables or native D1 queries and types in the owning `src/lib/` service; expose user-scoped reads through `src/app/` and test the migration and operation. |
| Add an upstream | Put provider-specific calls and response mapping behind an adapter in `src/lib/`; connect it through a validated `src/app/api/` endpoint and, for long-running work, `worker.ts`, `src/lib/ledger.ts`, and a progress-aware component; add its Worker secret names to `src/lib/env.ts`, `wrangler.jsonc`, and `scripts/site-check.ts`. |
| Replicate a site | Use `fixtures/second-site/` as the shape example, then create the new `site/` choices and matching `wrangler.jsonc`, provision that site's D1, R2, Queue, hostname, and secrets, apply `migrations/` to its D1, and run `pnpm site-check` against the new site. |

Changes to these paths receive focused tests in `test/` and the verification commands documented in `README.md`.

## Database schema

`migrations/0001_initial.sql` defines the auth and ledger foundation, `migrations/0002_invite_codes.sql` adds optional invitation state, and `migrations/0003_account_rewards.sql` stores account rewards.

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
| `account_checkin` | `(user_id, day)` unique | UTC daily credit claims. |
| `account_share` | User, public URL, review status | Pending public share submissions, no automatic grant. |
| `account_referral_code`, `account_referral` | Opaque user code and one claim per referred user | Idempotent referral grants. |

`src/lib/auth.ts` uses Drizzle's D1 adapter for the four auth tables, while `src/lib/ledger.ts` and `src/lib/invites.ts` use prepared native D1 statements and batches for write-side invariants.
`src/lib/account-rewards.ts` scopes reward reads and writes by user and grants check-in/referral credits through the ledger.
`src/lib/credit-history.ts` limits history reads to 100 lots for the signed-in user, and `src/app/api/credits/balance/route.ts` validates the session and invite gate before reading a balance.
Schema changes gain a new reviewed migration and matching service/query types and tests; a site applies those migrations to its own D1 before depending on the new shape.

## Configuration items

### Site configuration compiled into the app

| Location and item | Current role |
| --- | --- |
| `site/site.config.ts`: `brand`, optional `logo` | Site title and notification brand, plus optional homepage navigation logo image and alt text. |
| `previewOnly` | Controls robots metadata and `robots.txt` indexing behavior. |
| `apex`, `url` | Canonical host and absolute base URL for authentication, callbacks, links, metadata, and site-check. |
| `locales`, `defaultLocale` | Available locale routes and selector values, plus default homepage and document language. |
| `deploy.worker`, `deploy.d1`, `deploy.r2`, `deploy.queue` | Expected per-site Worker, D1, R2, and Queue names compared with Wrangler. |
| `email.provider`, `email.from` | Selects the email adapter and sender address. |
| `signupCredits` | Amount granted once to an eligible new account. |
| `account` | Reward switches/amounts, submission cap, contact addresses, commercial-use link, icon and share-network choices. |
| `plans` | One-time and annual plan id, price, currency, and credit amount. |
| `site/auth.config.ts`: `backend`, `basePath` | Current better-auth selection and `/api/auth` routing contract. |
| `email.enabled`, `email.requireVerification`, `email.passwordReset`, `google.enabled`, `github.enabled` | Independently enable sign-in options; email verification delays the session and signup credits until the emailed link is opened, password reset shows one forgot-password path and sends through `EmailProvider` only when that switch is on, and OAuth options require matching Worker secrets. |
| `google.oneTapEnabled` | Adds the One Tap plugin and client prompt when Google login is enabled. |
| `invite.required`, `invite.adminEmails` | Gate account credit access and authorize invitation administration; enabling the gate uses migration `0002_invite_codes.sql`. |
| `desktop.schemes` | Allow-listed app URL schemes for signed-in desktop handoff. |
| `turnstile.onSignIn` | Applies Turnstile verification to sign-in requests supplied with a client token. |
| `site/database.config.ts`: `binding`, `migrationsDir` | Site D1 binding name and migration directory. |
| `site/theme.config.ts`: `light`, `dark`, `chrome`, `rowTones`, `defaultMode`, `font`, `account`, `tones` | Paired semantic palettes and navigation/account-card chrome, row tones, homepage/other-page defaults, and account accents emitted through `src/lib/theme-tokens.ts`. |
| `site/video-tool.config.ts` | Landing tool media, workflows, models, fields, references, assets, and optional promo. |
| `site/messages/en.ts`, `zh.ts`: `nav`, `hero`, `videoTool`, `account`, `dashboard`, `credits` | Same-shape localized strings consumed by navigation, the video tool, and content views. |

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
| `next.config.ts`, `open-next.config.ts` | Next.js tracing root, local Cloudflare context for `next dev` (optionally using an uncommitted `NEXT_DEV_WRANGLER_CONFIG`), and OpenNext's Cloudflare build settings. |
| `tsconfig.json` | Strict compilation and `@/` and `@site/` import aliases. |

`src/lib/env.ts` types the values actually available to Worker code:

| Env item | Runtime role |
| --- | --- |
| `DB`, `MEDIA`, `JOBS`, `EMAIL` | D1 account and credit data, media storage, background queue, and Cloudflare Email delivery. |
| `SITE_URL`, `BETTER_AUTH_SECRET` | Better-auth base URL and signing secret. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google login and optional One Tap credentials. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub login credentials when selected. |
| `TURNSTILE_SECRET` | Server-side verification when the sign-in gate is selected. |
| `WAFFO_MERCHANT_ID`, `WAFFO_PRIVATE_KEY` | Waffo Pancake request authentication. The private key signs checkout calls. |
| `WAFFO_PRODUCT_ID` | Existing Pancake product id sent to authenticated checkout. |
| `WAFFO_CALLBACK_PUBLIC_KEY` | PEM public key the Pancake SDK uses to verify `X-Waffo-Signature`. |
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
8. **Verify before handoff:** run `pnpm test`, `pnpm typecheck`, `pnpm cf:build`, and `pnpm site-check`, then follow `README.md` for any relevant live flow. The landing tool also needs `pnpm site-check fixtures/second-site`.
9. **Keep this guide synchronized:** whenever the stack, module roles, commands, architecture, patterns, extension flow, schema, configuration, or these working rules change, update this file in the same change.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Point to the authoritative file or command for details already visible in the codebase.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

# Project architecture guide

This repository is a replicable AI video site template; the current reference site is one configured example.
A new site changes `site/`, provisions its own D1 and other Worker resources, supplies its own secrets, and keeps sharing the application layers in `src/`.
The current example has site-local accounts, invitation primitives, configurable account rewards, a credit ledger, mail adapters, and a Waffo checkout adapter; video generation remains a placeholder in `src/lib/mock-services.ts`.
`README.md` records the reference site's live state and verification procedure.

## Design principles

- **Configuration decides what appears:** `site/` describes the site's identity, features, copy, and theme; the UI reflects enabled choices and the server enforces the same choices. The landing video tool is a client-only request preview, not a generation or credit operation.
- **One language per file:** `site/messages/en.ts` and `site/messages/zh.ts` compose matching per-module message files in `site/messages/en/` and `site/messages/zh/`; locale-aware pages select one set at a time.
  `site/site.config.ts` owns language entries; `src/lib/routes.ts` owns server navigation metadata, while `src/lib/route-paths.ts` holds client-safe route paths.
- **One navigation path per purpose:** the navigation has one language control and one sign-in entry; its sign-in card lists only the methods enabled in `site/auth.config.ts`.
- **Theme owns color:** `site/theme.config.ts` defines paired light/dark palettes, top-bar and account-card chrome, dialog, video-tool and pricing surfaces, row tones, default modes, and account accents; `src/lib/theme-tokens.ts` generates the stylesheet in `src/app/layout.tsx`.
  `src/lib/theme-mode.ts` owns the root mode transitions; the layout freezes the first page's default and the shared header toggles the root mode without resetting it on client navigation, while legacy CSS surfaces still await migration.
- **Pages compose sections:** `src/components/sections/HomePage.tsx` orders six content sections; five remain empty scaffolds, and the video tool renders its existing implementation. `src/components/site-shell.tsx` owns one persistent header, footer, and shared Auth-4 login dialog for home, pricing, dashboard, and credits.
- **Long-running work is observable:** video generation uses an asynchronous task and progress flow, while the server validates costs and records credit movements in the ledger.

## Overall tech stack

- **Application:** Next.js 15 App Router, React 19, strict TypeScript, server components for account views, client components for interaction, and CSS variables for visual tokens.
- **Deployment:** OpenNext compiles the Next.js application into one Cloudflare Worker whose HTTP, scheduled, and queue events enter through `worker.ts`.
- **Persistence:** Cloudflare D1 stores better-auth identities, invitation records, video task state, and credit lots and entries; SQL migrations in `migrations/` define the schema.
- **Identity:** better-auth uses the Drizzle D1 adapter for its own tables, while invitation and ledger operations use native D1 statements where atomic batches matter.
- **Resources:** `wrangler.jsonc` declares this site's D1, R2 media bucket, Queue, email binding, hostname, preview URL switch, cron, environment variable, and required secret names.
- **Tooling:** Node 22, pnpm 10, Wrangler, Miniflare-backed Node tests, and TypeScript type checking; `package.json` owns the runnable scripts.

## Tech stack of each module

| Area | Files and technology | Contract |
| --- | --- | --- |
| Site configuration | `site/*.config.ts`, `site/messages/`, `src/lib/config.ts` | Compiled site choices and typed localized copy shared by routes and components. |
| Web and HTTP | `src/app/`, Next.js App Router | Pages, metadata, better-auth handler, and request/response endpoints. |
| UI | `src/components/`, React server/client components, CSS, Motion, Lucide and React Icons | Homepage and workspace composition, shared navigation, signed-in account cards, sign-in, invitation, language, and desktop interaction. |
| Authentication | `src/lib/auth.ts`, `src/lib/auth-schema.ts`, better-auth, Drizzle on D1 | Sessions and accounts from this site's DB; enabled methods from `site/auth.config.ts`. |
| Access control | `src/lib/request-context.ts`, `src/lib/invites.ts`, `src/lib/turnstile.ts`, `src/lib/desktop-auth.ts`, D1 and Turnstile HTTP API | Centralized request session, browser write guard, JSON parsing and account snapshot; invitation eligibility, optional sign-in verification, and allow-listed app handoff. |
| Credits | `src/lib/ledger.ts`, `src/lib/credit-history.ts`, native D1 statements and batches | Atomic grants, reservations, allocation, refund, balance, and bounded account history. |
| Email | `src/lib/email.ts`, `src/lib/notifications.ts`, Cloudflare Email or Resend | One `EmailProvider` interface for message delivery and application notification copy. |
| Video and payments | `src/components/video-tool/`, `src/lib/mock-services.ts`, `src/lib/waffo.ts`, `src/lib/waffo-products.ts`, `src/lib/payments.ts`, `src/lib/ledger.ts`, `video_task` | The landing tool previews a create payload from site config. Checkout selects a price- and period-matched test product from `WAFFO_PRODUCTS`; signed test callbacks must match before granting. |
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
│   ├── site/theme.config.ts          # Alternate theme
│   ├── site/messages/                # Independent localized copy
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
│       ├── en.ts, zh.ts              # Locale-specific message composition
│       ├── en/, zh/                  # Matching per-module navigation, sign-in, mail, invites, handoff, account, workspace, credits, pricing, video-tool copy
│       ├── video-templates-en.ts     # English image-template titles and descriptions
│       ├── video-templates-zh.ts     # Chinese image-template titles and descriptions
│       └── index.ts                  # Locale-to-message map
├── src/                               # Application routes, presentation, and services
│   ├── middleware.ts                 # Forwards route locale to the root layout
│   ├── app/                          # Next.js App Router pages and API handlers
│   │   ├── layout.tsx                # Request-locale html lang/metadata, preview indexing and theme tokens
│   │   ├── globals.css               # Shared responsive layout and token-consuming styles
│   │   ├── (site)/                   # Default-locale homepage, invite landing and shared-shell layout
│   │   ├── robots.ts                 # Preview indexing policy and sitemap reference
│   │   ├── sitemap.ts                # Locale-aware homepage URLs and alternates
│   │   ├── [locale]/                 # Locale-aware marketing, workspace, and auth pages
│   │   │   ├── (site)/               # Shared-shell layout; home, pricing, dashboard, credits and info pages
│   │   │   ├── verify-email/page.tsx # Centered verification panel outside shared shell
│   │   │   └── reset-password/page.tsx # Centered reset panel outside shared shell
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
│   │   ├── blocks/replica-navigation.tsx # Shared bar, language, theme and mobile links
│   │   ├── blocks/auth-4.tsx         # Licensed Auth-4 card wired to better-auth
│   │   ├── blocks/account-popovers.tsx   # Signed-in account/credit menu data and actions
│   │   ├── blocks/account-dialogs.tsx    # Seven account dialog bodies and shared dialog hero
│   │   ├── blocks/account-profile.tsx    # Shared avatar trigger and profile header
│   │   ├── blocks/account-gate-rows.tsx  # Invite-gated menu rows using route-table links
│   │   ├── blocks/account-popover-card.tsx # Shared ordered-row popover shell and row presentation
│   │   ├── blocks/tags.css               # Shared semantic tag tones for badges and model labels
│   │   ├── blocks/account-popover-state.ts # Pure seven-day streak presentation
│   │   ├── sections/                 # Ordered homepage content sections; Header and localized Footer belong to site-shell
│   │   ├── video-tool/               # Bound copy, scoped themed video-tool.css, interaction state, pure selectors
│   │   ├── pricing-content.tsx       # Server-bound pricing catalog and video-tool models
│   │   ├── pricing-checkout.tsx      # Monthly/yearly/pack cards and gated checkout interaction
│   │   ├── pricing-confetti.tsx      # Brief decorative entry effect
│   │   ├── pricing.css               # Tokenized responsive pricing surface
│   │   ├── auth-dialog.tsx           # Shared modal, server-session-confirmed return intent, and OAuth draft event
│   │   ├── auth-control.tsx          # Client signed-in controls and public sign-in trigger
│   │   ├── sign-in-card.tsx          # Client email/social sign-in dialog
│   │   ├── referral-capture.tsx      # Always-mounted home referral hook host
│   │   ├── reset-password.tsx        # Client form that submits a new password for a reset token
│   │   ├── google-one-tap.tsx        # Optional browser-side One Tap client
│   │   ├── language-control.tsx      # Locale switch preserving the current route
│   │   ├── theme-mode-initializer.tsx # Freezes first document theme before client navigation
│   │   ├── site-shell.tsx            # Persistent account-aware header and one footer for public pages
│   │   ├── workspace-shell.tsx       # Workspace content layout with account sidebar and heading
│   │   ├── information-page.tsx      # Shared localized about, privacy and terms content
│   │   ├── workspace-content.tsx     # Session-scoped dashboard/credit data and rendering
│   │   ├── invite-gate.tsx           # Client code redemption form
│   │   ├── invite-admin.tsx          # Client code inventory and actions
│   │   └── desktop-handoff.tsx       # Client app-return request and redirect
│   └── lib/                          # Business logic, config exports, and integration seams
│       ├── config.ts                 # Typed site/auth/theme/database contracts and compiled choices
│       ├── routes.ts                 # Server navigation, request-locale and initial shell mode lookup
│       ├── route-paths.ts            # Client-safe localized route primitives
│       ├── checkin-invite.ts         # Check-in invite URL, copy payload and social share targets
│       ├── auth-path.ts              # Template auth route prefix
│       ├── auth-client.ts            # Singleton browser auth client and One Tap
│       ├── browser-nav-copy.ts       # Assembles client navigation/auth copy without mail
│       ├── use-dismissable-layer.ts  # Popover/dialog dismissal and focus
│       ├── use-referral-claim.ts      # Home referral persistence and claim
│       ├── json-request.ts           # Browser JSON write helper
│       ├── plan-copy.ts              # Localized plan names selected by plan id
│       ├── theme-tokens.ts           # Generated mode-aware CSS tokens from site theme
│       ├── theme-mode.ts             # Root theme initialization and control transitions
│       ├── env.ts                    # Worker binding and secret types plus context accessor
│       ├── auth-schema.ts            # Drizzle mapping for better-auth D1 tables
│       ├── auth.ts                   # Better-auth construction, origin checks, signup grant
│       ├── request-context.ts        # Session, browser write guard, JSON reader and account snapshot
│       ├── invites.ts                # Invite eligibility, validation, redemption, admin match
│       ├── ledger.ts                 # Atomic credits, source registry, paid-source policy and labels
│       ├── credit-history.ts         # Bounded user credit-lot query
│       ├── account-rewards.ts        # Check-in/referral grants and pending share state
│       ├── turnstile.ts              # Token verification and local test path
│       ├── desktop-auth.ts           # Scheme validation and token-bearing app URL
│       ├── email.ts                  # Cloudflare/Resend adapter and fake test provider
│       ├── notifications.ts          # Localized mail composition and one HTML escaping boundary
│       ├── waffo.ts                   # Waffo Pancake checkout and callback format
│       ├── waffo-products.ts          # Worker-secret product price/period matching
│       ├── payments.ts                # Plan checkout and idempotent payment grants
│       └── mock-services.ts           # Local-only video placeholder
└── test/                              # Miniflare D1, auth, mail, config, and ledger tests
    ├── routes-language-ledger-plans.test.ts # Route, locale, source and plan copy guards
    ├── account-rewards.test.ts       # Reward persistence, concurrency and user scope
    ├── account-popover-state.test.ts # Seven-day completion and next UTC claim
    ├── account-popover-card.test.ts  # Row badges, dividers, shared profile and invite-gate destinations
    ├── account-dialogs.test.ts       # Seven dialog bodies, shared hero and route destinations
    ├── checkin-invite.test.ts        # Check-in invite payload, networks, and separate invite card
    ├── client-boundary.test.ts       # Client imports, singleton auth, localized props guards
    ├── auth-integration.test.ts      # Local better-auth signup and idempotent credits
    ├── auth-options.test.ts          # Provider switches, invites, desktop handoff
    ├── password-reset.test.ts        # Reset switch, mailed link, and reset page
    ├── config-email-auth.test.ts     # Second-site wiring, mail adapters, Turnstile
    ├── credit-history.test.ts       # Signed-in and bounded account credit reads
    ├── ledger.test.ts               # Concurrent spend, refunds, and monthly grants
    ├── home-sections.test.ts        # Homepage section scaffold order and stable ids
    ├── theme-guards.test.ts         # Palette parity, legacy literal baseline, duplicate-selector guard
    ├── payments.test.ts             # Waffo signature, one-time grant, monthly grant, and replay
    ├── pricing-port.test.ts         # Reference catalog, feature lists, disabled checkout, locale/theme guards
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
`src/lib/request-context.ts` owns server session lookup, browser-write origin and cross-site checks, JSON reads, and the invited account snapshot with its read-time signup grant and balance; signed payment callbacks remain server-to-server.
Presentation composition lives in `src/components/`, and external vendor response shapes can be translated inside future video or checkout adapters before reaching those components.
A new capability can be a new `src/lib/` service called by an API endpoint, a server-rendered page, or a Worker event; the existing file layout is an example of responsibilities, not a naming restriction.

## Key design patterns

### Configuration and localization

`src/lib/config.ts` declares the site, auth, and database config contracts; site files use `satisfies` to check build-time choices, while `wrangler.jsonc` declares matching live resources.
`scripts/site-check.ts` compares the Worker name, D1/R2/Queue names, auth shape, email binding, callback origin, and required secret names before publication.
`site/messages/en.ts` and `site/messages/zh.ts` compose matching per-module copy under `site/messages/{en,zh}/`, including separate mail, sign-in, invites, handoff, account, workspace, credits, pricing, footer, and video-tool files; `src/app/[locale]/` and `src/components/language-control.tsx` select copy without duplicating business logic.
`site/theme.config.ts` provides same-key light and dark palettes, paired top-bar/account-card/dialog/video-tool/pricing colors and row tones, mode defaults, and account colors; `src/lib/theme-tokens.ts` generates the CSS token stylesheet in `src/app/layout.tsx` instead of inline body styles.
The middleware marks whether the first route uses the public shell; the root layout applies that route's default through `data-mode="auto"`, and `ThemeModeInitializer` freezes it on `<html>` before client navigation. `ReplicaNavigation` reads the document mode and toggles it through `src/lib/theme-mode.ts`, preserving the selected mode across page changes.
Header language changes use App Router navigation to preserve the document; `ReplicaNavigation` synchronizes `<html lang>` because the root layout persists across client-side transitions.
`src/middleware.ts` forwards the route locale so the root layout sets matching `<html lang>` and metadata, including for the default-language `/` homepage.
`src/app/globals.css` applies the tokens across marketing and workspace surfaces, and `.auth-panel` sets foreground with its surface background.

### Authentication and eligibility

`src/lib/auth.ts` constructs better-auth using request-time `SITE_URL`, the Worker D1, the enabled email/Google/GitHub methods from `site/auth.config.ts`, and its email OTP plugin for the shared Auth-4 sign-in.
On each request, production login accepts the Worker `SITE_URL` only when it equals `site.url` from `site/site.config.ts`; a mismatch refuses login rather than creating a session on another origin.
`src/app/api/auth/[...all]/route.ts` wraps signup with invite validation, limits the email OTP plugin to sign-in codes, and applies optional sign-in Turnstile verification before delegating to better-auth.
`ensureSignupCredits` checks invitation eligibility and grants a signup lot with the user ID as its stable source ID; when email verification is enabled, it waits until the emailed link marks the account verified.
`src/app/api/invites/redeem/route.ts` uses the shared session and browser-write guard, redeems the code through an atomic D1 batch, and grants the eligible user credits.
`src/lib/invites.ts` owns invite code format, normalization, inventory reads, creation, and revocation.
`src/components/site-shell.tsx` mounts one `AuthDialogProvider` for public pages; `auth-control.tsx` triggers the licensed Auth-4 adaptation. Below 768px the same card uses a bottom drawer, while wider viewports use a dialog; its email sign-in uses a mailed six-digit code instead of a password. The standalone desktop callback keeps `sign-in-card.tsx` as a fallback outside that shell. `src/lib/auth-client.ts` owns the browser auth client, and `src/lib/browser-nav-copy.ts` assembles navigation and auth copy without sending mail strings to client props. Auth-4 uses Tailwind v4 theme variables and utilities without a global base reset via `postcss.config.mjs` and `src/app/globals.css`.
When `email.passwordReset` is on, the forgot-password link is sent through `EmailProvider`; `src/components/verify-email.tsx` provides the verification waiting and resend page; `src/components/reset-password.tsx` accepts the new password; desktop handoff uses `src/lib/desktop-auth.ts` to validate a configured app scheme before `/api/auth/desktop-handoff` issues a session-bearing return URL.

### Credits, tasks, and provider seams

`src/lib/ledger.ts` owns source IDs and paid-source membership, while `site/messages/` supplies localized names; `src/lib/plan-copy.ts` selects plan names by ID.
`site/messages/{en,zh}/pricing.ts` owns tier feature lists, annual-only feature lines, and interpolated pack perks; pricing cards select those lists by tier or plan ID without reusing plan-name copy as features.
`src/lib/ledger.ts` writes `credit_lot`, `credit_entry`, `credit_alloc`, and `video_task` with D1's own `prepare().bind()` statements and `batch()` for multi-step writes, preserving atomic reservations under concurrent requests.
Grant source IDs, entry idempotency keys, and task state transitions make retries observable. A verified annual payment calls `grantSubscriptionMonth` for the current calendar month only. There is no separate billing scheduler.
`src/lib/email.ts` chooses Cloudflare Email or Resend behind `EmailProvider`, and `src/lib/notifications.ts` composes and escapes localized mail, including sign-in codes, verification and password reset links, independently of delivery.

### Current state and extension paths

The homepage account popovers read the signed-in balance and profile and expose configured check-ins, referral sharing and a masked real-data leaderboard, pending share submissions, support links, plans and payment receipts.
`src/lib/use-dismissable-layer.ts` centralizes client dismissal, Escape and focus handling; `src/lib/use-referral-claim.ts` captures `ref` on home or `invite_code` on `/invitation-landing` through sign-in and redeems eligible claims, and `src/lib/json-request.ts` owns JSON writes.
`src/lib/checkin-invite.ts` builds the check-in card's share payload from the site origin and current user's referral code; `/invitation-landing` renders the branded homepage with the existing referral capture, while the separate invite dialog retains its existing `ref` link.
`src/components/blocks/account-popover-card.tsx` renders account menus from ordered rows with optional badges, one named tone, and per-row dividers.
`account-profile.tsx` shares avatar and profile presentation across the full and invite-gated menus; `account-gate-rows.tsx` maps existing route-table links into shared rows, while `account-popovers.tsx` owns account actions and `account-dialogs.tsx` owns seven dialog bodies and their shared hero.
`src/components/blocks/tags.css` shares semantic tag tones between row badges and video-model labels, while `src/components/video-tool/video-tool.css` owns the themed workbench.
`replica-navigation.css` owns the shared popover shell, avatar and credit pill; `account-popovers.css` owns account-card content, while paired chrome tokens keep the light and dark surfaces synchronized.
`docs/research/account-popovers/components/source-spec.md` records source-observed desktop/mobile metrics and click-state evidence; the implementation uses local site copy and capabilities rather than the reference site's product claims.
Receipts reflect settled credit ledger grants, not tax invoices; share submissions do not award credits until reviewed.
The existing homepage, dashboard, and credit history are a preview; `src/lib/mock-services.ts` produces no generated media.
`src/components/sections/HomePage.tsx` orders VideoHero, VideoToolSection, VideoShowcase, VideoFeatures, VideoPricing, and VideoFAQ inside page content; five non-tool sections remain empty with stable ids.
The `(site)` route layouts use `src/components/site-shell.tsx` to keep one account-aware Header and Footer mounted across home, pricing, dashboard, credits, and localized about/privacy/terms pages; the workspace sidebar stays in the workspace content, while verification, password reset, desktop callback, and invite admin routes remain outside the shell.
The footer takes identity and contact from `site/site.config.ts`, copy from `site/messages/{en,zh}/footer.ts`, links from `src/lib/route-paths.ts`, and its language row (including each configured flag) from `site.languages` through the same locale path helper as the header.
`Header` passes localized brand, optional site logo, links, language choices, real signed-in credits and account controls to `blocks/replica-navigation.tsx`; the shell owns its account snapshot.
`sections/VideoToolSection.tsx` binds one locale's tool copy and assets on the server and passes them to `src/components/video-tool/video-tool-section.tsx`.
`bind-copy.ts` localizes links and assembles asset copy; the client `video-tool-section.tsx` shows the create-payload preview without importing site configuration.
`video-generation-tool.tsx` composes the dark workbench from `composer.tsx` and `stage.tsx`.
`use-video-tool-state.ts` owns interactive state, saves a serializable draft before OAuth navigation or the full reload after email-code sign-in, restores it after a confirmed session and calls pure selectors in `state.ts`; `model-menu.tsx` and `parameter-field.tsx` accept only their scoped presentation data.
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
Site plans in `site/site.config.ts` list four monthly and annual tiers and five credit packs; annual `amount` is the full 12-month total, displayed as a monthly equivalent in the pricing UI.
`WAFFO_PRODUCTS` is a per-site Worker secret mapping each plan to a test product ID, verified USD price and billing period; checkout stays unavailable for any unprovisioned or mismatched plan.
The reference site's 13 test products were created in the existing Kanvora test store through its dashboard; its ignored `.waffo-products.json` is the local provisioning record, not source configuration.
`README.md` documents test-product provisioning through `scripts/provision-waffo-products.ts` in a secret-bearing environment.
`POST /api/webhooks/payment` verifies `X-Waffo-Signature`, test mode, checkout-bound plan and period, actual charged amount, listed total and currency before `src/lib/payments.ts` grants packs once or only the paid current month of a subscription; dashboard products may omit product metadata, but supplied metadata must agree.
Subscription credits follow `subscription.payment_succeeded` (including first and renewal charges), not the separate `subscription.activated` state event, whose payment fields are absent.
No scheduler pre-grants future months.
The product map, merchant id, request signing key, and callback public key remain Worker secrets.
Vendor-specific request and callback formats stay in adapters, while the page, task, and ledger contracts describe this application's behavior.

## How to add new logic

| Change | Start here, then connect |
| --- | --- |
| Change copy or switches | Edit `site/messages/en.ts` and `site/messages/zh.ts` together for text, or `site/site.config.ts` and `site/auth.config.ts` for site choices; connect new switches to their `src/components/` view, `src/lib/` or `src/app/api/` server gate, and `scripts/site-check.ts` when bindings change. |
| Add a page section | Implement or extend a section in `src/components/sections/` and compose it from `HomePage.tsx`; supply localized content from `site/messages/` and tokens from `site/theme.config.ts` and `src/app/globals.css`. Public page routes belong under the `(site)` layouts and must join the initial shell route classification in `src/lib/routes.ts`; the shared chrome is in `site-shell.tsx`. |
| Add a sign-in method | Extend `site/auth.config.ts`, the method selection in `src/lib/auth.ts`, the public card in `src/components/blocks/auth-4.tsx` and desktop fallback in `src/components/sign-in-card.tsx`, and the callback or guard in `src/app/api/auth/[...all]/route.ts`; declare credentials in `src/lib/env.ts`, `wrangler.jsonc`, and `scripts/site-check.ts`, with auth tests under `test/`. |
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
`src/lib/account-rewards.ts` scopes reward reads and writes by user, owns the referral-code format, throws coded account reward errors, and grants check-in/referral credits through the ledger.
`src/lib/credit-history.ts` limits history reads to 100 lots for the signed-in user, and `src/app/api/credits/balance/route.ts` validates the session and invite gate before reading a balance.
Schema changes gain a new reviewed migration and matching service/query types and tests; a site applies those migrations to its own D1 before depending on the new shape.

## Configuration items

### Site configuration compiled into the app

| Location and item | Current role |
| --- | --- |
| `site/site.config.ts`: `brand`, optional `logo` | Site title and notification brand, plus optional shared navigation logo image and alt text. |
| `previewOnly` | Controls robots metadata and `robots.txt` indexing behavior. |
| `apex`, `url` | Canonical host and absolute base URL for authentication, callbacks, links, metadata, and site-check. |
| `languages`, derived `locales`, `defaultLocale` | Code, native name, flag emoji, and date locale for every language; default homepage and request-locale document language. |
| `deploy.worker`, `deploy.d1`, `deploy.r2`, `deploy.queue` | Expected per-site Worker, D1, R2, and Queue names compared with Wrangler. |
| `email.provider`, `email.from` | Selects the email adapter and sender address. |
| `signupCredits` | Amount granted once to an eligible new account. |
| `account` | Reward switches/amounts, submission cap, contact addresses, commercial-use link, icon and share-network choices. |
| `plans` | Monthly and annual tiers plus credit packs; Worker `WAFFO_PRODUCTS` enables only matching test products. |
| `site/auth.config.ts`: `backend` | Current better-auth selection. |
| `src/lib/auth-path.ts`: `authBasePath` | Template-owned `/api/auth` route contract shared by server and browser. |
| `email.enabled`, `email.requireVerification`, `email.passwordReset`, `google.enabled`, `github.enabled` | Independently enable sign-in options; email verification delays the session and signup credits until the emailed link is opened, password reset shows one forgot-password path and sends through `EmailProvider` only when that switch is on, and OAuth options require matching Worker secrets. |
| `google.oneTapEnabled` | Adds the One Tap plugin and client prompt when Google login is enabled. |
| `invite.required`, `invite.adminEmails` | Gate account credit access and authorize invitation administration; enabling the gate uses migration `0002_invite_codes.sql`. |
| `desktop.schemes` | Allow-listed app URL schemes for signed-in desktop handoff. |
| `turnstile.onSignIn` | Applies Turnstile verification to sign-in requests supplied with a client token. |
| `site/database.config.ts`: `binding`, `migrationsDir` | Site D1 binding name and migration directory. |
| `site/theme.config.ts`: `light`, `dark`, `chrome`, `pricing`, `rowTones`, `defaultMode`, `font`, `account`, `tones` | Paired semantic palettes and navigation/account-card/pricing chrome, row tones, homepage/other-page defaults, and account accents emitted through `src/lib/theme-tokens.ts`. |
| `site/video-tool.config.ts` | Landing tool media, workflows, models, fields, references, assets, and optional promo. |
| `site/messages/en.ts`, `zh.ts`: `metadata`, `nav`, `hero`, `videoTool`, `account`, `dashboard`, `credits`, `pricing`, `planCopy` | Localized strings for metadata, navigation, credit sources, plan names and pricing features, the video tool, and content views. |

### Worker, build, and request-time configuration

| Location and item | Role |
| --- | --- |
| `wrangler.jsonc`: `name`, `main` | Worker name and `worker.ts` entry point. |
| `workers_dev`, `preview_urls` | Keep the production workers.dev route disabled while permitting versioned preview URLs for unmerged work. |
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
| `WAFFO_PRODUCTS` | JSON attestations of each site's verified test product IDs, prices, currencies and billing periods. |
| `WAFFO_CALLBACK_PUBLIC_KEY` | PEM public key the Pancake SDK uses to verify `X-Waffo-Signature`. |
| `RESEND_API_KEY` | Resend mail delivery when selected. |
| `LOCAL_AUTH_TEST` | Explicit loopback-only local authentication test mode. |

The `site/` TypeScript values are included in a build, while Worker variables and secrets are read when a request runs.
A site-choice change is published with a new build, and a runtime-secret change uses the Worker environment contract.
`fixtures/second-site/` demonstrates its own site, auth, theme, and localized copy with different names, URL, and email provider while reusing the same application modules.

## Critical Rules

1. **Preserve the site boundary and one owner per fact:** site-specific identity, copy, switches, theme, and resource names live in `site/`, with corresponding UI, server, and site-check behavior when the contract grows.
   Ported code may look new, but must reuse each fact's existing owner or replace its old implementation and delete that copy in the same change, never duplicating the fact.
   For example, a redesigned account card can change its layout while reusing existing color and copy sources; a new navigation style still uses the established path source.
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

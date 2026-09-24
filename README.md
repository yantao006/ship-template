# ship-template

Next.js App Router + OpenNext on Cloudflare Workers, with a D1-backed better-auth account, a native-batch credit ledger, and two mail adapters.
The reference site is live at [awesomejev.link](https://awesomejev.link/).
Navigation, hero, workspace and credits copy live in `site/messages/en.ts` and `site/messages/zh.ts`; brand and resource names live in `site/site.config.ts`, while colors live in `site/theme.config.ts`.
`site/auth.config.ts` selects email/password, Google, and GitHub sign-in independently; the live configuration enables email and Google but leaves GitHub off.
Google login uses the existing dedicated Google Cloud project and exact callback `https://awesomejev.link/api/auth/callback/google`.
The Google consent app is in Testing mode; only the configured Google test users can finish sign-in until its branding and audience are published.

Video generation, checkout, subscription billing, model pages, and legal pages are not implemented.
Mock video/payment services cannot generate media or charge anyone.
The landing page has a marketing navigation and hero. The preview workspace at `/{locale}/dashboard` and the credit-grant table at `/{locale}/credits` show only the signed-in account's existing D1 data, without enabling video or checkout.

## Re-run verification

Use Node 22 and pnpm 10.

```bash
pnpm install
pnpm site-check
pnpm site-check fixtures/second-site
pnpm test
pnpm typecheck
pnpm cf:build
pnpm exec wrangler deploy --dry-run --outdir /tmp/ship-template-dryrun
```

`pnpm test` uses local Miniflare D1 to reproduce naive read-then-write overspending, verify atomic native D1 batches under concurrency, cover refund/grant idempotency, exercise better-auth signup, and test both mail adapters with fake sending.
The second-site fixture changes only `site/`, `wrangler.jsonc` resource names and environment requirements; business modules are unchanged.
`pnpm site-check --strict` needs `SITE_URL`, `BETTER_AUTH_SECRET`, and credentials for enabled OAuth providers in the invoking environment; it reports missing names without printing values.
Secrets already installed on the deployed Worker are not exported into the local shell.

For local-only D1 smoke checks, first run `pnpm exec wrangler d1 migrations apply awesomejev-db --local`.
The local-only auth test path uses an explicit `LOCAL_AUTH_TEST=1` and a loopback `SITE_URL`, as exercised by `test/auth-integration.test.ts`; it cannot be used on a non-loopback request.
Email/password signup and login use the same site's D1-backed better-auth session and account tables.
Email verification, password reset, and account recovery are not configured; do not use a valuable password for this preview site.
Do not use localhost as acceptance evidence for the public Google flow.
The live verification is to open [awesomejev.link](https://awesomejev.link/), click **Sign In** in the top navigation, then choose **Continue with Google** inside the single card, select a permitted test account, consent, and confirm the navigation shows your name and the workspace shows 30 credits.
The same card contains email/password sign-in and account creation; GitHub is absent while disabled in `site/auth.config.ts`.
The single **Language** selector is in the marketing navigation on home, or at the top right of the workspace content above the Credits table. It switches between `/en` and `/zh` while preserving the current page.
An unauthenticated request to `/api/credits/balance` returns 401.
A successful first Google sign-in creates one user and one idempotent signup credit lot in this site's D1.

## Site and secret boundaries

Each site needs its own D1, Worker, Google Cloud project and OAuth web client, and account namespace.
`wrangler.jsonc` names this site's bindings and the sole custom hostname `awesomejev.link`.
`SITE_URL` is a Worker environment variable and `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `BETTER_AUTH_SECRET` are Worker secrets; better-auth reads them on every request, not from the build.
To enable GitHub, create a real OAuth app with callback `https://awesomejev.link/api/auth/callback/github`, install `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Worker secrets, add those two names to `wrangler.jsonc` `secrets.required`, and then set `github.enabled` true in `site/auth.config.ts`.
Never invent or commit OAuth credentials.
Google One Tap is supported by `google.oneTapEnabled`, but remains off; it requires a Google client whose authorized origins include this site and uses the existing Worker client ID.
Desktop handoff is off while `desktop.schemes` is empty; when enabled, only allow-listed app schemes receive a session token through `/auth-callback?redirect=app://...`.
Invitation gating is off while `invite.required` is false; enabling it requires migration `0002_invite_codes.sql` and an `invite.adminEmails` allow-list for `/admin/invites`.
When required, new accounts cannot use their credits until a valid invite is redeemed, and toggling it on also gates existing accounts without a redemption.
Apply D1 migrations before deploying a build that enables invitations.
Credentials are never committed to `site/` or D1.
`site-check` compares the Worker, D1, R2, Queue and email bindings with site configuration and secret declarations.
Cloudflare Email is the default adapter; Resend is selectable through `site.email.provider` and needs `RESEND_API_KEY`.
Notification functions use fake email in tests; they are not connected to real video or payment events.
Turnstile verification remains implemented and locally tested, but this reference site's `site/auth.config.ts` disables the sign-in gate until a real client widget and secret are configured.
Do not flip it on without both pieces, or Google login will be blocked.
Annual credits have an idempotent monthly grant primitive, but no billing scheduler is connected.
Failures/timeouts refund reserved credits once; submitted user cancellations do not refund.

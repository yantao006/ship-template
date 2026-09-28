# ship-template

Next.js App Router + OpenNext on Cloudflare Workers, with a D1-backed better-auth account, a native-batch credit ledger, and two mail adapters.
The reference site is live at [awesomejev.link](https://awesomejev.link/).
Navigation, hero, workspace and credits copy live in `site/messages/en.ts` and `site/messages/zh.ts`; brand and resource names live in `site/site.config.ts`, while colors live in `site/theme.config.ts`.
`site/auth.config.ts` selects email/password, Google, and GitHub sign-in independently; the live configuration enables email and Google but leaves GitHub off.
Google login uses the existing dedicated Google Cloud project and exact callback `https://awesomejev.link/api/auth/callback/google`.
The Google consent app is in Testing mode; only the configured Google test users can finish sign-in until its branding and audience are published.

Video generation, model pages, and legal pages are not implemented.
The mock video service cannot generate media.
The pricing catalog displays four monthly and annual tiers plus five credit packs at the reference prices.
Each card requires its own verified Waffo **test** product with the same USD amount and billing period, selected from the `WAFFO_PRODUCTS` Worker secret.
The old single `WAFFO_PRODUCT_ID` is not used and must not be mapped to a differently priced plan.
The thirteen current prices were created and verified in the existing Kanvora merchant's test mode; the per-Worker catalog is installed separately as `WAFFO_PRODUCTS`.
A missing or mismatched entry leaves its pay button disabled and its server checkout unavailable.
Max above 1× remains a non-payable preview.
The homepage navigation has signed-in account and credit popovers with shared accessible dialogs for daily credit claims, referral links, share submissions, contact, feedback and plans.
The account menu links to localized Account, My Subscription, Invoices and Credit Center pages with one sidebar under the shared public shell.
The credit-pill Buy Credits dialog lists site-configured plans, annual savings and features; only products verified in `WAFFO_PRODUCTS` can start checkout, and the Max multiplier above 1× stays a preview.
The commercial-use page is informational only: certificates are not issued in this preview, and View Plans opens the shared plan chooser.
The Feedback & Get Credits card uses the site's support address and explicitly states that quality feedback may receive credits after review, never automatically.
The Account page offers confirmed self-deletion; `/api/account/delete` requires a same-origin signed-in request and matching account confirmation, then atomically removes that user's ledger and identity, revoking sessions through database cascades.
Do not test deletion on an account with valuable data; `test/delete-account.test.ts` uses a one-time local account and checks the old login, related records, and another user's isolation.
`site/site.config.ts` configures rewards, limits, contact addresses, link and icon choices; `site/messages/en.ts` and `zh.ts` provide all account copy.
Migration `0003_account_rewards.sql` stores check-ins, pending share submissions and referral claims in this site's D1.
Check-in and eligible referral credits use the existing idempotent ledger; share submissions remain pending and do not award credits without review.
The Invoices page reads settled paid credit grants as receipts, not downloadable tax invoices; the request-invoice link contacts support.
My Subscription lists issued subscription-month credits but does not assert an active billing status.
Credit Center reads bounded ledger entries, including grants, spends and refunds, scoped to the signed-in user.
Apply `migrations/0005_account_history_indexes.sql` to each site's D1 before relying on indexed account-history and deletion lookups; the preview build does not apply remote migrations.
Apply the migration before using the signed-in homepage on an existing D1.
The landing page has a marketing navigation and hero.
Pricing at `/{locale}/pricing` renders the localized monthly/yearly/credit-pack catalog, Max 1-5× preview, model list sourced from the video-tool config, and illustrative payment marks.
Yearly amounts in `site.plans` are the total for 12 months, while the pricing card displays the equivalent monthly rate.
The preview workspace at `/{locale}/dashboard` and the credit-grant table at `/{locale}/credits` show the signed-in account's D1 data.

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
For a local Next.js preview, set `NEXT_DEV_WRANGLER_CONFIG` to a local, uncommitted Wrangler config whose `vars.SITE_URL` is the exact preview origin and whose `vars.LOCAL_AUTH_TEST` is `1`.
Apply migrations `0001` through `0003` locally for a preview with account rewards.
Do not use production credentials in local preview configs.
Google OAuth additionally needs real local credentials and that exact origin's `/api/auth/callback/google` registered on the OAuth client; fake credentials can only test the sign-in start, not complete the callback.
Never commit that preview config or `.dev.vars`.
Email/password signup and email-code sign-in use the same site's D1-backed better-auth session and account tables.
Email verification, password reset, and account recovery are not configured; do not use a valuable password for this preview site.
Do not use localhost as acceptance evidence for the public Google flow.
The live verification is to open [awesomejev.link](https://awesomejev.link/), click **Sign In** in the top navigation, then choose **Continue with Google** inside the single card, select a permitted test account, consent, and confirm the navigation shows your name and the workspace shows 30 credits.
The same card contains email-code sign-in and email/password account creation; GitHub is absent while disabled in `site/auth.config.ts`.
The single **Language** selector is in the marketing navigation on home, or at the top right of the workspace content above the Credits table. It switches between `/en` and `/zh` while preserving the current page.
An unauthenticated request to `/api/credits/balance` returns 401.
A successful first Google sign-in creates one user and one idempotent signup credit lot in this site's D1.

### Source-inspired auth card preview (2026-09-27)

Preview alias:

https://popovers-awesomejev-test.yantao006.workers.dev/en

At the time of this browser run, the preview alias served `minimax-auth-card.tsx`.
The card keeps the site's brand, configured welcome credits and localized claims, and uses the existing email-code sign-in after the email action.
The image is a site-local placeholder.
At the time of this run, the email-code flow still used the card's inline code field, mobile bottom drawer and full-page reload.
The measured source spec, computed-color comparison and initial plus expanded-email viewport/theme screenshot pairs live in `docs/research/auth-card/source-spec.md` and `docs/verification/auth-card/`.
Cloudflare Worker version `2b762543-321f-4191-81d8-eabf8c426b05` was uploaded to the preview alias with the existing `WAFFO_PRODUCTS` catalog, without deploying to the live hostname.
The expanded email input follows the OR divider in a column flow with 12px of separation; both themes were compared at 1440 × 900 and 390 × 844 in ego-browser.

### Email OTP dialog preview (2026-09-28)

The preview alias now serves `minimax-auth-card.tsx` for the email entry and the licensed Auth-6 adaptation in `src/components/auth/auth-6.tsx` for the six-digit code.
Google sign-in remains unchanged.
A successful send hides the email card and opens the independent wide dialog; Use a different email restores the card, while closing the code dialog exits sign-in entirely.
Verification and resend call the existing better-auth email OTP methods.
An ego-browser unsigned desktop and 390px mobile run confirmed the wide dialog without the login card behind it, copy, grouping, paste/auto-advance/backspace, resend cooldown, email-change return, and full sign-in close.
A subsequent browser run submitted the authorized `yantao006@agent.qq.com` inbox, confirmed the redesigned message really arrived, entered its received code, and established a server-confirmed session.
That run also found that the prior five-minute OTP lifetime contradicted the dialog's 15-minute claim; the plugin, mail copy, and dialog now agree on 15 minutes.
Desktop and mobile captures, a safe sample of the redesigned email, and the delivery/login evidence are in [email OTP dialog verification](docs/verification/email-otp-dialog/README.md).
Worker version `3b50f1ce-1e3a-4be1-a78b-2352b637b474` was uploaded to the existing preview alias after the delivery fix, without deploying to the live hostname.
This alias is shared with another workstream and can be overwritten by its next upload; use the immutable version URL in the verification record to identify this build.
Cloudflare Email Sending for `awesomejev.link` is now onboarded: the prior Email Routing-only binding could send to verified destination addresses but not reliably to other users.
The auth route now waits for Cloudflare's send acknowledgement before opening the OTP dialog; Cloudflare's activity log reports the Gmail and 126 test messages as Delivered, while only the `agent.qq.com` inbox was independently read.

### Language suggestion preview (2026-09-28)

The unmerged language suggestion was uploaded as Worker version `30f3b91c-690c-4cf7-9645-eb8344c12dee` to the shared `popovers` preview alias, without deploying to the live hostname.
Its immutable preview URL is:

https://30f3b91c-awesomejev-test.yantao006.workers.dev/en

In an ego-browser with `navigator.languages[0] === 'zh-CN'`, the English page showed the Chinese suggestion card; continuing in English and closing it each survived a refresh, while switching from `/en/pricing` navigated to `/zh/pricing` and remembered the choice.
Desktop and 375px mobile screenshots showed the card below the fixed header without horizontal overflow.

## Site and secret boundaries

Each site needs its own D1, Worker, Google Cloud project and OAuth web client, and account namespace.
`wrangler.jsonc` names this site's bindings and the sole custom hostname `awesomejev.link`.
The production workers.dev route stays disabled, while version preview URLs are enabled so unmerged code can be reviewed without deploying to the custom hostname.
For the existing preview alias, after `pnpm cf:build` run `pnpm exec wrangler versions upload --preview-alias popovers`; if Cloudflare's Domains page shows Preview URLs disabled, enable that switch first, then upload again.
Uploading a version does not deploy it to production traffic.
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
Cloudflare Email is the default adapter; sending to unverified recipient addresses requires onboarding this site's sender domain to Email Sending on a Workers Paid account, in addition to the `EMAIL` binding.
The `EMAIL` binding has no recipient allowlist and forwards any valid email address to Email Sending; the provider may still reject invalid or suppressed recipients.
The Cloudflare adapter requires an acknowledgement ID, and the OTP send route returns an error if sending fails instead of reporting a false success.
Resend is selectable through `site.email.provider` and needs `RESEND_API_KEY`.
Notification functions use fake email in tests; they are not connected to real video or payment events.
Turnstile verification remains implemented and locally tested, but this reference site's `site/auth.config.ts` disables the sign-in gate until a real client widget and secret are configured.
Do not flip it on without both pieces, or Google login will be blocked.
A verified test payment grants a pack once or a subscription's current calendar month once.
Annual checkout charges the configured 12-month total, not the monthly equivalent displayed prominently on the card; the annual payment grants only the current month.
Monthly checkout uses a Waffo monthly product at the displayed monthly rate, never the annual product.
The signed webhook requires test mode, checkout-bound plan metadata, matching currency, amount, any reported total and subscription period before granting credits.
Dashboard-created products have no product metadata; any product metadata supplied by Waffo must agree with the checkout plan.
No scheduler grants future subscription months without a new verified payment event.
Failures/timeouts refund reserved credits once; submitted user cancellations do not refund.

## Provision test checkout products

The thirteen matching products were created in the existing Kanvora test store through the merchant dashboard, with exact USD prices and monthly/yearly periods verified there.
Do not substitute an older Kanvora product whose price differs, or switch to production mode.
The ignored `.waffo-products.json` records the mapping locally; it must not be committed or printed.
For a new site's test merchant, the optional SDK script creates products only when test credentials and store ID are already available securely:

```bash
WAFFO_TEST_MODE_CONFIRMED=1 pnpm exec tsx scripts/provision-waffo-products.ts
```

The optional script creates five one-time and eight subscription products, verifies each returned price and period against `site/site.config.ts`, and saves the attestations to ignored `.waffo-products.json`.
It reuses entries from that file on a retry but refuses stale or duplicate mappings.
Do not run it against this already-provisioned catalog.
Install the verified catalog as the site's Worker secret without echoing it:

```bash
pnpm exec wrangler secret put WAFFO_PRODUCTS < .waffo-products.json
```

`wrangler secret put` can publish a new Worker version; verify the catalog and checkout code are deployed together before enabling cards.
Do not change merchant or callback keys.
Keep the old `WAFFO_PRODUCT_ID` out of the new map.
The Kanvora test store already has an `awesomejev.link` test webhook; confirm payment events arrive signed with the configured test `WAFFO_CALLBACK_PUBLIC_KEY`.
In the deployed test site, sign in and open each card at 1×, verify Waffo checkout shows the exact USD charge from the pricing card (yearly uses its **billed yearly** total), finish a sandbox payment, and verify one ledger grant.
If Waffo adds tax beyond that amount for a buyer's market, do not enable that market until the charged total matches the advertised total; the server rejects callbacks whose reported total differs, but cannot undo a tax-increased checkout charge.
Confirm replay does not grant twice, incorrect amount or period is rejected, and Max above 1× cannot start checkout.
On 2026-09-27, a $39.90 Waffo test payment completed through the live site and the account balance changed from 30 to 830 credits.
The reference site is still a preview: video generation is not connected to credits.

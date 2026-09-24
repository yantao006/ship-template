# ship-template

A local-first verification slice of a Next.js + OpenNext Cloudflare Worker video-site template.
This slice implements the scaffold, D1 ledger, better-auth with per-site D1 and Google configuration, Turnstile, two mail adapters, and a second-site configuration check.
Video generation, real payments, public production deployment, model pages, legal pages, and runtime feature flags are not implemented.
The mock video/payment services cannot charge users or generate real media.

## Run the local verification

Node 22 and pnpm 10 are expected.

```bash
pnpm install
pnpm site-check
pnpm site-check fixtures/second-site
pnpm test
pnpm typecheck
pnpm cf:build
pnpm exec wrangler deploy --dry-run --outdir /tmp/ship-template-dryrun
```

`pnpm test` runs real Miniflare D1 migrations and parallel ledger mutations, demonstrates read-then-write overspending, verifies batch rollback and refund idempotency, and signs up a local better-auth account.
The second-site fixture contains only a changed `site/`, `wrangler.jsonc`, and an alternate provider configuration.
No business source files change between sites.
`pnpm site-check --strict` checks production secret names and rejects the placeholder D1 id, so it intentionally fails without real per-site resources and environment variables.

For an HTTP smoke test using only local D1 state:

```bash
pnpm exec wrangler d1 migrations apply example-video-db --local
printf '%s\\n' 'BETTER_AUTH_SECRET=only-local-test-secret-long-enough-000000' > .dev.vars
pnpm cf:build
pnpm exec wrangler dev --local --port 8787 --var SITE_URL:http://localhost:8787 --var LOCAL_AUTH_TEST:1
```

In another terminal, request `/`, `/api/auth/ok`, then sign up via `POST /api/auth/sign-up/email` with JSON `name`, `email`, and `password` and an `Origin: http://localhost:8787` header.
`POST /api/auth/sign-in/email` requires `x-turnstile-token: local-test-token` on the loopback host only.
The local email/password method and local Turnstile token are disabled unless `LOCAL_AUTH_TEST=1` and `SITE_URL` is loopback; requests to a non-loopback host cannot use them.
After signing in, `GET /api/credits/balance` with the session cookie repairs missing signup grants idempotently and returns the balance.
Wrangler warns that the undeclared Google and Turnstile secrets are absent, which is expected in local-only mode.
Wrangler filters `.dev.vars` against `secrets.required`, so the loopback-only test flag and URL are passed with `--var` instead.
Delete `.dev.vars` after the smoke test; it is ignored by Git.
No real Google, Turnstile, or email keys are needed for local verification.

## Site boundaries

Each site needs its own D1 database, Worker, Google Cloud project and OAuth web client, and account namespace.
The Google consent screen and client must be configured for that site's brand and canonical `https://<apex>/api/auth/callback/google` redirect.
Credentials stay in environment secrets and never in `site/` or D1.
`site-check` compares the D1, R2, Queue, Worker name, email binding and secret declaration with `site/site.config.ts`.
Cloudflare Email is the default; changing `site.email.provider` to `resend` requires `RESEND_API_KEY` and the matching required-secret declaration.
Annual subscription credits have a monthly idempotent grant primitive, but no billing scheduler or real payment integration is included in this slice.
Failed or timed-out reserved/submitted tasks refund only once; user cancellations after submission do not refund.

The default wrangler D1 id is deliberately a placeholder.
Do not deploy `wrangler.jsonc` or create remote storage resources as part of the local commands above.

## Authorized test hostname

`wrangler.test.jsonc` is a deliberately reduced, static-only Worker deployment for `https://awesomejev.link/`.
It uses the same OpenNext build but binds no D1, R2, Queue, email service, or auth secrets.
The page is labeled TEST ONLY, marked noindex, and the login and balance APIs return 503 instead of pretending to work.
After `pnpm cf:build`, `pnpm exec wrangler deploy -c wrangler.test.jsonc` deploys only this test Worker to the already-owned Cloudflare zone; do not use the full config for this hostname until real per-site resources and credentials are provided.
This remote smoke test does not replace the Miniflare ledger, local better-auth, and fake email tests.

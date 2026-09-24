# Project design guide

This file maps responsibilities and extension points in the current template; `README.md` covers setup, verification, and the reference site's live state.

## Site configuration

`site/site.config.ts` holds the site's identity, locales, deployment names, and product-level choices; `site/auth.config.ts`, `site/database.config.ts`, `site/theme.config.ts`, and `site/messages/` hold the corresponding feature, data, visual, and copy choices.
`src/lib/config.ts` presents these choices to shared application code, while `src/components/` renders the enabled experiences and `src/lib/` enforces their server-side behavior.
`site/messages/` keeps localized copy keyed consistently across languages, and the theme flows from `site/theme.config.ts` into the variables consumed by `src/app/globals.css`.
`wrangler.jsonc` declares the reference site's Worker resources and bindings; `src/lib/env.ts` describes their request-time contract, including credentials and secrets supplied by the Worker environment.
A new site changes its site configuration, resource bindings, and credentials while reusing the application layers; new configuration capabilities also receive matching UI, server behavior, and validation in `scripts/site-check.ts`.

## Project structure and runtime

`src/app/` owns pages and HTTP endpoints, `src/components/` owns reusable presentation and interaction, and `src/lib/` owns authentication, business operations, and service integrations.
OpenNext builds the Next.js app for Cloudflare Workers; `worker.ts` connects the generated HTTP handler with scheduled and queue entry points.
`src/lib/auth.ts` currently connects better-auth to the site's D1 binding and uses the configured site URL to establish the login origin.
`src/lib/email.ts` illustrates a service boundary where site choices select an adapter and application callers work with one email interface.
Extensions can enter through an App Router endpoint, a Worker event, or a component while sharing business operations in `src/lib/`.

## Video generation

The current preview has credit and task primitives but no live video generator; `src/lib/mock-services.ts` is a stand-in for this state.
A generation flow starts with input in a UI component, passes through an authenticated API that validates the prompt, parameters, and credit cost, reserves credits through `src/lib/ledger.ts`, and submits work through a provider adapter.
The task identifier and persisted status let the client observe a long-running job through status requests, while queue or scheduled handlers in `worker.ts` can coordinate completion, timeouts, and retries.
On success, the service stores private media in the site's media binding and exposes an authorized preview or download; terminal failures reconcile the task and ledger once according to the product's credit policy.
Adding a model or provider changes the adapter and parameter mapping in the service layer, the server's accepted options and costs, and the UI's configured controls and progress states together.

## Frontend components

`src/components/home-content.tsx` currently composes the preview homepage, and the workspace components present account and credit data from server-side services.
As the product grows, navigation, hero, generation tool, showcase, features, pricing, FAQ, and footer can be independent sections driven by `site/` choices and localized messages.
The generation tool owns input, pending-task, progress, error, and preview interaction states; API responses carry task status and results rather than provider-specific UI logic.
Shared colors and typography flow through the theme configuration and global CSS, while components own layout, responsive behavior, and accessible interaction.

## Payments and credits

Checkout is not wired in the current preview; `src/lib/mock-services.ts` models that boundary without charging users.
A payment integration maps the site's plans and product identifiers to a checkout adapter, then receives verified provider events at an API endpoint and translates them into subscription and credit operations.
`src/lib/ledger.ts` owns idempotent credit grants, reservations, and reversals; payment events supply stable identifiers and billing periods so retries and recurring grants preserve the same balance.
New plans or payment providers extend the site-facing plan data, checkout and webhook adapters, environment bindings, and pricing UI while keeping credit accounting in the ledger.

## Database and persistence

`migrations/` versions this site's D1 schema for authentication, credit lots and entries, allocations, and video tasks.
`src/lib/auth.ts` uses the auth schema, while `src/lib/ledger.ts` performs atomic D1 writes for credit movements and task transitions.
API handlers return user-scoped data to UI components, while Worker event handlers can process background tasks; media bytes live in the media binding and task records carry the durable processing state.
A new persisted feature starts with a migration and then updates its server types, data operations, API contract, and corresponding UI; `test/` and the checks in `README.md` exercise the resulting flow.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Point to the authoritative file or command for details already visible in the codebase.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

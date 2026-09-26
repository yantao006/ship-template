# Entry guard baseline before consolidation

Observed from the nine `src/app/api/**/route.ts` handlers before editing.
For browser write requests, "allowed" means the request passes the route's entry guard, not that authentication, input validation, or the provider succeeds.
The existing sign-in flow is same-origin; the payment webhook is a signed server-to-server request, not a browser write.

| Route | Existing acceptance and rejection before business logic |
| --- | --- |
| `auth/[...all]` GET/POST | Better Auth handles origin validation for POST against configured trusted origins, and accepts GET callbacks without an Origin header; invite signup and Turnstile sign-in have extra checks. No route-level `Sec-Fetch-Site` check. |
| `auth/desktop-handoff` POST | Requires a configured browser Origin and rejects `Sec-Fetch-Site: cross-site`; then parses JSON, checks target and session. Local-test origin has no exception. |
| `checkout` POST | Requires a configured browser Origin, then session and optional invite; does not inspect `Sec-Fetch-Site`. Local-test Origin rejected. |
| `account/activity` GET/POST | GET requires session and invite, no Origin check. POST requires configured Origin or explicit local-test loopback Origin and rejects `Sec-Fetch-Site: cross-site`; then session and invite. |
| `webhooks/payment` POST | No browser Origin check; delegates to signed Waffo callback verification. No session or browser JSON guard. |
| `invites/validate` POST | Requires enabled invites and valid JSON; public probe accepts requests with no Origin and any Origin, including cross-site mark. |
| `invites/redeem` POST | Requires enabled invites and configured Origin, then session; no `Sec-Fetch-Site` check. Local-test Origin rejected. |
| `invites` GET/POST/DELETE | All require enabled invites and admin session. Writes also require configured Origin and JSON; no `Sec-Fetch-Site` check. Local-test Origin rejected. |
| `credits/balance` GET | Requires session and invite, then grants signup credits on read and returns balance; no Origin check. |

Consolidation must retain missing-Origin behavior for the public invite probe and Better Auth's own POST handling, and preserve the signed webhook's server-to-server contract.
Only requests explicitly marked cross-site may change at the browser write boundary.

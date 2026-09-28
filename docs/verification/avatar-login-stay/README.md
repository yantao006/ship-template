# Avatar sign-in persistence verification

The first divergence is not cookie forwarding: `src/lib/request-context.ts` uses Better Auth's same `getSession` lookup for server rendering, while the browser calls `/api/auth/get-session`.
Email OTP creates a real user with an empty `name`; a local Miniflare-backed sign-in returned a 200 session and user with `name: ""` and a nonempty email.
A read-only aggregate query against the live D1 found one user with a blank name and one unexpired session for that user, with a nonblank email.
The old header used `userName` truthiness to render Sign In, while `serverHasSession()` used the presence of session and user, so the same authenticated identity took opposite branches and immediately closed the guest dialog.
An actual unsigned production browser request returned JSON `null`; an actual signed preview request returned a session with a nonempty name and rendered the account menu.

`SiteShell` now derives a display name from the authenticated email when the name is empty and treats session existence as account readiness.
An immediate guest dialog stays open during a positive probe until a refreshed server header can render the account menu; a guest's null probe leaves the form available.

Preview Worker version: `a80f130d-84a7-447b-bbf2-7d0204cba810`.
The alias was updated through `wrangler versions upload --preview-alias popovers`, not deployed to production.
In ego-browser, the preview session cookie was temporarily replaced with an invalid value for an unsigned visit, then restored in a `finally` block and confirmed to render the account menu again.
On the unsigned visit, the real `/api/auth/get-session` request completed with HTTP 200 and JSON `null` after clicking the avatar; the dialog remained visible and the email input expanded without navigation.
The screenshot is [preview-guest-email.png](preview-guest-email.png).

Checks: `pnpm test` (105 passing), `pnpm typecheck`, `pnpm site-check`, `pnpm site-check fixtures/second-site`, and `pnpm cf:build`.

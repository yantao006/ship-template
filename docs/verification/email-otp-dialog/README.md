# Email OTP preview verification - 2026-09-28

Preview alias:

https://popovers-awesomejev-test.yantao006.workers.dev/en

Final preview Worker version: `4d34c8a5-efda-4026-95f8-8c32242019a8`.
The complete delivery-and-login run used version `64cbd54b-7181-4dd6-9a3a-5f0930542659` with the same runtime code; after it passed, the final bundle was reuploaded with `pnpm exec wrangler versions upload --preview-alias popovers --message otp-mail-verified`.
No production deployment or `SITE_URL` change was made.

## What happened and why

Trigger: on the preview, an unauthenticated visitor opened Sign In, entered an email address, and submitted it.
Environment-dependent condition: `agently-cli +me` lists `yantao006@agent.qq.com` as the sole authorized inbox alias.
An earlier test submitted `yantao006+otpqa@agent.qq.com`; the UI opened the code dialog, but an inbox search for that exact recipient found no mail.
Changing only the recipient to the authorized primary address yielded an inbox message from `noreply@awesomejev.link` within approximately six seconds, before any code or dialog changes.
Visible symptom: the code dialog opens after Cloudflare accepts a send request, not after the recipient's mailbox confirms delivery.
The evidence identifies the earlier plus-address test as a recipient-specific delivery gap; it does not establish that every unreceived address has the same cause.
The email OTP callback was already wired to the Cloudflare `EMAIL` binding, and the primary address received its mail on the previous preview version.

A separate, confirmed expiration bug was that the dialog claimed 15 minutes while Better Auth used its five-minute default and the old email also said five minutes.
The plugin now explicitly uses `expiresIn: 15 * 60`, and the email and dialog both say 15 minutes.
The local D1 integration test verifies the persisted OTP expiry is 900 seconds after creation.
The reference-inspired email layout uses a site-configured mail brand and site-theme colors rather than the unrelated reference site's sender or product identity.

## End-to-end delivery and login

Before the fix, a real send to `yantao006@agent.qq.com` at 02:27:01 UTC reached its inbox at 02:27:07 UTC, and its received code established a session.
After uploading the new version, an unsigned ego-browser run submitted the same primary email at 02:33:49 UTC.
`agently-cli message +search` found the new email in the inbox at 02:33:56 UTC with the subject format `Your Awesomejev verification code: [six digits] - Awesomejev`.
`agently-cli message +read` confirmed the delivered HTML contains the white centered card, purple-to-blue stripe, heading, 15-minute explanation, dashed purple six-digit box, and ignore-if-unrequested note.
The received code was pasted into the six cells and Verify & Sign In was clicked.
The page reloaded with an account menu and 130 available credits; `/api/auth/get-session` returned HTTP 200 with both session and user, with email `yantao006@agent.qq.com`.
The real one-time code and session token are not stored in this repository.

## Dialog and email visuals

The earlier unsigned desktop and 390px mobile passes confirmed that only the wide code dialog remains visible after send, that Use a different email restores focus to the email input, and that the close X exits the entire sign-in flow.
At 1440 × 900 the dialog measured 580 × 419px; at 390 × 844 it measured 358 × 306px without horizontal overflow.
They also checked the six grouped cells, automatic focus advance, Backspace, paste, disabled-until-complete action, and resend cooldown reset after a real resend.

- [Desktop OTP dialog](desktop.png)
- [390px OTP dialog](mobile-390.png)
- [Sample email HTML using a non-real code](mail-preview.html)
- [Sample email render](mail-preview.png)
- [Signed-in page after the delivered code](signed-in.png)

The React Bits Pro registry installation command timed out; this implementation uses the licensed Auth-6 source supplied in the task brief.
Validation: `pnpm test` (100 passed), `pnpm typecheck`, `pnpm cf:build`, `pnpm site-check`, and `pnpm site-check fixtures/second-site`.

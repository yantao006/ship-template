# Email OTP preview verification - 2026-09-28

Preview alias:

https://popovers-awesomejev-test.yantao006.workers.dev/en

Current delivery-fix preview Worker version: `3b50f1ce-1e3a-4be1-a78b-2352b637b474`.
The original delivery-and-login run used version `64cbd54b-7181-4dd6-9a3a-5f0930542659`; this fix was uploaded with `pnpm exec wrangler versions upload --preview-alias popovers --message otp-delivery-ack-r2`.
The `popovers` alias is shared with another workstream, so verify its served build before relying on it; the immutable version URL distinguishes this exact build:

https://3b50f1ce-awesomejev-test.yantao006.workers.dev/en
No production deployment or `SITE_URL` change was made.

## What happened and why

Trigger: on the preview, an unauthenticated visitor opened Sign In, entered an email address, and submitted it.
Environment-dependent condition: `agently-cli +me` lists `yantao006@agent.qq.com` as the sole authorized inbox alias.
An earlier test submitted `yantao006+otpqa@agent.qq.com`; the UI opened the code dialog, but an inbox search for that exact recipient found no mail.
Changing only the recipient to the authorized primary address yielded an inbox message from `noreply@awesomejev.link` within approximately six seconds, before any code or dialog changes.
Visible symptom: the code dialog opens after Cloudflare accepts a send request, not after the recipient's mailbox confirms delivery.
Further diagnosis found that `awesomejev.link` had Email Routing but no Email Sending domain onboarded; the routing destination list contained only the verified `yantao006@agent.qq.com` address.
Cloudflare's documented limit before sender onboarding is sending to verified destinations only, so the prior plus-address result was not evidence of a plus-address parsing bug.
The email OTP callback was already wired to the Cloudflare `EMAIL` binding, but Better Auth swallowed the send error and returned HTTP 200, causing a false code-dialog success.
The auth wrapper now awaits the send promise and returns HTTP 502 on rejection; the Cloudflare adapter also rejects a missing acknowledgement ID.
The sender domain was onboarded to Email Sending with Cloudflare-managed `cf-bounce` MX/SPF/DKIM and a previously absent DMARC record; Email Routing stayed enabled.
No production Worker version was deployed and `SITE_URL` stayed unchanged.

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

## Three-address delivery investigation on the current preview

Trigger: as an unauthenticated user on the preview, enter each exact address and submit the email sign-in form, without plus-address aliases.
Condition: before Email Sending onboarding, `yantao006@agent.qq.com` was the only verified destination; Gmail and 126 were unverified and had no sender-domain authorization path.
Visible symptom: the old Better Auth response was HTTP 200 and its UI claimed a code was sent to all three addresses, despite no guarantee that Cloudflare accepted those unverified sends.
At 03:22:47 UTC, the primary address was submitted and a message appeared in its authorized inbox at 03:22:53 UTC; Gmail and 126 attempts at 03:16 and 03:22 opened the old code field without comparable receipt evidence.
Cloudflare did not provide per-message error records for these pre-onboarding attempts, so their precise provider error code is not asserted.
The earliest established divergence is the verified-destination gate at Cloudflare, after Better Auth generated an OTP and before the recipient's mailbox.

After onboarding and uploading version `3b50f1ce-1e3a-4be1-a78b-2352b637b474`, the browser submitted `yantao006@126.com` at 03:33:36 UTC, `yantao006@gmail.com` at 03:33:59 UTC and `yantao006@agent.qq.com` at 03:34:08 UTC.
Each returned HTTP 200 and displayed the standalone Auth-6 dialog only after the service acknowledged sending.
The Cloudflare Email Sending activity log independently recorded Gmail and 126 as **Delivered**, with no delivery-failed or bounce event for those messages at inspection time.
That status is evidence of downstream SMTP acceptance, not proof the emails appeared in those mailboxes; neither Gmail nor 126 inbox was accessible here.
`agently-cli message +list --dir inbox` independently showed a new branded message for `yantao006@agent.qq.com` at 03:34:15 UTC.
The inbox and a prior full login prove the primary-address path only; the new Gmail and 126 sign-ins were not completed.
A regression test simulates provider rejection and asserts HTTP 502 rather than an unusable code dialog.

## Arbitrary recipient check

`wrangler.jsonc` declares `send_email: [{ name: 'EMAIL' }]` with no `destination_address` or `allowed_destination_addresses` restriction.
The configured sender domain `awesomejev.link` is enabled under Cloudflare Email Sending, not just Email Routing.
The application forwards the supplied recipient to the provider without comparing it against a recipient list.
The Miniflare regression covers accepted addresses on three different domains (`example.com`, `outlook.com`, `proton.me`) and a rejected provider send returning HTTP 502.
Cloudflare's documented limit is that onboarding the sender domain permits sending to any recipient, subject to ordinary provider validation, suppression and delivery outcomes:

https://developers.cloudflare.com/email-service/platform/limits/

At 04:08:27 UTC, an independent Cloudflare Email Sending test addressed `yan.tao006@gmail.com`, which is absent from all three original test addresses and from the verified destination list.
The Wrangler Email Sending command returned `Queued for: yan.tao006@gmail.com`; the Cloudflare activity log then reported **Delivered** for that exact recipient and no observed bounce.
This test used the provider sending command directly rather than the OTP application route because the shared `popovers` preview alias belongs to another workstream; no alias was overwritten and no new Worker version was uploaded.
It proves provider acceptance and downstream handoff for an unlisted recipient, not inbox visibility or a completed login for that address.

## Dialog and email visuals

The earlier unsigned desktop and 390px mobile passes confirmed that only the wide code dialog remains visible after send, that Use a different email restores focus to the email input, and that the close X exits the entire sign-in flow.
At 1440 × 900 the dialog measured 580 × 419px; at 390 × 844 it measured 358 × 306px without horizontal overflow.
They also checked the six grouped cells, automatic focus advance, Backspace, paste, disabled-until-complete action, and resend cooldown reset after a real resend.

- [Desktop OTP dialog](desktop.png)
- [390px OTP dialog](mobile-390.png)
- [Sample email HTML using a non-real code](mail-preview.html)
- [Sample email render](mail-preview.png)
- [Signed-in page after the delivered code](signed-in.png)
- [Cloudflare delivery activity with real OTP values redacted](delivery-log-redacted.png)
- [Post-fix desktop dialog](delivery-desktop.png)
- [Post-fix 390px dialog](delivery-mobile-390.png)

The React Bits Pro registry installation command timed out; this implementation uses the licensed Auth-6 source supplied in the task brief.
Validation for the fix: `pnpm test` (101 passed), `pnpm typecheck`, `pnpm cf:build`, `pnpm site-check`, and `pnpm site-check fixtures/second-site`.

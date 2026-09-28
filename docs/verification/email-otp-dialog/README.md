# Email OTP dialog preview - 2026-09-28

Preview alias:

https://popovers-awesomejev-test.yantao006.workers.dev/en

Worker version: `a17c646e-c744-4eef-bc32-d351bfa22a0f`.
Uploaded using `pnpm cf:build` and `pnpm exec wrangler versions upload --preview-alias popovers --message otp-wide-mobile`, not deployed to production.
`SITE_URL` was not changed.

## Unsigned ego-browser run

Opened Sign In and the email entry within the source-inspired card.
Submitted an owner-controlled email address and waited for a successful send response before the separate dialog appeared.
The email card disappears while the code dialog is open, leaving only the page behind the wide dialog.
Confirmed the top-left Use a different email action, top-right close button, no diamond icon, Enter Verification Code, a separate stronger email line after Verification code sent to, Code expires in 15 minutes, grouped six fields with central divider, a disabled Verify & Sign In until six digits, and Didn't receive it? with Resend in Ns followed by Resend code.
At 1440 × 900 the dialog measured 580 × 419px; at 390 × 844 it measured 358 × 306px with no horizontal overflow.
Both measured widths exceed their heights.
The desktop dialog used the existing dark auth-card panel and purple button token.
Entered one digit to confirm focus advanced; Backspace on an empty field focused the previous field; pasted six digits to confirm all cells filled and the verify button enabled.
Did not submit a real code.
Clicked Use a different email and confirmed focus returned to the original editable email input with the code layer closed.
Changed the email, sent a second code, waited for the 30-second cooldown and clicked Resend code; the cooldown restarted on successful resend.
Clicked the close X and confirmed the whole sign-in flow closed, with neither the code layer nor email card left open.

Screenshots:

- [Desktop dialog](desktop.png)
- [390px mobile dialog](mobile-390.png)

The registry install command was attempted first with the ignored local license environment; the command timed out, so this implementation uses the licensed Auth-6 source supplied in the task brief.
Tests: `pnpm test` (99 passed), `pnpm typecheck`, `pnpm cf:build`, `pnpm site-check`, `pnpm site-check fixtures/second-site`.
No real received OTP was entered and no successful email sign-in is claimed.

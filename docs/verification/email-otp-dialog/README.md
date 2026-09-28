# Email OTP dialog preview - 2026-09-28

Preview alias:

https://popovers-awesomejev-test.yantao006.workers.dev/en

Worker version: `19c78194-f102-4e77-8cb7-7ff8ca82f162`.
Uploaded using `pnpm cf:build` and `pnpm exec wrangler versions upload --preview-alias popovers --message otp-dialog`, not deployed to production.
`SITE_URL` was not changed.

## Unsigned ego-browser run

Opened Sign In and the email entry within the source-inspired card.
Submitted an owner-controlled email address and waited for a successful send response before the separate dialog appeared.
The code was not shown inside the email card.
Confirmed the top-left Use a different email action, top-right close button, no diamond icon, Enter Verification Code, a separate stronger email line after Verification code sent to, Code expires in 15 minutes, grouped six fields with central divider, a disabled Verify & Sign In until six digits, and Didn't receive it? with Resend in Ns followed by Resend code.
At 2548 × 1341 the dialog measured 420 × 471px; at 390 × 844 it measured 358 × 451px with no horizontal overflow.
The desktop dialog used the existing dark auth-card panel and purple button token.
Entered one digit to confirm focus advanced; Backspace on an empty field focused the previous field; pasted six digits to confirm all cells filled and the verify button enabled.
Did not submit a real code.
Clicked Use a different email and confirmed focus returned to the original editable email input with the code layer closed.
Changed the email, sent a second code, waited for the 30-second cooldown and clicked Resend code; the cooldown restarted on successful resend.
Clicked the close X and confirmed only the code layer closed while the email card remained open with the current address.

Screenshots:

- [Desktop dialog](desktop.png)
- [390px mobile dialog](mobile-390.png)

The registry install command was attempted first with the ignored local license environment; the command timed out, so this implementation uses the licensed Auth-6 source supplied in the task brief.
Tests: `pnpm test` (99 passed), `pnpm typecheck`, `pnpm cf:build`, `pnpm site-check`, `pnpm site-check fixtures/second-site`.
No real received OTP was entered and no successful email sign-in is claimed.

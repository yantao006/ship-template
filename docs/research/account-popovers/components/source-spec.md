# Account popover source specification

Observed in the signed-in source browser at 1440 × 900 and 390 × 844 on 2026-09-26.
The source account and its balances are observation only, never seed data for this site.
Computed values below come from browser `getComputedStyle` and `getBoundingClientRect`, not an image estimate.

## Triggers and menus

The desktop credit trigger is 57 × 36 px at x=1299, y=66, with a 36 px avatar to its right.
Click opens a 288 px-wide, 14 px-radius dark credit card below the trigger; outside click, Escape, or another trigger closes it.
The credit card shows live balance, Buy Credits, Daily check-in, Share and earn, Invite Friends, and Feedback & Get Credits.
The profile trigger opens a 288 × 638 px menu at x=1120, y=110, with computed background `lab(15.204 0 0)`, 1 px border at 15% violet opacity and 14 px radius.
The profile rows use 14 px type: reward rows are 262 × 44 px, padding 10 × 12 px and 8 px vertical gaps; other rows are 262 × 54 px with the same padding.
The menu includes the real profile, three reward actions, Commercial Use License, Contact Us, Account, Invoices, Credit Center, and Sign Out.
Reward items open the same dialogs regardless of which trigger was used.
Links navigate to their own site's corresponding licensing, account, billing, and credit pages.
The source Sign Out click reloaded the homepage but the observed avatar and balance were still visible afterward; the local implementation must prioritize ending its own better-auth session rather than copying that unreliable result.
Hover changes row fill or border, while opening and closing use opacity, scale and a short vertical translate; reduced-motion disables that animation.

## Daily check-in

The source dialog at 1440 × 900 has a computed rect x=200, y=69, width=1040, height=762, a 28 px radius, background `rgb(16,17,17)` and 1 px translucent border.
It zooms and fades onto a dimmed, blurred backdrop, closes with Escape, close control, or backdrop click, and traps focus.
The hero has 36 px padding, height 174 px, a subtle 32 px grid and violet glow; its kicker is 12 px/900 with 0.18em tracking and `rgb(196,181,253)`, heading 34 px/900, and supporting copy 16 px.
The body padding is 32 × 36 px and its section gap is 24 px.
The seven-day header uses 16 px/800 uppercase type and a 12 px/700 pill, 12 × 4 px padding.
The seven day tiles occupy a 966 × 96 px desktop grid.
Completed days show a check with muted gray surface; the current unclaimed day has a violet surface, dark text and an orange corner dot; future days are dark and subdued.
The completion count is based on the seven-day streak, not seven identical rewards.
The claim button is 966 × 56 px with 16 px/900 type and 16 px radius; hover raises it 2 px when enabled; once claimed it is visibly disabled and says to come back tomorrow.
The next claim time appears in 12 px type below the button when claimed, derived from the next eligible server day rather than a fabricated clock.
A 966 × 196 px share panel at x=237, y=546 uses 24 px padding, 24 px radius, a 4 px orange top-right accent, a 14 px/700 Copy invite button (135 × 44 px), and five 44 px-high equal-width social actions: Facebook, X, WhatsApp, LinkedIn, Telegram.
The social buttons hover upward 2 px and open outbound share intents in a new tab; Copy invite copies the current user's referral URL and shows a success or failure notice.
Activity details is a 119 × 32 px text button below the panel; click reveals source activity information, not a fake account error.
The source's reward-mode tooltip is triggered by hover or focus on the information icon.
On mobile 390 × 844, the dialog rect is x=0, y=8, width=390, height=828 and scrolls internally, with a visible close button, a wrapped heading and the seven tiles in two rows.
The source has horizontal overflow on the grid and share panel at this viewport; the reusable implementation should preserve all controls without clipping them horizontally.

## Other nested surfaces and clicks

Share and earn is a 1040 px-wide, 28 px-radius dialog with a violet hero and two step panels: publish recommendation, quick-copy text, Reddit/X/Facebook/LinkedIn outbound intents, expandable Where can I share, URL field and Submit.
Submitting a public URL creates a pending review record only; it does not grant credits until approved.
Invite is a 980 px-wide dialog with referral URL, Copy Link, five social intents, reward amounts, referred counts, rules, history and a leaderboard area; the site's own referral records must be used, not the source's leaderboard identities.
Buy Credits opens a site pricing modal with Monthly, Yearly, and Credit Packs tabs in the source; this site's modal shows only configured billing plans and its checkout page, never fake SKUs.
The source invite dialog measures 980 × 884 px at x=230, y=8, scrolls internally, uses a full-width violet-to-pink hero (188 px high), a wide referral-link panel, then a two-column rewards and leaderboard row.
The source social share buttons open external platform intents in new tabs (verified Facebook invite intent), and its check-in Copy invite displays a copied-message toast.
Feedback and Contact are mailto actions presented in separate compact dialogs; the source's Feedback dialog measured about 426 × 262 px after settling.
Commercial license navigates to the site's configured commercial-use destination.
Account navigates to `/account`; the source page contains profile identity, Sign Out and account deletion controls.
Invoices navigates to `/account/Invoices`, displaying an empty-orders state for the observed account.
Credit Center navigates to `/account/credits` with balance, a purchase action, credit-change filter and ledger rows.
Commercial Use License navigates to `/commercial-license`; this site's configured destination is pricing because it does not issue a commercial-use certificate.
The local site's own account dashboard, purchase receipts and ledger are the adapted destinations and must not claim a certificate it cannot issue.
Every dialog has an explicit close control and Escape/backdrop dismissal.
All currency, account amounts, reward counts, social networks, copy, plan selection and destination links are site configuration or locale data.
A request error is shown only for an actual failed request; loading is temporary, and successful account activity clears a stale loading error.

# MiniMax H3 sign-in card - measured appearance

Source (ego-browser TaskSpace 24, 1440 × 900 desktop and 390 × 844 mobile, September 2026):

https://minimaxh3.ai/
This is a visual reference, not a source for product claims or auth behavior.
The local copy and capabilities remain owned by `site/`.

## Entry and states

- The initial source homepage is dark and the header's `Get Started` opens a centered card at desktop.
- The source switches to light through its header theme button; opening the card in light preserves that theme.
- Desktop email action replaces the secondary `Sign in with Email` button with an email input and arrow submit in place, without navigating.
  This task deliberately keeps the existing password-based email form instead of adding an email-code flow.
- Source mobile uses a bottom drawer and hides the image.
  The drawer mechanics belong to a separate task; this implementation only adapts the card contents to the existing modal on mobile.
- Clicking the source Google button on mobile closed the card and left the URL at `/`; the header then showed an account avatar and 4 available credits.
  No consent or password wall appeared in this browser session, so no external auth interaction is copied into the visual variant.
- No consent or password wall was encountered before these states.

## Desktop computed geometry, 1440 × 900

| Element | Measured value |
| --- | --- |
| Overlay | `rgba(0, 0, 0, .6)` |
| Card | x 280, y 150, width 880, height 600, radius 28px; left 42% (369.6px), right 58% (510.4px) |
| Left image | fills left 369.6 × 600, `object-fit: cover`; top label x 304 y 174; bottom slogan x 308 y 634 |
| Right panel | x 649.6, width 510.4, 40px padding, vertical center, 24px group gap |
| Heading | x 689.6 y 230.4, 30px / 32.4px, 700, -0.9px tracking, Bricolage Grotesque; 20px margin below |
| Benefit rows | x 689.6, width 430.4; y 282.8, 353.8, 424.8; height 63; gap 8; padding 12px 16px; border 1px, radius 16px; icon circle 32px, icon 16px; row title 15px / 18.75px, 600; description 13px / 16.25px, margin-top 2px |
| Action group | x 689.6 y 511.8, width 430.4; Google height 56, radius 9999px, 20px / 28px, 600; divider y 579.8, height 16; email y 599.8 height 36, 14px / 20px; terms y 647.8, 11px / 17.875px |
| Close | x 1108 y 166, 36 × 36, dark translucent circular background |

## Computed theme values

| Property | Light | Dark |
| --- | --- | --- |
| Card / right panel | `rgb(244, 242, 238)` / `rgb(255, 255, 255)` | `rgb(17, 17, 19)` / `rgb(32, 32, 36)` |
| Heading / primary text | `rgb(10, 10, 10)` | `rgb(250, 250, 250)` |
| Benefit row / border | `rgb(236, 232, 224)` / `rgb(232, 229, 223)` | `rgb(25, 25, 29)` / `rgb(50, 50, 56)` |
| Benefit icon circle | `rgb(10, 10, 10)` | `rgb(167, 139, 250)` |
| Secondary text | `rgb(107, 114, 128)` | `rgb(161, 161, 170)` |
| Terms text | `rgb(156, 163, 175)` | `rgb(113, 113, 122)` |
| Google background / foreground | `rgb(10, 10, 10)` / white | `rgb(122, 91, 255)` / white |
| Google hover | `rgb(0, 0, 0)` | `rgb(0, 0, 0)` |

Google shadow starts at `0 8px 24px -8px rgba(0,0,0,.35)` and hovers at `0 12px 32px -8px rgba(0,0,0,.45)`.
On hover, the button translates up 1px and scales to 1.01 over 200ms with `cubic-bezier(.4,0,.2,1)`; active scales to .99.
Email/link colors transition over 150ms with the same easing.
Desktop modal enters via fade and zoom from 95% to 100% over 200ms; no looping ambient animation was observed.

## Mobile computed card contents, 390 × 844

- Source drawer bounds x 0, y 326, width 390, height 518, radius 24px on top; the image is absent.
- Heading x 20 y 386, width 350, 26px / 28.6px.
- Rows are stacked with 8px gaps and retain 15px titles, 13px descriptions and 32px icons.
- Google x 20 y 660, width 350, height 56, font 18px; email x 20 y 746, height 36; terms x 20 y 792, width 350, wraps to two lines.
- The source drawer has a 500ms `cubic-bezier(.32,.72,0,1)` translation; excluded here per task scope.

## Local adaptation

The left media is a placeholder as requested, not the source image.
Its brand label and logo come from `site/site.config.ts`, feature text and legal text from localized `site/messages/{en,zh}/sign-in.ts`, and the welcome credit amount from `site.signupCredits`.
The source's claimed image/video generation is not repeated as a live capability; local feature copy must honestly describe the preview and configured workflows.

## Review loop and comparison

The first Cloudflare preview used a 960px-wide inherited `auth4-dialog` instead of the source's 880px, and the initial mobile heading collided with the close button.
The source measurements above were correct, so the component selectors were made more specific and the mobile top padding was increased to 60px before uploading again.
A further mobile comparison found the overlay's 12px side padding made the content x32 instead of the source x20; the final preview removes that padding only on mobile, without adding the excluded bottom drawer.

The final preview alias was uploaded as Worker version `efed1c75-92ea-4e04-9a5c-f713edc9f420`.
At desktop 1440 × 900 in both modes, source and preview modal bounds are exactly x280 y150 880 × 600, with the right panel starting x649.6, benefit rows and Google button both 430.4px wide and 63px / 56px high respectively.
The Google backgrounds match computed values in both modes: light `rgb(10, 10, 10)`, dark `rgb(122, 91, 255)`.
The local brand name forces a two-line heading (64.8px versus source 32.4px), so its vertically centered benefit rows and button land 16.2px lower; shrinking or replacing this site's identity would violate the site-owned brand requirement.
The deliberately different left image is the approved site-local placeholder.
At mobile 390 × 844, source and preview Google buttons are both x20, width350, height56 with matching mode colors; the vertical coordinates differ because the source uses an excluded bottom drawer while this task retains the existing centered modal.

| View | Source screenshot | Final preview screenshot |
| --- | --- | --- |
| Light desktop | `docs/verification/auth-card/source-light-desktop.png` | `docs/verification/auth-card/preview-light-desktop.png` |
| Dark desktop | `docs/verification/auth-card/source-dark-desktop.png` | `docs/verification/auth-card/preview-dark-desktop.png` |
| Light mobile | `docs/verification/auth-card/source-light-mobile.png` | `docs/verification/auth-card/preview-light-mobile.png` |
| Dark mobile | `docs/verification/auth-card/source-dark-mobile.png` | `docs/verification/auth-card/preview-dark-mobile.png` |

The local email action opens the existing email/password flow inside the same card, not the source email-code flow.
No production hostname was deployed.

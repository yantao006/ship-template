# MiniMax H3 sign-in card - measured appearance

Source (ego-browser TaskSpace 24, 1440 × 900 desktop and 390 × 844 mobile, September 2026):

https://minimaxh3.ai/
This is a visual reference, not a source for product claims or auth behavior.
The local copy and capabilities remain owned by `site/`.

## Entry and states

- The initial source homepage is dark and the header's `Get Started` opens a centered card at desktop.
- The source switches to light through its header theme button; opening the card in light preserves that theme.
- The email action replaces the secondary `Sign in with Email` button with an email input and arrow submit in place, without navigating.
  On mobile the source form is x20 y738.25, width350, height44; the input is 298px wide, and the purple circular arrow button is 44px with an 8px gap.
  The visual variant retains the in-place presentation and uses the email-code behavior already merged into the base application.
- At 390 × 844 in the light source, clicking Sign in with Email leaves the OR and both horizontal rules visible above the input, which begins at y738.25 and is 44px high.
  The source input is 298px wide and its arrow is 44px wide, with an 8px gap; the screenshot was rechecked against the local expanded state before changing layout.
- Source mobile uses a bottom drawer and hides the image.
  The base application's bottom drawer landed separately; this task retains those mechanics and adapts only the copied card's contents.
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
- The source drawer has a 500ms `cubic-bezier(.32,.72,0,1)` translation; drawer behavior is owned by the separately landed application flow, not this variant.

## Local adaptation

The left media is a placeholder as requested, not the source image.
Its brand label and logo come from `site/site.config.ts`, feature text and legal text from localized `site/messages/{en,zh}/sign-in.ts`, and the welcome credit amount from `site.signupCredits`.
The source's claimed image/video generation is not repeated as a live capability; local feature copy must honestly describe the preview and configured workflows.

## Review loop and comparison

The first Cloudflare preview used a 960px-wide inherited `auth4-dialog` instead of the source's 880px, and the initial mobile heading collided with the close button.
The source measurements above were correct, so the component selectors were made more specific and the mobile top padding was increased to 60px before uploading again.
A further mobile comparison found the overlay's 12px side padding made the content x32 instead of the source x20; the final preview removes that padding only on mobile, without adding the excluded bottom drawer.

The original preview alias was uploaded as Worker version `efed1c75-92ea-4e04-9a5c-f713edc9f420`; after integrating current main, the preceding alias was uploaded as `aa7641c9-00c2-4436-afd2-fdd39aedfa5b`.
At desktop 1440 × 900 in both modes, source and preview modal bounds are exactly x280 y150 880 × 600, with the right panel starting x649.6, benefit rows and Google button both 430.4px wide and 63px / 56px high respectively.
The expanded source input starts at y595.75 and the preview input at y601.45; both are 378.4 × 44px, and the preview OR divider ends at y589.45, leaving 12px before the input.
The Google backgrounds match computed values in both modes: light `rgb(10, 10, 10)`, dark `rgb(122, 91, 255)`.
The local brand name forces a two-line heading (64.8px versus source 32.4px), so its vertically centered benefit rows and button land 16.2px lower; shrinking or replacing this site's identity would violate the site-owned brand requirement.
The deliberately different left image is the approved site-local placeholder.
At mobile 390 × 844, the first preview had source-matching button width and colors but different vertical coordinates because it predated the separately landed bottom drawer.
After updating onto main, the 390 × 844 preview uses the separately landed bottom drawer and hides the image.
In both modes, the preview drawer is x0 y311.94, 390 × 532.06; the source is x0 y325.66, 390 × 518.34.
The extra 14px of height comes from the local two-line brand heading, not a different drawer width or button size.
The preview Google button is x20 y674.13, 350 × 56 versus source x20 y660.25, 350 × 56; both computed backgrounds match the source at `rgb(10, 10, 10)` and `rgb(122, 91, 255)`.
The in-place email form was re-extracted after the update in both modes.
In the previous preview, the divider ended at y742.13 and the email input started at y754.13 in both modes, but review reported the expanded input covering the OR and rules in the shared alias.
The follow-up places the divider and inline form in one explicit column-flow group with a 12px row gap, so the label and both rules cannot be overlaid by the input.
The new preview alias was uploaded as Worker version `2b762543-321f-4191-81d8-eabf8c426b05` with the existing `WAFFO_PRODUCTS` catalog and compared in ego-browser with the source in both themes at 390 × 844 and 1440 × 900.
In both mobile preview modes the divider is x20 y726.13, 350 × 16, and the input is x20 y754.13, 298 × 44; both rules and OR remain visible in the 12px gap above the input.
The source mobile input starts at y738.25; the local longer brand makes the card taller, while the input and arrow remain 298 × 44 and 44 × 44 within the same 350px row.

| View | Source screenshot | Final preview screenshot |
| --- | --- | --- |
| Light desktop | `docs/verification/auth-card/source-light-desktop.png` | `docs/verification/auth-card/preview-light-desktop.png` |
| Dark desktop | `docs/verification/auth-card/source-dark-desktop.png` | `docs/verification/auth-card/preview-dark-desktop.png` |
| Light mobile | `docs/verification/auth-card/source-light-mobile.png` | `docs/verification/auth-card/preview-light-mobile.png` |
| Dark mobile | `docs/verification/auth-card/source-dark-mobile.png` | `docs/verification/auth-card/preview-dark-mobile.png` |
| Light mobile, email expanded | `docs/verification/auth-card/source-light-email-mobile.png` | `docs/verification/auth-card/preview-light-email-mobile.png` |
| Dark mobile, email expanded | `docs/verification/auth-card/source-dark-email-mobile.png` | `docs/verification/auth-card/preview-dark-email-mobile.png` |
| Light desktop, email expanded | `docs/verification/auth-card/source-light-email-desktop.png` | `docs/verification/auth-card/preview-light-email-desktop.png` |
| Dark desktop, email expanded | `docs/verification/auth-card/source-dark-email-desktop.png` | `docs/verification/auth-card/preview-dark-email-desktop.png` |

The local email action opens the already-merged email-code flow inside the same card.
The separate flow's success reload and bottom drawer remain unchanged by this visual variant.
No production hostname was deployed.

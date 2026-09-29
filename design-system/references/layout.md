# SaaS block layout catalog

These are structural specimens of the fetched React Bits Pro blocks, in the requested composition order.
The recipe is an ordering guide, not a source of replacement product claims.
Use `preview.html` for the single white type, color, and motion system.
The HTML below shows section scaffolds; repeated children are specified in `component.md`.
All geometry is plain CSS and all visual tokens are references to the shared preview.

## navigation-1

The source has a brand, two dropdown groups, a pricing link, notification and sign-in actions, and a primary action; the compact view replaces the desktop links with a disclosure menu.

```html
<nav id="navigation-1" class="nav block" aria-label="Primary">
  <div class="wrap nav-row">
    <a class="brand" href="#hero-1">Flowbase</a>
    <div class="nav-links"><!-- two nav groups and Pricing --></div>
    <div class="nav-actions"><!-- notifications, sign in, primary action --></div>
    <details class="nav-mobile"><summary>Menu</summary><!-- groups and actions --></details>
  </div>
</nav>
```

```css
.nav { border-bottom: 1px solid var(--line); padding: 16px 0; }
.nav-row { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.nav-links, .nav-actions { display: flex; align-items: center; gap: 12px; }
.nav-mobile { display: none; }
@media (max-width: 900px) { .nav-links, .nav-actions { display: none; } .nav-mobile { display: block; } }
```

## hero-1

The preview label sits above the block and is not part of the source composition.
The copy column contains an announcement, headline, lead, two actions, and avatar proof; the other column contains a real photograph with a concave corner control.
The columns stack below 1024px and split evenly from 1024px, with a 32px gap that grows to 48px and then 64px from 1280px.
The photograph frame has a minimum height of 250px, increasing to 500px from 640px, and a 32px radius.

```html
<section id="hero-1" class="block">
  <div class="wrap">
    <span class="block-label">hero-1 · announcement, split hero and avatar proof</span>
    <div class="hero-grid">
      <div class="hero-copy"><!-- announcement, h1, lead, actions, avatar row --></div>
      <div class="hero-visual"><div class="hero-photo"><!-- image and corner notch --></div></div>
    </div>
  </div>
</section>
```

## social-proof-1

A centered trust line precedes six logo tiles in a bordered grid.

```html
<section id="social-proof-1" class="block logos">
  <div class="wrap"><h2>Trusted by the most innovative companies in the world</h2>
    <div class="logo-grid"><!-- six logo tiles --></div>
  </div>
</section>
```

```css
.logos h2 { text-align: center; margin: 0 0 40px; }
.logo-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); border: 1px solid var(--line); }
@media (max-width: 900px) { .logo-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 540px) { .logo-grid { grid-template-columns: repeat(2, 1fr); } }
```

## features-2

The source is a split section: eyebrow, heading, lead and three selectable rows on the left; a portrait image with an overlaid status dashboard on the right.

```html
<section id="features-2" class="block">
  <div class="wrap split">
    <div><header class="intro"><!-- eyebrow, h2, lead --></header>
      <div class="feature-tabs"><!-- three selectors --></div>
    </div>
    <div class="feature-visual photo-placeholder"><!-- status dashboard --></div>
  </div>
</section>
```

```css
.split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 64px; align-items: center; }
.feature-tabs { display: grid; gap: 12px; border-top: 1px solid var(--line); padding-top: 24px; }
.feature-visual { display: grid; place-items: center; min-height: 600px; padding: 24px; }
@media (max-width: 900px) { .split { grid-template-columns: 1fr; gap: 36px; } .feature-visual { min-height: 440px; } }
```

## features-1

This is the existing specimen folded into the shared catalog: eyebrow, title and lead above an eight-item icon grid, one column on narrow screens, two from 640px and four from 1024px.

```html
<section id="features-1" class="block f1">
  <div class="wrap">
    <header class="intro"><p class="eyebrow">Enterprise Security Platform</p>
      <h2>Protect what matters most</h2><p class="lead">Comprehensive cybersecurity solutions that protect your business from evolving threats while ensuring complete compliance.</p>
    </header>
    <div class="f1-grid"><!-- f1-item × 8 --></div>
  </div>
</section>
```

```css
.f1-grid { display: grid; grid-template-columns: 1fr; column-gap: 24px; row-gap: 32px; }
@media (min-width: 640px) { .f1-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px) { .f1-grid { column-gap: 32px; row-gap: 48px; } }
@media (min-width: 1024px) { .f1-grid { grid-template-columns: repeat(4, 1fr); } }
```

## how-it-works-1

The source has a heading with a right-hand button, three numbered slide articles with two overlapping photo panels per step, and previous/next plus dot controls.
The static specimen keeps all three steps visible so a catalog reader does not have to operate a carousel to inspect them.

```html
<section id="how-it-works-1" class="block">
  <div class="wrap"><header class="steps-heading"><!-- eyebrow, h2, action --></header>
    <div class="steps-grid"><!-- numbered step × 3, each with overlapping photos --></div>
    <nav class="step-controls" aria-label="Step navigation"><!-- previous, dots, next --></nav>
  </div>
</section>
```

```css
.steps-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 48px; }
.steps-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.step-controls { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
@media (max-width: 900px) { .steps-grid { grid-template-columns: 1fr; } .steps-heading { align-items: start; flex-direction: column; } }
```

## stats-3

The actual source uses a centered introductory heading and lead, a thin vertical connector, then a two-column case-study panel: story and two statistics on the left, a photograph with geometric tile overlay on the right.
It is not a generic four-number counter row.

```html
<section id="stats-3" class="block">
  <div class="wrap"><header class="stats-intro"><h2>Monitor everything and prevent issues before they happen</h2><p class="lead">Our platform helps you track metrics across your entire infrastructure, identifying bottlenecks and optimization opportunities.</p></header>
    <div class="stats-stem"></div>
    <div class="stats-panel"><div><!-- case study heading, lead, two stats --></div><div class="photo-placeholder"><!-- geometric tiles --></div></div>
  </div>
</section>
```

```css
.stats-intro { max-width: 650px; margin: 0 auto 40px; text-align: center; }
.stats-stem { width: 1px; height: 64px; margin: 0 auto; background: var(--line); }
.stats-panel { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid var(--line); }
@media (max-width: 900px) { .stats-panel { grid-template-columns: 1fr; } }
```

## social-proof-8

The original is one testimonial at a time, not a card grid: a square portrait at left, a large quote, attribution and three progress indicators at right.
The shared preview shows the first quote as the representative state and lists the other quotes as additional inspectable states.

```html
<section id="social-proof-8" class="block">
  <div class="wrap testimonial"><div class="portrait photo-placeholder"></div>
    <div><blockquote><!-- quote --></blockquote><div class="testimonial-foot"><!-- attribution, three indicators --></div></div>
  </div>
</section>
```

```css
.testimonial { display: grid; grid-template-columns: minmax(200px, 1fr) 2fr; gap: 32px; align-items: stretch; }
.portrait { width: 100%; max-width: 260px; aspect-ratio: 1; }
.testimonial-foot { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-top: 32px; }
@media (max-width: 700px) { .testimonial { grid-template-columns: 1fr; } .testimonial-foot { flex-wrap: wrap; } }
```

## comparison-1

The left column holds the comparison title, explanation and action; the right holds two brand names and five rows of paired yes/no cells, with each feature label repeated in both columns as in the source.

```html
<section id="comparison-1" class="block"><div class="wrap split">
  <header><!-- h2, lead, action --></header>
  <div class="comparison-table"><div class="comparison-head"><!-- two brands --></div><!-- five paired rows --></div>
</div></section>
```

```css
.comparison-table { min-width: 0; }
.comparison-head, .comparison-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.comparison-row { border-top: 1px solid var(--line); }
@media (max-width: 540px) { .comparison-row { gap: 8px; } }
```

## pricing-1

A centered title and subtitle lead to a standalone free-plan banner, then three side-by-side plan cards with independent period toggles for Pro and Team.
The middle Team card is visually emphasized, while Enterprise is contact-based.

```html
<section id="pricing-1" class="block"><div class="wrap">
  <header class="pricing-intro"><h2>Secure Cloud Storage</h2><p class="lead">Store, sync, and share files securely</p></header>
  <div class="free-banner"><!-- free offer and action --></div>
  <div class="plan-grid"><!-- Pro, Team, Enterprise --></div>
</div></section>
```

```css
.pricing-intro { text-align: center; margin-bottom: 40px; }
.free-banner { max-width: 580px; margin: 0 auto 48px; padding: 20px 24px; border: 1px solid var(--line); }
.plan-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
@media (max-width: 900px) { .plan-grid { grid-template-columns: 1fr; } }
```

## faq-1

A narrow, optionally sticky heading column sits beside three disclosure rows; the first answer is open in the source.

```html
<section id="faq-1" class="block"><div class="wrap faq-grid">
  <header><h2>FAQs</h2><p class="lead">Everything you need to know about our product and billing.</p></header>
  <div><!-- details × 3 --></div>
</div></section>
```

```css
.faq-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 64px; align-items: start; }
.faq-grid header { position: sticky; top: 24px; }
@media (max-width: 900px) { .faq-grid { grid-template-columns: 1fr; gap: 32px; } .faq-grid header { position: static; } }
```

## cta-1

The closing section centers a two-line heading, lead, username entry and login hint over six faint, floating portrait cards.
The preview deliberately does not submit the specimen form.

```html
<section id="cta-1" class="block closing"><div class="cta-portraits" aria-hidden="true"><!-- six photo placeholders --></div>
  <div class="wrap cta-content"><h2>Why settle for<br>algorithm chaos?</h2><p class="lead">Join the platform where creators connect authentically. Build your community without the algorithm chaos.</p>
    <form><!-- username field and action --></form><p><!-- login hint --></p>
  </div>
</section>
```

```css
.closing { position: relative; overflow: hidden; min-height: 540px; display: grid; place-items: center; }
.cta-portraits { position: absolute; inset: 0; pointer-events: none; }
.cta-content { position: relative; max-width: 720px; text-align: center; }
@media (max-width: 700px) { .closing { min-height: 600px; } }
```

## footer-1

The source closes with one identity column, three bordered link-group cards and a large decorative wordmark beneath the grid.

```html
<footer id="footer-1" class="block"><div class="wrap">
  <div class="footer-grid"><div class="footer-identity"><!-- mark, tagline, caption --></div><!-- three link groups --></div>
  <div class="footer-wordmark" aria-hidden="true">FITFORGE</div>
</div></footer>
```

```css
.footer-grid { display: grid; grid-template-columns: 1.2fr repeat(3, 1fr); }
.footer-identity { display: flex; flex-direction: column; justify-content: space-between; padding: 24px; }
.footer-wordmark { overflow: hidden; width: 100%; text-align: center; }
@media (max-width: 900px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 540px) { .footer-grid { grid-template-columns: 1fr; } }
```

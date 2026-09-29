# SaaS block component catalog

Each entry describes the repeating or reusable unit in the corresponding section of `layout.md`.
All specimen sentences are source sample content, not assertions about this site.
The sole rendering and token authority is `../preview.html`.

## navigation-1

Products and Solutions are disclosure groups with seven and five links respectively; the desktop source opens them on hover, while the preview uses native `details` for keyboard and touch access.
The compact menu repeats the same groups plus Pricing, Sign In and Try it FREE.

```html
<details class="nav-group"><summary>Products <svg aria-hidden="true"><use href="#chevron"/></svg></summary>
  <div class="nav-list"><a href="#features-1">Analytics Dashboard</a><!-- six more links --></div>
</details>
```

```css
.nav-group { position: relative; }
.nav-list { display: grid; gap: 4px; padding: 12px; border: 1px solid var(--line); background: var(--surface); }
.nav-links .nav-list { position: absolute; z-index: 5; top: 100%; min-width: 240px; }
```

## hero-1

The pill combines a small New chip and one line of copy; two action controls sit alongside each other, followed by three overlapping initials avatars and a count.
The large image and corner arrow are structural, not a real photo or functioning route.

```html
<div class="announcement"><span class="chip">New</span><span>AI-powered design systems</span></div>
<div class="actions"><a class="button" href="#features-2">Start Building</a><a class="button secondary" href="#how-it-works-1">Watch Demo <svg aria-hidden="true"><use href="#play"/></svg></a></div>
<div class="avatar-row"><div class="avatars"><span>JD</span><span>SK</span><span>AL</span></div><p><strong>50k+</strong><br>Engineers shipping products daily.</p></div>
```

```css
.announcement, .actions, .avatar-row, .avatars { display: flex; align-items: center; gap: 12px; }
.avatars span + span { margin-left: -18px; }
.hero-visual .corner-action { position: absolute; right: 0; bottom: 0; width: 80px; height: 80px; }
```

## social-proof-1

Six bordered logo cells are labeled Acme Corp, Galileo, Layers, Capsule, Luminous and Quotient.
The original uses image logos; this dependency-free specimen uses text marks and does not imply endorsement.

```html
<div class="logo-tile" aria-label="Acme Corp sample logo">Acme Corp</div>
```

```css
.logo-tile { display: grid; place-items: center; min-height: 96px; padding: 16px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); }
```

## features-2

Three selectors correspond to Automate work, Stay in control and Surface new insights.
The selected state swaps the overlay card's heading and three alert rows; a portrait photo is represented by a bordered placeholder.

```html
<button class="feature-tab" type="button" aria-pressed="true"><svg aria-hidden="true"><use href="#shield"/></svg>Automate work</button>
<div class="dashboard"><h3>Security Dashboard</h3><div class="alert-row"><span>Threat detected in Network A</span><span class="status">Critical</span><small>2 min ago</small></div><!-- two more alerts --></div>
```

```css
.feature-tab { display: flex; align-items: center; gap: 12px; width: 100%; padding: 14px 16px; border: 1px solid var(--line); }
.dashboard { width: min(100%, 400px); padding: 24px; border: 1px solid var(--line); background: var(--surface); }
.alert-row { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 0; border-top: 1px solid var(--line); }
```

## features-1

This retains the primary specimen's eight features, one icon plus title on the same line, and a two-line description beneath.
The icon box measures 40px on narrow screens and 48px from 640px, while the glyph measures 20px then 24px.

```html
<article class="f1-item"><div class="f1-head"><span class="f1-icon"><svg aria-hidden="true"><use href="#shield"/></svg></span><h3>Threat Detection</h3></div><p>Real-time monitoring for suspicious activities.</p></article>
```

```css
.f1-item { display: flex; flex-direction: column; }
.f1-head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.f1-icon { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: var(--radius-icon); background: var(--surface); box-shadow: var(--icon-shadow); }
.f1-icon svg { width: 20px; height: 20px; }
.f1-item p { display: -webkit-box; max-width: 20ch; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; color: var(--muted); font-size: var(--text-body); }
@media (min-width: 640px) { .f1-icon { flex-basis: 48px; width: 48px; height: 48px; } .f1-icon svg { width: 24px; height: 24px; } }
```

## how-it-works-1

Each of three numbered articles contains a short title and description plus a larger upper image and smaller overlapping lower image.
The source's carousel control is represented by three navigable anchors in the all-visible static catalog.

```html
<article class="step" id="step-1"><span class="eyebrow">1</span><h3>Create your account</h3><p>Sign up in seconds with your email or social accounts. No credit card required to get started.</p><div class="step-images"><div class="photo-placeholder"></div><div class="photo-placeholder"></div></div></article>
```

```css
.step { min-width: 0; }
.step-images { position: relative; height: 300px; margin-top: 20px; }
.step-images > :first-child { width: 100%; height: 72%; }
.step-images > :last-child { position: absolute; width: 65%; height: 60%; left: 18%; top: 40%; }
```

## stats-3

The actual two metric units are `12x` / Faster deployments and `99.99` / Uptime percentage.
The right photo has a diagonal grid/marquee overlay in the source, simplified here to static tiles.

```html
<div class="metric"><strong>12x</strong><span>Faster deployments</span></div>
```

```css
.metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; }
.metric { display: flex; flex-direction: column; gap: 8px; }
.metric strong { font-size: var(--text-metric); }
@media (max-width: 540px) { .metrics { grid-template-columns: 1fr; } }
```

## social-proof-8

The active testimonial has one square portrait, quotation, name, role and three horizontal progress indicators.
The three source quotes belong to Imani Olowe, David Park and Sofia Davis; they are illustrative attributions, not verified testimonials for this site.

```html
<figure class="quote-state"><div class="portrait photo-placeholder">Portrait placeholder</div><figcaption><blockquote>“The scalability and performance have been game-changing for our organization. We've seen a 50% improvement in response times.”</blockquote><strong>Imani Olowe</strong><p>VP of Engineering at Nexus</p><div class="quote-progress"><span></span><span></span><span></span></div></figcaption></figure>
```

```css
.quote-state { display: grid; grid-template-columns: 1fr 2fr; gap: 32px; margin: 0; }
.quote-progress { display: flex; gap: 12px; }
.quote-progress span { width: 48px; height: 2px; background: var(--line); }
@media (max-width: 700px) { .quote-state { grid-template-columns: 1fr; } }
```

## comparison-1

Each of five rows has two cells, one for SkyVault and one for CloudBox, with a square check or empty outline and the feature name repeated in both cells.
The row names are Unlimited storage, Unlimited uploads, Advanced encryption, Team collaboration and Mobile sync.

```html
<div class="comparison-row"><div class="comparison-cell"><span class="check"><svg aria-hidden="true"><use href="#check"/></svg></span>Unlimited storage</div><div class="comparison-cell"><span class="check empty"></span>Unlimited storage</div></div>
```

```css
.comparison-cell { display: flex; align-items: center; gap: 12px; min-width: 0; padding: 16px 0; }
.check { flex: 0 0 24px; width: 24px; height: 24px; border: 1px solid var(--line); display: grid; place-items: center; }
.check.empty { background: var(--surface); }
```

## pricing-1

The free banner advertises 10 GB storage included.
Pro and Team have separate Yearly/Monthly switches and per-seat monthly prices; Enterprise has no price and ends with Schedule a call.
Plan features are individual check rows.

```html
<article class="plan"><div class="plan-top"><h3>Pro</h3><label>Yearly <input type="checkbox" checked aria-label="Pro yearly billing"></label></div><p>Individual storage for</p><p class="price">$16 <small>per seat /month</small></p><ul><li><svg aria-hidden="true"><use href="#check"/></svg>100 GB secure storage</li><li><svg aria-hidden="true"><use href="#check"/></svg>File versioning</li><li><svg aria-hidden="true"><use href="#check"/></svg>2FA security</li></ul><a class="button" href="#cta-1">Get Pro</a></article>
```

```css
.plan { display: flex; flex-direction: column; padding: 24px; border: 1px solid var(--line); background: var(--surface); }
.plan-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.plan ul { margin-top: auto; padding: 32px 0 20px; list-style: none; }
.plan li { display: flex; align-items: start; gap: 10px; padding: 8px 0; }
.plan .button { width: 100%; }
```

## faq-1

The source's first of three questions is open by default.
Native `details` provides the equivalent keyboard-operable disclosure without a React runtime.

```html
<details class="faq-item" open><summary>What payment methods do you accept? <svg aria-hidden="true"><use href="#chevron"/></svg></summary><p>We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. All payments are processed securely through our encrypted payment gateway.</p></details>
```

```css
.faq-item { border-top: 1px solid var(--line); padding: 24px 0; }
.faq-item:last-child { border-bottom: 1px solid var(--line); }
.faq-item summary { display: flex; align-items: start; justify-content: space-between; gap: 16px; cursor: pointer; }
.faq-item p { max-width: 64ch; margin-bottom: 0; color: var(--muted); font-size: var(--text-body); }
```

## cta-1

Six decorative photos surround a centered form with a `spark.social/` prefix, username field and Claim Profile button.
The static preview prevents submission because a specimen must not pretend to reserve a username.

```html
<div class="cta-portraits"><div class="photo-placeholder"></div><!-- five more --></div>
<form onsubmit="return false"><label for="username">Profile name</label><div class="cta-entry"><span>spark.social/</span><input id="username" placeholder="yourname"><button type="submit">Claim Profile</button></div></form>
```

```css
.cta-portraits .photo-placeholder { position: absolute; width: 120px; height: 120px; }
.cta-entry { display: flex; align-items: center; gap: 12px; max-width: 540px; margin: 0 auto; padding: 8px; border: 1px solid var(--line); background: var(--surface); }
.cta-entry input { min-width: 0; flex: 1; }
@media (max-width: 540px) { .cta-entry { flex-wrap: wrap; } .cta-entry button { width: 100%; } }
```

## footer-1

Programs, Resources and Support each have a bordered card containing a heading and link list.
Two original links carry an external-link arrow; the catalog maps sample links to local specimen anchors where practical.

```html
<div class="footer-card"><h3>Programs</h3><ul><li><a href="#features-1">Personal Training</a></li><li><a href="#features-2">Nutrition Coaching</a></li><li><a href="#how-it-works-1">Group Classes</a></li><li><a href="#pricing-1">Online Membership</a></li></ul></div>
```

```css
.footer-card { min-height: 300px; padding: 32px; border: 1px solid var(--line); margin-left: -1px; }
.footer-card ul { display: grid; gap: 12px; padding: 0; list-style: none; }
@media (max-width: 900px) { .footer-card { margin-left: 0; } }
```

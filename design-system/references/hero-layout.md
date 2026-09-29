# 英雄区布局

目前 24 条，后续可以沿用相同条目形状继续追加。
这里记录结构，不规定具体品牌文案和区块主题。
每条按 React Bits Pro 原始 JSX 的布局和动效对照；可运行的轻量替代效果见 `../demo-hero-layout.html`，不要求引入 React、WebGL 或新的运行时依赖。
静态占位只代替媒体内容，不代替运动中的形状关系；尊重 `prefers-reduced-motion`，目录预览在离开视口时暂停循环。

---

## 01. Hero分栏缺口型（Hero 1）

**适用**: 产品落地页的分栏首屏，左边是说明和行动，右边是一张带缺口的图。

```html
<section class="hero-1">
  <div class="hero-1-copy">
    <div class="hero-1-announcement"><span class="hero-1-mark"></span>公告</div>
    <h1>标题</h1>
    <p>一句说明</p>
    <div class="hero-1-actions">
      <a class="hero-1-action hero-1-action--solid" href="#">主要行动</a>
      <a class="hero-1-action hero-1-action--outline" href="#">
        <span class="hero-1-play" aria-hidden="true"></span>次要行动
      </a>
    </div>
    <div class="hero-1-proof">
      <span class="hero-1-avatars" aria-hidden="true"><span></span><span></span><span></span></span>
      <span>简短说明</span>
    </div>
  </div>
  <div class="hero-1-visual">
    <div class="hero-1-image" role="img" aria-label="图像占位"></div>
    <div class="hero-1-notch"><button type="button" aria-label="图像操作"><i data-lucide="arrow-up-right" aria-hidden="true"></i></button></div>
  </div>
</section>
```

```css
.hero-1 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
}
.hero-1-copy { min-width: 0; text-align: left; }
.hero-1-announcement,
.hero-1-actions,
.hero-1-proof { display: flex; align-items: center; gap: 12px; }
.hero-1-announcement,
.hero-1-action { width: fit-content; border-radius: 999px; }
.hero-1-mark { width: 8px; height: 8px; flex: none; }
.hero-1-actions { flex-wrap: wrap; }
.hero-1-action { display: inline-flex; align-items: center; gap: 10px; padding: 12px 20px; }
.hero-1-play { width: 22px; height: 22px; border-radius: 50%; }
.hero-1-avatars { display: flex; padding-left: 8px; }
.hero-1-avatars span { width: 32px; height: 32px; border-radius: 50%; margin-left: -8px; }
.hero-1-visual { position: relative; min-width: 0; }
.hero-1-image { min-height: 500px; border-radius: 32px; background: #d2d2d2; }
.hero-1-notch {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  border-top-left-radius: 26px;
  background: var(--page-surface);
}
.hero-1-notch::before, .hero-1-notch::after {
  content: ''; position: absolute; width: 32px; height: 32px;
  background: radial-gradient(circle at left top, transparent 31px, var(--page-surface) 32px);
  pointer-events: none;
}
.hero-1-notch::before { top: -32px; right: 0; }
.hero-1-notch::after { bottom: 0; left: -32px; }
.hero-1-notch button { width: 58px; height: 58px; border-radius: 18px; border: 0; }
.hero-1-notch svg { width: 22px; height: 22px; }
@media (max-width: 1023px) {
  .hero-1 { grid-template-columns: 1fr; }
}
@media (max-width: 639px) {
  .hero-1-image { min-height: 250px; }
}
```

⚠️ 注意：原作宽屏左右分栏，窄屏上文下图。
大圆角图片的右下缺口有两处**向内弯的外接圆角**，按钮本身是圆角矩形，箭头斜向右上而不是圆形按钮的正向箭头；初次进入的文案和图片使用短暂淡入。

---

## 02. Hero弧形拼贴型（Hero 2）

**适用**: 需要在居中标题下展示多张不等高画面的首屏。

```html
<section class="hero-2">
  <div class="hero-2-copy"><h1>标题</h1><p>一句说明</p><div class="hero-2-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div></div>
  <div class="hero-2-gallery" aria-label="五列画面占位">
    <div class="hero-2-stack"><div class="hero-2-tall"></div><div class="hero-2-slim"></div></div>
    <div class="hero-2-tall"></div><div class="hero-2-square"></div><div class="hero-2-tall"></div>
    <div class="hero-2-stack"><div class="hero-2-tall"></div><div class="hero-2-slim"></div></div>
  </div>
</section>
```

```css
.hero-2-copy { max-width: 680px; margin: 0 auto 40px; text-align: center; }
.hero-2-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
.hero-2-gallery { display: flex; align-items: end; justify-content: center; gap: 16px; overflow: hidden; }
.hero-2-gallery > *, .hero-2-stack { flex: 0 0 18%; min-width: 150px; }
.hero-2-stack { display: grid; gap: 16px; }
.hero-2-gallery .hero-2-tall, .hero-2-square, .hero-2-slim { background: #d2d2d2; border-radius: 20px; transition: transform .35s; }
.hero-2-gallery .hero-2-tall:hover, .hero-2-gallery .hero-2-square:hover, .hero-2-gallery .hero-2-slim:hover { transform: rotateY(-9deg) translateY(-8px); }
.hero-2-gallery { perspective: 1000px; }
.hero-2-tall { height: 260px; } .hero-2-square { aspect-ratio: 1; } .hero-2-slim { height: 65px; }
@media (max-width: 1023px) { .hero-2-gallery { justify-content: flex-start; overflow-x: auto; } }
```

⚠️ 注意：原作五列高低错落，窄屏横向滚动；五列卡片有随指针倾斜效果，底部 Canvas 波线持续流动。
预览以五列的 hover 倾斜和循环波纹代替 Canvas，不要只留静止五块灰面。

## 03. Hero框景着色器型（Hero 3）

**适用**: 需要让大面积画面成为背景、文字和链接沿画框边缘排列的首屏。

```html
<section class="hero-3">
  <div class="hero-3-scene" role="img" aria-label="画面占位"></div>
  <div class="hero-3-frame">
    <div class="hero-3-top"><span>标识</span><a href="#">行动</a></div>
    <div class="hero-3-bottom"><h1>标题</h1><nav aria-label="相关入口"><a href="#">入口一</a><a href="#">入口二</a><a href="#">入口三</a></nav></div>
  </div>
</section>
```

```css
.hero-3 { position: relative; min-height: 560px; overflow: hidden; }
.hero-3-scene { position: absolute; inset: 0; border-radius: 28px; background: linear-gradient(115deg, #777b81, #b1adaf 38%, #9caabd 65%, #777b81); background-size: 240% 100%; animation: hero-flow 11s ease-in-out infinite alternate; }
@keyframes hero-flow { to { background-position: 100% 0; } }
.hero-3-frame { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 560px; padding: 32px; }
.hero-3-top, .hero-3-bottom { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.hero-3-top { align-items: start; } .hero-3-bottom nav { display: grid; gap: 8px; text-align: right; }
@media (max-width: 1023px) { .hero-3-bottom { flex-direction: column; align-items: start; } .hero-3-bottom nav { text-align: left; } }
```

⚠️ 注意：原作是随时间和鼠标变化的全屏 WebGL 波纹渐变，不是静止灰面。
预览用流动灰阶渐变代替着色器，同时保留贴着画框边缘的上下文字层和右下白色曲角入口；1024 以下底部标题和入口纵排。

## 04. Hero视频跑马廊型（Hero 4）

**适用**: 居中大字之后用横向连续视频画框展示作品的首屏。

```html
<section class="hero-4">
  <div class="hero-4-copy"><span>栏目</span><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div>
  <div class="hero-4-viewport"><div class="hero-4-track" aria-label="循环视频画框占位">
    <div class="hero-4-video"><span class="hero-4-play"></span><span class="hero-4-dots">● ●</span></div>
    <div class="hero-4-video"><span class="hero-4-play"></span></div>
    <div class="hero-4-video"><span class="hero-4-play"></span></div>
    <!-- 重复前三幅作无缝循环，不重复内容语义 -->
    <div class="hero-4-video" aria-hidden="true"><span class="hero-4-play"></span><span class="hero-4-dots">● ●</span></div>
    <div class="hero-4-video" aria-hidden="true"><span class="hero-4-play"></span></div>
    <div class="hero-4-video" aria-hidden="true"><span class="hero-4-play"></span></div>
  </div></div>
</section>
```

```css
.hero-4-copy { max-width: 800px; margin: 0 auto 48px; text-align: center; }
.hero-4-viewport { overflow: hidden; mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent); }
.hero-4-track { display: flex; gap: 16px; width: max-content; animation: hero-marquee 18s linear infinite; }
.hero-4-viewport:hover .hero-4-track { animation-play-state: paused; }
.hero-4-video { position: relative; flex: 0 0 clamp(240px, 42vw, 520px); aspect-ratio: 4 / 3; display: grid; place-items: center; border-radius: 24px; background: #d2d2d2; }
@keyframes hero-marquee { to { transform: translateX(calc(-50% - 8px)); } }
.hero-4-play { width: 44px; height: 44px; border: 2px solid currentColor; border-radius: 50%; }
.hero-4-dots { position: absolute; bottom: 14px; left: 16px; }
@media (max-width: 1023px) { .hero-4-video { flex-basis: 75vw; } }
@media (prefers-reduced-motion: reduce) { .hero-4-track { animation: none; } }
```

⚠️ 注意：原作是无限横向视频跑马廊，hover 暂停，并有两端羽化。
预览复制一组画框作无缝 CSS 横移，保留播放圆点；不加载 mp4。

## 05. Hero浮球视窗型（Hero 5）

**适用**: 居中行动区下方展示浏览器视窗、背景有漂浮层次的首屏。

```html
<section class="hero-5">
  <div class="hero-5-orb" aria-hidden="true"></div>
  <div class="hero-5-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div class="hero-5-actions"><a href="#">次要行动</a><a href="#">主要行动</a></div></div>
  <div class="hero-5-browser"><div class="hero-5-toolbar"><span>● ● ●</span></div><div class="hero-5-screen" role="img" aria-label="视窗占位"></div></div>
</section>
```

```css
.hero-5 { position: relative; overflow: hidden; padding: 72px 24px 0; }
.hero-5-orb { position: absolute; top: 10%; right: 10%; width: 120px; aspect-ratio: 1; border-radius: 50%; background: #d2d2d2; }
.hero-5-copy { position: relative; max-width: 680px; margin: auto; text-align: center; }
.hero-5-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
.hero-5-browser { position: relative; max-width: 900px; margin: 50px auto 0; border: 1px solid #c5c5c5; border-radius: 18px 18px 0 0; overflow: hidden; }
.hero-5-toolbar { height: 36px; padding: 6px 14px; border-bottom: 1px solid #c5c5c5; }
.hero-5-screen { aspect-ratio: 16 / 9; background: #d2d2d2; }
@keyframes hero-orb-drift { to { transform: translate3d(8px, -12px, 0); } }
.hero-5-orb { animation: hero-orb-drift 6s ease-in-out infinite alternate; }
@media (max-width: 1023px) { .hero-5-orb { width: 70px; } }
@media (prefers-reduced-motion: reduce) { .hero-5-orb { animation: none; } }
```

⚠️ 注意：原作漂浮彩色光球、随时间变化的渐变背景和带流光边框的浏览器视窗有层次和运动。
预览用缓慢漂浮、流动的灰阶渐变和轻量边缘层次代替 Canvas，section 根不设主题色。

## 06. Hero进度轮播分栏型（Hero 6）

**适用**: 左侧一帧文案、右侧一张图，中间有轮播进度轨的首屏。

```html
<section class="hero-6">
  <div class="hero-6-copy"><h1>标题</h1><p>一句说明</p><div class="hero-6-email"><input type="email" aria-label="邮箱"><button type="button">行动</button></div></div>
  <div class="hero-6-rail" aria-label="轮播进度"><span></span><span></span><span></span></div>
  <div class="hero-6-image" role="img" aria-label="当前画面占位"></div>
  <div class="hero-6-mobile-rail" aria-hidden="true"><span></span><span></span><span></span></div>
</section>
```

```css
.hero-6 { display: grid; grid-template-columns: minmax(0, 1fr) 3px minmax(0, 1fr); align-items: center; gap: 48px; }
.hero-6-copy { min-width: 0; } .hero-6-email { display: flex; max-width: 440px; border-radius: 999px; }
.hero-6-email input { min-width: 0; flex: 1; } .hero-6-rail { display: grid; gap: 10px; height: 360px; }
.hero-6-rail span { border-radius: 3px; background: #d2d2d2; } .hero-6-rail span:first-child { background: #555; }
.hero-6-image { min-height: 360px; border-radius: 20px; background: #d2d2d2; }
.hero-6-mobile-rail { display: none; }
.hero-6-rail span, .hero-6-mobile-rail span { animation: hero-progress 9s steps(1) infinite; }
.hero-6-rail span:nth-child(2), .hero-6-mobile-rail span:nth-child(2) { animation-delay: -3s; }
.hero-6-rail span:nth-child(3), .hero-6-mobile-rail span:nth-child(3) { animation-delay: -6s; }
.hero-6-image { animation: hero-slide 9s steps(1) infinite; }
@keyframes hero-progress { 0%, 33% { background: #555; } 33.34%, 100% { background: #d2d2d2; } }
@keyframes hero-slide { 0%, 33% { background: #d2d2d2; } 33.34%, 66% { background: #b7c1c9; } 66.34%, 100% { background: #a9adb9; } }
@media (max-width: 1023px) { .hero-6 { grid-template-columns: 1fr; gap: 24px; } .hero-6-rail { display: none; } .hero-6-mobile-rail { display: flex; justify-content: center; gap: 8px; } .hero-6-mobile-rail span { width: 44px; height: 3px; background: #d2d2d2; } }
@media (prefers-reduced-motion: reduce) { .hero-6-rail span, .hero-6-mobile-rail span, .hero-6-image { animation: none; } }
```

⚠️ 注意：原作自动切换三组图文，进度条依次填充，图片交替过渡；1024 以下变为上文下图，竖轨移到底部。
占位版不编造三组文案，但画面灰阶和进度要持续轮换，而不是固定第一格。

## 07. Hero三维环形画廊型（Hero 7）

**适用**: 上方居中标题、下方以旋转画廊为主体的视觉首屏。

```html
<section class="hero-7">
  <div class="hero-7-copy"><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div>
  <div class="hero-7-scene" role="img" aria-label="循环转动的环形画廊"><div></div><div></div><div></div></div>
</section>
```

```css
.hero-7 { min-height: 560px; overflow: hidden; }
.hero-7-copy { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; text-align: center; }
.hero-7-scene { position: relative; height: 380px; overflow: hidden; perspective: 850px; }
.hero-7-scene div { position: absolute; top: 20%; left: 37%; width: 26%; height: 60%; border-radius: 18px; background: #d2d2d2; backface-visibility: hidden; animation: hero-ring 9s linear infinite; }
.hero-7-scene div:first-child { animation-delay: -6s; }
.hero-7-scene div:nth-child(3) { animation-delay: -3s; }
.hero-7-scene::after { content: ''; position: absolute; z-index: 4; top: 18%; left: 49%; width: 2%; height: 64%; border-radius: 50%; background: linear-gradient(90deg, transparent, #f09de0, white, #f09de0, transparent); box-shadow: 0 0 18px 8px #e9a0e489; pointer-events: none; animation: hero-glow 3s ease-in-out infinite alternate; }
@keyframes hero-ring {
  0%, 100% { transform: translate3d(0, 0, 110px) rotateY(0) scale(1.07); z-index: 3; opacity: 1; }
  33.33% { transform: translate3d(112%, 9%, -130px) rotateY(-42deg) scale(.82); z-index: 1; opacity: .72; }
  66.66% { transform: translate3d(-112%, 9%, -130px) rotateY(42deg) scale(.82); z-index: 1; opacity: .72; }
}
@keyframes hero-glow { to { opacity: .25; } }
@media (max-width: 1023px) { .hero-7-scene { height: 280px; } }
@media (max-width: 639px) { .hero-7-scene div { width: 34%; left: 33%; } }
@media (prefers-reduced-motion: reduce) {
  .hero-7-scene div, .hero-7-scene::after { animation: none; }
  .hero-7-scene div:first-child { transform: translateX(-110%) scale(.82); }
  .hero-7-scene div:nth-child(3) { transform: translateX(110%) scale(.82); }
}
```

⚠️ 注意：原作是九幅图围成的缓慢旋转 3D 环，中央另有粉色光带和飘散粒子。
预览只用三幅不同的占位图作循环换位、透视和轻量光带，不载入 three.js 或 WebGL；粒子属于原作效果，未精确模拟。

## 08. Hero字间媒体嵌片型（Hero 8）

**适用**: 两行大字中各夹一块媒体嵌片、下方另有宽幅画面的首屏。

```html
<section class="hero-8">
  <div class="hero-8-lines"><h1><span>标题</span><span class="hero-8-tile" role="img" aria-label="嵌片占位"></span><span>标题</span></h1><div><span>文字</span><span class="hero-8-tile" role="img" aria-label="嵌片占位"></span><span>文字</span></div></div>
  <p>一句说明</p><div class="hero-8-wide" role="img" aria-label="宽幅画面占位"></div>
</section>
```

```css
.hero-8 { text-align: center; }
.hero-8-lines h1, .hero-8-lines > div { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
.hero-8-tile { display: inline-block; width: 116px; aspect-ratio: 1.6; border-radius: 10px; background: #d2d2d2; animation: hero-tile 10s steps(1) infinite; }
.hero-8-lines > div .hero-8-tile { animation-delay: -5s; }
@keyframes hero-tile { 0%, 49% { background: #d2d2d2; } 50%, 100% { background: #aaaebc; } }
.hero-8 p { max-width: 640px; margin: 28px auto; }
.hero-8-wide { aspect-ratio: 21 / 9; border-radius: 20px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-8-lines { text-align: left; } .hero-8-lines h1, .hero-8-lines > div { justify-content: flex-start; } .hero-8-wide { aspect-ratio: 16 / 9; } }
```

⚠️ 注意：原作两行字间嵌片在视口内展开并每五秒切换图片，hover 也能触发；小屏将文字行改为无嵌片的独立行，下方宽幅画面仍可见。
占位版用两组灰阶切换代替媒体资源，不要把嵌片收成永远不变的一格。

## 09. Hero沉底视频背景型（Hero 9）

**适用**: 全幅视频画面上把标题、说明和两枚行动贴近底部的首屏。

```html
<section class="hero-9">
  <div class="hero-9-video" role="img" aria-label="视频静态占位"><span class="hero-9-play"></span></div>
  <div class="hero-9-bottom"><div><h1>标题</h1><span>公告</span></div><div><p>一句说明</p><div class="hero-9-actions"><a href="#">行动一</a><a href="#">行动二</a></div></div></div>
</section>
```

```css
.hero-9 { position: relative; display: flex; align-items: end; min-height: 540px; overflow: hidden; }
.hero-9-video { position: absolute; inset: 0; display: grid; place-items: center; border-radius: 24px; background: linear-gradient(120deg, #abaeb3, #79878c, #cbd0cb, #abaeb3); background-size: 300% 100%; animation: hero-video 8s linear infinite alternate; }
@keyframes hero-video { to { background-position: 100% 0; } }
.hero-9-play { width: 52px; height: 52px; border: 2px solid currentColor; border-radius: 50%; }
.hero-9-bottom { position: relative; display: flex; align-items: end; justify-content: space-between; gap: 32px; width: 100%; padding: 28px; }
.hero-9-actions { display: flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-9-bottom { flex-direction: column; align-items: start; } }
```

⚠️ 注意：原作是铺底自动播放的视频与暗色遮罩，文字贴底且标题按词淡入；1024 以下标题与行动堆叠。
预览用连续流动的灰阶背景代替 mp4，保留画面在动的感觉。

## 10. Hero三叠卡型（Hero 10）

**适用**: 居中引导文案下方以三张层叠卡片收尾的首屏。

```html
<section class="hero-10"><div class="hero-10-copy"><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div><div class="hero-10-cards" aria-label="三张画面占位"><div></div><div></div><div></div></div></section>
```

```css
.hero-10 { overflow: hidden; } .hero-10-copy { max-width: 680px; margin: 0 auto 56px; text-align: center; }
.hero-10-cards { display: flex; align-items: end; justify-content: center; padding-top: 18px; }
.hero-10-cards div { width: 32%; max-width: 270px; aspect-ratio: 1.1; border-radius: 24px; background: #d2d2d2; }
.hero-10-cards div + div { margin-left: -42px; } .hero-10-cards div:first-child { transform: rotate(-9deg); }
.hero-10-cards div:nth-child(2) { transform: translateY(-20px); z-index: 1; } .hero-10-cards div:last-child { transform: rotate(9deg); }
@media (max-width: 1023px) { .hero-10-cards div { min-width: 90px; } .hero-10-cards div + div { margin-left: -18px; } }
```

⚠️ 注意：原作三张叠压卡有依次翻入的短暂入场，后方另有大圆形光晕；中间卡抬高，不是普通网格。
入场结束后静止是符合原作的，不应强加无限循环。

## 11. Hero线框角标型（Hero 11）

**适用**: 居中标题与行动之下，用四角线框强调单张产品画面的首屏。

```html
<section class="hero-11"><div class="hero-11-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div><a href="#">主要行动</a><a href="#">次要行动</a></div></div><div class="hero-11-frame" role="img" aria-label="四角线框画面占位"><div class="hero-11-image"></div><i></i><i></i><i></i><i></i></div></section>
```

```css
.hero-11-copy { max-width: 720px; margin: 0 auto 48px; text-align: center; }
.hero-11-copy > div { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }
.hero-11-frame { position: relative; max-width: 840px; margin: auto; padding: 14px; }
.hero-11-image { aspect-ratio: 16 / 9; background: #d2d2d2; }
.hero-11-frame i { position: absolute; width: 28px; height: 28px; border: 2px solid currentColor; }
.hero-11-frame i:nth-of-type(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.hero-11-frame i:nth-of-type(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.hero-11-frame i:nth-of-type(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.hero-11-frame i:nth-of-type(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }
@media (max-width: 1023px) { .hero-11-copy > div { flex-direction: column; align-items: stretch; } }
```

⚠️ 注意：线框角标属于图片外框，不是画面本身；原作只有一次入场，无持续动效，1024 以下行动纵排。

## 12. Hero曲线贴片画面型（Hero 12）

**适用**: 一张铺底大图，上方有两层曲角标题贴片、底部另有信息卡的首屏。

```html
<section class="hero-12"><div class="hero-12-scene" role="img" aria-label="画面占位"></div><div class="hero-12-head"><h1>标题</h1><span>补充标题</span></div><a class="hero-12-action" href="#">主要行动</a><div class="hero-12-card"><div role="img" aria-label="局部画面占位"></div><p>一句说明</p><a href="#">查看</a></div></section>
```

```css
.hero-12 { position: relative; min-height: 560px; overflow: hidden; border-radius: 28px; }
.hero-12-scene { position: absolute; inset: 0; background: #d2d2d2; }
.hero-12-head { position: relative; display: flex; align-items: start; flex-direction: column; }
.hero-12-head h1, .hero-12-head span { position: relative; max-width: 90%; padding: 14px 22px; border-bottom-right-radius: 32px; background: var(--page-surface); }
.hero-12-head h1::after, .hero-12-head span::after { content: ''; position: absolute; top: 0; right: -32px; width: 32px; height: 32px; background: radial-gradient(circle at right bottom, transparent 32px, var(--page-surface) 33px); }
.hero-12-action { position: absolute; top: 24px; right: 24px; }
.hero-12-card { position: absolute; bottom: 24px; right: 24px; width: 260px; padding: 10px; border-radius: 16px; background: var(--page-surface); }
.hero-12-card > div { height: 110px; border-radius: 8px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-12-action { top: 160px; left: 20px; right: auto; } .hero-12-card { left: 20px; right: 20px; bottom: 20px; width: auto; } }
```

⚠️ 注意：原作两块曲角标题贴片各自向右延伸出内凹弧面，第二块下缘还向左弯曲；不是 Hero 1 的右下缺口。
预览用伪元素圆弧补齐接缝；窄屏行动移到标题下，信息卡铺宽。

## 13. Hero浮标信息层型（Hero 13）

**适用**: 居中说明和社交证明下方，以悬浮图标、发光横条与信息卡组成画面的首屏。

```html
<section class="hero-13"><div class="hero-13-copy"><h1>标题</h1><p>一句说明</p><div class="hero-13-actions"><a href="#">查看</a><a href="#">主要行动</a></div><div class="hero-13-proof"><span>● ● ● ●</span><span>★★★★★</span></div></div><div class="hero-13-stage" role="img" aria-label="浮标与信息卡占位"><span class="hero-13-bar"></span><span class="hero-13-icon"><i data-lucide="terminal" aria-hidden="true"></i></span><div class="hero-13-card"><i data-lucide="database" aria-hidden="true"></i></div><div class="hero-13-card"><i data-lucide="cloud" aria-hidden="true"></i></div></div></section>
```

```css
.hero-13-copy { position: relative; z-index: 1; max-width: 680px; margin: auto; text-align: center; }
.hero-13-actions, .hero-13-proof { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.hero-13-stage { position: relative; height: 350px; max-width: 850px; margin: -8px auto 0; overflow: hidden; }
.hero-13-bar { position: absolute; top: 40px; left: 49%; width: 8px; height: 260px; border-radius: 99px; background: #f5c3e9; box-shadow: 0 0 12px 6px #e6a8da; animation: hero-glow 3s ease-in-out infinite alternate; }
.hero-13-icon { position: absolute; left: 35%; top: 80px; width: 48px; height: 48px; border-radius: 50%; background: #d2d2d2; text-align: center; animation: hero-float 4s ease-in-out infinite alternate; }
@keyframes hero-float { to { transform: translate3d(8px, -12px, 0); } }
@keyframes hero-glow { to { opacity: .4; box-shadow: 0 0 20px 12px #e6a8da; } }
.hero-13-card { position: absolute; right: 10%; top: 80px; width: 25%; height: 120px; border-radius: 14px; background: #d2d2d2; }
.hero-13-card:last-child { top: 216px; right: 15%; }
@media (max-width: 1023px) { .hero-13-stage { height: 260px; } }
```

⚠️ 注意：原作的粉色光条**竖直**穿过舞台中线，四周有微粒；左侧图标漂浮，右侧是两张信息卡。
预览用脉冲的 CSS 竖向光带和漂浮层次代替 Canvas，不把光条误画成静止横线。

## 14. Hero邮箱表单分栏型（Hero 14）

**适用**: 左侧评分与邮箱收集、右侧单张产品画面的首屏。

```html
<section class="hero-14"><div class="hero-14-copy"><div><i data-lucide="star" aria-hidden="true"></i> <span>5 stars</span> <span>3,000+</span></div><h1>标题</h1><p>一句说明</p><div class="hero-14-form"><input type="email" aria-label="邮箱"><button type="button">主要行动</button></div><a href="#">次要入口</a></div><div class="hero-14-image" role="img" aria-label="画面占位"></div></section>
```

```css
.hero-14 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: 48px; }
.hero-14-copy { min-width: 0; text-align: left; } .hero-14-copy > * + * { margin-top: 20px; }
.hero-14-form { display: flex; gap: 8px; max-width: 500px; padding: 8px; border-radius: 16px; }
.hero-14-form input { min-width: 0; flex: 1; } .hero-14-image { aspect-ratio: 4 / 3; border-radius: 20px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-14 { grid-template-columns: 1fr; } }
@media (max-width: 639px) { .hero-14-form { flex-direction: column; } }
```

⚠️ 注意：1024 以下上文下图；窄屏邮箱和按钮分开，宽屏仍是一体表单。
原作只有入场和悬停时箭头小幅位移，没有自动循环，静止主图不需要凭空做旋转。

## 15. Hero斜体标题问答型（Hero 15）

**适用**: 居中大标题、上下两层说明与底部问答输入框的首屏。

```html
<section class="hero-15"><div class="hero-15-copy"><span>公告</span><h1><em>标题</em></h1><p>一句说明</p><p>补充说明</p><a href="#">主要行动</a><div class="hero-15-prompt"><input type="text" aria-label="提问"><button type="button" aria-label="发送">↑</button></div><small>简短提示</small></div></section>
```

```css
.hero-15-copy { max-width: 760px; margin: auto; text-align: center; }
.hero-15-copy > * { display: block; margin: 0 auto 20px; }
.hero-15-copy h1 { margin-top: 42px; } .hero-15-copy em { font-style: italic; }
.hero-15-prompt { display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 56px; padding: 8px; border-radius: 999px; }
.hero-15-prompt input { min-width: 0; flex: 1; } .hero-15-prompt button { width: 44px; height: 44px; border-radius: 50%; }
@media (max-width: 1023px) { .hero-15-prompt { margin-top: 36px; } }
```

⚠️ 注意：原作斜体 serif 标题、两层说明、独立的圆角行动按钮及底部胶囊形输入条；只有入场和按钮 hover，不存在持续画廊动画；此处不实现提交。

## 16. Hero标志顶置叙事型（Hero 16）

**适用**: 顶部小标识、左上大标题，底部左右分列说明与分体行动的首屏。

```html
<section class="hero-16"><div class="hero-16-logo" aria-label="标识占位"></div><h1>标题</h1><div class="hero-16-bottom"><p>一句说明</p><div class="hero-16-actions"><a href="#">主要行动</a><a href="#" aria-label="下一步">→</a></div></div></section>
```

```css
.hero-16 { display: flex; flex-direction: column; min-height: 500px; padding: 32px; }
.hero-16-logo { width: 110px; height: 20px; background: #d2d2d2; }
.hero-16 h1 { max-width: 780px; margin-top: 50px; flex: 1; }
.hero-16-bottom { display: flex; align-items: end; justify-content: space-between; gap: 32px; }
.hero-16-bottom p { max-width: 400px; } .hero-16-actions { display: flex; gap: 8px; flex: none; }
@media (max-width: 1023px) { .hero-16-bottom { flex-direction: column; align-items: start; } }
```

⚠️ 注意：原始描述称背景图，但实际 JSX 没有背景图，不按描述补图；1024 以下底部说明与分开的两个圆角方形行动改为一列，箭头 hover 小幅平移。

## 17. Hero商品主图三缩略型（Hero 17）

**适用**: 左侧促销与行动、右侧一张主图和三张缩略图的商品首屏。

```html
<section class="hero-17"><div class="hero-17-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div><div class="hero-17-gallery"><div class="hero-17-main" role="img" aria-label="主图占位"></div><div class="hero-17-thumbs" aria-label="三张缩略图占位"><div></div><div></div><div></div></div></div></section>
```

```css
.hero-17 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: 56px; }
.hero-17-copy > * { display: block; margin-bottom: 20px; }
.hero-17-main { aspect-ratio: 16 / 10; border-radius: 20px; background: #d2d2d2; }
.hero-17-thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
.hero-17-thumbs div { aspect-ratio: 1; border-radius: 12px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-17 { grid-template-columns: 1fr; } }
```

⚠️ 注意：右侧是一张 16:10 主图加三张方形缩略图；1024 以下上文下图。
原作缩略图初次依次淡入，稳态是静止商品图，不要统一添加循环效果。

## 18. Hero指令面板型（Hero 18）

**适用**: 居中说明下方直接展示搜索指令面板和结果列表的首屏。

```html
<section class="hero-18"><div class="hero-18-copy"><span>⌘K 公告</span><h1>标题</h1><p>一句说明</p></div><div class="hero-18-panel"><div class="hero-18-query">⌕ <span>搜索占位</span><kbd>esc</kbd></div><div class="hero-18-scopes"><span>范围 24</span><span>范围 9</span><span>范围 6</span><span>范围 3</span></div><div class="hero-18-rows"><div><i data-lucide="file-text"></i><span>结果一</span><kbd>↵</kbd></div><div><i data-lucide="git-pull-request"></i><span>结果二</span></div><div><i data-lucide="users"></i><span>结果三</span></div><div><i data-lucide="sparkles"></i><span>结果四</span></div></div><div class="hero-18-keys"><kbd>↑</kbd><kbd>↓</kbd><kbd>↵</kbd></div></div><div class="hero-18-action"><a href="#">主要行动</a><span>⌘ K</span></div></section>
```

```css
.hero-18 { display: flex; flex-direction: column; align-items: center; }
.hero-18-copy { max-width: 700px; text-align: center; }
.hero-18-panel { width: min(100%, 660px); margin: 42px auto 0; border: 1px solid #d2d2d2; border-radius: 24px; overflow: hidden; }
.hero-18-query, .hero-18-scopes, .hero-18-keys { display: flex; align-items: center; gap: 12px; padding: 12px 18px; }
.hero-18-query, .hero-18-keys { border-bottom: 1px solid #d2d2d2; } .hero-18-query kbd { margin-left: auto; }
.hero-18-rows > div { display: flex; gap: 12px; padding: 10px 18px; } .hero-18-rows kbd { margin-left: auto; }
.hero-18-rows > div:first-child { position: relative; overflow: hidden; }
.hero-18-rows > div:first-child::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 25%, #fff8 50%, transparent 75%); animation: hero-shimmer 4s ease-in-out infinite; pointer-events: none; }
@keyframes hero-shimmer { from { transform: translateX(-100%); } 50%, 100% { transform: translateX(100%); } }
.hero-18-action { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
@media (max-width: 1023px) { .hero-18-action { flex-direction: column; } }
```

⚠️ 注意：原作有四条结果、范围计数、键帽、搜索光标闪烁和选中行上的慢速 shimmer；预览保留这条轻量扫光，不实现真正搜索。

## 19. Hero账单悬浮卡分栏型（Hero 19）

**适用**: 左侧编辑式文字、右侧发票列表和两张悬浮信息卡的首屏。

```html
<section class="hero-19"><div class="hero-19-copy"><span>栏目</span><h1>标题</h1><p>一句说明</p><div><a href="#">主要行动</a><a href="#">次要行动</a></div><div class="hero-19-trust">◯ 简短说明　◯ 简短说明</div></div><div class="hero-19-stage"><div class="hero-19-float hero-19-float--top">✓ <span>提示</span></div><div class="hero-19-panel"><div class="hero-19-panel-head">○ <span>列表标题</span><span>● 状态</span></div><div class="hero-19-row">○ <span>条目一</span><span>状态</span></div><div class="hero-19-row">○ <span>条目二</span><span>状态</span></div><div class="hero-19-row">○ <span>条目三</span><span>状态</span></div><div class="hero-19-metric"><span>指标</span><strong>78%</strong><div></div></div></div><div class="hero-19-float hero-19-float--bottom">○ <span>提示</span></div></div></section>
```

```css
.hero-19 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; gap: 64px; }
.hero-19-copy > * { display: block; margin-bottom: 22px; }
.hero-19-stage { position: relative; padding: 22px; } .hero-19-panel { padding: 20px; border: 1px solid #d2d2d2; border-radius: 24px; }
.hero-19-panel-head, .hero-19-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #d2d2d2; }
.hero-19-panel-head span:last-child, .hero-19-row span:last-child { margin-left: auto; }
.hero-19-metric { padding: 18px; } .hero-19-metric strong { float: right; } .hero-19-metric div { clear: both; height: 6px; width: 78%; margin-top: 16px; background: #777; }
.hero-19-float { position: absolute; padding: 10px; border: 1px solid #d2d2d2; border-radius: 12px; background: var(--page-surface); }
.hero-19-float--top { top: 0; right: 0; } .hero-19-float--bottom { bottom: 0; left: 0; }
.hero-19-panel, .hero-19-float { transition: transform .5s cubic-bezier(.16, 1, .3, 1); }
.hero-19-stage:hover .hero-19-panel { transform: translate(5px, -5px); }
.hero-19-stage:hover .hero-19-float--top { transform: translate(-8px, 6px); }
.hero-19-stage:hover .hero-19-float--bottom { transform: translate(8px, -6px); }
@media (max-width: 1023px) { .hero-19 { grid-template-columns: 1fr; } .hero-19-float { display: none; } }
```

⚠️ 注意：原作鼠标移动时账单面板与两张悬浮卡作不同幅度的弹性视差；预览用 hover 位移展示关系。
1024 以下上文下面板，小屏隐藏悬浮卡但保留账单行与 78% 数字。

## 20. Hero口号标志指标型（Hero 20）

**适用**: 居中一句主张、行动、标志行和底部四格指标的首屏。

```html
<section class="hero-20"><h1>标题</h1><p>一句说明</p><div class="hero-20-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><div class="hero-20-logos" aria-label="六个标志占位"><span></span><span></span><span></span><span></span><span></span><span></span></div><div class="hero-20-metrics"><div><strong>4.2B</strong><span>指标</span></div><div><strong>38ms</strong><span>指标</span></div><div><strong>99.99%</strong><span>指标</span></div><div><strong>3,100+</strong><span>指标</span></div></div></section>
```

```css
.hero-20 { text-align: center; } .hero-20 h1, .hero-20 p { max-width: 760px; margin: 0 auto 24px; }
.hero-20-actions, .hero-20-logos { display: flex; justify-content: center; flex-wrap: wrap; gap: 18px; }
.hero-20-logos { margin: 58px auto 40px; } .hero-20-logos span { width: 90px; height: 13px; border-radius: 4px; background: #d2d2d2; }
.hero-20-metrics { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 24px 0; }
.hero-20-metrics > div { display: grid; gap: 8px; } .hero-20-metrics > div + div { border-left: 1px solid #ccc; }
@media (max-width: 1023px) { .hero-20-metrics { grid-template-columns: repeat(2, 1fr); gap: 20px 0; } .hero-20-metrics > div:nth-child(3) { border-left: 0; } }
```

⚠️ 注意：原作四项指标的数字分别是 4.2B、38ms、99.99%、3,100+，Logo 行有六个字标及两侧淡出遮罩；稳态不循环。
指标必须留数字，1024 以下四格改为两列，不用产品口号替代黑条。

## 21. Hero极光光环型（Hero 21）

**适用**: 背景画面与顶部光环标记共同衬托居中标题的首屏。

```html
<section class="hero-21"><div class="hero-21-field" role="img" aria-label="极光画面占位"></div><div class="hero-21-copy"><div class="hero-21-orb" aria-hidden="true"><span></span></div><span>标识</span><h1>标题</h1><p>一句说明</p><div class="hero-21-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><small>简短提示</small></div></section>
```

```css
.hero-21 { position: relative; min-height: 500px; display: grid; place-items: center; overflow: hidden; }
.hero-21-field { position: absolute; inset: 0; border-radius: 24px; background: radial-gradient(ellipse at 48% 35%, #c7d2fe, #d5d0e6 42%, #cbd0cb 72%); background-size: 160% 160%; animation: hero-aurora 14s ease-in-out infinite alternate; }
@keyframes hero-aurora { to { background-position: 100% 100%; } }
.hero-21-copy { position: relative; max-width: 720px; padding: 40px 24px; text-align: center; }
.hero-21-orb { position: relative; width: 76px; height: 76px; margin: 0 auto 18px; display: grid; place-items: center; border-radius: 50%; background: conic-gradient(#c7d2fe, #f5d0fe, #a5f3fc, #c7d2fe); animation: hero-orbit 26s linear infinite; }
.hero-21-orb::before { content: ''; position: absolute; inset: 12px; border-radius: 50%; background: var(--page-surface); }
.hero-21-orb span { position: relative; }
@keyframes hero-orbit { to { transform: rotate(360deg); } }
.hero-21-orb span { width: 8px; height: 8px; border-radius: 50%; background: #555; }
.hero-21-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-21-copy { width: 100%; } }
```

⚠️ 注意：原作极光 GLSL 背景流动，顶部 conic 光环以约 26 秒缓慢旋转并轻微呼吸。
预览用动画渐变和 CSS 环代替 GLSL，不把场景冻结成整块灰面。

## 22. Hero网格流光居中型（Hero 22）

**适用**: 居中公告、标题与行动叠在一整块流动画面上的首屏。

```html
<section class="hero-22"><div class="hero-22-field" role="img" aria-label="流光画面占位"></div><div class="hero-22-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div class="hero-22-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><small>简短提示</small></div></section>
```

```css
.hero-22 { position: relative; min-height: 480px; display: grid; place-items: center; overflow: hidden; }
.hero-22-field { position: absolute; inset: 0; border-radius: 24px; background: radial-gradient(ellipse at 20% 30%, #aeb9d4, transparent 55%), radial-gradient(ellipse at 75% 65%, #c6a8c6, transparent 60%), #cbd0cb; background-size: 160% 160%; animation: hero-mesh 10s ease-in-out infinite alternate; }
@keyframes hero-mesh { to { background-position: 100% 100%; } }
.hero-22-copy { position: relative; max-width: 720px; padding: 40px 24px; text-align: center; }
.hero-22-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-22-copy { width: 100%; } }
```

⚠️ 注意：原作 MeshGradient 缓慢流动且有带模糊的标题入场。
预览用几层缓慢移动的灰阶光斑代替 shader，文字仍用黑条和灰条，不做渐变标题。

## 23. Hero水纹画框型（Hero 23）

**适用**: 居中叙述下方用带状态芯片与帧率数字的画框呈现画面的首屏。

```html
<section class="hero-23"><div class="hero-23-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div class="hero-23-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div></div><div class="hero-23-frame" role="img" aria-label="水纹画面占位"><span class="hero-23-live">● 状态</span><div class="hero-23-caption"><span>60 fps</span><span>画面信息</span></div></div></section>
```

```css
.hero-23-copy { max-width: 720px; margin: 0 auto 40px; text-align: center; }
.hero-23-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.hero-23-frame { position: relative; aspect-ratio: 16 / 11; border-radius: 24px; overflow: hidden; background: repeating-radial-gradient(ellipse at 50% 30%, #8298a7 0 12px, #b0c0c6 22px 36px, #809cb1 45px 60px); background-size: 150% 150%; animation: hero-water 8s ease-in-out infinite alternate; }
@keyframes hero-water { to { background-position: 70% 80%; } }
.hero-23-live { position: absolute; top: 18px; left: 18px; padding: 6px 12px; border-radius: 999px; }
.hero-23-caption { position: absolute; bottom: 18px; left: 18px; right: 18px; display: flex; justify-content: space-between; align-items: end; }
@media (max-width: 1023px) { .hero-23-caption { flex-wrap: wrap; gap: 12px; } }
```

⚠️ 注意：原作 16:11 画框中的 Water shader 有持续水纹，左上状态圆点呼吸，底部保留 60 fps 数字。
预览用持续移动的灰阶同心波纹替代 shader，不要退回单块静止灰面。

## 24. Hero神经线场左文型（Hero 24）

**适用**: 左侧状态芯片、标题与标志行置于整幅线场画面前的首屏。

```html
<section class="hero-24"><div class="hero-24-field" role="img" aria-label="线场画面占位"></div><div class="hero-24-copy"><span class="hero-24-status">● 状态</span><h1>标题</h1><p>一句说明</p><div class="hero-24-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><div class="hero-24-logos"><span>标志</span><span>标志</span><span>标志</span></div></div></section>
```

```css
.hero-24 { position: relative; min-height: 500px; display: flex; align-items: center; overflow: hidden; }
.hero-24-field { position: absolute; inset: 0; border-radius: 24px; background: repeating-radial-gradient(ellipse at 80% 55%, transparent 0 10px, #778d9c88 11px 12px, transparent 13px 30px), linear-gradient(90deg, #cbd0cb, #aebac2); background-size: 140% 150%; animation: hero-neuro 8s ease-in-out infinite alternate; }
@keyframes hero-neuro { to { background-position: 100% 60%; } }
.hero-24-copy { position: relative; width: min(100%, 620px); padding: 40px; text-align: left; }
.hero-24-status { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 12px; }
.hero-24-actions, .hero-24-logos { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
@media (max-width: 1023px) { .hero-24-copy { padding: 32px 20px; } }
```

⚠️ 注意：原作 NeuroNoise 线场持续流动且状态芯片圆点会 ping；预览用移动的灰阶细线和圆点扩散代替 shader。
左侧内容与底部标志行不可改成居中；1024 以下仍保持单列左对齐。

# 英雄区布局

目前 24 条，后续可以沿用相同条目形状继续追加。
这里记录结构，不规定具体品牌文案和区块主题。

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
    <div class="hero-1-notch"><button type="button" aria-label="图像操作"></button></div>
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
  border-top-left-radius: 24px;
  background: var(--page-surface);
}
.hero-1-notch button { width: 56px; height: 56px; border-radius: 50%; }
@media (max-width: 1023px) {
  .hero-1 { grid-template-columns: 1fr; }
}
@media (max-width: 639px) {
  .hero-1-image { min-height: 250px; }
}
```

⚠️ 注意：宽屏左右分栏，窄屏改为上文下图。

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
.hero-2-gallery .hero-2-tall, .hero-2-square, .hero-2-slim { background: #d2d2d2; border-radius: 20px; }
.hero-2-tall { height: 260px; } .hero-2-square { aspect-ratio: 1; } .hero-2-slim { height: 65px; }
@media (max-width: 1023px) { .hero-2-gallery { justify-content: flex-start; overflow-x: auto; } }
```

⚠️ 注意：画廊保留五列高低错落，窄屏横向滚动而不是把五列硬塞进视口；这里只画静态一帧。

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
.hero-3-scene { position: absolute; inset: 0; border-radius: 28px; background: #d2d2d2; }
.hero-3-frame { position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 560px; padding: 32px; }
.hero-3-top, .hero-3-bottom { display: flex; align-items: end; justify-content: space-between; gap: 24px; }
.hero-3-top { align-items: start; } .hero-3-bottom nav { display: grid; gap: 8px; text-align: right; }
@media (max-width: 1023px) { .hero-3-bottom { flex-direction: column; align-items: start; } .hero-3-bottom nav { text-align: left; } }
```

⚠️ 注意：实际画面由着色器提供，这里只留一块灰面；1024 以下把底部标题和入口改为纵向排列。

## 04. Hero视频跑马廊型（Hero 4）

**适用**: 居中大字之后用横向连续视频画框展示作品的首屏。

```html
<section class="hero-4">
  <div class="hero-4-copy"><span>栏目</span><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div>
  <div class="hero-4-track" aria-label="视频画框占位">
    <div class="hero-4-video"><span class="hero-4-play"></span><span class="hero-4-dots">● ●</span></div>
    <div class="hero-4-video"><span class="hero-4-play"></span></div>
    <div class="hero-4-video"><span class="hero-4-play"></span></div>
  </div>
</section>
```

```css
.hero-4-copy { max-width: 800px; margin: 0 auto 48px; text-align: center; }
.hero-4-track { display: flex; gap: 16px; overflow-x: auto; }
.hero-4-video { position: relative; flex: 0 0 42%; min-width: 240px; aspect-ratio: 4 / 3; display: grid; place-items: center; border-radius: 24px; background: #d2d2d2; }
.hero-4-play { width: 44px; height: 44px; border: 2px solid currentColor; border-radius: 50%; }
.hero-4-dots { position: absolute; bottom: 14px; left: 16px; }
@media (max-width: 1023px) { .hero-4-video { flex-basis: 75%; } }
```

⚠️ 注意：真实区块是无限视频跑马廊；此处仅静止三帧和播放圆点，不加载 mp4。

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
@media (max-width: 1023px) { .hero-5-orb { width: 70px; } }
```

⚠️ 注意：浮球只保留静态层次，背景与根节点不设主题色，视窗画面使用灰面。

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
@media (max-width: 1023px) { .hero-6 { grid-template-columns: 1fr; gap: 24px; } .hero-6-rail { display: none; } .hero-6-mobile-rail { display: flex; justify-content: center; gap: 8px; } .hero-6-mobile-rail span { width: 44px; height: 3px; background: #d2d2d2; } }
```

⚠️ 注意：只画当前一帧；1024 以下变为上文下图，并把中间竖进度轨移到底部。

## 07. Hero三维环形画廊型（Hero 7）

**适用**: 上方居中标题、下方以旋转画廊为主体的视觉首屏。

```html
<section class="hero-7">
  <div class="hero-7-copy"><h1>标题</h1><p>一句说明</p><a href="#">主要行动</a></div>
  <div class="hero-7-scene" role="img" aria-label="环形画廊静态占位"><div></div><div></div><div></div></div>
</section>
```

```css
.hero-7 { min-height: 560px; overflow: hidden; }
.hero-7-copy { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; text-align: center; }
.hero-7-scene { display: flex; align-items: center; justify-content: center; gap: 18px; height: 380px; overflow: hidden; }
.hero-7-scene div { flex: none; width: 30%; height: 52%; border-radius: 18px; background: #d2d2d2; }
.hero-7-scene div:nth-child(2) { height: 70%; transform: translateY(-12px); }
@media (max-width: 1023px) { .hero-7-scene { height: 280px; } .hero-7-scene div { width: 42%; } }
```

⚠️ 注意：保留环形画廊的前中后三帧关系，不载入 three.js、粒子或画面资源。

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
.hero-8-tile { display: inline-block; width: 116px; aspect-ratio: 1.6; border-radius: 10px; background: #d2d2d2; }
.hero-8 p { max-width: 640px; margin: 28px auto; }
.hero-8-wide { aspect-ratio: 21 / 9; border-radius: 20px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-8-lines { text-align: left; } .hero-8-lines h1, .hero-8-lines > div { justify-content: flex-start; } .hero-8-wide { aspect-ratio: 16 / 9; } }
```

⚠️ 注意：字间媒体保持两行嵌片关系；1024 以下以自然换行排成单列，宽幅画面变为 16:9。

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
.hero-9-video { position: absolute; inset: 0; display: grid; place-items: center; border-radius: 24px; background: #d2d2d2; }
.hero-9-play { width: 52px; height: 52px; border: 2px solid currentColor; border-radius: 50%; }
.hero-9-bottom { position: relative; display: flex; align-items: end; justify-content: space-between; gap: 32px; width: 100%; padding: 28px; }
.hero-9-actions { display: flex; gap: 10px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-9-bottom { flex-direction: column; align-items: start; } }
```

⚠️ 注意：只有圆角灰面和播放圆点，不放 mp4；1024 以下标题与行动堆叠。

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

⚠️ 注意：三张卡片叠压且中间抬高，不把它误画成普通网格。

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

⚠️ 注意：线框角标属于图片外框，不是画面本身；1024 以下行动纵排。

## 12. Hero曲线贴片画面型（Hero 12）

**适用**: 一张铺底大图，上方有两层曲角标题贴片、底部另有信息卡的首屏。

```html
<section class="hero-12"><div class="hero-12-scene" role="img" aria-label="画面占位"></div><div class="hero-12-head"><h1>标题</h1><span>补充标题</span></div><a class="hero-12-action" href="#">主要行动</a><div class="hero-12-card"><div role="img" aria-label="局部画面占位"></div><p>一句说明</p><a href="#">查看</a></div></section>
```

```css
.hero-12 { position: relative; min-height: 560px; overflow: hidden; border-radius: 28px; }
.hero-12-scene { position: absolute; inset: 0; background: #d2d2d2; }
.hero-12-head { position: relative; display: flex; align-items: start; flex-direction: column; }
.hero-12-head h1, .hero-12-head span { max-width: 90%; padding: 14px 22px; border-bottom-right-radius: 32px; background: var(--page-surface); }
.hero-12-action { position: absolute; top: 24px; right: 24px; }
.hero-12-card { position: absolute; bottom: 24px; right: 24px; width: 260px; padding: 10px; border-radius: 16px; background: var(--page-surface); }
.hero-12-card > div { height: 110px; border-radius: 8px; background: #d2d2d2; }
@media (max-width: 1023px) { .hero-12-action { top: 160px; left: 20px; right: auto; } .hero-12-card { left: 20px; right: 20px; bottom: 20px; width: auto; } }
```

⚠️ 注意：两块曲角标题贴片不是 Hero 1 的右下缺口；窄屏行动移动到标题下，信息卡铺宽。

## 13. Hero浮标信息层型（Hero 13）

**适用**: 居中说明和社交证明下方，以悬浮图标、发光横条与信息卡组成画面的首屏。

```html
<section class="hero-13"><div class="hero-13-copy"><h1>标题</h1><p>一句说明</p><div class="hero-13-actions"><a href="#">查看</a><a href="#">主要行动</a></div><div class="hero-13-proof"><span>● ● ● ●</span><span>★★★★★</span></div></div><div class="hero-13-stage" role="img" aria-label="浮标与信息卡占位"><span class="hero-13-bar"></span><span class="hero-13-icon">○</span><div class="hero-13-card"></div><div class="hero-13-card"></div></div></section>
```

```css
.hero-13-copy { position: relative; z-index: 1; max-width: 680px; margin: auto; text-align: center; }
.hero-13-actions, .hero-13-proof { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
.hero-13-stage { position: relative; height: 350px; max-width: 850px; margin: -8px auto 0; overflow: hidden; }
.hero-13-bar { position: absolute; bottom: 50px; left: 10%; width: 80%; height: 8px; border-radius: 99px; background: #bdbdbd; }
.hero-13-icon { position: absolute; left: 35%; top: 80px; width: 48px; height: 48px; border-radius: 50%; background: #d2d2d2; text-align: center; }
.hero-13-card { position: absolute; right: 10%; top: 80px; width: 25%; height: 120px; border-radius: 14px; background: #d2d2d2; }
.hero-13-card:last-child { top: 216px; right: 15%; }
@media (max-width: 1023px) { .hero-13-stage { height: 260px; } }
```

⚠️ 注意：3D 光条只保留静态横条，信息卡与图标仍为叠层，不引入 Canvas。

## 14. Hero邮箱表单分栏型（Hero 14）

**适用**: 左侧评分与邮箱收集、右侧单张产品画面的首屏。

```html
<section class="hero-14"><div class="hero-14-copy"><div>☆ <span>评分</span> <span>数量</span></div><h1>标题</h1><p>一句说明</p><div class="hero-14-form"><input type="email" aria-label="邮箱"><button type="button">主要行动</button></div><a href="#">次要入口</a></div><div class="hero-14-image" role="img" aria-label="画面占位"></div></section>
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

⚠️ 注意：说明是两层，圆角输入条与行动按钮是不同层；此处不实现提交。

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

⚠️ 注意：实际源码未放背景图，不按描述补图；1024 以下底部说明与行动改为一列。

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

⚠️ 注意：右侧必须是一张 16:10 主图加三张方形缩略图；1024 以下上文下图。

## 18. Hero指令面板型（Hero 18）

**适用**: 居中说明下方直接展示搜索指令面板和结果列表的首屏。

```html
<section class="hero-18"><div class="hero-18-copy"><span>⌘K 公告</span><h1>标题</h1><p>一句说明</p></div><div class="hero-18-panel"><div class="hero-18-query">⌕ <span>搜索占位</span><kbd>esc</kbd></div><div class="hero-18-scopes"><span>范围 12</span><span>范围 8</span><span>范围 4</span></div><div class="hero-18-rows"><div>○ <span>结果一</span><kbd>↵</kbd></div><div>○ <span>结果二</span></div><div>○ <span>结果三</span></div></div><div class="hero-18-keys"><kbd>↑</kbd><kbd>↓</kbd><kbd>↵</kbd></div></div><div class="hero-18-action"><a href="#">主要行动</a><span>⌘ K</span></div></section>
```

```css
.hero-18 { display: flex; flex-direction: column; align-items: center; }
.hero-18-copy { max-width: 700px; text-align: center; }
.hero-18-panel { width: min(100%, 660px); margin: 42px auto 0; border: 1px solid #d2d2d2; border-radius: 24px; overflow: hidden; }
.hero-18-query, .hero-18-scopes, .hero-18-keys { display: flex; align-items: center; gap: 12px; padding: 12px 18px; }
.hero-18-query, .hero-18-keys { border-bottom: 1px solid #d2d2d2; } .hero-18-query kbd { margin-left: auto; }
.hero-18-rows > div { display: flex; gap: 12px; padding: 10px 18px; } .hero-18-rows kbd { margin-left: auto; }
.hero-18-action { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
@media (max-width: 1023px) { .hero-18-action { flex-direction: column; } }
```

⚠️ 注意：保留键帽、范围计数和三条结果；只画静态结果，不实现搜索或闪光动效。

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
@media (max-width: 1023px) { .hero-19 { grid-template-columns: 1fr; } .hero-19-float { display: none; } }
```

⚠️ 注意：1024 以下上文下面板，窄屏隐藏原区块的小悬浮卡，保留账单行与进度数字。

## 20. Hero口号标志指标型（Hero 20）

**适用**: 居中一句主张、行动、标志行和底部四格指标的首屏。

```html
<section class="hero-20"><h1>标题</h1><p>一句说明</p><div class="hero-20-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><div class="hero-20-logos" aria-label="标志占位"><span></span><span></span><span></span><span></span></div><div class="hero-20-metrics"><div><strong>01</strong><span>指标</span></div><div><strong>02</strong><span>指标</span></div><div><strong>03</strong><span>指标</span></div><div><strong>04</strong><span>指标</span></div></div></section>
```

```css
.hero-20 { text-align: center; } .hero-20 h1, .hero-20 p { max-width: 760px; margin: 0 auto 24px; }
.hero-20-actions, .hero-20-logos { display: flex; justify-content: center; flex-wrap: wrap; gap: 18px; }
.hero-20-logos { margin: 58px auto 40px; } .hero-20-logos span { width: 90px; height: 13px; border-radius: 4px; background: #d2d2d2; }
.hero-20-metrics { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 24px 0; }
.hero-20-metrics > div { display: grid; gap: 8px; } .hero-20-metrics > div + div { border-left: 1px solid #ccc; }
@media (max-width: 1023px) { .hero-20-metrics { grid-template-columns: repeat(2, 1fr); gap: 20px 0; } .hero-20-metrics > div:nth-child(3) { border-left: 0; } }
```

⚠️ 注意：指标必须留数字，1024 以下四格改为两列，不用产品口号替代黑条。

## 21. Hero极光光环型（Hero 21）

**适用**: 背景画面与顶部光环标记共同衬托居中标题的首屏。

```html
<section class="hero-21"><div class="hero-21-field" role="img" aria-label="极光画面占位"></div><div class="hero-21-copy"><div class="hero-21-orb" aria-hidden="true"><span></span></div><span>标识</span><h1>标题</h1><p>一句说明</p><div class="hero-21-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><small>简短提示</small></div></section>
```

```css
.hero-21 { position: relative; min-height: 500px; display: grid; place-items: center; overflow: hidden; }
.hero-21-field { position: absolute; inset: 0; border-radius: 24px; background: #d2d2d2; }
.hero-21-copy { position: relative; max-width: 720px; padding: 40px 24px; text-align: center; }
.hero-21-orb { width: 76px; height: 76px; margin: 0 auto 18px; display: grid; place-items: center; border: 12px solid #bbb; border-radius: 50%; }
.hero-21-orb span { width: 8px; height: 8px; border-radius: 50%; background: #555; }
.hero-21-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-21-copy { width: 100%; } }
```

⚠️ 注意：光环和极光均画静态一帧，不复刻 GLSL、动画或整区块着色。

## 22. Hero网格流光居中型（Hero 22）

**适用**: 居中公告、标题与行动叠在一整块流动画面上的首屏。

```html
<section class="hero-22"><div class="hero-22-field" role="img" aria-label="流光画面占位"></div><div class="hero-22-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div class="hero-22-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><small>简短提示</small></div></section>
```

```css
.hero-22 { position: relative; min-height: 480px; display: grid; place-items: center; overflow: hidden; }
.hero-22-field { position: absolute; inset: 0; border-radius: 24px; background: #d2d2d2; }
.hero-22-copy { position: relative; max-width: 720px; padding: 40px 24px; text-align: center; }
.hero-22-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
@media (max-width: 1023px) { .hero-22-copy { width: 100%; } }
```

⚠️ 注意：背景只用灰面表示 MeshGradient 的占位，不放 shader 或渐变标题。

## 23. Hero水纹画框型（Hero 23）

**适用**: 居中叙述下方用带状态芯片与帧率数字的画框呈现画面的首屏。

```html
<section class="hero-23"><div class="hero-23-copy"><span>公告</span><h1>标题</h1><p>一句说明</p><div class="hero-23-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div></div><div class="hero-23-frame" role="img" aria-label="水纹画面占位"><span class="hero-23-live">● 状态</span><div class="hero-23-caption"><span>60 fps</span><span>画面信息</span></div></div></section>
```

```css
.hero-23-copy { max-width: 720px; margin: 0 auto 40px; text-align: center; }
.hero-23-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.hero-23-frame { position: relative; aspect-ratio: 16 / 11; border-radius: 24px; overflow: hidden; background: #d2d2d2; }
.hero-23-live { position: absolute; top: 18px; left: 18px; padding: 6px 12px; border-radius: 999px; }
.hero-23-caption { position: absolute; bottom: 18px; left: 18px; right: 18px; display: flex; justify-content: space-between; align-items: end; }
@media (max-width: 1023px) { .hero-23-caption { flex-wrap: wrap; gap: 12px; } }
```

⚠️ 注意：画框保留 16:11 比例和 60 fps 数字；水纹以一块灰面代替。

## 24. Hero神经线场左文型（Hero 24）

**适用**: 左侧状态芯片、标题与标志行置于整幅线场画面前的首屏。

```html
<section class="hero-24"><div class="hero-24-field" role="img" aria-label="线场画面占位"></div><div class="hero-24-copy"><span class="hero-24-status">● 状态</span><h1>标题</h1><p>一句说明</p><div class="hero-24-actions"><a href="#">主要行动</a><a href="#">次要行动</a></div><div class="hero-24-logos"><span>标志</span><span>标志</span><span>标志</span></div></div></section>
```

```css
.hero-24 { position: relative; min-height: 500px; display: flex; align-items: center; overflow: hidden; }
.hero-24-field { position: absolute; inset: 0; border-radius: 24px; background: #d2d2d2; }
.hero-24-copy { position: relative; width: min(100%, 620px); padding: 40px; text-align: left; }
.hero-24-status { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 12px; }
.hero-24-actions, .hero-24-logos { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
@media (max-width: 1023px) { .hero-24-copy { padding: 32px 20px; } }
```

⚠️ 注意：线场用静态灰面，左侧内容与底部标志行不可改成居中；1024 以下仍保持单列左对齐。

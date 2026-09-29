# 英雄区布局

目前 1 条，后续可以沿用相同条目形状追加至 24 条。
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

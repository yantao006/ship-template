# Brand DNA - 品牌基因

> ⚠️ **使用前请确认配置：** 下面是 Palette A · 松间手账默认三色配色，可直接使用。
> 如需换成你自己的品牌色，替换三个色值并同步修改模板 `:root` 变量。
> 本 fork 已设置 `assets/avatar.jpg`，气质关键词也可按你的品牌继续替换。

---

## 🎨 IP固定三色（Palette A · 松间手账默认配色，可替换为你自己的）

| 角色 | 色名 | 色值 | 用途 |
|------|------|------|------|
| 主色 | 松针绿 | `#2F6F5E` | 主色调、标题、超链接、重点标记 |
| 强调色 | 琥珀金 | `#E8B86D` | 强调、装饰、badges、连接线、高亮 |
| 点缀色 | 陶土红 | `#C45C4A` | 点缀、高亮下划线、CTA、标签 |

三色比例原则：主色60% · 强调色30% · 点缀色10%（点缀色永远是点缀，不做主色）

变量名保留 `--blue` / `--yellow` / `--red` 以兼容原 Esther 模板，对应色值分别是松针绿 / 琥珀金 / 陶土红。

> 💡 如需替换为你自己的品牌色，改上面三个色值即可，比例原则不变。不知道怎么选色？参考 `brand-dna.md` 底部的扩展色规则。

---

## 👤 头像/IP形象

本 fork 已内置 `assets/avatar.jpg`，是一张 1254×1254 的方形 monogram 头像。
如需换成你自己的头像，覆盖 `assets/avatar.jpg` 即可（建议正方形，至少 400×400px）。

如果你有完整IP形象（全身/半身），放入 `assets/character.png`。

### 使用规则
- 需要头像时优先用 `assets/avatar.jpg`
- `assets/avatar-placeholder.svg` 保留为备用占位文件
- 是否在页面中使用IP形象由你决定，不强制

---

## 🔤 字体基因

### 核心原则
- **标题用衬线，正文用无衬线** — 混搭产生节奏
- **中英文搭配** — 英文做装饰/标签，中文承载内容
- **字号对比极端** — 大的要很大，小的要真的小

### 推荐字体池

| Role | Font | Notes |
|------|------|-------|
| English display/title | `Fraunces` (often italic) | quality serif, accents, EN display |
| English hand/casual | `Caveat` | annotations, handwritten notes |
| English mono/terminal | `Fira Code` | tech/terminal only |
| Chinese title primary | `Huiwen Mincho`（汇文明朝体） | true title face; local ttf when available |
| Chinese title fallback | `Noto Serif SC` 900 | webfont when no Huiwen file |
| Body EN+ZH | `DM Sans` (Latin) · `Noto Sans SC` + system stack (CJK) | only role changed from pure P1 |

### CSS字体变量

```css
--font-en-display: 'Fraunces', Georgia, serif; /* italic when decorative */
--font-hand: 'Caveat', cursive;
--font-mono: 'Fira Code', ui-monospace, monospace;
--font-zh-title: 'Huiwen Mincho', 'Noto Serif SC', 'Songti SC', serif;
--font-body: 'DM Sans', 'Noto Sans SC', -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
```

Google Fonts 无 Huiwen 文件时加载 `Fraunces`、`Caveat`、`Fira Code`、`Noto Serif SC`、`Noto Sans SC`、`DM Sans`。
如已有合法的汇文明朝体文件，可放在 `assets/fonts/HuiwenMincho.ttf` 并按需启用本地 `@font-face`。
模板文件在 `assets/` 目录内时，`url()` 路径应写为 `fonts/HuiwenMincho.ttf`。

### 字号系统（fluid sizing）
- Hero大标题: `clamp(2.8rem, 7vw, 5.5rem)`
- Section标题: `clamp(1.6rem, 4vw, 2.6rem)`
- 卡片标题: `1.15rem ~ 1.4rem`
- 正文: `16px`
- 辅助文字: `0.78rem ~ 0.85rem`
- 大装饰数字: `clamp(3rem, 8vw, 7rem)` + `opacity: 0.12~0.2`

---

## ✨ 气质关键词

设计出来的东西应该让人觉得：

- **可爱但有品质** — 不是幼儿风也不是奢侈风
- **手绘蜡笔感** — 有温度、有人味
- **不像AI** — 这是最高优先级的约束
- **有设计师眼光** — 细节讲究、间距精确、色彩克制
- **温暖但不幼稚** — 有内容有深度
- **个人品牌感** — 一看就知道是"你的"

> 💡 请根据你自己的品牌调性修改上面的关键词。

---

## 🎨 配色扩展原则

当三色不够用时：

- 背景永远偏暖：`#fefcf6`（主背景）、`#faf6eb`（深奶）
- 文字永远非纯黑：用 `#1A1A2E`（墨色）或 `#1a1a1a`
- 次要文字：`#4A4A5A`、`#555`、`#888`
- 绝不用纯黑 `#000` 或纯白 `#fff`
- 暗色场景底色：`#151821`、`#0d1117`（冷蓝调暗底，仅适用于HTML全屏页面，3:4卡片场景禁止深色底）
- 终端绿：`#4ade80`（仅终端风格场景使用）
- 径向渐变制造层次，不用纯平色

---

## 🚫 通用禁忌清单

| 类型 | 禁止 |
|------|------|
| 配色 | 蓝紫渐变、cyan、neon、纯黑白、AI常用的冷灰蓝调、任何多色渐变背景（占位色块用纯色 `#FFF8E1` 或 `#E8B86D`，荷光笔高亮的 `linear-gradient(transparent 60%, #E8B86D 60%)` 保留） |
| 深色版面 | 仅3:4图文卡片场景禁止黑色/深色版面；HTML全屏页面可用深色面板 |
| 字体 | Inter/Roboto/Arial等overused字体（除非明确是终端风格辅助字体）、monospace充当"技术感" |
| 布局 | 所有section居中、千篇一律卡片网格、cards嵌套cards |
| 动效 | bounce/elastic、animate width/height、无限循环动画 |
| 装饰 | glassmorphism、圆角矩形+阴影千篇一律、渐变文字、AI光效、border-left 竖线引用块（类似 Notion/飞书的左侧竖条引用样式） |
| 整体 | 看起来像AI生成的通用模板、generic Landing Page模板感 |
| 边框 | 强调色装饰边框细于40px（统一40px，不得更细） |
| 排版 | 行间距/字间距必须肉眼检查，不允许出现过松或过紧的异常节奏 |
| 图片 | AI生成的stock photo风、过度滤镜、无意义装饰图 |
| 默认样式 | HTML默认blockquote、默认border-left引用块、无样式ul/ol列表、默认table——所有组件必须从components.md选用，绝不允许浏览器默认渲染 |

### 自检问题
做完设计后问自己：
1. 这个页面截图发到社交媒体，会不会被人评论"又是AI做的"？
2. 能不能一眼认出这是你的品牌？
3. 有没有哪个部分让你觉得"见过很多次了"？

---

## 📐 通用间距原则

- Section之间: `clamp(80px, 12vh, 160px)`
- 内容块之间: `clamp(40px, 6vw, 100px)`
- 卡片内padding: `clamp(28px, 3vw, 44px)`
- 元素间gap: `clamp(24px, 3vw, 48px)`
- 全部用 `clamp()` 做fluid sizing
- `max-width: 1300px` + `margin: 0 auto` 约束内容宽度

---

## 📱 响应式通用规则

- 断点: 900px（两栏→单栏）、600px（字号微缩）
- 移动端是"重新排列"不是"缩小"
- 尊重 `prefers-reduced-motion`
- 移动端不隐藏内容——adapt不amputate

---

## 🔍 细节规范

- **选中文本高亮**: `::selection { background: 你的强调色; color: #1a1a1a; }`
- **链接悬停**: 用强调色底色块或下划线，不用变色

---

*This is the foundation. Every scene file builds on top of this.*

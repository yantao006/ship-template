# Personal Design Skill

一套给 AI 看的个人品牌设计系统。

本 fork 默认三色已本地化为 Palette A · 松间手账：松针绿 / 琥珀金 / 陶土红。
变量名保留 `--blue` / `--yellow` / `--red` 以兼容原 Esther 模板。

**ESTHER不二** · [小红书](https://www.xiaohongshu.com/user/profile/55c6c7695894460904f87b47?m_source=pinpai) · [Twitter / X](https://x.com/SjwEsther)

![Esther Design System overview](assets/design-system-overview-final.png)

> **开源的是方法论，不是我的身份。**
>
> 本仓库开源的是我整理出的设计方法论、设计规范、工作流程、布局模式、组件模式和相关模板。你可以基于 CC BY-NC-SA 4.0 学习、修改和分享这些内容，但这不代表你获得了使用 **ESTHER不二 / Esther / 不二 / esthersjw** 的姓名、头像、IP形象、Logo、品牌标识、个人账号标识或本人形象进行创作、运营、发布、商业合作或对外背书的许可。
>
> 使用这套系统时，请替换为你自己的姓名、头像、IP和品牌信息。任何使用本仓库内容制作的账号、作品、产品、课程、Agent 或服务，都不得让人误以为由我制作、授权、合作或背书。协议要求的署名仅表示内容来源，不等于身份授权。

把审美写成操作手册，AI 每次帮你做页面时必须翻这本手册，不能自由发挥。**限制 AI 的自由度 = 保证输出质量。**

> ⚠️ **使用前请先完成 `brand-dna.md` 的配置：** Palette A 默认品牌色和头像可直接使用，如需替换成你自己的请同步修改模板变量和头像文件。

---

## Demo

用这套系统生成的真实页面：

### 📖 教程型 - 分享会页面

信息清晰、步骤明确、有节奏的单页科普/教程。

🔗 [在线预览](https://esthersjw.github.io/cola-ob-sharing/cola-ob-sharing.html)

---

### 📖 教程型 - Design Skill 拆解

把审美写成操作手册——从纠正AI到做出自己的Design Skill的完整过程。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/demo-readme-tutorial.html)

---

### 🎪 活动页 / Landing

视觉冲击、深浅面板交替、强节奏感的活动邀请页。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/demo-landing.html)

---

### 📱 App 型 / 功能型

功能优先、交互感、信息密度高的应用型页面。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/demo-app.html)

---

### 📕 小红书图文卡片

3:4 比例、字大、手机可读、一键导出 PNG 的图文卡片。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/demo-cards.html)

---

### 📱 公众号排版

杂志编号风：全内联样式 + section 标签，复制粘贴进微信公众号编辑器即可。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/assets/demo-wechat.html)

---

### 📜 布局 Playground

16种经过验证的布局模式一览。

🔗 [在线预览](https://esthersjw.github.io/esther-design-system/demo-layouts.html)

---

### 🧩 组件库全览

51个经过验证的可复用组件。

🔗 [组件库预览](https://esthersjw.github.io/esther-design-system/components-preview.html)

---

## 核心逻辑

```
SKILL.md(流程 - AI 按什么步骤干活)
    ↓
brand-dna.md + references/*(规范 - 能用什么不能用什么)
    ↓
assets/template-*.html(起点 - 从模板改,不从零写)
```

- AI 不能随便发明布局 → 只能从 16 种里选
- AI 不能随便用颜色 → 只能用你定义的品牌色 + 扩展规则
- AI 不能随便写样式 → 必须从组件库里选
- AI 做完要自检 → 对照 checklist 逐条过，P0 不过就打回

---

## 文件结构

```
esther-design-system/
├── SKILL.md                    ← 7步工作流(大脑)
├── brand-dna.md                ← 品牌基因:颜色/字体/气质/禁忌(需配置)
├── assets/                     ← 模板骨架(起点)
│   ├── template-tutorial.html      教程页模板
│   ├── template-landing.html       活动页模板
│   ├── template-app.html           App型模板
│   ├── template-cards.html         小红书卡片模板
│   ├── template-wechat.html        公众号排版模板
│   ├── html2canvas.min.js          卡片导出依赖
│   ├── avatar-placeholder.svg      占位头像(保留备用)
│   └── avatar.jpg                  Palette A fork 默认头像(可替换)
└── references/                 ← 规则和零件(知识库)
    ├── layouts.md                  16种布局模式(附完整代码)
    ├── components.md               组件库(51组件,完整HTML+CSS)
    ├── checklist.md                质量检查清单(P0/P1/P2)
    ├── scene-tutorial.md           教程场景规范
    ├── scene-landing.md            活动页场景规范
    ├── scene-app.md                App型场景规范
    ├── scene-cards.md              小红书卡片场景规范
    └── scene-wechat.md             公众号排版场景规范
```

---

## 7 步工作流

AI 每次做设计必须按这个顺序走：

| # | 做什么 | 为什么 |
|---|--------|--------|
| 1 | 问 5 个问题(类型/受众/几屏/素材/约束)。类型含：教程/活动页/App/卡片/**公众号** | 不自作主张 |
| 2 | 读 brand-dna + 对应场景文件 | 先学规矩再动手 |
| 3 | 从 assets/ 复制对应模板 | 从半成品开始，不从零写 |
| 4 | 从 layouts.md 选 3-5 种布局 | 每个 section 不能一样 |
| 5 | 从 components.md 选组件 | 禁止用 HTML 默认样式 |
| 6 | 对照 checklist 自检 | P0 不过就打回 |
| 7 | 交付 HTML 文件 | 浏览器打开就能看 |

---

## 品牌基因速览

### 三色（本 fork 默认 Palette A · 松间手账，可在brand-dna.md中替换为你自己的）

| 角色 | 色名 | 色值 | 比例 |
|------|------|------|------|
| 主色 | 松针绿 | `#2F6F5E` | 60% |
| 强调色 | 琥珀金 | `#E8B86D` | 30% |
| 点缀色 | 陶土红 | `#C45C4A` | 10% |

### 字体

| 用途 | 字体 |
|------|------|
| English display/title | Fraunces italic |
| English hand/casual | Caveat |
| English mono/terminal | Fira Code |
| Chinese title primary | 汇文明朝体 |
| Chinese title fallback | Noto Serif SC 900 |
| Body EN+ZH | DM Sans (Latin) · Noto Sans SC + system stack (CJK) |

### 气质关键词（请根据你的品牌调性修改）

可爱但有品质 · 手绘蜡笔感 · 有温度 · **不像 AI** · 一看就是你的

### 禁忌

蓝紫渐变 · glassmorphism · neon · bounce 动画 · Inter/Roboto · 所有 section 居中 · HTML 默认样式 · 看起来像 AI 生成的通用模板

---

## 质量检查

**P0(必须全过)**

品牌三色比例 · 无禁忌元素 · 无 HTML 默认样式 · 暖底背景 · 衬线+无衬线混搭 · 响应式 · 每 section 布局不同 · clamp() fluid sizing · 截图发社交媒体不会被说"又是 AI 做的"

**P1(应过)**

至少一个视觉惊喜 section · 字号对比极端 · Scroll Reveal 动效 · 大装饰数字/英文

**P2(加分)**

图片溢出容器 · 深色面板打破节奏 · 装饰元素克制 · prefers-reduced-motion

---

## 怎么用

1. Fork 或克隆本仓库
2. 如需个性化头像，覆盖 `assets/avatar.jpg`
3. （可选）打开 `brand-dna.md`，把 Palette A · 松间手账默认品牌色替换成你自己的，并同步修改 `assets/template-*.html` 里 `:root` 的变量。
   注意：公众号模板（`template-wechat.html`）全部是内联样式，没有 CSS 变量，需要手动搜索替换色值。
   快捷方法：在所有模板文件中搜索 `#2F6F5E` 替换为你的主色，`#E8B86D` 替换为你的强调色，`#C45C4A` 替换为你的点缀色
4. 把 `assets/template-cards.html` 中的作者名替换成你自己的
5. 把仓库链接发给你的 AI Agent，跟它说：

> 帮我读这个设计系统，以后做页面按这个规范来。

核心不是这些文件本身，是**你的审美判断力**。文件只是把你的判断写成了 AI 能执行的规则。

---

## Credits

- 方法论灵感来源于 [归藏](https://github.com/guizang) 的 PPT Skill——“限制AI的自由度 = 保证输出质量”这个核心思路参考了他的设计
- 本 fork 保留 ESTHER不二 / esthersjw 的 CC BY-NC-SA 署名要求，默认三色本地化为 Palette A · 松间手账：松针绿 / 琥珀金 / 陶土红
- Built with [Cola](https://colaos.ai) — the first OS with a soul

---

## License

[![CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

本仓库中的方法论、设计规范、工作流程、布局模式、组件模式、模板和文档，采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议。

- ✅ 可以学习、使用、修改和分享本仓库中的方法论与设计内容
- ✅ 必须注明来源：ESTHER不二 / [esther-design-system](https://github.com/esthersjw/esther-design-system)
- ❌ 禁止将本仓库内容用于商业用途
- 🔄 修改后必须以相同协议分享
- ❌ 署名不等于姓名、头像、IP、Logo、品牌标识或本人形象的使用授权
- ❌ 不得使用我的名字、头像、IP或其他身份标识创建看起来由我运营、授权、合作或背书的账号、作品、产品、课程、Agent或服务

### Name, Image and IP Notice

**ESTHER不二、Esther、不二、esthersjw** 及与我相关的姓名、头像、IP形象、Logo、品牌标识、个人账号标识和本人形象，不属于本仓库 CC BY-NC-SA 4.0 的授权范围。

你可以在协议要求的范围内进行事实性来源署名，但不得把这些名称或视觉资产用作自己的账号名、用户名、头像、品牌名、角色名、产品名或对外宣传素材，也不得暗示与我存在官方关系。

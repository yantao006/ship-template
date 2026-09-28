# Share and earn 视觉闭环

范围仅限 Share and earn 卡片。
桌面评审视口为 1440×900，双站均使用深色主题。
实现端与每轮独立评审端均使用 Pi `openai-codex/gpt-6-sol`，thinking high。
评审用 ego-browser 亲手开卡、复制、原生粘贴、展开规则、检查空输入和关闭叉。

## 轮次

| 轮次 | 评审原文 | 结果与下一步 |
| --- | --- | --- |
| 01 | `review-01.txt` | 浏览器被接管，操作未完成，不计分。 |
| 02 | `review-02.txt` | 8/10；复制反馈导致卡片跳动，展开说明偏密。 |
| 03 | `review-03.txt` | 8/10；展开态底部截断，反馈过小。 |
| 04 | `review-04.txt` | 8/10；正式分享域名待核验，按钮颜色偏深。 |
| 05 | `review-05.txt` | 8/10；推荐语不够具体，宽幅反馈遮抢内容。 |
| 06 | `review-06.txt` | 9/10；亲手完成两边操作，无必须先改的结构问题，按退出条件停止。 |

改动依次集中在两栏步骤标题、社交链接与规则展开、空 URL 禁用、独立复制提示、可视高度、按钮色和站点事实文案。
末轮实现截图为 `preview-r5-toast.png`；展开态截图为 `preview-r3-expanded.png`；对标初始截图为 `source-1440.png`。
截图只是操作记录，分数以评审实际操作原文为准。

## 允许差异

分享链接采用 `site/site.config.ts` 的正式对外地址，而非 Cloudflare 预览别名。
本站视频工具目前只预览请求，不生成视频，因此推荐语明确写 `preview ... requests`，没有照搬对标站免费生成视频或图片的宣称。
积分和次数取本站配置，未复制对标站的账号、产品与域名。

正式分享地址：

https://awesomejev.link

评审预览地址：

https://popovers-awesomejev-test.yantao006.workers.dev/en

## 尚未核验

最后一轮评审未离开指定两站打开正式分享落点，因此收件人的实际到达效果尚未核验。
没有提交真实帖子链接或触发积分发放。

## 验证

`pnpm test`、`pnpm typecheck`、`pnpm site-check`、`pnpm site-check fixtures/second-site` 与 `pnpm cf:build` 均通过。
通过 `pnpm exec wrangler versions upload --preview-alias popovers --message share-earn-visual-r5` 上传预览版本，没有部署正式流量。

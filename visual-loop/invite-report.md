# Invite Friends 卡片视觉闭环

评审视口为 1440×900，同一深色主题，独立 Pi 评审亲手通过 ego-browser 打开两站并操作卡片。
每次有效评审使用新的 Pi 进程，只给评审端操作要求和两个地址。
原始评审文字保存在本目录的 `invite-review-*.txt`，截图仅作记录，不作为评分依据。

参考站：

https://minimaxh3.ai/

预览站：

https://popovers-awesomejev-test.yantao006.workers.dev/en

## 实现与验证

新增额度高亮、官方邀请落点、分离的链接框与 Copy Link 按钮、五个分享入口、真实奖励规则、真实已奖励排行榜、真实邀请历史与刷新、空状态，以及可见的复制提示。
邀请人数、排行榜和历史仅统计账本中实际获得邀请人奖励的领取记录，不制造用户名或数量。
邀请码落点沿用现有 `checkinInviteShare` 和 `/invitation-landing?invite_code=`，正式分享域名仍为站点配置的 `site.url`，与评审预览别名不同。
中英两套文案及第二站 fixture 维持同一键集合，规则取本站 24 小时领取窗口等实际能力。

`pnpm test` 全部 101 项通过，`pnpm typecheck`、`pnpm site-check`、`pnpm site-check fixtures/second-site`、`pnpm cf:build` 通过。
预览通过 `wrangler versions upload --preview-alias popovers` 上传，未部署生产版本。

## 有效评审轮次

| 原文 | 评分 | 本轮主要观察 |
| --- | --- | --- |
| `invite-review-07.txt` | 8/10 | 复制反馈在底部不可见、字号换行紧、空榜高度不足。 |
| `invite-review-11.txt` | 8/10 | 复制反馈、换行和榜单布局改进，剩余视觉层次差异。 |
| `invite-review-15.txt` | 7/10 | 评审观察到进场瞬间透底与装饰不足，随后的版本取消邀请卡的透明进场。 |
| `invite-review-16.txt` | 8/10 | 标题、渐变、背景、独立链接框及额度高亮仍有差距。 |
| `invite-review-17.txt` | 8.5/10 | 结构对齐，底部空历史较紧凑。 |
| `invite-review-18.txt` | 8.5/10 | 增加历史空态高度与图标后，主要剩余为轻微渐变和栏宽。 |
| `invite-review-20.txt` | 8/10 | 最后一轮亲手操作两站，确认无必须先改的结构问题，仍认为卡片底色偏重。 |

未操作完两站或因浏览器控制权交接中断的评审未纳入分数。
最后两次有效评审没有实质性的分数或主要问题改进，因此按循环退出规则停止，不宣称达到 9/10。
最后一轮评审原文：`visual-loop/invite-review-20.txt`。
参考与预览底部截图：`visual-loop/invite-source-final-bottom.png`、`visual-loop/invite-preview-final-bottom.png`。

## 允许差异与剩余差异

允许差异：站点名称、正式邀请域名、真实邀请人数、真实排行榜和历史数据，以及两站不同的业务规则。
参考站 Gmail 限制、同 IP 限制和每日奖励上限不属于本站能力，不能复制这些文案。
剩余差异：邀请卡的紫色底色、渐变光晕和深色区域对比仍与参考站略有差别，复制成功提示文案不同；最后一轮评审给出 8/10，没有结构性阻碍。
未验证实际好友通过链接完成注册与领取的生产端到端流程；预览只验证了已登录的邀请卡操作和剪贴板正文。

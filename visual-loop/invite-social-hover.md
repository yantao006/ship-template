# Invite Friends 分享按钮悬停核验

在 1440×900 深色主题中用 ego-browser 亲手打开参考站和预览站的 Invite Friends 卡片。
参考站五个圆钮悬停时仅将白色半透明底色从约 4% 提升到约 10%，以 150ms 过渡，不发生位置或尺寸变动。
本次只把这套反馈应用于 Invite Friends 的 Facebook、X、WhatsApp、LinkedIn、Telegram 五个社交圆钮。
键盘 `Tab` 聚焦使用相同底色反馈，并保留已有可见焦点轮廓。
`prefers-reduced-motion: reduce` 下取消过渡，仍保留状态变化。

参考站悬停记录：`visual-loop/invite-social-source-hover-1440.png`。
预览站五张悬停截图：`visual-loop/invite-social-hover-facebook.png`、`visual-loop/invite-social-hover-x.png`、`visual-loop/invite-social-hover-whatsapp.png`、`visual-loop/invite-social-hover-linkedin.png`、`visual-loop/invite-social-hover-telegram.png`。
键盘焦点截图：`visual-loop/invite-social-focus-facebook.png`。
预览站逐一实际悬停后，五个按钮的背景均达到 10% 半透明白色，保持原有 36×36 尺寸、坐标和品牌图标色，不遮挡左侧文字。

参考站：

https://minimaxh3.ai/

预览站：

https://popovers-awesomejev-test.yantao006.workers.dev/en

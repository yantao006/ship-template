# Auth-4 登录弹窗验证记录

- 2026-09-27：使用任务提供的已保存 Auth-4 源码并适配，位于 `src/components/blocks/auth-4.tsx`；没有再次运行 registry 安装。
- `pnpm typecheck`、`pnpm test`（87 项，含 Auth-4 服务端标记渲染、站内回跳路径、单例弹窗及支付不自动恢复断言）、`pnpm site-check`、`pnpm site-check fixtures/second-site`、`pnpm cf:build` 均通过。
- 原有认证集成测试覆盖邮箱注册、邮箱验证、真实 D1 会话、Google 起始回调、密码重置和支付回调；本次新增 UI 通过 `/api/auth/get-session` 确认服务端会话后才进入成功状态。自动测试没有执行 Auth-4 表单至远端 Google 授权的完整浏览器链路。
- 当前首页工具只预览生成参数，不执行真实生成或扣费；仓库没有 Get Started 按钮。已接入公共导航、只读工作台入口和定价结算拦截。
- 无可复用的正在运行的本地预览；遵守任务限制，未启动或重启 Next 开发服务器，因此桌面/移动端的打开关闭、焦点和滚动保留、真实 OAuth 授权回跳及完整支付入口均未在浏览器中实测。
- 未附旧站截图，也未将没有运行的浏览器路径记为已通过。

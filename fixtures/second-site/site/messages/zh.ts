import navigation from './zh/navigation';
import signIn from './zh/sign-in';
import mail from './zh/mail';
import invites from './zh/invites';
import handoff from './zh/handoff';
import account from './zh/account';
import dashboard from './zh/workspace';
import credits from './zh/credits';
import pricing from './zh/pricing';
import planCopy from './zh/plan-copy';
import videoTool from './zh/video-tool';

export default {
  metadata: { description: '抢先体验未来的视频创作工作台。' },
  hero: {
    title: '从下一帧开始。',
    description: '你的独立工作台已准备好。登录即可查看积分，也可以选择套餐补充积分。',
    detail: '未来工作台的预览。',
    explore: '探索工作台',
    viewPlans: '查看套餐',
    openWorkspace: '进入工作台',
    credits: '可用积分',
  },
  nav: navigation,
  signIn, mail, invites, handoff, account, dashboard, credits, pricing, planCopy, videoTool,
};

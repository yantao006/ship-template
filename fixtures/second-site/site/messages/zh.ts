import navigation from './zh/navigation';
import footer from './zh/footer';
import signIn from './zh/sign-in';
import mail from './zh/mail';
import invites from './zh/invites';
import handoff from './zh/handoff';
import account from './zh/account';
import accountPages from './zh/account-pages';
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
  shines: {
    title: '{brand} 的闪光时刻',
    intro: '从游戏场景、视觉风格、产品或故事出发，为下一段视频构思方向。',
    items: [
      { title: '游戏场景', description: '想象一个新世界的开场、界面片刻，或角色登场。', tags: ['游戏 CG', '界面演示', '角色宣传片'] },
      { title: '动画风格', description: '为视觉故事尝试手绘、黏土质感或立体造型的方向。', tags: ['动漫', '黏土动画', '3D 风格'] },
      { title: '产品故事', description: '构思产品亮相、店铺宣传，或一段简短的品牌故事。', tags: ['产品演示', '广告创意', '品牌影片'] },
      { title: '影片创意', description: '用镜头规划预告片、戏剧性瞬间，或一段精简的故事。', tags: ['预告片', '品牌影片', '短剧'] },
    ],
  },
  nav: navigation,
  footer, signIn, mail, invites, handoff, account, accountPages, dashboard, credits, pricing, planCopy, videoTool,
};

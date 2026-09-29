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
    intro: '从想象中的游戏世界到动起来的日常物件，探索下一段视频的四种创作方向。可以从一个场景、一种情绪，或一个值得分享的故事开始。',
    items: [
      {
        title: '游戏世界',
        description: '为新世界设计开场：角色亮相、游戏感场景，或一段动起来的界面演示。',
        tags: ['游戏 CG', '界面演示', '角色宣传片'],
      },
      {
        title: '风格化动画',
        description: '用手绘线条、黏土质感或鲜明的 3D 造型构思画面，为想讲的故事选一种视觉语言。',
        tags: ['动漫', '黏土动画', '3D 风格'],
      },
      {
        title: '产品与电商',
        description: '把物品的细节放到聚光灯下，从安静的产品亮相到有活力的店铺宣传创意。',
        tags: ['产品演示', '广告创意', '品牌影片'],
      },
      {
        title: '电影感故事',
        description: '构思戏剧性的开场、人物的片刻，或令人难忘的收尾镜头，让故事有电影般的节奏。',
        tags: ['预告片', '品牌影片', '短剧'],
      },
    ],
  },
  nav: navigation,
  footer, signIn, mail, invites, handoff, account, accountPages, dashboard, credits, pricing, planCopy, videoTool,
};

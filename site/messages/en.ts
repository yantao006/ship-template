import navigation from './en/navigation';
import footer from './en/footer';
import signIn from './en/sign-in';
import mail from './en/mail';
import invites from './en/invites';
import handoff from './en/handoff';
import account from './en/account';
import accountPages from './en/account-pages';
import dashboard from './en/workspace';
import credits from './en/credits';
import pricing from './en/pricing';
import planCopy from './en/plan-copy';
import videoTool from './en/video-tool';

export default {
  metadata: { description: 'An early look at your future video workspace.' },
  hero: {
    title: 'A place to begin the next frame.',
    description: 'Your private workspace is ready. Sign in to see your credits, or choose a plan to add more.',
    detail: 'A preview of the workspace to come.',
    explore: 'Explore workspace',
    viewPlans: 'View plans',
    openWorkspace: 'Open workspace',
    credits: 'Available credits',
  },
  shines: {
    title: 'Where {brand} Shines',
    intro: 'From imagined game worlds to everyday objects in motion, explore four directions for your next video concept. Start with a scene, a feeling, or a story worth sharing.',
    items: [
      {
        title: 'Game Worlds',
        description: 'Give a new world its opening moment: a character reveal, a game-inspired scene, or an interface brought to life.',
        tags: ['Game CG', 'UI Demos', 'Character PV'],
      },
      {
        title: 'Stylized Animation',
        description: 'Think in drawn lines, sculpted clay, or bold 3D shapes. Choose the visual language that fits the story you want to tell.',
        tags: ['Anime', 'Claymation', '3D Styles'],
      },
      {
        title: 'Products in Motion',
        description: 'Put the details of an object in the spotlight, from a quiet product reveal to a lively idea for a shop campaign.',
        tags: ['Product Demos', 'Ad Creatives', 'Brand Films'],
      },
      {
        title: 'Cinematic Stories',
        description: 'Frame a dramatic opening, a small character moment, or a memorable closing shot with the pace of a film.',
        tags: ['Trailers', 'Brand Films', 'Short Drama'],
      },
    ],
  },
  nav: navigation,
  footer, signIn, mail, invites, handoff, account, accountPages, dashboard, credits, pricing, planCopy, videoTool,
};

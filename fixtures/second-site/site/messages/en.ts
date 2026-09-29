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
    intro: 'Sketch a direction for your next video, whether it starts with a game, a visual style, a product, or a story.',
    items: [
      { title: 'Game Scenes', description: 'Imagine an opening, an interface moment, or a character introduction for a new world.', tags: ['Game CG', 'UI Demos', 'Character PV'] },
      { title: 'Animated Looks', description: 'Explore drawn, clay-like, or dimensional directions for a visual story.', tags: ['Anime', 'Claymation', '3D Styles'] },
      { title: 'Product Stories', description: 'Plan a product reveal, a shop campaign, or a short brand vignette.', tags: ['Product Demos', 'Ad Creatives', 'Brand Films'] },
      { title: 'Film Ideas', description: 'Map out a trailer, a dramatic beat, or a compact story told through shots.', tags: ['Trailers', 'Brand Films', 'Short Drama'] },
    ],
  },
  nav: navigation,
  footer, signIn, mail, invites, handoff, account, accountPages, dashboard, credits, pricing, planCopy, videoTool,
};

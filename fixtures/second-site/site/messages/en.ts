import navigation from './en/navigation';
import signIn from './en/sign-in';
import mail from './en/mail';
import invites from './en/invites';
import handoff from './en/handoff';
import account from './en/account';
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
  nav: navigation,
  signIn, mail, invites, handoff, account, dashboard, credits, pricing, planCopy, videoTool,
};

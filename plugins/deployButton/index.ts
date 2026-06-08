import { definePlugin } from 'sanity';
import { RocketIcon } from '@sanity/icons';
import { DeployTool } from './DeployTool';

// Studio plugin that adds a "Deploy Site" tool to the Studio sidebar. The
// tool renders a button that POSTs to the trigger-deploy Netlify function,
// which in turn hits the configured Netlify build hook. Lets editors batch
// CMS changes and publish them with one click instead of relying on a
// per-save webhook that burns build credits.
export const deployButtonPlugin = definePlugin({
  name: 'deploy-button',
  tools: [
    {
      name: 'deploy',
      title: 'Deploy Site',
      icon: RocketIcon,
      component: DeployTool,
    },
  ],
});

import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  /* appId pins the deployed Sanity Studio application so subsequent
   * `sanity deploy` runs don't reprompt for one. Hostname is
   * activeins.sanity.studio; first deploy ran on 2026-06-12. */
  deployment: {
    appId: 'f1d82d23cc3ca58e7395ad75',
  },
});

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { iconPicker } from 'sanity-plugin-icon-picker';
import { schemaTypes } from './schemas';
import { deployButtonPlugin } from './plugins/deployButton';

// Types where clients can only edit existing documents, not create or delete.
// Each of these is a singleton (or a fixed small set, like the 3 navigation
// docs) seeded once and edited afterward. Removed `socialLinks` — that schema
// no longer exists.
const LOCKED_TYPES = ['page', 'legalPage', 'siteSettings', 'navigation', 'utilityBar', 'footerColumns'];

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;

const sharedConfig = {
  projectId,
  plugins: [structureTool(), iconPicker(), deployButtonPlugin()],
  schema: { types: schemaTypes },
  document: {
    actions: (prev: any[], context: { schemaType: string }) => {
      if (LOCKED_TYPES.includes(context.schemaType)) {
        return prev.filter(
          (action: { action?: string }) => !['create', 'delete', 'duplicate'].includes(action.action ?? '')
        );
      }
      return prev;
    },
    newDocumentOptions: (prev: { templateId: string }[]) => {
      return prev.filter((opt) => !LOCKED_TYPES.includes(opt.templateId));
    },
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    name: 'production',
    title: 'Active Insurance Solutions',
    dataset: 'production',
    basePath: '/production',
  },
  {
    ...sharedConfig,
    name: 'staging',
    title: 'Active Insurance Solutions (Staging)',
    dataset: 'staging',
    basePath: '/staging',
  },
]);

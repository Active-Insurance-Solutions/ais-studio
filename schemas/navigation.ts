import { defineType, defineField } from 'sanity';
import { MdMenu } from 'react-icons/md';

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: MdMenu,
  fields: [
    defineField({
      name: 'navType',
      title: 'Navigation type',
      description: 'Where this navigation appears. The site expects exactly one document of each type.',
      type: 'string',
      options: {
        list: [
          { title: 'Main (header)', value: 'main' },
          { title: 'Footer', value: 'footer' },
          { title: 'Legal (footer bottom)', value: 'legal' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Navigation items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'menuItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              description: 'Internal path (e.g. /about) or absolute external URL (https://…).',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'isExternal',
              title: 'External link',
              description: 'Open in a new tab.',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { navType: 'navType', items: 'items' },
    prepare({ navType, items }: { navType?: string; items?: unknown[] }) {
      const titles: Record<string, string> = {
        main: 'Main navigation (header)',
        footer: 'Footer navigation',
        legal: 'Legal navigation (footer bottom)',
      };
      return {
        title: navType ? titles[navType] || 'Navigation' : 'Navigation (no type set)',
        subtitle: `${(items || []).length} item${(items || []).length === 1 ? '' : 's'}`,
      };
    },
  },
});

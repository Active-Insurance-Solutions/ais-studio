import { defineType, defineField } from 'sanity';
import { MdViewColumn } from 'react-icons/md';

export default defineType({
  name: 'footerColumns',
  title: 'Footer Columns',
  type: 'document',
  icon: MdViewColumn,
  // Singleton — drives the link columns in the navy 3-column footer section.
  // The Contact column is rendered separately by SiteFooter from siteSettings,
  // so only the link-list columns (typically Company + Legal) live here.
  fields: [
    defineField({
      name: 'columns',
      title: 'Column groups',
      description: 'Each column has a title and a list of links. The footer renders the Contact column separately from siteSettings, so this list typically only contains Company and Legal.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({
              name: 'title',
              title: 'Column title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'navLink',
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
                      description: 'Internal path (e.g. /about) or absolute external URL.',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: { title: 'label', subtitle: 'url' },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title', links: 'links' },
            prepare({ title, links }: { title?: string; links?: unknown[] }) {
              const count = (links || []).length;
              return {
                title: title || 'Untitled column',
                subtitle: `${count} link${count === 1 ? '' : 's'}`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { columns: 'columns' },
    prepare({ columns }: { columns?: Array<{ title?: string; links?: unknown[] }> }) {
      const cols = columns || [];
      const titles = cols.map((c) => c.title).filter(Boolean);
      const totalLinks = cols.reduce((sum, c) => sum + (c.links?.length || 0), 0);
      return {
        title: 'Footer Columns',
        subtitle: cols.length
          ? `${titles.join(' · ')} (${totalLinks} link${totalLinks === 1 ? '' : 's'} total)`
          : 'No columns configured',
      };
    },
  },
});

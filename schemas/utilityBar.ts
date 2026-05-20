import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'utilityBar',
  title: 'Utility Bar',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone number displayed in utility row',
      type: 'string',
    }),
    defineField({
      name: 'hoursLabel',
      title: 'Business hours label (e.g. "Mon–Fri 9am–5pm")',
      type: 'string',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social media links in utility row',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
            })
          ],
        }
      ],
    }),
  ],
});

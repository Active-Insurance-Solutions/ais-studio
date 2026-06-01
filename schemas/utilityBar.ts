import { defineType, defineField } from 'sanity';
import { MdPhoneAndroid } from 'react-icons/md';

export default defineType({
  name: 'utilityBar',
  title: 'Utility Bar',
  type: 'document',
  icon: MdPhoneAndroid,
  // Singleton — the studio config (LOCKED_TYPES) prevents create/delete/duplicate
  // so there is exactly one document at _id: "utilityBar".
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone number',
      description: 'Displayed on the left of the utility bar (the dark navy band at the very top of the header). Use dot-separated format per brand guidelines, e.g. 970.241.5542.',
      type: 'string',
    }),
    defineField({
      name: 'quickLinks',
      title: 'Service quick links',
      description: 'Displayed on the right of the utility bar. Each link can target a section anchor on /plans (e.g. /plans#medicare) so users can jump directly to a specific plan category.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'quickLink',
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
              description: 'Internal path, optionally with a hash for anchor scrolling (e.g. /plans#medicare).',
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
    prepare: () => ({ title: 'Utility Bar (header top row)' }),
  },
});

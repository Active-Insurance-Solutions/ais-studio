import { defineType, defineField } from 'sanity';
import { IoSettingsSharp } from 'react-icons/io5';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: IoSettingsSharp,
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'contact', title: 'Contact' },
    { name: 'cta', title: 'Calls to Action' },
    { name: 'footer', title: 'Footer' },
  ],
  fields: [
    // ─── Identity ─────────────────────────────────────────────────────────
    defineField({
      name: 'siteName',
      title: 'Site Name',
      description: 'Displayed in the header and used as a text fallback when no logo is uploaded.',
      type: 'string',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      description: 'Short brand line shown in heroes and closing CTAs (e.g. "Good Health, That\'s the Plan").',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'identity',
    }),
    defineField({
      name: 'darkLogo',
      title: 'Dark-mode Logo',
      description: 'Optional alternate logo for dark mode. Falls back to the main logo if blank.',
      type: 'image',
      group: 'identity',
    }),
    defineField({
      name: 'authEnabled',
      title: 'Show login / account button in header',
      type: 'boolean',
      group: 'identity',
    }),

    // ─── Contact ──────────────────────────────────────────────────────────
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'contact',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      description: 'Use the dot-separated format (e.g. 970.241.5542) per brand guidelines.',
      type: 'string',
      group: 'contact',
    }),
    defineField({
      name: 'address',
      title: 'Business Address',
      description: 'Plain text — used in footer/contact for local SEO.',
      type: 'text',
      rows: 3,
      group: 'contact',
    }),

    // ─── CTAs ─────────────────────────────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Primary CTA Label',
      description: 'Header CTA button text (e.g. "Contact Us").',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'Primary CTA URL',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaHeadline',
      title: 'Closing CTA Headline',
      description: 'Headline shown in the footer CTA band on every page except Home.',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaSubtext',
      title: 'Closing CTA Subtext',
      description: 'Supporting line beneath the closing CTA headline.',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaFooterLabel',
      title: 'Closing CTA Button Label',
      description: 'Falls back to the primary CTA label if left blank.',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaFooterUrl',
      title: 'Closing CTA Button URL',
      description: 'Falls back to the primary CTA URL if left blank.',
      type: 'string',
      group: 'cta',
    }),

    // ─── Footer ───────────────────────────────────────────────────────────
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      description: 'Falls back to "© [year] [Site Name]. All rights reserved." if blank.',
      type: 'string',
      group: 'footer',
    }),
    defineField({
      name: 'craftedBy',
      title: 'Built-By Attribution',
      description: 'Shown beneath the copyright (e.g. "Crafted by Phifer Web Solutions").',
      type: 'string',
      group: 'footer',
    }),
  ],
});

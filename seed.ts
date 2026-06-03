// Seed script — pre-populate Sanity with initial content for Active Insurance Solutions.
// Run: pnpm exec sanity exec seed.ts --with-user-token
//
// Targets the dataset from SANITY_STUDIO_DATASET (set via studio/.env).
// Aborts if that resolves to production — staging-only by design.
//
// Uses createOrReplace so re-running fully refreshes content (idempotent during dev).

import { getCliClient } from 'sanity/cli';
import { readFileSync } from 'fs';

const client = getCliClient();

if (client.config().dataset === 'production') {
  console.error('Refusing to seed production. Set SANITY_STUDIO_DATASET=staging in studio/.env.');
  process.exit(1);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

let blockKeySeed = 0;
function ptBlock(text: string, opts: { style?: string; listItem?: 'bullet' | 'number'; level?: number } = {}) {
  blockKeySeed += 1;
  const block: Record<string, unknown> = {
    _type: 'block',
    _key: `b${blockKeySeed}`,
    style: opts.style || 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${blockKeySeed}`, text, marks: [] }],
  };
  if (opts.listItem) {
    block.listItem = opts.listItem;
    block.level = opts.level || 1;
  }
  return block;
}

// Minimal markdown → Portable Text. Handles:
//   ## H2  /  ### H3  /  #### H3 (no h4 default in PortableText, collapsed)
//   - bullet item
//   1. numbered item
//   blank line separates paragraphs
function mdToPortableText(md: string) {
  const blocks: ReturnType<typeof ptBlock>[] = [];
  const lines = md.split('\n');
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push(ptBlock(paragraph.join(' ').trim()));
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    const h = line.match(/^(#{2,4})\s+(.+)$/);
    if (h) {
      flush();
      const style = h[1].length === 2 ? 'h2' : 'h3';
      blocks.push(ptBlock(h[2], { style }));
      continue;
    }
    if (line.startsWith('- ')) {
      flush();
      blocks.push(ptBlock(line.slice(2), { listItem: 'bullet' }));
      continue;
    }
    const n = line.match(/^(\d+)\.\s+(.+)$/);
    if (n) {
      flush();
      blocks.push(ptBlock(n[2], { listItem: 'number' }));
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

const legalMd = (name: string) => readFileSync(`legal/${name}.md`, 'utf8');

// Shape required for a Sanity image-reference field.
const imageRef = (assetId: string) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: assetId },
});

// Asset IDs for tight-cropped carrier logos (transparent margins removed
// via PIL bbox detection). Produced by upload-trimmed-logos.ts on 2026-05-21.
// Re-running that script produces the same IDs (content-hash dedup).
//
// Companion Life uses the client-uploaded 369x49 asset directly — it was
// already tight-cropped when the client replaced it via the studio.
const ASSETS = {
  logoKansasCityLife: 'image-f686a7daab9b9ee4bba714ce4fcfa7600d63a3d0-400x268-png',
  logoDeltaDental: 'image-a173a14d56f50cff6a1c837527236e95a25ca87d-400x118-png',
  logoRockyMountain: 'image-d6361c6f0b145ce38625b56e3cb6b268f22268df-284x133-png',
  logoSelectHealth: 'image-094bcbd6841c79bdfd2560f7e63908122bc24b2e-721x299-png',
  logoCigna: 'image-075dbb6e82819850b02ef5596aeca2e0e033a423-311x103-png',
  logoAnthem: 'image-d33de9b714763575f1e36737941f25a2e550e8b8-400x109-png',
  logoMetLife: 'image-380e3e503930297e4f9c696dfa1a9eadce99d6db-262x329-png',
  logoCompanionLife: 'image-f3fc3326e3411c861d1fa30a75f744731eaf9a21-369x49-png',
  logoUnitedHealthcare: 'image-caebe6a880a0428a6c3461e26d98a2fc4a59a279-400x125-png',
  logoVsp: 'image-e4594e6e4d5533e4bac2da22c772c8b3dd3eaa58-226x188-png',
  logoAetna: 'image-0dc0d449d4fc42952877c7078417bce7e400675d-378x97-png',
  // Brand assets uploaded by the client via the studio:
  brandLogo: 'image-321822063c33ca651e324eea89714862cd8b0b46-390x114-png',
  homeHero: 'image-15fd271aab0cc8583461ab8f525cacad06d54c5b-1600x1150-jpg',
  teamCjRhyne: 'image-8d1603e54a787f74df8e12ae995d3bd8f97b804f-289x326-jpg',
  teamRandyPifer: 'image-af476509d8b17994bdd80408377c633d42ce7d4c-330x330-jpg',
  teamRhondaSteinkirchner: 'image-3528c9100ad063692d8bb919f31db92794e0a925-333x375-jpg',
  teamKatieCrum: 'image-a1733cae7032da0dde4562f6b13f1d3c75765f34-731x1023-jpg',
};

// ─── Documents ──────────────────────────────────────────────────────────────

const documents: Array<Record<string, unknown>> = [
  // Site Settings — singleton. Now fully populated; the watcher in SiteLayout
  // overrides the Pinia store defaults so the client can edit any of these in
  // the studio. Store defaults remain as boot-time fallbacks.
  {
    _type: 'siteSettings',
    _id: 'siteSettings',
    siteName: 'Active Insurance Solutions',
    tagline: "Good Health, That's the Plan",
    logo: imageRef(ASSETS.brandLogo),
    contactEmail: 'rhonda@activeinsurancegj.com',
    contactPhone: '970.241.5542',
    address: '940 Colorado Ave\nGrand Junction, CO 81501',
    ctaLabel: 'Contact Us',
    ctaUrl: '/contact',
    ctaHeadline: "Good Health, That's the Plan",
    ctaSubtext: 'Call 970.241.5542 or send a message.',
    ctaFooterLabel: 'Contact Us',
    ctaFooterUrl: '/contact',
    copyrightText: '',
    craftedBy: 'Crafted by Phifer Web Solutions',
  },

  // ─── Home (`/`) ───────────────────────────────────────────────────────────
  {
    _type: 'page',
    _id: 'page-home',
    title: 'Home',
    slug: { _type: 'slug', current: '/' },
    sections: [
      {
        _type: 'heroSection',
        _key: 'home-hero',
        // Opt out of the compact title-bar default — Home keeps the full landing
        // treatment with image, gradient overlay, and the Contact Us CTA.
        compact: false,
        title: "Good Health, That's the Plan",
        subtitle: 'Taking the worry out of complex insurance issues for both BUSINESSES and INDIVIDUALS',
        cta: { label: 'Contact Us', url: '/contact' },
        image: imageRef(ASSETS.homeHero),
        imageAlt: 'Doctor with a young family in a clinical setting',
      },
      {
        _type: 'partnerLogos',
        _key: 'home-partners',
        heading: 'Our Partners',
        subheading: 'We affiliate with top insurance providers to bring you inclusive and flexible coverage.',
        logos: [
          { _key: 'l-kcl',   name: 'Kansas City Life',          image: imageRef(ASSETS.logoKansasCityLife) },
          { _key: 'l-dd',    name: 'Delta Dental',              image: imageRef(ASSETS.logoDeltaDental) },
          { _key: 'l-rmhp',  name: 'Rocky Mountain Health Plans', image: imageRef(ASSETS.logoRockyMountain) },
          { _key: 'l-sh',    name: 'Select Health',             image: imageRef(ASSETS.logoSelectHealth) },
          { _key: 'l-cigna', name: 'Cigna',                     image: imageRef(ASSETS.logoCigna) },
          { _key: 'l-anth',  name: 'Anthem',                    image: imageRef(ASSETS.logoAnthem) },
          { _key: 'l-ml',    name: 'MetLife',                   image: imageRef(ASSETS.logoMetLife) },
          { _key: 'l-cl',    name: 'Companion Life',            image: imageRef(ASSETS.logoCompanionLife) },
          { _key: 'l-uhc',   name: 'UnitedHealthcare',          image: imageRef(ASSETS.logoUnitedHealthcare) },
          { _key: 'l-vsp',   name: 'VSP',                       image: imageRef(ASSETS.logoVsp) },
          { _key: 'l-aetna', name: 'Aetna',                     image: imageRef(ASSETS.logoAetna) },
        ],
      },
    ],
  },

  // ─── About (`/about`) ─────────────────────────────────────────────────────
  // Team members rendered as 4 stacked splitSections (matches the original
  // site's pattern per design-decisions.md L141-145). Image placeholders
  // render a fallback tile until headshots are sourced (rebuild-notes L145-154).
  {
    _type: 'page',
    _id: 'page-about',
    title: 'About',
    slug: { _type: 'slug', current: '/about' },
    sections: [
      {
        _type: 'heroSection',
        _key: 'about-hero',
        title: 'Meet Our Team',
        subtitle: 'Knowledgeable and Informed',
      },
      {
        _type: 'splitSection',
        _key: 'about-team-cj',
        eyebrow: 'President / CEO',
        heading: 'C.J. Rhyne',
        body: 'C.J. was born and raised here in the Grand Valley. He attended Palisade High School and went on to continue his education at Colorado Mesa University where he graduated with a Degree in Business Administration. Shortly after graduation he became a member of the PGA of America and began working his way through the golf industry. Most recently C.J. has been the Business Retention & Expansion Director at the Grand Junction Chamber of Commerce. With the relationships he has built and groomed throughout the previous years, and his dedication and willingness to help others, he will be a great fit and integral piece of the AIS team.',
        ctaLabel: 'Email C.J.',
        ctaUrl: 'mailto:cj@activeinsurancegj.com',
        imageRight: true,
        image: imageRef(ASSETS.teamCjRhyne),
        imageAlt: 'Portrait of C.J. Rhyne, President and CEO of Active Insurance Solutions',
      },
      {
        _type: 'splitSection',
        _key: 'about-team-rhonda',
        eyebrow: 'Office Manager',
        heading: 'Rhonda Steinkirchner',
        body: 'Rhonda is a Grand Junction native as well. She has been in the insurance business for over 30 years much of that time specializing in various aspects of insurance related to the health care industry. She has owned her own agency a couple of different times throughout her career and now is excited to start a new page in her career with Randy and C.J., providing excellent service to our clients as a part of the Active Insurance Solutions team.',
        ctaLabel: 'Email Rhonda',
        ctaUrl: 'mailto:rhonda@activeinsurancegj.com',
        imageRight: true,
        image: imageRef(ASSETS.teamRhondaSteinkirchner),
        imageAlt: 'Portrait of Rhonda Steinkirchner, Office Manager at Active Insurance Solutions',
      },
      {
        _type: 'splitSection',
        _key: 'about-team-katie',
        eyebrow: 'Broker / Advisor',
        heading: 'Katie Crum',
        body: "Katie is also a Grand Valley Native. She graduated from Central High School and attended Mesa State College. Katie has been in the insurance industry since 2015. She started in property and casualty insurance and has recently made the jump to life and health as well. Katie has worked for both the captive and broker side of the industry and loves being on the broker side the best. Katie is enthusiastic about finding fitting solutions for all her clients' needs. She takes customer service seriously and is happy to be working with a team that shares those same values.",
        ctaLabel: 'Email Katie',
        ctaUrl: 'mailto:katie@activeinsurancegj.com',
        imageRight: false,
        image: imageRef(ASSETS.teamKatieCrum),
        imageAlt: 'Portrait of Katie Crum, Broker and Advisor at Active Insurance Solutions',
      },
      {
        _type: 'splitSection',
        _key: 'about-team-randy',
        eyebrow: 'President Emeritus',
        heading: 'Randy Pifer',
        body: "Randy has been in the insurance business since December 1983, focusing on group and individual benefit plans. Randy's goal as an insurance advisor is to match his clients' needs with plans that work for them. Providing plan guidance and recommendations to clients is a sincere pleasure for him. Randy has served as the first President, awards Chairman, and legislative committee member, for the Western Colorado Association of Health Underwriters. Randy is currently serving on the board of American Red Cross – Western Slope Chapter. Uniquely, he also continues as \"Groundhog Ambassador\" for his hometown of Punxsutawney, PA.",
        ctaLabel: 'Email Randy',
        ctaUrl: 'mailto:randy@activeinsurancegj.com',
        imageRight: false,
        image: imageRef(ASSETS.teamRandyPifer),
        imageAlt: 'Portrait of Randy Pifer, President Emeritus at Active Insurance Solutions',
      },
      {
        _type: 'textContent',
        _key: 'about-mission',
        heading: 'Our Mission',
        body: [
          ptBlock("It has always been our practice to initiate and maintain long-term trusting relationships with our clients. We've taken the time to know the \"in's and out's\" of the insurance industry so that we can guide you towards making an informed decision when it comes to the insurance plans you purchase."),
          ptBlock("The effective preservation of your family's health and lifestyle should not cost you more than you need to spend which is why we affiliate with top insurance providers to bring you inclusive and flexible coverages at their most competitive rates."),
          ptBlock('We work tirelessly to stay informed about the latest changes in the healthcare markets. We can provide you information on what your market has available right now and any expected changes.'),
        ],
      },
    ],
  },

  // ─── Services (`/services`) ───────────────────────────────────────────────
  {
    _type: 'page',
    _id: 'page-services',
    title: 'Services',
    slug: { _type: 'slug', current: '/services' },
    sections: [
      {
        _type: 'heroSection',
        _key: 'services-hero',
        title: 'What We Cover',
        subtitle: 'Insurance with Clarity',
      },
      {
        _type: 'featureGrid',
        _key: 'services-grid',
        heading: '',
        items: [
          {
            _key: 'svc-supplemental',
            title: 'Supplemental Plans',
            description: 'Whether it be Medicare Plan G, Life Insurance, Disability Coverage, or Long Term Care Plans, we are experts that can give you peace of mind and explain all the options available to you.',
          },
          {
            _key: 'svc-employer',
            title: 'Employer Benefit Solutions',
            description: 'We can find plans where, in many cases, your employees will receive comprehensive benefits with low out-of-pocket expenses and more choices than ever, all while keeping that personal touch we are known for.',
          },
          {
            _key: 'svc-individual',
            title: 'Individual and Family Insurance Plans',
            description: "Your family is the most important part of your life. We help you find health insurance that covers everyone, puts your mind at ease, and won't break the bank with coverage that's tailored to you and your family.",
          },
          {
            _key: 'svc-life',
            title: 'Life Insurance',
            description: 'Protection for your family and allows the family to help maintain its standard of living by providing income after the loss of a loved one.',
          },
        ],
      },
    ],
  },

  // ─── FAQ (`/faq`) ─────────────────────────────────────────────────────────
  {
    _type: 'page',
    _id: 'page-faq',
    title: 'FAQ',
    slug: { _type: 'slug', current: '/faq' },
    sections: [
      {
        _type: 'heroSection',
        _key: 'faq-hero',
        title: 'Frequently Asked Questions',
        subtitle: 'Answers to the questions clients ask most.',
      },
      {
        _type: 'faqSection',
        _key: 'faq-list',
        heading: '',
        items: [
          {
            _key: 'faq-disability',
            question: 'Why would I need Disability Insurance coverage?',
            answer: 'The main purpose of Disability Insurance is to help cover your expenses should you not be able to return to work. The policy will pay a percentage of your salary should an illness or injury prevent you from performing your job duties. Depending on the policy selected, Disability Insurance covers your lost income for anywhere from a few weeks to the remainder of your working life. There are many variations of Disability Insurance, we can outline the policies and the process for you.\n\nCall us to discuss this important income replacement tool — 970.241.5542',
          },
          {
            _key: 'faq-group',
            question: 'What is the benefit of offering a Group Insurance plan for my company?',
            answer: "One of the biggest benefits of offering a group health insurance plan to your employees is employee recruitment and employee retention. Especially now in the current economic times we are in, employees are looking for the best work environment and most added value from their employer. Having a solid employee benefit (Health, Dental, Vision, etc.) program is essential to happy and productive employees.\n\nAdditional reasons for having an employee's benefits program are tax credit incentives for paying for employee premiums, possibilities for the employee to cover their family members, protects the overall wellness of your workforce, tax breaks for employees, and many others.\n\nContact us to talk about how to create a quality employee benefit program to increase your business's competitive edge — 970.241.5542",
          },
          {
            _key: 'faq-life-amount',
            question: 'How much Life Insurance should I have?',
            answer: 'We typically recommend having a policy that would provide you with 10 times your income. That is a standard base, but every individual and family situation is different, so please call us to set up an appointment to find out how we can get the life insurance policy that best fits the needs of your family — 970.241.5542',
          },
          {
            _key: 'faq-medicare-types',
            question: 'What is the difference between Medicare Supplement Plans and Medicare Advantage Plans?',
            answer: 'Medicare Supplement plans, such as Plan G, offer the highest level of benefit available. Under most Medicare Supplement Plans you can see ANY doctor who accepts Medicare assignment. The same cannot be said for Advantage Plans. A recent study finds that 40% of surveyed 65+ year olds did not know they could not see any doctor they wanted with their Medicare Advantage Plan.\n\nAdditionally, Medicare Supplement Plans such as Plan G do not require a referral to see a specialist and have a very low yearly out-of-pocket maximum. There are many more reasons we sell the best Medicare Supplement Plan available.\n\nCall us to find out more about getting the BEST — 970.241.5542',
          },
          {
            _key: 'faq-enrollment',
            question: 'When can I enroll in an Individual Health Plan?',
            answer: "Open enrollment for qualified individual health plans through the Affordable Care Act runs between November 1st – December 15th for the following year. Open enrollment allows you to choose a new health plan or make changes to your current plan.\n\nIf you miss the open enrollment deadline, but have a Qualified Life Change Event, you may qualify for a special enrollment period. The Qualified Life Change Events include:\n\n• Becoming newly married or divorced\n• Having a baby or adopting a child\n• Experiencing a death of the insurer in the family\n• Losing health insurance coverage due to job loss\n• Losing eligibility for Medicare, Medicaid, or Children's Health Insurance Program (CHIP+)\n\nBecause every situation is different, you may need to present documentation to show how the life event impacts your health insurance coverage.\n\nCall us immediately to find out how long you have after an event to change your plan — 970.241.5542",
          },
        ],
      },
    ],
  },

  // ─── Contact (`/contact`) ─────────────────────────────────────────────────
  // ContactSection.vue currently renders only Name/Email/Message form fields —
  // the additional fields (phone, best day, best time, preferred method) from
  // client-brief.md L146-152 are tracked in the step-4 checklist.
  {
    _type: 'page',
    _id: 'page-contact',
    title: 'Contact',
    slug: { _type: 'slug', current: '/contact' },
    sections: [
      {
        _type: 'heroSection',
        _key: 'contact-hero',
        title: 'Contact Us',
        subtitle: 'Our team is here to provide you with the support you need.',
      },
      {
        _type: 'contactSection',
        _key: 'contact-form',
        heading: 'Get in Touch',
        preferenceNotes: 'If you would like a quote for your business, individual, disability or life insurance needs OR have a question for the Active Insurance Team, please fill out your contact information. We make our clients lives easier by taking the worry out of complex insurance issues for both businesses and individuals while consistently providing the appropriate coverage and benefit solutions.',
        email: 'rhonda@activeinsurancegj.com',
        phone: '970.241.5542',
        showPhone: true,
        responseTime: 'We respond within one business day.',
        address: '940 Colorado Ave.\nGrand Junction, CO 81501',
        // Unofficial-but-stable embed format. Replace with the full src= URL from
        // Google Maps → Share → Embed if branded styling or custom zoom is wanted.
        mapEmbedUrl: 'https://maps.google.com/maps?q=940+Colorado+Ave,+Grand+Junction,+CO+81501&output=embed',
      },
    ],
  },

  // ─── Plans (`/plans`) ─────────────────────────────────────────────────────
  // Five featureGrids, one per category. Each carries the anchor ID the
  // utility-bar links target (see design-decisions.md L73-83).
  {
    _type: 'page',
    _id: 'page-plans',
    title: 'Plans',
    slug: { _type: 'slug', current: '/plans' },
    sections: [
      {
        _type: 'featureGrid',
        _key: 'plans-supplemental',
        anchorId: 'supplemental-plans',
        heading: 'Supplemental Plans',
        items: [
          {
            _key: 'sp-dental',
            title: 'Dental Plans',
            description: 'Make sure you keep smiling! Affordable dental plans are available, and some policies provide coverage for orthodontics, teeth whitening, and dental implants. We also offer dental discount plans that sometimes are more suitable than insurance.',
          },
          {
            _key: 'sp-vision',
            title: 'Vision Plans',
            description: "See what you've been missing! We can review options from multiple insurance companies to help meet your needs.",
          },
          {
            _key: 'sp-accident',
            title: 'Accident Plans',
            description: "You don't plan accidents. But you can plan for them. A supplemental accident plan typically pays a lump-sum cash benefit directly to you for injuries to help cover expenses you may have during your recovery.",
          },
          {
            _key: 'sp-disability',
            title: 'Short-Term & Long-Term Disability Plans',
            description: "An injury or illness that prevents you from working has the potential to turn into a financial hardship. Disability insurance plans generally pay a monthly cash benefit to you when you're unable to work.",
          },
          {
            _key: 'sp-ltc',
            title: 'Long-Term Care Plans',
            description: "Costs for assisted living facilities, nursing homes, and even at-home care are rising. Protect your finances and peace of mind with a long-term care policy that can protect you and your family's future.",
          },
        ],
      },
      {
        _type: 'featureGrid',
        _key: 'plans-employer',
        anchorId: 'employer-benefit-solutions',
        heading: 'Employer Benefit Solutions',
        items: [
          {
            _key: 'eb-better',
            title: 'Better Health & Protection',
            description: 'Let us help you find plans where, in many cases, your employees will receive more comprehensive benefits with lower out-of-pocket expenses.',
          },
          {
            _key: 'eb-personal',
            title: 'Personal Assistance',
            description: 'We are here for you. We provide help to you and every one of your employees when you need it — not just once a year.',
          },
          {
            _key: 'eb-choices',
            title: 'More Choices Than Ever',
            description: "Don't limit yourself. You have more options now than ever before. We can give you access to health plans from several insurance companies nationwide.",
          },
        ],
      },
      {
        _type: 'featureGrid',
        _key: 'plans-medicare',
        anchorId: 'medicare',
        heading: 'Medicare',
        items: [
          {
            _key: 'mc-partd',
            title: 'Medicare Part D',
            description: 'We can help you better manage your prescription expenses with a Medicare Part D prescription drug plan. Contact us to decode the eligibility requirements.',
          },
          {
            _key: 'mc-supp',
            title: 'Medicare Supplement Plans',
            description: 'Need more predictable out-of-pocket costs? We can enroll you in a Medicare supplement plan that can help fill the gaps in your Medicare Part A and B coverage, so there are fewer surprise expenses.',
          },
        ],
      },
      {
        _type: 'featureGrid',
        _key: 'plans-individual',
        anchorId: 'individual-and-family-insurance-plans',
        heading: 'Individual and Family Insurance Plans',
        items: [
          {
            _key: 'if-connect',
            title: 'Connect for Health Colorado',
            description: "We can help you find the health insurance plan that meets your needs, whether you're under the age of 30 and looking for a low-cost, catastrophic-only plan; a high-coverage platinum plan with low out-of-pocket expenses; or something in between.",
          },
          {
            _key: 'if-family',
            title: 'Family Plans',
            description: "Your family is the most important part of your life. Let us help you find health insurance that covers everyone, puts your mind at ease, and won't break the bank. We can help you choose coverage that's tailored to your family.",
          },
        ],
      },
      {
        _type: 'featureGrid',
        _key: 'plans-life',
        anchorId: 'life-insurance',
        heading: 'Life Insurance',
        items: [
          {
            _key: 'li-term',
            title: 'Term Life Insurance',
            description: "We can assist you in securing a term life policy that can help provide for your family's loss of income if you die. This policy could help pay off a mortgage or fund a college education.",
          },
          {
            _key: 'li-whole',
            title: 'Whole Life Insurance',
            description: "If you want to access a guaranteed cash value account, you want a whole life policy. You'll get guaranteed level premiums and life insurance protection for as long as you live.",
          },
          {
            _key: 'li-universal',
            title: 'Universal Life Insurance',
            description: "If you're looking for the flexibility to customize your coverage and premiums, we can help provide you with a policy that lasts a lifetime.",
          },
        ],
      },
    ],
  },

  // ─── Legal pages ──────────────────────────────────────────────────────────
  // Privacy Policy and Terms scraped verbatim from the current live site
  // (activeinsurancegj.com); content lives in studio/legal/*.md for easy editing.
  // Accessibility is a new page — wrote reasonable WCAG 2.1 AA boilerplate.
  {
    _type: 'legalPage',
    _id: 'legal-privacy-policy',
    title: 'Privacy Policy',
    slug: { _type: 'slug', current: 'privacy-policy' },
    // Bumped from 2022-05-17 when the Tracking Technologies and Cookies section
    // was rewritten to accurately reflect the cookieless rebuild.
    lastUpdated: '2026-06-03',
    body: mdToPortableText(legalMd('privacy-policy')),
  },
  {
    _type: 'legalPage',
    _id: 'legal-terms-and-conditions',
    title: 'Terms & Conditions',
    slug: { _type: 'slug', current: 'terms-and-conditions' },
    lastUpdated: '2022-05-17',
    body: mdToPortableText(legalMd('terms-and-conditions')),
  },
  {
    _type: 'legalPage',
    _id: 'legal-accessibility',
    title: 'Accessibility Statement',
    slug: { _type: 'slug', current: 'accessibility' },
    lastUpdated: '2026-05-20',
    body: mdToPortableText(legalMd('accessibility')),
  },

  // ─── Navigation ──────────────────────────────────────────────────────────
  // Three nav documents, one per location. SiteLayout watches all three and
  // routes items into the right slot of the Pinia store based on navType.
  // "Contact Us" is omitted from the main nav because the header renders it
  // separately as an amber CTA button (per design-decisions.md L72-76).
  {
    _type: 'navigation',
    _id: 'nav-main',
    navType: 'main',
    items: [
      { _key: 'home',     label: 'Home',     url: '/' },
      { _key: 'about',    label: 'About Us', url: '/about' },
      { _key: 'services', label: 'Services', url: '/services' },
      { _key: 'faq',      label: 'FAQ',      url: '/faq' },
    ],
  },
  {
    _type: 'navigation',
    _id: 'nav-footer',
    navType: 'footer',
    items: [
      { _key: 'home',     label: 'Home',        url: '/' },
      { _key: 'about',    label: 'About Us',    url: '/about' },
      { _key: 'services', label: 'Services',    url: '/services' },
      { _key: 'faq',      label: 'FAQ',         url: '/faq' },
      { _key: 'contact',  label: 'Contact Us',  url: '/contact' },
    ],
  },
  {
    _type: 'navigation',
    _id: 'nav-legal',
    navType: 'legal',
    items: [
      { _key: 'privacy',       label: 'Privacy Policy',          url: '/privacy-policy' },
      { _key: 'terms',         label: 'Terms & Conditions',      url: '/terms-and-conditions' },
      { _key: 'accessibility', label: 'Accessibility Statement', url: '/accessibility' },
    ],
  },

  // ─── Utility Bar (singleton) ─────────────────────────────────────────────
  // Drives the dark navy band at the very top of the header. SiteLayout
  // watches this and writes phone → site.contactPhone and quickLinks →
  // site.utilityNav. The three quick-link anchor IDs must match the
  // anchorId fields on the /plans page featureGrids.
  {
    _type: 'utilityBar',
    _id: 'utilityBar',
    phone: '970.241.5542',
    quickLinks: [
      { _key: 'employer',  label: 'Employer and Individual Health Plans', url: '/plans#employer-benefit-solutions' },
      { _key: 'medicare',  label: 'Medicare',                              url: '/plans#medicare' },
      { _key: 'life',      label: 'Life Insurance',                        url: '/plans#life-insurance' },
    ],
  },

  // ─── Footer Columns (singleton) ──────────────────────────────────────────
  // Drives the navy 3-column section of the footer. Column 1 (Company) and
  // Column 2 (Legal) are rendered here. The third Contact column is rendered
  // separately by SiteFooter using siteSettings (address, phone, email) +
  // useBusinessHours — that data isn't list-of-links shaped, so it lives in
  // siteSettings instead of being shoe-horned into this doc.
  //
  // Per design-decisions.md L84-99.
  {
    _type: 'footerColumns',
    _id: 'footerColumns',
    columns: [
      {
        _key: 'company',
        title: 'Company',
        links: [
          { _key: 'home',     label: 'Home',        url: '/' },
          { _key: 'about',    label: 'About Us',    url: '/about' },
          { _key: 'services', label: 'Services',    url: '/services' },
          { _key: 'faq',      label: 'FAQ',         url: '/faq' },
          { _key: 'contact',  label: 'Contact Us',  url: '/contact' },
        ],
      },
      {
        _key: 'legal',
        title: 'Legal',
        links: [
          { _key: 'privacy',       label: 'Privacy Policy',          url: '/privacy-policy' },
          { _key: 'terms',         label: 'Terms & Conditions',      url: '/terms-and-conditions' },
          { _key: 'accessibility', label: 'Accessibility Statement', url: '/accessibility' },
        ],
      },
    ],
  },
];

// Recursive merge: take the seed value as the base, but at any image node
// (and at any keyed array item that contains images), prefer what's already
// on the existing doc. Preserves:
//   - hotspot/crop set via Studio on images the seed only references by asset
//   - asset-reference swaps (e.g. KCL logo replaced with a tighter crop)
//   - any image field the client has touched, anywhere in the doc tree
// Falls through to the seed value when there's no existing counterpart, so a
// fresh dataset still bootstraps with the seed's images.
function isImageObject(v: unknown): v is { _type: 'image'; asset?: unknown } {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as { _type?: unknown })._type === 'image'
  );
}

function mergePreservingImages(seedValue: unknown, existingValue: unknown): unknown {
  // Both sides are images and existing has an asset → keep existing
  // (preserves hotspot/crop + any asset swap the client made via Studio).
  if (isImageObject(seedValue) && isImageObject(existingValue) && existingValue.asset) {
    return existingValue;
  }
  // Keyed arrays — walk pairwise by _key so reorders / inserts on the seed
  // side still get their images merged from the matching existing entry.
  if (Array.isArray(seedValue) && Array.isArray(existingValue)) {
    return seedValue.map((seedItem) => {
      if (seedItem && typeof seedItem === 'object' && '_key' in seedItem) {
        const match = (existingValue as Array<Record<string, unknown>>).find(
          (e) => e && typeof e === 'object' && e._key === (seedItem as Record<string, unknown>)._key,
        );
        if (match) return mergePreservingImages(seedItem, match);
      }
      return seedItem;
    });
  }
  // Plain objects — recurse on every key the seed defines.
  if (
    seedValue &&
    typeof seedValue === 'object' &&
    !Array.isArray(seedValue) &&
    existingValue &&
    typeof existingValue === 'object' &&
    !Array.isArray(existingValue)
  ) {
    const merged: Record<string, unknown> = {};
    for (const key of Object.keys(seedValue)) {
      merged[key] = mergePreservingImages(
        (seedValue as Record<string, unknown>)[key],
        (existingValue as Record<string, unknown>)[key],
      );
    }
    return merged;
  }
  // Primitive, mismatched shapes, or no existing counterpart → use seed.
  return seedValue;
}

// Upsert pattern: createIfNotExists ensures the doc exists, then patch.set()
// updates the fields the seed manages — but for image nodes, we first fetch
// the existing doc and merge in whatever the client has set so re-running
// the seed never wipes a Studio-edited hotspot or replaced asset.
//
// Caveat: NON-image fields inside seed-managed arrays (sections[], items[],
// logos[]) are still authoritative. If you've added/rearranged sections via
// Studio, re-running the seed will revert that structure.
async function seed() {
  const dataset = client.config().dataset;
  console.log(`Seeding ${documents.length} document(s) into "${dataset}"...`);

  // Fetch every existing doc up front in parallel so the merge step doesn't
  // serialize round-trips. getDocument returns null when the doc is absent.
  const existing = await Promise.all(
    documents.map((doc) => client.getDocument((doc as { _id: string })._id)),
  );

  const transaction = client.transaction();
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i] as Record<string, unknown> & { _id: string; _type: string };
    const { _id, _type, ...fields } = doc;
    transaction.createIfNotExists({ _id, _type });
    const merged = existing[i]
      ? (mergePreservingImages(fields, existing[i]) as Record<string, unknown>)
      : fields;
    transaction.patch(_id, (p) => p.set(merged));
  }
  await transaction.commit();
  console.log('Seed complete.');
}

seed().catch((err: Error) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

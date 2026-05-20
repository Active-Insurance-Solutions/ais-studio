// Seed script — pre-populate Sanity with initial content
// Run: npx sanity exec seed.ts --with-user-token
import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const documents = [
  {
    "_type": "siteSettings",
    "_id": "siteSettings",
    "siteName": "Active Insurance Solutions",
    "ctaLabel": "Get Started",
    "ctaUrl": "/contact",
    "contactEmail": "cj@activeinsurancegj.com",
    "contactPhone": "",
    "contactAddress": "",
    "copyrightText": "© 2026 Active Insurance Solutions. All rights reserved."
  },
  {
    "_type": "page",
    "_id": "page-home",
    "title": "Home",
    "slug": {
      "_type": "slug",
      "current": "/"
    },
    "sections": [
      {
        "_type": "heroSection",
        "_key": "heroSection-0",
        "title": "Active Insurance Solutions",
        "subtitle": ""
      },
      {
        "_type": "featureGrid",
        "_key": "featureGrid-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-about",
    "title": "About",
    "slug": {
      "_type": "slug",
      "current": "/about"
    },
    "sections": [
      {
        "_type": "teamProjectsSection",
        "_key": "teamProjectsSection-0"
      },
      {
        "_type": "textContent",
        "_key": "textContent-1"
      },
      {
        "_type": "pricingCtaSection",
        "_key": "pricingCtaSection-2"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-contact",
    "title": "Contact",
    "slug": {
      "_type": "slug",
      "current": "/contact"
    },
    "sections": [
      {
        "_type": "contactSection",
        "_key": "contactSection-0",
        "email": "cj@activeinsurancegj.com"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-services",
    "title": "Services",
    "slug": {
      "_type": "slug",
      "current": "/services"
    },
    "sections": [
      {
        "_type": "splitSection",
        "_key": "splitSection-0"
      },
      {
        "_type": "pricingCtaSection",
        "_key": "pricingCtaSection-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-faq",
    "title": "FAQ",
    "slug": {
      "_type": "slug",
      "current": "/faq"
    },
    "sections": [
      {
        "_type": "faqSection",
        "_key": "faqSection-0"
      },
      {
        "_type": "pricingCtaSection",
        "_key": "pricingCtaSection-1"
      }
    ]
  },
  {
    "_type": "page",
    "_id": "page-plans",
    "title": "Plans",
    "slug": {
      "_type": "slug",
      "current": "/plans"
    },
    "sections": [
      {
        "_type": "featureGrid",
        "_key": "featureGrid-0"
      },
      {
        "_type": "pricingCtaSection",
        "_key": "pricingCtaSection-1"
      }
    ]
  },
  {
    "_type": "legalPage",
    "_id": "legal-privacy-policy",
    "title": "Privacy Policy",
    "slug": {
      "_type": "slug",
      "current": "/privacy-policy"
    }
  },
  {
    "_type": "legalPage",
    "_id": "legal-terms-and-conditions",
    "title": "Terms & Conditions",
    "slug": {
      "_type": "slug",
      "current": "/terms-and-conditions"
    }
  },
  {
    "_type": "legalPage",
    "_id": "legal-accessibility",
    "title": "Accessibility Statement",
    "slug": {
      "_type": "slug",
      "current": "/accessibility"
    }
  },
  {
    "_type": "navigation",
    "_id": "nav-main",
    "navType": "main",
    "items": [
      {
        "_key": "home",
        "label": "Home",
        "url": "/"
      },
      {
        "_key": "about",
        "label": "About",
        "url": "/about"
      },
      {
        "_key": "contact",
        "label": "Contact",
        "url": "/contact"
      },
      {
        "_key": "services",
        "label": "Services",
        "url": "/services"
      },
      {
        "_key": "faq",
        "label": "FAQ",
        "url": "/faq"
      }
    ]
  },
  {
    "_type": "navigation",
    "_id": "nav-legal",
    "navType": "legal",
    "items": [
      {
        "_key": "privacy-policy",
        "label": "Privacy Policy",
        "url": "/privacy-policy"
      },
      {
        "_key": "terms-and-conditions",
        "label": "Terms & Conditions",
        "url": "/terms-and-conditions"
      },
      {
        "_key": "accessibility",
        "label": "Accessibility Statement",
        "url": "/accessibility"
      }
    ]
  }
]

async function seed() {
  console.log(`Seeding ${documents.length} document(s)...`)
  const transaction = client.transaction()
  for (const doc of documents) {
    transaction.createIfNotExists(doc)
  }
  await transaction.commit()
  console.log('Seed complete!')
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})

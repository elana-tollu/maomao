// Single source of truth for facts used across pages, header, footer and JSON-LD.
export const site = {
  url: 'https://elana.tolliu.pro', // must match `site` in astro.config.mjs
  name: 'Elana Tolliu',
  email: 'elana.tolliu@gmail.com',
  fiverr: 'https://www.fiverr.com/s/vbrRkrr', // voice-over gig
  fiverrEditing: 'https://www.fiverr.com/s/VrDl6yB', // editing gig
  // Links to other profiles: help search engines and LLMs connect them to the person
  profiles: ['https://www.fiverr.com/s/vbrRkrr', 'https://www.fiverr.com/s/VrDl6yB'],
  business: {
    owner: 'Elana Tolliu',
    legalName: 'Elana Tolliu (enskild firma)',
    orgNr: '800722-3848',
    vat: 'SE800722384801',
    taxStatus: 'Approved for F-tax (Godkänd för F-skatt)',
    street: 'Parkgatan 3',
    postalCode: '434 50',
    city: 'Kungsbacka',
    region: 'Halland',
    country: 'Sweden',
  },
  nav: [
    { label: 'Editing', href: '/services/editing/' },
    { label: 'Voice-over', href: '/services/voice-over/' },
  ],
};

export const mailto = (subject: string, body?: string) =>
  `mailto:${site.email}?subject=${encodeURIComponent(subject)}` +
  (body ? `&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}` : '');

// Shared schema.org Person node. Every page references it by @id.
export const personLd = {
  '@type': 'Person',
  '@id': `${site.url}/#me`,
  name: site.name,
  jobTitle: 'Russian-language editor and voice-over artist',
  url: site.url,
  email: site.email,
  image: `${site.url}/og.jpg`,
  knowsLanguage: ['ru', 'en', 'sv'],
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.business.city,
    addressRegion: site.business.region,
    addressCountry: 'SE',
  },
  sameAs: site.profiles,
};

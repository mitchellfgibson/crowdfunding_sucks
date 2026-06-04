/**
 * Financial-publisher / analyst directory, sourced verbatim from
 * crowdfundingsucks.com/gurus (retrieved 2026-06-02). FACTS ONLY: each entry is
 * a publisher, its analysts, and each analyst's stated coverage focus — no
 * track-record numbers (the source provides none, and rule 1 forbids unsourced
 * figures), no opinion language, no scoring. The eventual community-evaluation
 * layer attaches only when sourced recommendations exist.
 */

export interface Analyst {
  name: string;
  focus: string;
}

export interface Publisher {
  name: string;
  url: string; // official site (used for the logo favicon + a reference link)
  description: string; // factual, as written by the source
  analysts: Analyst[];
}

/** URL-safe slug for a publisher name. */
export function publisherSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PUBLISHERS_SOURCE = {
  title: 'Financial newsletter gurus directory',
  publisher: 'crowdfundingsucks.com',
  url: 'https://crowdfundingsucks.com/gurus',
  retrieved: '2026-06-02',
};

export const PUBLISHERS_INTRO =
  'A directory of the financial publishers promoting startup, Reg CF, and Reg A investment opportunities, with the analysts ("gurus") writing under each. Listed for reference only — no performance claims are made here.';

export const publishers: Publisher[] = [
  {
    name: 'Paradigm Press Group',
    url: 'https://paradigmpressgroup.com',
    description:
      'Investment research publisher featuring analysts focused on macro trends, emerging technologies, and speculative investment opportunities.',
    analysts: [
      { name: 'James Altucher', focus: 'Technology / AI / venture' },
      { name: 'Jim Rickards', focus: 'Macro / geopolitics / gold' },
      { name: 'Ray Blanco', focus: 'Emerging technology' },
      { name: 'Enrique Abeyta', focus: 'Growth stocks' },
      { name: 'Jim Osman', focus: 'Crypto / digital assets' },
    ],
  },
  {
    name: 'Stansberry Research',
    url: 'https://stansberryresearch.com',
    description:
      'Large investment newsletter publisher known for macro, commodities, and speculative investment research.',
    analysts: [
      { name: 'Porter Stansberry', focus: 'Macro / value investing' },
      { name: 'Whitney Tilson', focus: 'Global macro / equities' },
      { name: 'Eric Wade', focus: 'Crypto / digital assets' },
      { name: 'Dan Ferris', focus: 'Deep value investing' },
      { name: 'Brett Eversole', focus: 'Growth investing' },
    ],
  },
  {
    name: 'Banyan Hill Publishing',
    url: 'https://banyanhill.com',
    description:
      'Financial publisher focused on emerging technologies, cryptocurrency, and speculative growth opportunities.',
    analysts: [
      { name: 'Ian King', focus: 'Cryptocurrency / blockchain' },
      { name: 'Matt McCall', focus: 'Technology startups' },
      { name: 'Charles Mizrahi', focus: 'Growth stocks' },
      { name: 'Ted Bauman', focus: 'Macro / geopolitics' },
      { name: 'Jeff Yastine', focus: 'Global markets' },
    ],
  },
  {
    name: 'Angel Publishing',
    url: 'https://angelpub.com',
    description:
      'Financial publisher covering alternative investments, microcaps, and options strategies.',
    analysts: [
      { name: 'Brian Hicks', focus: 'Alternative investments' },
      { name: 'Alex Koyfman', focus: 'Microcap stocks' },
      { name: 'Shah Gilani', focus: 'Options / markets' },
    ],
  },
  {
    name: 'Oxford Club',
    url: 'https://oxfordclub.com',
    description:
      'Investment research organization focused on global equities, dividends, and trading strategies.',
    analysts: [
      { name: 'Alexander Green', focus: 'Global equities' },
      { name: 'Marc Lichtenfeld', focus: 'Dividend investing' },
      { name: 'Karim Rahemtulla', focus: 'Options trading' },
    ],
  },
  {
    name: 'Crowdability',
    url: 'https://crowdability.com',
    description:
      'Investment research service focused specifically on private startup and crowdfunding investments.',
    analysts: [
      { name: 'Matthew Milner', focus: 'Startup investing' },
      { name: 'Adam Sharp', focus: 'Venture / startup deals' },
    ],
  },
  {
    name: 'Early Investing',
    url: 'https://earlyinvesting.com',
    description:
      'Publisher focused on venture-style startup investing and private market opportunities.',
    analysts: [
      { name: 'Andy Gordon', focus: 'Startup / venture deals' },
      { name: 'Adam Sharp', focus: 'Early-stage startups' },
    ],
  },
  {
    name: 'Motley Fool',
    url: 'https://fool.com',
    description:
      'Major financial media company with coverage spanning public equities, private markets, and venture investing.',
    analysts: [
      { name: 'Tom Gardner', focus: 'Growth stocks' },
      { name: 'David Gardner', focus: 'Growth investing' },
      { name: 'Jason Moser', focus: 'Tech / equities' },
    ],
  },
];

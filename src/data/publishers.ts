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
  description: string; // factual, as written by the source
  analysts: Analyst[];
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
    name: 'Palm Beach Research Group',
    description:
      'Publisher known for promoting emerging technology, crypto, and venture-style investment opportunities through multiple newsletters.',
    analysts: [
      { name: 'Teeka Tiwari', focus: 'Crypto / digital assets' },
      { name: 'Luke Lango', focus: 'Technology / AI / startups' },
      { name: 'Andy Snyder', focus: 'Private deals / Reg A opportunities' },
      { name: 'Graham Summers', focus: 'Macro / markets' },
    ],
  },
  {
    name: 'Paradigm Press Group',
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
    name: 'Casey Research',
    description:
      'Investment research firm specializing in natural resources, commodities, and global macro analysis.',
    analysts: [
      { name: 'Doug Casey', focus: 'Global macro / commodities' },
      { name: 'Nick Giambruno', focus: 'Macro / geopolitics' },
      { name: 'Marin Katusa', focus: 'Natural resources' },
    ],
  },
  {
    name: 'Angel Publishing',
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
    description:
      'Investment research service focused specifically on private startup and crowdfunding investments.',
    analysts: [
      { name: 'Matthew Milner', focus: 'Startup investing' },
      { name: 'Adam Sharp', focus: 'Venture / startup deals' },
    ],
  },
  {
    name: 'Early Investing',
    description:
      'Publisher focused on venture-style startup investing and private market opportunities.',
    analysts: [
      { name: 'Andy Gordon', focus: 'Startup / venture deals' },
      { name: 'Adam Sharp', focus: 'Early-stage startups' },
    ],
  },
  {
    name: 'Motley Fool',
    description:
      'Major financial media company with coverage spanning public equities, private markets, and venture investing.',
    analysts: [
      { name: 'Tom Gardner', focus: 'Growth stocks' },
      { name: 'David Gardner', focus: 'Growth investing' },
      { name: 'Jason Moser', focus: 'Tech / equities' },
    ],
  },
];

/**
 * Industry statistics surfaced on the homepage. SOURCE: these figures are as
 * published by crowdfundingsucks.com (retrieved 2026-06-03) and are attributed
 * to it on the page — we are reporting their stated numbers with a citation,
 * not asserting them as independently verified. If/when primary sources (SEC,
 * academic Reg CF studies) are confirmed, swap the citation per stat.
 */

export const INDUSTRY_SOURCE = {
  label: 'crowdfundingsucks.com',
  url: 'https://crowdfundingsucks.com',
  retrieved: '2026-06-03',
};

/** Headline "why it's broken" stats — animated count-up. */
export interface Stat {
  value: number; // numeric target for the counter
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  tone?: 'flag' | 'neutral';
}

export const problemStats: Stat[] = [
  { value: 99, suffix: '%', label: 'of retail crowdfunding investors haven’t made money', tone: 'flag' },
  { value: 75, suffix: '%', label: 'of startups fail', tone: 'flag' },
  { value: 5, prefix: '3–', suffix: '×', label: 'overvalued vs. comparable VC rounds', tone: 'flag' },
  { value: 1, prefix: '<', suffix: '%', label: 'ever reach an exit', tone: 'flag' },
  { value: 68, suffix: '%', label: 'led by first-time founders', tone: 'neutral' },
  { value: 0, suffix: '', label: 'platforms publicly report investor returns', tone: 'flag' },
];

/** "Crowdfunding by the numbers" — market-size stats. */
export const marketStats: Stat[] = [
  { value: 2.5, prefix: '$', suffix: 'B+', decimals: 1, label: 'Total Reg CF capital raised since 2016' },
  { value: 1200, suffix: '+', label: 'Active offerings in 2024' },
  { value: 320, prefix: '$', suffix: 'K', label: 'Average campaign size' },
  { value: 2, suffix: 'M+', label: 'Investor accounts' },
];

/** Platform market share (their figures). Sums ~100. */
export const marketShare: { name: string; pct: number }[] = [
  { name: 'Wefunder', pct: 32 },
  { name: 'StartEngine', pct: 28 },
  { name: 'Republic', pct: 18 },
  { name: 'Mainvest', pct: 8 },
  { name: 'Others', pct: 14 },
];

/** Annual Reg CF capital raised (illustrative trend, their chart). $ millions. */
export const capitalByYear: { year: string; raised: number }[] = [
  { year: '2018', raised: 110 },
  { year: '2019', raised: 135 },
  { year: '2020', raised: 240 },
  { year: '2021', raised: 500 },
  { year: '2022', raised: 410 },
  { year: '2023', raised: 380 },
  { year: '2024', raised: 460 },
];

/**
 * Community traction numbers crowdfundingsucks.com advertises. These describe a
 * COMMUNITY, not this site's current reality — shown as goals, not facts, so we
 * don't misstate our own traction.
 */
export const communityGoals: Stat[] = [
  { value: 10, suffix: 'K+', label: 'investor community members' },
  { value: 50, suffix: 'K+', label: 'discussions' },
  { value: 2.3, prefix: '$', suffix: 'B', decimals: 1, label: 'in deals monitored' },
];

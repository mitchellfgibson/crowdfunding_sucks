import type { CollectionEntry } from 'astro:content';

/**
 * Build-time performance math for guru/outlet track records.
 *
 * FIREWALL (CLAUDE.md rules 1 & 4): every number here is pure arithmetic over
 * sourced frontmatter. Nothing is authored, nothing is invented. A
 * recommendation only contributes a return when BOTH `entryValuation` and
 * `currentValuation` are present AND `sources` is non-empty (the schema already
 * guarantees sources.min(1), but we re-check defensively so a future schema
 * change can't leak an uncited datum into a computed score).
 *
 * "Resolved" = outcome is a verifiable terminal event (not active/unknown).
 * Win rate is computed only over resolved recommendations that also have a
 * computable return, so it never silently mixes in unscored items.
 */

type Guru = CollectionEntry<'gurus'>;
type Recommendation = Guru['data']['recommendations'][number];

const TERMINAL_OUTCOMES = new Set([
  'acquired',
  'delisted',
  'dissolved',
  'litigation_public_record',
]);

/** A recommendation has a citation we can stand behind. */
export function isCited(rec: Recommendation): boolean {
  return Array.isArray(rec.sources) && rec.sources.length > 0;
}

/** Return as a ratio (0.5 = +50%), or null when not computable from sources. */
export function returnRatio(rec: Recommendation): number | null {
  if (!isCited(rec)) return null;
  const { entryValuation: entry, currentValuation: current } = rec;
  if (typeof entry !== 'number' || typeof current !== 'number') return null;
  if (entry <= 0) return null; // guard divide-by-zero / nonsense
  return current / entry - 1;
}

/** outcome is a verifiable terminal event (vs. active / unknown). */
export function isResolved(rec: Recommendation): boolean {
  return TERMINAL_OUTCOMES.has(rec.outcome);
}

export interface OutletPerformance {
  total: number; // all recommendations on file
  cited: number; // those with >=1 source
  scored: number; // those with a computable return
  resolved: number; // those with a terminal outcome
  avgReturn: number | null; // mean return ratio over `scored`, or null
  medianReturn: number | null;
  bestReturn: number | null;
  worstReturn: number | null;
  winRate: number | null; // share of scored picks with return > 0, or null
  lastDate: Date | null; // most recent recommendation date
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Aggregate one outlet's sourced recommendations into a performance summary. */
export function summarize(recs: Recommendation[]): OutletPerformance {
  const cited = recs.filter(isCited);
  const ratios = cited
    .map(returnRatio)
    .filter((r): r is number => r !== null);

  const lastDate = recs.reduce<Date | null>((acc, r) => {
    const d = r.date instanceof Date ? r.date : new Date(r.date);
    return !acc || d > acc ? d : acc;
  }, null);

  return {
    total: recs.length,
    cited: cited.length,
    scored: ratios.length,
    resolved: cited.filter(isResolved).length,
    avgReturn: ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null,
    medianReturn: median(ratios),
    bestReturn: ratios.length ? Math.max(...ratios) : null,
    worstReturn: ratios.length ? Math.min(...ratios) : null,
    winRate: ratios.length ? ratios.filter((r) => r > 0).length / ratios.length : null,
    lastDate,
  };
}

/** Format a return ratio as a signed percentage string, or an em dash. */
export function fmtPct(ratio: number | null, digits = 0): string {
  if (ratio === null || !Number.isFinite(ratio)) return '—';
  const pct = ratio * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(digits)}%`;
}

/** Format a 0..1 rate as a plain percentage, or an em dash. */
export function fmtRate(rate: number | null, digits = 0): string {
  if (rate === null || !Number.isFinite(rate)) return '—';
  return `${(rate * 100).toFixed(digits)}%`;
}

/** Recommendations newest-first; tolerant of string|Date dates. */
export function byNewest(recs: Recommendation[]): Recommendation[] {
  return [...recs].sort((a, b) => {
    const da = (a.date instanceof Date ? a.date : new Date(a.date)).getTime();
    const db = (b.date instanceof Date ? b.date : new Date(b.date)).getTime();
    return db - da;
  });
}

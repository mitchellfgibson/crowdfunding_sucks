import { getCollection } from 'astro:content';
import { summarize, type OutletPerformance } from './performance';
import { publishers, publisherSlug, type Analyst } from '../data/publishers';

/**
 * Unified performance board — merges the two former "people" systems:
 *   - REAL analysts (from src/data/publishers.ts), scored individually,
 *   - the fictional sample @handle accounts (the `gurus` collection),
 * into one ranked list of scorable accounts.
 *
 * FIREWALL: real analysts carry NO calls unless sourced ones are added to the
 * data (analyst.recommendations). With none, they compute to "Unrated" — we
 * never invent calls for real people. The performance math is the same
 * summarize() used everywhere; nothing is authored here.
 */

export interface BoardEntry {
  slug: string; // route segment under /community/
  name: string; // handle or person name (display)
  publisher?: string; // owning publisher, for real analysts
  focus?: string; // coverage area, for real analysts
  url?: string; // publisher site (real analysts)
  kind: 'analyst' | 'sample';
  perf: OutletPerformance;
  rated: boolean; // has at least one scored (sourced + valued) call
}

/** Recommendation shape shared by both sources (matches the gurus schema). */
type RecLike = Parameters<typeof summarize>[0][number];

function realAnalystEntries(): BoardEntry[] {
  const out: BoardEntry[] = [];
  for (const pub of publishers) {
    for (const a of pub.analysts as (Analyst & { slug?: string; recommendations?: RecLike[] })[]) {
      const recs = (a.recommendations ?? []) as RecLike[];
      const perf = summarize(recs);
      out.push({
        slug: a.slug ?? `${publisherSlug(pub.name)}-${publisherSlug(a.name)}`,
        name: a.name,
        publisher: pub.name,
        focus: a.focus,
        url: pub.url,
        kind: 'analyst',
        perf,
        rated: perf.scored > 0,
      });
    }
  }
  return out;
}

async function sampleEntries(): Promise<BoardEntry[]> {
  const gurus = await getCollection('gurus');
  return gurus.map((g) => {
    const perf = summarize(g.data.recommendations);
    return {
      slug: g.data.slug ?? g.id,
      name: g.data.name,
      kind: 'sample' as const,
      perf,
      rated: perf.scored > 0,
    };
  });
}

export interface BoardData {
  ranked: BoardEntry[]; // real analysts with a score, best first
  unrated: BoardEntry[]; // real analysts with no sourced calls yet
  samples: BoardEntry[]; // fictional demo accounts (kept separate + labeled)
  totalAnalysts: number;
  ratedCount: number;
}

export async function buildBoard(): Promise<BoardData> {
  const analysts = realAnalystEntries();
  const samples = await sampleEntries();

  const ranked = analysts
    .filter((e) => e.rated)
    .sort((a, b) => (b.perf.avgReturn ?? -Infinity) - (a.perf.avgReturn ?? -Infinity));
  const unrated = analysts
    .filter((e) => !e.rated)
    .sort((a, b) => a.name.localeCompare(b.name));

  samples.sort((a, b) => (b.perf.avgReturn ?? -Infinity) - (a.perf.avgReturn ?? -Infinity));

  return {
    ranked,
    unrated,
    samples,
    totalAnalysts: analysts.length,
    ratedCount: ranked.length,
  };
}

/** Look up one board entry by slug (for the profile page). */
export async function boardEntry(slug: string): Promise<BoardEntry | undefined> {
  const { ranked, unrated, samples } = await buildBoard();
  return [...ranked, ...unrated, ...samples].find((e) => e.slug === slug);
}

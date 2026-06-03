import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Content collection schemas — the structural half of the legal firewall
 * (BUILD_PLAN §2 / CLAUDE.md hard rules).
 *
 * Principles encoded here:
 *  - Every datum that makes a factual claim carries `sources[]`. The schema
 *    permits empty arrays; rendering code MUST hide any datum whose sources are
 *    empty (CLAUDE.md rule 1). Where a claim is meaningless without a citation
 *    (a recommendation), the schema itself requires `sources.min(1)`.
 *  - Outcomes are an enum of verifiable events only — never free text
 *    (CLAUDE.md rule 3).
 *  - No computed values are stored. Track-record returns, scores, and portal
 *    aggregate stats are derived at build time from these fields and must never
 *    appear in frontmatter (CLAUDE.md rule 4).
 */

// ---------------------------------------------------------------------------
// Firewall building blocks
// ---------------------------------------------------------------------------

/** A citation. `url` is required and validated; everything else is optional. */
const source = z.object({
  title: z.string().optional(),
  publisher: z.string().optional(),
  url: z.string().url(),
  date: z.coerce.date().optional(), // when the source itself was published
  retrieved: z.coerce.date().optional(), // when we captured it
});

const link = z.object({
  label: z.string(),
  url: z.string().url(),
});

/** The ONLY allowed outcome characterizations (CLAUDE.md rule 3). */
const outcome = z.enum([
  'active',
  'acquired',
  'delisted',
  'dissolved',
  'litigation_public_record',
  'unknown',
]);

/** Security type for a deal/raise. */
const security = z.enum([
  'equity',
  'safe',
  'convertible_note',
  'debt',
  'revenue_share',
  'token',
  'other',
]);

/**
 * Fields shared by every tracked entity (CLAUDE.md rule 6).
 *
 *  - `status` is the entity's real-world operating lifecycle.
 *  - `draft` gates publishing: rendering/listing code filters out `draft: true`
 *    entries in production. New entries default to draft.
 *  - `slug` is an optional override; when omitted, routing uses the
 *    glob-derived entry id (the filename).
 */
const entityBase = {
  name: z.string(),
  slug: z.string().optional(),
  summary: z.string(),
  links: z.array(link).default([]),
  sources: z.array(source).default([]),
  lastVerified: z.coerce.date(),
  status: z.enum(['operating', 'inactive', 'defunct', 'unknown']).default('unknown'),
  draft: z.boolean().default(true),
};

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

/** Educational long-form. Not a tracked entity, so it has its own shape. */
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    sources: z.array(source).default([]),
    draft: z.boolean().default(false),
  }),
});

/**
 * Crowdfunding platforms.
 *
 * Note what is deliberately absent: `dealsHosted` and `aggregateStats`. Both
 * are derived at build time by querying the `deals` collection (a deal points
 * at its portal via `portal`), so a portal never hand-maintains a deal list and
 * stats are never authored (CLAUDE.md rule 4).
 */
const portals = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portals' }),
  schema: z.object({
    ...entityBase,
    url: z.string().url(),
    // Regulation framework(s) the platform operates under, factual.
    regulation: z.array(z.enum(['reg_cf', 'reg_a', 'reg_d', 'broker_dealer', 'other'])).default([]),
    // Coarse asset focus for grouping/filtering the directory.
    category: z
      .enum([
        'startup_equity',
        'real_estate',
        'small_business',
        'climate',
        'private_markets',
        'infrastructure',
      ])
      .optional(),
  }),
});

/** Individual campaigns / issuers. The deal → portal link is the graph edge. */
const deals = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/deals' }),
  schema: z.object({
    ...entityBase,
    issuer: z.string(),
    portal: reference('portals').optional(),
    raiseAmount: z.number().nonnegative().optional(), // target for an open raise
    raisedToDate: z.number().nonnegative().optional(), // committed so far (open raises)
    minInvestment: z.number().nonnegative().optional(),
    valuation: z.number().nonnegative().optional(),
    currentValuation: z.number().nonnegative().optional(),
    sector: z.string().optional(), // short label, e.g. "Climate hardware"
    date: z.coerce.date(),
    security: security.optional(),
    outcome: outcome.default('unknown'),
  }),
});

/**
 * A single published recommendation by a guru. The computed return is derived
 * from `entryValuation`/`currentValuation` at build time — never stored.
 * `sources.min(1)`: an uncited recommendation is exactly the kind of datum the
 * firewall forbids from rendering, so it is rejected at the schema level.
 */
const recommendation = z.object({
  date: z.coerce.date(),
  target: z
    .object({
      deal: reference('deals').optional(),
      ticker: z.string().optional(),
    })
    .refine((t) => Boolean(t.deal) || Boolean(t.ticker), {
      message: 'recommendation.target needs a deal reference or a ticker',
    }),
  thesis: z.string(), // factual paraphrase only; opinion verbs are an editorial rule, not enforceable here
  entryValuation: z.number().nonnegative().optional(),
  currentValuation: z.number().nonnegative().optional(),
  outcome: outcome.default('unknown'),
  sources: z.array(source).min(1),
});

/** Publishers / newsletters / influencers / promoters. */
const gurus = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/gurus' }),
  schema: z.object({
    ...entityBase,
    recommendations: z.array(recommendation).default([]),
  }),
});

export const collections = { lessons, portals, deals, gurus };

/**
 * Giscus (GitHub Discussions) configuration + thread-key helpers.
 *
 * Per CLAUDE.md, ALL discussion is Giscus — never a custom comment backend.
 * Each discussable thing (a whole profile, or a single deal/recommendation
 * within it) maps to its own Giscus "term", so one GitHub Discussion is created
 * per thread on first comment.
 *
 * The repo/category IDs below are PUBLIC identifiers (the same values giscus
 * prints in its own setup page) — not secrets — so they ship as build-time
 * defaults. Env vars still override, e.g. to point a preview build at a
 * different repo. `enabled` stays false only if defaults are blanked out.
 */

export const giscusConfig = {
  repo: import.meta.env.PUBLIC_GISCUS_REPO ?? 'mitchellfgibson/crowdfunding_sucks',
  repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID ?? 'R_kgDOSrrZ1g',
  category: import.meta.env.PUBLIC_GISCUS_CATEGORY ?? 'General',
  categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID ?? 'DIC_kwDOSrrZ1s4C-YDG',
};

export const giscusEnabled = Boolean(
  giscusConfig.repo &&
    giscusConfig.repoId &&
    giscusConfig.category &&
    giscusConfig.categoryId,
);

/** Stable thread key for a whole profile's general discussion. */
export function profileTerm(slug: string): string {
  return `outlet/${slug}`;
}

/**
 * Stable thread key for one deal/recommendation within a profile. Uses the
 * profile slug + the deal's ticker (or its dated index when no ticker), so the
 * same deal always maps to the same GitHub Discussion across rebuilds.
 */
export function dealTerm(slug: string, ticker: string | undefined, index: number): string {
  const key = (ticker ?? `call-${index}`).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `outlet/${slug}/deal/${key}`;
}

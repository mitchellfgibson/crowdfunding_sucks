import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { withBase } from '../lib/url';

// Lessons feed. Empty until Phase 1 content lands — an empty feed is valid.
export async function GET(context: APIContext) {
  const lessons = (await getCollection('lessons')).filter((l) => !l.data.draft);

  return rss({
    title: 'CrowdfundingSucks — Lessons',
    description: 'Investor education on equity crowdfunding.',
    site: context.site ?? 'https://mitchellfgibson.github.io',
    items: lessons
      .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())
      .map((l) => ({
        title: l.data.title,
        description: l.data.description,
        pubDate: l.data.publishDate,
        link: withBase(`/lessons/${l.data.slug ?? l.id}/`),
      })),
  });
}

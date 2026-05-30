// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Deployed to GitHub Pages as a PROJECT site, served under /crowdfunding_sucks/.
// `site` + `base` drive canonical URLs, the sitemap, and the withBase() helper
// (src/lib/url.ts) that every internal link goes through. To move to a root
// host later (Vercel / a custom domain), set base back to '/' and update site.
export default defineConfig({
  site: 'https://mitchellfgibson.github.io',
  base: '/crowdfunding_sucks',
  integrations: [mdx(), sitemap()],
  vite: {
    // @tailwindcss/vite is built against a newer Vite than Astro bundles, so
    // the Plugin types are nominally incompatible even though it works at
    // runtime. JSDoc cast silences the `astro check` type error.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
